---
layout: post
title: "Public Key Cryptography: Understanding RSA and Key Exchange"
date: 2026-01-15
categories: [computer-science, security]
tags: [cryptography, public-key-cryptography, rsa, diffie-hellman, key-exchange]
excerpt: "Exploring public key cryptography systems, including the RSA algorithm, Diffie-Hellman key exchange, and how asymmetric encryption enables secure communication without shared secrets."
reading_time: 15
course: "Cryptography"
---

# Public Key Cryptography: Understanding RSA and Key Exchange

Public-key cryptography separates *encryption* from *key distribution*: each party publishes a public key and keeps a private key. **RSA** rests on the hardness of factoring (or related problems) while related primitives such as **Diffie–Hellman** address agreement of shared secrets over insecure channels.

This post summarizes the core ideas at a graduate level: key generation, modular exponentiation, correct use of padding and hybrid encryption, and why raw RSA is insufficient in practice. For implementation, prefer well-vetted libraries and modern padding (e.g., OAEP for encryption, PSS for signatures) rather than textbook-only constructions.

See the **Cryptography** course page and later posts for rigorous treatment of attacks, parameters, and pairing with symmetric ciphers for bulk data.
