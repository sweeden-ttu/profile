---
layout: post
title: "Cracking the Code: A Review of Cryptographic Failures in Peer-to-Peer and Wireless Protocols"
date: 2026-04-13
categories: [computer-science, security]
tags: [cryptography, curve25519, bluetooth, secure-scuttlebot, side-channels, formal-verification]
excerpt: "From Tamarin’s prime-order ideal to Scuttlebutt, Bluetooth P-256 invalid-point attacks, and OpenSSL lazy resize—how symbolic proofs miss implementation and protocol reality."
reading_time: 15
course: "Cryptography"
---

# Cracking the Code: A Review of Cryptographic Failures in Peer-to-Peer and Wireless Protocols

There's a recurring pattern in cryptography failures: a protocol gets a clean math proof on paper, ships, and then breaks anyway. The proof wasn't wrong — it just described a *cleaner* world than the one the code actually runs in. This post walks through three real cases of that gap (Secure Scuttlebutt, Bluetooth pairing, and OpenSSL nonce leaks), with enough background that you don't need to be a crypto researcher to follow along.

> **Quick refresher.** Two parties agreeing on a shared secret over an insecure channel is called *Diffie-Hellman key exchange* (DH). Modern systems use *Elliptic Curve* Diffie-Hellman (ECDH) — same idea, but the math happens with points on an elliptic curve over a finite field. The thing each party multiplies a public point by — its private key — is called a *scalar*.

---

## 1. The "Perfect Group" That Doesn't Exist

When researchers prove a protocol secure, they often use tools like **Tamarin** or **ProVerif**. These are programs that take a protocol description and try to find an attack — if they can't, they output "verified." The catch is that they reason at the *symbolic* level: they assume the math behaves perfectly. In particular, they typically assume the group of points used by the protocol has *prime order*, meaning the number of elements is prime.

Why does prime order matter? Two reasons:

1. **No internal subgroups.** A prime-order group has only two subgroups: the trivial one (just the identity element) and the whole group. So there's nowhere a value can get "trapped."
2. **Every non-identity element is a generator.** Pick any element other than the identity, and you can reach every other element by repeatedly combining it with itself. There are no second-class citizens.

Real curves used in practice don't always have prime order. **Curve25519**, the curve behind Signal, WhatsApp, TLS 1.3, and SSH, has order $8 \cdot p$ for a large prime $p$. The factor 8 is called the **cofactor**. It exists because curves with a small cofactor are faster to implement using the *Montgomery ladder* — an x-coordinate-only multiplication algorithm that's both fast and naturally resistant to timing attacks.

That tradeoff — performance for a slightly messier group — is the seam where every attack we'll see today gets in.

| Aspect | What the proof assumes | What the implementation actually does |
| --- | --- | --- |
| Group order | Prime — no subgroups exist | Composite (e.g. $8p$) — small subgroups exist |
| Inputs | Always valid curve points | High-performance libraries may skip the "is this on the curve?" check |
| Identity element | Never appears | Sometimes accepted; can pin the shared secret to a constant |
| Numbers | Atomic integers | Big integers stored as arrays of 64-bit "limbs" — memory layout leaks information |

Now let's see what actually goes wrong.

---

## 2. Case Study: Secure Scuttlebutt's "Secret Handshake"

**Secure Scuttlebutt (SSB)** is a decentralized social-feed protocol — think of it as a federated Twitter where each user replicates their friends' posts directly. To talk to a friend, two SSB clients run a "Secret Handshake" that proves they each hold a long-term Curve25519 keypair. SSB had been analyzed in symbolic models and looked fine. The flaw was in how the protocol handled *attacker-supplied* points.

A **low-order point** is a curve point that, when multiplied by any scalar, produces only a tiny set of outputs. Curve25519's cofactor of 8 means there's a subgroup of order 8 — and every point in it is "low-order." If you compute $k \cdot P$ where $P$ has order 8, the result lands somewhere in those 8 points no matter what $k$ is.

Here is how the attack works:

1. **Attacker sends a low-order point.** Instead of sending a normal ephemeral public key (a random point on the curve), the attacker sends a point $P$ of order 8.
2. **Shared secret collapses.** The shared secret in ECDH is computed as $k \cdot P$, where $k$ is the responder's secret. Because $P$ is low-order, $k \cdot P$ can only land in 8 possible values — and the attacker can guess them all.
3. **Challenge becomes predictable.** SSB derives a session-binding "challenge" from this collapsed secret. The attacker now knows the challenge in advance.
4. **Signature forgery.** The handshake's last step requires the attacker to sign that challenge with the responder's *long-term* key. Normally this is impossible — but because the challenge is constant and the protocol re-uses the same long-term key, the attacker can produce a valid signature without the secret key.
5. **Authentication bypassed.** The handshake completes; the attacker is "authenticated as your friend" and can read your private feed.

The deeper lesson: even when a protocol uses a verified-correct library like **HACL\*** for the math primitives, the *protocol logic* still has to reject low-order public keys. The Go standard library originally accepted them; libsodium rejects them. That single library-level decision was the difference between vulnerable and safe.

---

## 3. Case Study: Bluetooth's Invalid-Point Attack

Bluetooth devices pair using ECDH. Bluetooth Low Energy Secure Connections (LESC, the modern variant) uses the **NIST P-256** curve. P-256 is "twist-secure" — both the curve and its mirror image (its quadratic twist) are mathematically strong. So the attack we're about to describe isn't a twist attack. It's something different: an **invalid-point attack**, where the attacker sends an $(x, y)$ pair that isn't on *either* the curve or its twist.

