---
layout: post
title: "The Fragility of Raw RSA: From Mathematical Elegance to Existential Forgery"
date: 2026-04-27
categories: [computer-science, security]
tags: [cryptography, rsa, digital-signatures, hash-then-sign, rsa-pss, homomorphic-signatures]
excerpt: "Why textbook RSA preserves multiplicative structure and enables existential forgery, and how hash-then-sign and padding schemes like RSA-PSS close the gap."
reading_time: 15
course: "Cryptography"
---

# The Fragility of Raw RSA: From Mathematical Elegance to Existential Forgery

RSA is the algorithm most students see first in a cryptography course — and it's beautiful. Pick two big primes, multiply them, and you get a function that's easy to evaluate but apparently hard to invert without the factorization. The catch: the textbook version is also catastrophically broken, in a way that has nothing to do with factoring.

This post explains why "raw" RSA fails as a signature scheme, walks through a forgery attack you can do with paper and pencil, and shows how the **hash-then-sign** paradigm (and modern padding like RSA-PSS) fixes it.

> **Background.** A *digital signature* is a small bit of data that proves a particular party authorized a particular message. Forging a signature without the secret key should be infeasible. RSA is one signature algorithm; ECDSA (covered in a different post) is another.

---

## 1. Two jobs of a digital signature

A signature on a message has to do two things:

* **Attribution.** Whoever holds the private key signed this. Nobody else could have.
* **Integrity.** The message hasn't been tampered with since it was signed.

If a signature scheme allows an attacker to take signatures the legitimate signer made and combine them into a *new* signature on a message the signer never approved, both properties fail. We'll see exactly that happen with raw RSA in section 3.

A note on real-world breakage: even when the algorithm itself is sound, key generation can ruin everything. The 2012 study **"Mining Your Ps and Qs"** by Heninger et al. found that 0.75% of TLS certificates *shared keys* due to insufficient entropy at boot, and they directly recovered private keys for 0.50% of TLS hosts using the **GCD attack** — taking pairwise greatest common divisors of millions of public moduli and finding shared primes. Most of the failures were embedded devices with predictable boot-time entropy. RSA's math wasn't the bug; the dice were.

---

## 2. RSA in five lines

For a non-cryptographer audience, RSA is short enough to write out:

* **Pick two big primes** $p$ and $q$.
* **Compute the modulus** $n = pq$. Make $n$ public.
* **Pick a public exponent** $e$. The most common choice is $e = 65537 = 2^{16} + 1$ — small enough to make the public-key operation fast (just a few squarings via square-and-multiply: $O(\log e)$ instead of $O(e)$), but large enough to avoid the small-exponent attacks we'll mention in section 5.
* **Compute the private exponent** $d$ as the modular inverse of $e$ mod $\phi(n) = (p-1)(q-1)$ — i.e., $de \equiv 1 \pmod{\phi(n)}$. Keep $d$, $p$, and $q$ secret.

To sign a message $m$, the signer computes

$$\sigma = m^d \pmod n$$

To verify, anyone with the public key $(n, e)$ checks

$$m \equiv \sigma^e \pmod n$$

This works because $(m^d)^e = m^{de} = m^{1 + k\phi(n)}$, and Euler's theorem says $m^{\phi(n)} \equiv 1$ for $m$ coprime to $n$, so $m^{de} \equiv m$.

| | Public knows | Secret to signer |
| --- | --- | --- |
| Components | $n, e$ | $p, q, d$ |
| Operation | Verify: $\sigma^e \bmod n$ | Sign: $m^d \bmod n$ |

---

## 3. The fatal flaw: RSA preserves multiplication

Here's the property nobody warned you about. RSA's signing function $\sigma(m) = m^d \bmod n$ is a **group homomorphism** from $\mathbb{Z}_n^*$ to itself under multiplication. In English: signing a product equals the product of the signatures.

$$\sigma(m_1 \cdot m_2) = (m_1 m_2)^d = m_1^d m_2^d = \sigma(m_1) \cdot \sigma(m_2) \pmod n$$

That single property breaks raw RSA as a signature scheme. Here's the concrete attack.

### Existential forgery in three steps

Suppose the attacker has obtained two valid signatures $\sigma_1$ and $\sigma_2$ from the legitimate signer:

1. $\sigma_1 = m_1^d \bmod n$ (a real signature on $m_1$)
2. $\sigma_2 = m_2^d \bmod n$ (a real signature on $m_2$)

The attacker computes $\sigma_3 = \sigma_1 \cdot \sigma_2 \bmod n$ and claims it's a signature on the new message $m_3 = m_1 \cdot m_2 \bmod n$.

Verification check:

$$
\begin{aligned}
\sigma_3^e &\equiv (\sigma_1 \sigma_2)^e \pmod n \\
&\equiv (m_1^d m_2^d)^e \pmod n \\
&\equiv m_1^{de} m_2^{de} \pmod n \\
&\equiv m_1 \cdot m_2 \pmod n \\
&\equiv m_3 \pmod n
\end{aligned}
$$

The verification passes. The attacker just produced a valid signature on a message the signer never saw — without knowing the private key $d$.

The attack is called **existential forgery**: the attacker can produce signatures, but only on specific messages dictated by the algebra (products of messages they already have signatures for). That sounds limited, until you realize an attacker can request *chosen* signatures (any unprivileged party can ask the signer to sign things) and combine them into a forgery on, say, an attacker-crafted message that *also* happens to be a valid contract.

---

## 4. Hash-then-sign breaks the homomorphism

