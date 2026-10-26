---
layout: post
title: "Declared Permissions Are Not a Specification"
date: 2026-10-16
categories: ["agent-verification", "formal-methods"]
tags: ["ai-agents", "formal-verification", "security"]
author: "Scott Weeden"
excerpt: "A study of 6,309 agent skill listings found that declared permissions rarely match what a skill can do. That gap is a verification problem."
---

A preprint posted October 13, "Beyond Maliciousness," profiled 6,309 agent skill listings from two marketplaces, combining static analysis of each bundle with instrumented sandbox runs. About half showed evidence of shell-execution capability. Roughly a third could write files or reach the network, and 13% could access credentials. Of the 6,061 listings whose metadata parsed, only 770 declared any permissions at all, and 59% of those understated what the bundle could do.

The authors' point is that the permission model is close to inert. Nothing checks a skill's declaration against its contents, and pre-approved tools remove the confirmation prompt without restricting what the skill can reach.

This is the gap my research on agent traces is about. A declaration only means something if a checker can compare it with observed behavior. If a skill's allowed actions were written as a small formal language over tool calls, a simple verifier could accept or reject each run's trace with no model in the loop. Until marketplaces do something like that, I would judge a skill by what its bundle can do, not by what its listing says.

**Why it matters:** Agent ecosystems ship capability declarations that nobody verifies, and checking them is a solvable verification problem.

**Sources**

- [Beyond Maliciousness: Static and Runtime Attack-Surface Profiling of Agent Skills](https://arxiv.org/abs/2610.19264) (Pandey et al., arXiv, October 13, 2026)
- [Paper summary on Emergent Mind](https://www.emergentmind.com/papers/2610.19264)
