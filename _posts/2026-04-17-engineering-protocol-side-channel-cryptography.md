---
layout: post
title: "Engineering Protocol-Secure and Side-Channel Resistant Cryptography: From Theory to Implementation"
date: 2026-04-17
categories: [computer-science, security]
tags: [cryptography, diffie-hellman, subgroup-attacks, constant-time, openssl, ed448, twist-security]
excerpt: "Bridging prime-order proofs with cofactor reality: small-subgroup attacks, BIGNUM leaks, twist security, and a practical mitigation checklist for protocol engineers."
reading_time: 15
course: "Cryptography"
---

# Engineering Protocol-Secure and Side-Channel Resistant Cryptography: From Theory to Implementation

Last post we walked through how a beautifully clean Diffie–Hellman proof can collide with messy implementation reality. This post zooms in on the *engineering* side of that gap: which group-theory facts you have to honor in code, why "constant-time" is harder than it sounds, and which curves let you sleep at night.

> **Background you'll want.** Recall a *group* is a set with one operation, an identity, and inverses. The *order* of an element is how many times you combine it with itself before cycling back to identity; the *order* of the group is the size of the set. A *subgroup* is a subset that's still a group on its own. ECDH (the elliptic-curve version of Diffie–Hellman) lives inside the group of points on a chosen curve. We'll use $g$ for a generator (in classical DH) or write things like $kP$ for scalar multiplication of curve points.

---

## 1. Why "prime order" matters so much

Most security proofs for DH and digital signatures assume the group has **prime order**. That's a strong assumption: a prime-order group has only two subgroups (just-identity and the whole thing), so there are no "trapdoors" smaller than the whole group.

In practice, engineers often pick groups with a small **cofactor** — meaning the order is $h \cdot p$ for a tiny integer $h$ and a large prime $p$. The reason is performance: curves like Curve25519 ($h = 8$) and Ed448 ($h = 4$) admit efficient, naturally constant-time Montgomery ladder implementations. The price is that small subgroups *do* exist, and an attacker who can pick inputs can sometimes steer your computation into those small subgroups.

