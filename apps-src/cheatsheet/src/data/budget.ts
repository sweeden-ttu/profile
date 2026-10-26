export interface BudgetRow {
  n: string;
  complexity: string;
  examples: string;
}

// Rough guide for a 1-2 s limit in C++ (~1e8-3e8 simple operations per second).
export const budget: BudgetRow[] = [
  { n: "n ≤ 10–11", complexity: "O(n!) · O(n^6)", examples: "Enumerate permutations, brute-force backtracking" },
  { n: "n ≤ 15–18", complexity: "O(2^n · n^2)", examples: "Bitmask DP with pairwise transitions (TSP / Held-Karp)" },
  { n: "n ≤ 20–25", complexity: "O(2^n · n)", examples: "Subset enumeration, SOS DP; O(3^n) submasks only to n ≈ 16" },
  { n: "n ≤ 40", complexity: "O(2^(n/2) · n)", examples: "Meet in the middle (split, enumerate halves, sort + binary search)" },
  { n: "n ≤ 100", complexity: "O(n^4)", examples: "DP with n^2 states and O(n^2) transitions" },
  { n: "n ≤ 400–500", complexity: "O(n^3)", examples: "Floyd-Warshall, interval DP, matrix multiplication, Gaussian elimination" },
  { n: "n ≤ 2 000", complexity: "O(n^2 log n)", examples: "Quadratic pairs with a sort/heap/BIT inside" },
  { n: "n ≤ 5 000", complexity: "O(n^2)", examples: "2-D DP (LCS, edit distance, knapsack with small W), all pairs" },
  { n: "n ≤ 1e5", complexity: "O(n √n)", examples: "Sqrt decomposition, Mo's algorithm" },
  { n: "n ≤ 2e5–5e5", complexity: "O(n log^2 n)", examples: "Binary search over a BIT/segment tree, CDQ divide & conquer" },
  { n: "n ≤ 1e6", complexity: "O(n log n)", examples: "Sorting, segment/Fenwick trees, Dijkstra, heaps, binary search" },
  { n: "n ≤ 1e7–1e8", complexity: "O(n)", examples: "Linear scans, sieve, prefix sums, two pointers, KMP / Z, monotonic stack" },
  { n: "n ≤ 1e12", complexity: "O(√n)", examples: "Trial division, enumerating divisors, sqrt-blocks of n / i" },
  { n: "n ≤ 1e18", complexity: "O(log n) · O(1)", examples: "Binary search on the answer, fast power, matrix power, digit DP, closed forms" },
];

export const budgetFacts: [string, string][] = [
  ["2^10", "≈ 1e3"],
  ["2^20", "≈ 1e6"],
  ["2^30", "≈ 1e9"],
  ["log2(1e6)", "≈ 20"],
  ["log2(1e9)", "≈ 30"],
  ["10!", "≈ 3.6e6"],
  ["20!", "≈ 2.4e18"],
  ["int32 max", "≈ 2.1e9"],
  ["int64 max", "≈ 9.2e18"],
  ["√1e12", "= 1e6"],
];

export const budgetNotes = [
  "Assumes C++ with ~1e8–3e8 simple operations per second and a 1–2 s limit; constant factors and memory access patterns matter near the edges.",
  "CPython is roughly 10–50x slower: budget ~1e7 simple operations per second. Lean on built-ins (sort, sum, bytearray slicing, bisect, heapq) and avoid deep recursion.",
  "Memory: 256 MB holds ~6e7 ints or ~3e7 64-bit values. A 2^20 x 20 table of int64 is ~168 MB.",
];