The fix is so simple it's almost a cheat: **don't sign the message — sign a hash of the message**.

$$\sigma = H(m)^d \pmod n, \quad \text{verify: } H(m) \stackrel{?}{\equiv} \sigma^e \pmod n$$

Here $H$ is a cryptographic hash function — SHA-256, SHA-3, BLAKE3, etc. The crucial property is that $H$ is *not* multiplicative:

$$H(m_1 \cdot m_2) \neq H(m_1) \cdot H(m_2) \pmod n$$

So the attacker can compute $\sigma_1 \cdot \sigma_2 \bmod n$, but the result is a signature on $H(m_1) \cdot H(m_2)$, not on $H(m_1 \cdot m_2)$ — and there's no message $m_3$ whose hash equals the product. Mathematically, the relation between hashes and message contents is "random" (modeled as a random oracle in proofs), severing the algebraic link the attacker needed.

Hash-then-sign is the foundation of every real-world RSA signature standard.

---

## 5. Padding: the second layer of defense

Hashing is necessary but not sufficient. The hash output also has to be *encoded* into the right shape for RSA. That encoding is the **padding scheme**. Two notorious examples of why this matters:

### Bleichenbacher's padding oracle (1998)

PKCS#1 v1.5 is the legacy padding standard. Some systems leak whether a decrypted ciphertext was "correctly padded" via different error messages or response timing. If you can ask the system "is this random ciphertext correctly padded?" repeatedly, Bleichenbacher showed in 1998 that you could iteratively recover the original plaintext — or, in TLS, recover session keys. Variants of the attack (ROBOT, 2017) still hit production systems today. The takeaway: deterministic padding plus an information leak equals broken.

### Håstad's broadcast attack (1985)

If you use a tiny public exponent like $e = 3$ and sign the same message $m$ for three different recipients with three different moduli $N_1, N_2, N_3$, an attacker collecting all three signatures can use the **Chinese Remainder Theorem** to recover $m^3$ in the integers (not modulo anything!), then take the regular cube root. The modular structure provided no protection because the message was small enough that $m^3 < N_1 N_2 N_3$.

This attack is why $e = 3$ is risky and why production RSA uses **randomized padding**: each signature on the same message produces a different ciphertext.

### RSA-PSS, the modern answer

**RSA-PSS** (Probabilistic Signature Scheme), defined in PKCS#1 v2.1, is the gold standard. It hashes the message, mixes in a fresh random salt, applies a mask-generation function, and then signs. Every signature on the same message is different. PSS has a *tight* security proof in the random oracle model — meaning the signature is provably as hard to forge as the underlying RSA problem is to invert, with no significant security loss in the reduction. (PKCS#1 v1.5 has no such proof.)

If you're writing a new system today: use PSS. If you're stuck with v1.5 for legacy reasons, treat any padding-error oracle as a key-compromise.

---

## 6. Question-and-answer recap

A common exam-style framing of this material:

> **Question.** What algebraic property of RSA makes existential forgery possible, and how does hashing prevent it?
>
> **Answer.** RSA's signing function is a **multiplicative homomorphism**: $\sigma(m_1 m_2) = \sigma(m_1) \sigma(m_2)$. So an attacker can multiply two valid signatures and obtain a third valid signature, on the product of the original messages, without the private key.
>
> Hashing breaks this because cryptographic hash functions are **not multiplicative**: $H(m_1 m_2) \neq H(m_1) H(m_2)$. Combining the signatures $\sigma_1$ and $\sigma_2$ now produces a value that's a "signature" on $H(m_1) H(m_2)$ — but no message $m_3$ has $H(m_3)$ equal to that product, so the forgery isn't a signature on any meaningful message. The algebraic shortcut is gone.

---

## 7. Survival rules

Four rules from this post you should carry forward:

1. **Never use raw RSA.** Always hash first; never sign or encrypt the message bytes directly.
2. **Prefer RSA-PSS** for new signature deployments. It has a tight proof and resists Bleichenbacher-style oracles by being randomized.
3. **Entropy is paramount.** The Heninger 2012 study showed that even a perfectly correct RSA implementation collapses if the random number generator that picks $p$ and $q$ is broken. Embedded devices that generate keys at first boot need a real entropy source — collecting from sensors, network jitter, or seeded by the manufacturer.
4. **Use audited libraries.** OpenSSL, BoringSSL, and libsodium implement padding, hashing, and constant-time exponentiation correctly. Don't roll your own — even with a textbook in hand. Especially with a textbook in hand.

The textbook version of RSA is a great teaching tool. It's also a great way to learn why every textbook footnote that says "for production, use a real padding scheme" is the most important sentence in the chapter.

---

## References

1. Heninger, Durumeric, Wustrow, Halderman. **"Mining Your Ps and Qs: Detection of Widespread Weak Keys in Network Devices."** USENIX Security 2012. [factorable.net](https://factorable.net/weakkeys12.extended.pdf)
2. Bleichenbacher. **"Chosen Ciphertext Attacks Against Protocols Based on the RSA Encryption Standard PKCS #1."** CRYPTO 1998.
3. Håstad. **"Solving simultaneous modular equations of low degree."** SIAM J. Computing, 1988.
4. Bellare, Rogaway. **"The Exact Security of Digital Signatures: How to Sign with RSA and Rabin."** EUROCRYPT 1996. (PSS construction.)
5. PKCS#1 v2.2 / RFC 8017. **"PKCS#1: RSA Cryptography Specifications Version 2.2."**