| Property | Prime-order group (the proof) | Cofactor-$h$ group (the reality) |
| --- | --- | --- |
| Subgroups | Only trivial and full | One per prime factor of the order (Cauchy's theorem) |
| Inputs | Always valid | May be low-order, may be on a twist, may be invalid |
| Contributivity | Both parties' secrets always influence the result | Attacker can sometimes "cancel out" the other side's secret |

The most important of those rows is **contributivity**. In a healthy DH exchange, the shared secret depends on *both* private keys. If the attacker can submit a low-order point $P$, then $kP$ for the victim's secret $k$ produces a value that *only depends on $k \bmod h$* — the rest of $k$ has no effect. The shared secret collapses, and the attacker may be able to predict it.

---

## 2. What goes wrong in non-prime-order groups

Two pieces of group theory matter here:

* **Lagrange's theorem.** Any subgroup's order divides the group's order. So if the group order is $8p$, possible subgroup orders are $1, 2, 4, 8, p, 2p, 4p, 8p$.
* **Cauchy's theorem.** For every prime that divides the group order, there's a subgroup of that exact prime order. So if the group order is divisible by 2, a subgroup of order 2 *must* exist; etc.

Combine these and you get three concrete attack categories:

1. **Subgroup confinement.** Attacker sends a low-order point. The shared secret lands in a tiny set of values. Two different inputs can collide to the same output — useful for bypassing uniqueness or replay checks.
2. **Point mangling.** Attacker takes a legitimate prime-order point $g^x$ and combines it with a low-order point $h$. The bits look different, but downstream operations (like further exponentiation by $z$) produce the *same* result $g^{xz}$. So caches, replay logs, and uniqueness checks see "two different keys" that are functionally identical.
3. **Lim–Lee key leakage.** This is the big one. By submitting points from many different small subgroups and observing whether the protocol succeeds or hangs, the attacker learns one fragment of the long-term secret per subgroup. Combine fragments via the **Chinese Remainder Theorem** (CRT) to reconstruct the whole private key.

A Lim–Lee attack needs three things: the victim *reuses* a long-term secret, the implementation *accepts* arbitrary attacker-chosen points, and the attacker has *some way to confirm guesses* — protocol-level success/failure, or a timing/cache side channel.

---

## 3. The "Big Numbers, Big Troubles" framework

Side channels are how secrets escape a correctly-written algorithm. **Constant-time** code is the standard defense: if the program's running time and memory access pattern do not depend on secret values, side channels can't read them.

Sounds easy. It isn't, especially when you're working with **big numbers** — integers far larger than a CPU register, stored as arrays of 64-bit chunks called *limbs*. Three pitfalls show up over and over:

### 3.1 Lazy resizing and minimal representation

OpenSSL and LibreSSL historically stored a `top` field tracking how many limbs were "really used." When a value's top limb became zero, they'd shrink the buffer (`bn_fix_top`). That means *the buffer size depends on the secret*. An attacker watching memory allocation patterns sees the bit-length leak. This was the root cause of OpenSSL **CVE-2018-0734** (DSA) and **CVE-2018-0735** (ECDSA).

### 3.2 Word-boundary leakage

If a secret nonce sits just below a multiple of 64 bits, a single increment can require an extra limb. That extra `malloc` shows up in the cache. Now the attacker knows your nonce was within a few bits of a word boundary — and that's enough information, repeated over many signatures, to recover the long-term key via the Hidden Number Problem (covered in the next post).

### 3.3 Modular inversion

Plenty of crypto needs $k^{-1} \bmod q$. The fast classical method is the **Binary Extended Euclidean Algorithm** (BEEA) — but its loop count depends on $k$, which leaks $k$. The constant-time alternative: **Fermat's Little Theorem**, which says $k^{q-2} \equiv k^{-1} \pmod q$ when $q$ is prime. Modular exponentiation with a fixed window size runs in constant time. Slower, yes — but no leak.

### Vulnerable vs. hardened nonce generation

| | Vulnerable: truncation | Hardened: rejection sampling |
| --- | --- | --- |
| Method | Generate a random number, truncate to target bit length | Generate, reject if outside $[1, q-1]$, retry |
| Bias | Introduces a small mathematical bias | Perfectly uniform |
| Side-channel | Truncation / division leaks length | Constant-time if paired with fixed-width BN |

BoringSSL and modern OpenSSL use rejection sampling.

---

## 4. Elliptic curves: twist security and invalid points

ECC widens the attack surface because a "point" is two coordinates $(x, y)$ that must satisfy a curve equation. Three classes of bad input show up:

1. **Low-order points** (already covered) — on the curve, but in a small subgroup.
2. **Points on the twist** — every elliptic curve has a "mirror image" called its **quadratic twist**, which has its own equation $dy^2 = x^3 + ax + b$. If you only check the $x$-coordinate (as Montgomery ladders do), the attacker can hand you an $x$ that lies on the twist, not on the main curve.
3. **Invalid points** — $(x, y)$ that satisfy *neither* the curve nor its twist. They aren't on any group at all, so the math collapses in unpredictable ways.

A curve is **twist-secure** if its twist is also a strong group (so a twist attack doesn't help). Common situations:

| Curve | Main curve | Twist | Twist-secure? |
| --- | --- | --- | --- |
| NIST P-256 | Prime order | Nearly-prime | Yes — but invalid-point attacks still possible if you skip the equation check |
| Curve25519 | Cofactor 8 over a prime | Nearly-prime | Yes |
| Ed448 (Goldilocks) | Cofactor 4 over a prime | Nearly-prime | Yes |
| NIST P-224 | Prime order | Composite — small subgroups exist | **No** — combined attack cost ~$2^{58}$ (SafeCurves) |

Note: even on twist-secure curves, you still have to validate that the received point satisfies the curve equation. Otherwise you're vulnerable to invalid-point attacks (this is exactly how the Bluetooth attack from the previous post worked, against P-256).

---

## 5. The engineering checklist

Defense-in-depth means stacking these mitigations, not picking one:

1. **Reject the identity element.** A handshake that accepts $\mathcal{O}$ as a peer's public key produces a constant shared secret. Always check.

2. **Reject low-order points / clamp scalars.** For Curve25519, the standard "X25519" scalar clamping zeroes the bottom 3 bits (so the resulting scalar is a multiple of 8) and sets bit 254. That forces multiplication into the prime-order subgroup. Caveat: clamping alone can *increase* confinement because all low-order inputs map to identity — pair it with identity-element rejection.

3. **Validate every received point.** Check $y^2 \equiv x^3 + ax + b \pmod p$ before any scalar multiplication. This is the one-line fix that would have prevented the Bluetooth disaster.

4. **Audit point-add for short-circuit leaks (V7).** Optimized NIST curve code sometimes contains conditions like `if (x_equal && y_equal && !z2_is_zero)` for the doubling case. When the scalar window is all-zero, the running point becomes the point at infinity, and that conditional fires — leaking the all-zero window via timing or cache. Replace with constant-time bitwise selects. The "V7 vulnerability" label is from Weiser et al. ([USENIX Security 2020](https://www.usenix.org/system/files/sec20-weiser.pdf)), and they document V7 hits in OpenSSL and BoringSSL across secp224r1, secp256k1, secp384r1, and secp521r1.

5. **Bind identities into the KDF.** The Jackson–Cremers–Cohn-Gordon–Sasse "Seems Legit" analysis ([CCS 2019](https://eprint.iacr.org/2019/779.pdf)) showed that signature schemes which omit the signer identity from the signed payload or key-derivation function are vulnerable to Universal Key Substitution-style attacks under stronger threat models. Tendermint's Ed25519 usage is one of the protocols they flag — there's no public exploit CVE matching this exactly, but the analytical risk is real.

---

## Case study: Ed448-Goldilocks, "secure by construction"

Ed448 deserves a closer look as a poster child for "design the math so the implementation is naturally constant-time." Its prime is the **Solinas trinomial** $p = 2^{448} - 2^{224} - 1$. Setting $\phi = 2^{224}$, the prime equals $\phi^2 - \phi - 1$, which means $\phi^2 \equiv \phi + 1 \pmod p$ — the same identity that defines the golden ratio.

When you multiply two field elements written as $a + b\phi$ and $c + d\phi$:

$$(a + b\phi)(c + d\phi) = ac + (ad + bc)\phi + bd\phi^2 \equiv (ac + bd) + (ad + bc + bd)\phi$$

Three sub-products and a couple of additions — and they all fit cleanly into 56-bit limbs that don't overflow a 128-bit accumulator. No conditional branches, no value-dependent reductions, no awkward carry handling. The shape of the prime *is* the constant-time property.

That's the lesson behind everything in this post: implementation security isn't a layer you add at the end. The math you choose either makes constant-time easy or fights you the whole way down.
