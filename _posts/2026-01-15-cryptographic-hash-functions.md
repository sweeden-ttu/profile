---
layout: post
title: "Cryptographic Hash Functions: Ensuring Data Integrity"
date: 2026-01-15
categories: [computer-science, security]
tags: [cryptography, hash-functions, sha, md5, data-integrity, digital-signatures]
excerpt: "Understanding cryptographic hash functions, their properties, applications in data integrity verification, digital signatures, and password storage systems."
reading_time: 15
course: "Cryptography"
---

# Cryptographic Hash Functions: Ensuring Data Integrity

Cryptographic hashes compress arbitrary data to fixed-size digests with **preimage resistance**, **second-preimage resistance**, and **collision resistance**. Those properties underpin integrity checks, commitment schemes, HMAC-style authentication, and Merkle structures used in protocols and blockchains.

In practice, deprecated algorithms (e.g., MD5, SHA-1 for collision-sensitive uses) must be avoided. Modern designs use SHA-256 / SHA-384 / SHA-512 in the SHA-2 family or SHA-3 where policy requires. Password storage requires **slow, salted** password hashes (e.g., bcrypt, scrypt, Argon2), never raw SHAs.

Hashes also appear inside digital signature and “hash-then-sign” pipelines; pair this note with posts on RSA-PSS, ECDSA, and domain separation so implementation choices stay consistent with your threat model.
