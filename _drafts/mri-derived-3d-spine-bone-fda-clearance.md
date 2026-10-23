---
layout: post
title: "Reading MRI as Geometry: An FDA Clearance for MRI-Derived 3D Spine Bone"
date: 2026-10-09
categories: ["medical-imaging", "machine-learning"]
tags: ["medical-imaging", "mri", "fda"]
author: "Scott Weeden"
excerpt: "MRI2CT's NextMR was cleared to build 3D lumbar spine and sacrum bone models from routine MRI. The interesting part is how it was validated."
---

On October 7, MRI2CT announced FDA 510(k) clearance for NextMR, software that builds 3D bone models of the lower lumbar spine and sacrum from a patient's routine MRI. The practical goal is to give surgeons a bone view from the MRI the patient already has, instead of ordering a separate CT and the radiation that comes with it.

What interests me is the validation. The company reports submillimeter accuracy in outlining cortical bone on a retrospective set of 145 adults who had both MRI and CT, from sites in the U.S. and Israel. Paired scans give a reference to measure against, which most imaging models lack. The coverage I read gives no numeric error, measurement protocol, or breakdown by pathology or scanner, so I would want the 510(k) summary before drawing conclusions.

In my own knee MRI work the hard part is similar: series differ in plane, voxel spacing, and fat suppression, and a trusted baseline has to come before any claim about what a model "sees." A clearance for a geometric task, measured against a paired reference, is a sensible place for the field to build trust.

**Why it matters:** A regulator accepted an MRI model for a measurable geometric task with a paired-CT reference, not for a diagnostic claim.

**Sources**

- [MRI2CT Receives FDA Clearance for AI-Powered Imaging Platform](https://www.itnonline.com/content/mri2ct-receives-fda-clearance-ai-powered-imaging-platform) (ITN, October 7, 2026)
- [MRI2CT gets FDA clearance for MRI-based spine imaging software](https://www.auntminnie.com/clinical-news/mri/news/15836912/mri2ct-gets-fda-clearance-for-mribased-spine-imaging-software) (AuntMinnie, October 7, 2026)
