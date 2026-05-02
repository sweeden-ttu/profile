---
layout: post
title: "Symmetric Encryption Algorithms: Understanding Block and Stream Ciphers"
date: 2026-01-15
categories: [computer-science, security]
tags: [cryptography, symmetric-encryption, aes, des, encryption-algorithms]
excerpt: "A deep dive into symmetric encryption algorithms, including block ciphers like AES and DES, stream ciphers, and their applications in modern cryptography."
reading_time: 15
course: "Cryptography"
---

# Symmetric Encryption Algorithms: Understanding Block and Stream Ciphers

Symmetric schemes use one shared key for both directions. **Block ciphers** (AES in particular) transform fixed-size blocks under a key; **modes** (CBC, CTR, GCM, …) define how multiple blocks are chained and how IVs/nonces participate. **Authenticated encryption** (preferably AEAD such as AES-GCM or ChaCha20-Poly1305) provides both confidentiality and integrity by default.

Older ciphers (DES, 3DES) appear only in legacy systems; plan migrations. **Stream ciphers** (or counter-based modes) suit streaming I/O when nonces are managed carefully. For every deployment, answer: how are keys rotated, how are nonces unique, and what happens on verification failure?

Course posts on AES internals, malleability, and one-time-pad limits connect back to the definitions sketched here—use this entry as the index for “which mode for which threat model.”
