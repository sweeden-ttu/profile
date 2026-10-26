---
layout: post
title: "A CA Private Key Equal to 4"
date: 2026-10-23
categories: ["cryptography", "security"]
tags: ["cryptography", "pki", "elliptic-curves"]
author: "Scott Weeden"
excerpt: "eMudhra revoked eight intermediate CAs whose P-384 private keys were all below 256. The curve was fine; the key ceremony was not."
---

Last week eMudhra, an Indian certificate authority, revoked eight intermediate CA certificates after a researcher found that their P-384 private keys were all below 256. Recovering one takes at most 256 guesses, and one published key was the number 4. Six of the intermediates could issue TLS certificates and two were for code signing, and some had been cross-signed by Sectigo. Mozilla and Chrome blocked them on October 17, the day of the report, and Apple and Microsoft followed within days.

eMudhra's preliminary explanation is a flaw in its key-ceremony script that created a second, weak key pair on the HSM, which was then picked for signing because its label resembled the right one. A June 2025 report of invalid CRL signatures from the same intermediates was an early warning, and it was closed as a manual error.

The elliptic-curve math was never the problem. Nothing caught that the signing keys were trivially small, so for about eighteen months part of the web's trust chain rested on a procedure no one had tested. Browsers are covered now. Go, Python's certifi, and other private trust stores needed updates, and clients that skip revocation checks may still need them.

**Why it matters:** Key ceremonies and trust stores are code and procedure, and they can fail in ways no amount of curve security prevents.

**Sources**

- [Mozilla, Google, Apple block compromised eMudhra CA certificates](https://bleepingcomputer.com/news/security/mozilla-google-apple-block-compromised-emudhra-ca-certificates) (BleepingComputer, October 20, 2026)
- [eMudhra CA Key Compromise: Weak Keys, Risks and Fixes](https://socradar.io/blog/emudhra-ca-key-compromise-weak-keys-risks-and-fixes) (SOCRadar)
- [Apple Blocks Certificates That Could Help Attackers Fake Websites](https://www.macrumors.com/2026/10/22/apple-blocks-certificates-that-could-help-attackers/) (MacRumors, October 22, 2026)