The vulnerability was disclosed in July 2018 (CVE-2018-5383), with the full Biham–Neumann paper published as [eprint 2019/1043](https://eprint.iacr.org/2019/1043) and presented at CT-RSA 2020. Affected vendors included Qualcomm, Broadcom, and Intel.

Here's the trick:

* The two devices exchange $(x, y)$ coordinates of their public points.
* The "Numeric Comparison" step (the 6-digit code that pops up on your phone) only authenticates the **x-coordinate** — not the y-coordinate.
* An attacker in the middle keeps the legitimate x-coordinate but **sets y = 0** in transit.
* The point $(x, 0)$ does not satisfy the curve equation $y^2 = x^3 + ax + b$ — it's invalid. But cryptographic libraries that skip the curve check just accept it.
* When you multiply *any* point with $y = 0$ by a scalar, the math collapses: such a point is its own additive inverse, so it has order 2. The shared secret ends up being one of just two possible values.

| Affected Vendors | What Was Exploited | Outcome |
| --- | --- | --- |
| Qualcomm, Broadcom, Intel | Accepting $(x, 0)$ as a valid P-256 point | Shared secret confined to two values |
| Google (Android) | No y-coordinate validation | Attacker decrypts the link silently |

The attacker can guess the session key, decrypt the Bluetooth traffic, and inject data — even though the user correctly compared the 6-digit code. The fix is one extra check: verify each received point actually satisfies $y^2 \equiv x^3 + ax + b \pmod{p}$ before doing any scalar multiplication.

---

## 4. The Hidden Leak: How Big Numbers Betray Secrets

The curves in elliptic curve crypto have prime fields with hundreds of bits — far more than fits in a single CPU register. Libraries store these numbers as arrays of 64-bit chunks called **limbs**. A 256-bit number takes 4 limbs; a 521-bit number takes 9.

OpenSSL and LibreSSL traditionally used a "minimal representation": they only allocated as many limbs as the value currently needed. If a number's top limb became zero (because the value got smaller after some operation), the library would shrink the buffer.

That sounds harmless — until you realize an attacker on the same machine (or with a network position) can *measure* when allocations happen.

Here is the leak that became **CVE-2018-0734** (DSA) and **CVE-2018-0735** (ECDSA):

1. ECDSA picks a per-signature random nonce $k$.
2. To make $k$'s bit-length uniform, the library computes $k + q$ (where $q$ is the curve order).
3. If $k$ happens to be just below a 64-bit boundary, the addition triggers a carry that needs an extra limb. The library calls `malloc` to grow the buffer.
4. An attacker using **Flush+Reload** (a cache side-channel) or **controlled-channel attacks** in Intel SGX can detect that allocation. They've just learned the top bits of $k$.

Recover enough of those tops bits across enough signatures, and you can recover the long-term ECDSA private key using lattice techniques (covered in a later post in this series).

The fix, used by **BoringSSL**, is to allocate a fixed-width buffer up front: every nonce takes exactly the same number of limbs regardless of its value. No conditional allocation, no leak.

| Vulnerable (OpenSSL/LibreSSL pre-fix) | Hardened (BoringSSL) |
| --- | --- |
| Buffer size depends on the secret value | Buffer size is fixed by the curve, not the value |
| `malloc` calls leak information | No conditional allocations |
| `bn_fix_top` strips leading zeros — leaks bit length | Leading zeros stay in place |

---

## 5. Defender's Toolbox

If you're implementing a protocol that uses ECDH or ECDSA, four mitigations cover most of the failures above:

| Mitigation | What it stops | Tradeoff |
| --- | --- | --- |
| **Reject the identity element** on every public-key input | Prevents the shared secret from being pinned to a constant | Negligible performance cost; should always be on |
| **Curve equation check** $y^2 \equiv x^3 + ax + b$ on every received point | Stops invalid-point attacks like Bluetooth's | Extra field arithmetic per point — usually worth it |
| **Cofactor clamping** (for Curve25519, X25519): zero out the low 3 bits of the scalar | Forces math into the prime-order subgroup | Small-subgroup inputs all map to identity; pair with identity rejection |
| **Fermat inversion** $k^{q-2} \pmod q$ instead of Extended Euclidean | Constant-time modular inverse | A bit slower than the variable-time alternative — but no timing leak |

---

## 6. Takeaways

Security is a full-stack problem. A clean mathematical proof says one thing; the bytes flying through your CPU's cache say another. A few things worth remembering:

1. **Proofs assume what they don't verify.** A Tamarin proof of "prime-order group" doesn't help if your real curve has cofactor 8 and your protocol accepts low-order public keys.
2. **Validate every point.** Even on twist-secure curves like P-256, skipping the "is this on the curve?" check is fatal. (For curves whose twist *isn't* secure, like P-224, the situation is even worse — its twist has combined attack cost around $2^{58}$ per SafeCurves.)
3. **Memory access patterns are public.** "Lazy" optimizations that resize buffers based on secret values are side channels.
4. **Handshakes need contributivity.** Both parties' secrets must influence the shared key in a way that *cannot* be cancelled by a small-subgroup input from the other side.

### Checklist for protocol designers

- [ ] Reject the identity element on all public-key inputs.
- [ ] Implement explicit curve equation checks ($y^2 = x^3 + ax + b$).
- [ ] Use fixed-width big-integer representations; disable lazy resizing.
- [ ] Use Fermat-style modular inversion (constant-time).
- [ ] If you use an x-only ladder, make sure the curve is twist-secure.
- [ ] Include both peers' identities in the key-derivation function (KDF).
- [ ] Apply cofactor clamping, but pair it with identity-element rejection.
