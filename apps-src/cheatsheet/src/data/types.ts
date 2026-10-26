// Shared content types. Kept free of runtime TS-only syntax so Node can
// import the data files directly (type stripping) in tests/check-snippets.mjs.

export type PatternCategory = "Creational" | "Structural" | "Behavioral" | "Modern" | "Agent";

export interface PatternEntry {
  kind: "pattern";
  id: string;
  name: string;
  aka?: string[];
  category: PatternCategory;
  intent: string;
  when: string[];
  /** Text UML: boxes/arrows drawn with box-drawing characters. */
  structure: string;
  /** Runnable Python 3.10+ example. */
  code: string;
  related: string[];
  tags: string[];
  pitfalls?: string[];
}

export type AlgoCategory =
  | "Search & Techniques"
  | "Graphs"
  | "Data Structures"
  | "Dynamic Programming"
  | "Strings"
  | "Number Theory"
  | "Geometry";

export type VizKind = "binary-search" | "dsu" | "dijkstra";

export interface AlgoEntry {
  kind: "algo";
  id: string;
  name: string;
  aka?: string[];
  category: AlgoCategory;
  idea: string;
  time: string;
  space: string;
  when: string[];
  pitfalls: string[];
  /** Self-contained C++17 (assumes bits/stdc++.h + using namespace std). */
  cpp: string;
  /** Self-contained Python 3.10+. */
  py: string;
  tags: string[];
  related?: string[];
  viz?: VizKind;
}

export type Entry = PatternEntry | AlgoEntry;
