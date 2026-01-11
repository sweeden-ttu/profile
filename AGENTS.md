# Multi-Agent Herbrand Base System

## Overview
This system is focused on the automated generation and validation of **Herbrand Bases** using Prolog.

## Target Course
**CS-5384 Logic for Computer Scientists**
- Specifically Lecture 16: Herbrand's Theorem and Semantics.

## Core Application
The central component is the `scripts/herbrand.pl` Prolog application, which implements:
- `herbrand_universe/2`: Generates ground terms.
- `herbrand_base/2`: Generates ground atoms.
- `satisfies/2`: Checks if a model satisfies a formula.

## Agent Role
- **Agent Herbrand**: responsible for the Prolog implementation and correctness verification.
- **Agent Logic**: responsible for extracting requirements from lecture materials.

## Success Criteria
- Correctness against textbook examples.
- Readable and well-commented Prolog code.
- Integration with the Jekyll blog for displaying results.
