import type { AlgoEntry } from "./types.ts";

const src = (s: TemplateStringsArray, ...v: unknown[]) =>
  String.raw(s, ...v).replace(/^\n/, "").replace(/\s+$/, "");

export const algosB: AlgoEntry[] = [
  // ───────────────────────── Data Structures ─────────────────────────
  {
    kind: "algo",
    id: "dsu",
    name: "Disjoint Set Union (Union-Find)",
    aka: ["DSU", "union find", "merge-find"],
    category: "Data Structures",
    idea: "A forest where each set is a tree identified by its root. find() follows parents to the root and compresses the path; union() links the root of lower rank under the root of higher rank.",
    time: "O(α(n)) amortised per operation (inverse Ackermann, ≤ 4 in practice)",
    space: "O(n)",
    when: [
      "Dynamic connectivity with only merges: components, Kruskal's MST, cycle detection in undirected graphs.",
      "Offline problems processed in reverse (deletions become unions).",
      "Grouping equal items (accounts merge, equations a == b).",
    ],
    pitfalls: [
      "Both path compression AND union by rank/size are needed for the α(n) bound.",
      "Always compare roots (find(a) == find(b)), never raw parents.",
      "Undo/rollback needs union by rank WITHOUT path compression (O(log n) find).",
    ],
    cpp: src`
struct DSU {
    vector<int> p, r;                          // parent, rank (upper bound on height)
    DSU(int n) : p(n), r(n, 0) { iota(p.begin(), p.end(), 0); }
    int find(int x) {                          // full path compression
        return p[x] == x ? x : p[x] = find(p[x]);
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;              // already in the same set
        if (r[a] < r[b]) swap(a, b);           // union by rank
        p[b] = a;
        if (r[a] == r[b]) r[a]++;
        return true;
    }
    bool same(int a, int b) { return find(a) == find(b); }
};`,
    py: src`
class DSU:
    def __init__(self, n: int):
        self.p = list(range(n))
        self.rank = [0] * n
        self.sets = n

    def find(self, x: int) -> int:
        root = x
        while self.p[root] != root:
            root = self.p[root]
        while self.p[x] != root:               # path compression (second pass)
            self.p[x], x = root, self.p[x]
        return root

    def union(self, a: int, b: int) -> bool:
        a, b = self.find(a), self.find(b)
        if a == b:
            return False
        if self.rank[a] < self.rank[b]:        # union by rank
            a, b = b, a
        self.p[b] = a
        if self.rank[a] == self.rank[b]:
            self.rank[a] += 1
        self.sets -= 1
        return True`,
    tags: ["union-find", "connectivity", "amortised", "graph"],
    related: ["mst", "dfs"],
    viz: "dsu",
  },
  {
    kind: "algo",
    id: "fenwick",
    name: "Fenwick Tree (Binary Indexed Tree)",
    aka: ["BIT"],
    category: "Data Structures",
    idea: "Node i stores the sum of the last lowbit(i) = i & -i elements ending at i. Prefix sums walk down by removing the low bit; updates walk up by adding it.",
    time: "O(log n) update and prefix query; O(n log n) build (O(n) possible)",
    space: "O(n)",
    when: [
      "Point update + prefix/range sum; counting inversions (BIT over compressed values).",
      "Range update + point query (BIT over the difference array).",
      "Order statistics: k-th smallest via binary descent on the tree.",
    ],
    pitfalls: [
      "It is 1-indexed internally - index 0 would loop forever (0 & -0 = 0).",
      "Only for invertible ops (sum, xor) on ranges; use a segment tree for min/max over ranges.",
    ],
    cpp: src`
struct Fenwick {
    int n;
    vector<long long> f;                  // 1-indexed internally
    Fenwick(int n) : n(n), f(n + 1, 0) {}
    void add(int i, long long v) {        // a[i] += v   (i is 0-indexed)
        for (++i; i <= n; i += i & -i) f[i] += v;
    }
    long long prefix(int i) const {       // a[0] + ... + a[i-1]
        long long s = 0;
        for (; i > 0; i -= i & -i) s += f[i];
        return s;
    }
    long long range(int l, int r) const { return prefix(r + 1) - prefix(l); }  // [l, r]
    // smallest idx with prefix(idx + 1) >= k, assuming all a[i] >= 0; n if none
    int lowerBound(long long k) const {
        int pos = 0, step = 1;
        while (step * 2 <= n) step *= 2;
        for (; step; step /= 2)
            if (pos + step <= n && f[pos + step] < k) { pos += step; k -= f[pos]; }
        return pos;
    }
};`,
    py: src`
class Fenwick:
    def __init__(self, n: int):
        self.n, self.f = n, [0] * (n + 1)      # 1-indexed internally

    def add(self, i: int, v: int):             # a[i] += v (0-indexed)
        i += 1
        while i <= self.n:
            self.f[i] += v
            i += i & -i

    def prefix(self, i: int) -> int:           # sum of a[0:i]
        s = 0
        while i > 0:
            s += self.f[i]
            i -= i & -i
        return s

    def range_sum(self, l: int, r: int) -> int:   # a[l..r] inclusive
        return self.prefix(r + 1) - self.prefix(l)

def count_inversions(a: list[int]) -> int:
    rank = {v: i for i, v in enumerate(sorted(set(a)))}
    bit, inv = Fenwick(len(rank)), 0
    for seen, x in enumerate(a):
        inv += seen - bit.prefix(rank[x] + 1)     # earlier elements > x
        bit.add(rank[x], 1)
    return inv`,
    tags: ["range-query", "tree", "log n", "prefix-sums"],
    related: ["segment-tree", "prefix-sums", "sorting-compression"],
  },
  {
    kind: "algo",
    id: "segment-tree",
    name: "Segment Tree",
    aka: ["range query tree"],
    category: "Data Structures",
    idea: "A binary tree over the array where each node stores op() of its segment. Any range decomposes into O(log n) nodes. The iterative bottom-up version below stores leaves at t[n..2n).",
    time: "O(n) build, O(log n) point update and range query",
    space: "O(n)",
    when: [
      "Range min/max/sum/gcd with point updates.",
      "Any associative op with an identity (matrix products, 'max subarray' node merges).",
      "Descending to find the first index where a prefix condition holds.",
    ],
    pitfalls: [
      "Pick the identity correctly (INF for min, 0 for sum, -INF for max).",
      "Half-open [l, r) vs inclusive [l, r] - be consistent at the call sites.",
      "For non-commutative ops keep separate left/right accumulators (as below).",
    ],
    cpp: src`
// iterative segment tree: point assign, query op over [l, r)
struct SegTree {
    int n;
    vector<long long> t;
    static long long op(long long a, long long b) { return min(a, b); }
    static constexpr long long ID = LLONG_MAX;               // identity of op
    SegTree(const vector<long long>& a) : n(a.size()), t(2 * a.size(), ID) {
        for (int i = 0; i < n; i++) t[n + i] = a[i];
        for (int i = n - 1; i > 0; i--) t[i] = op(t[2 * i], t[2 * i + 1]);
    }
    void set(int i, long long v) {
        t[i += n] = v;
        for (i >>= 1; i >= 1; i >>= 1) t[i] = op(t[2 * i], t[2 * i + 1]);
    }
    long long query(int l, int r) const {                    // [l, r)
        long long resl = ID, resr = ID;
        for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
            if (l & 1) resl = op(resl, t[l++]);
            if (r & 1) resr = op(t[--r], resr);
        }
        return op(resl, resr);
    }
};`,
    py: src`
class SegTree:
    """Iterative segment tree; any associative op with identity. query on [l, r)."""
    def __init__(self, a: list, op=min, ident=float("inf")):
        self.n, self.op, self.id = len(a), op, ident
        self.t = [ident] * self.n + list(a)
        for i in range(self.n - 1, 0, -1):
            self.t[i] = op(self.t[2 * i], self.t[2 * i + 1])

    def set(self, i: int, v):
        i += self.n
        self.t[i] = v
        i >>= 1
        while i:
            self.t[i] = self.op(self.t[2 * i], self.t[2 * i + 1])
            i >>= 1

    def query(self, l: int, r: int):
        resl = resr = self.id
        l += self.n
        r += self.n
        while l < r:
            if l & 1:
                resl = self.op(resl, self.t[l]); l += 1
            if r & 1:
                r -= 1; resr = self.op(self.t[r], resr)
            l >>= 1
            r >>= 1
        return self.op(resl, resr)

# sum tree:  SegTree(a, op=lambda x, y: x + y, ident=0)`,
    tags: ["range-query", "tree", "log n"],
    related: ["segment-tree-lazy", "fenwick", "sparse-table"],
  },
  {
    kind: "algo",
    id: "segment-tree-lazy",
    name: "Segment Tree with Lazy Propagation",
    aka: ["lazy segtree", "range update range query"],
    category: "Data Structures",
    idea: "Store a pending update (tag) at nodes fully covered by a range update instead of touching every leaf; push the tag to children only when you need to descend through that node.",
    time: "O(log n) range update and range query",
    space: "O(4n)",
    when: [
      "Range add / range assign combined with range sum / min / max.",
      "Painting intervals, counting covered length (with coordinate compression).",
    ],
    pitfalls: [
      "Always push before descending, and pull (recompute) after recursing.",
      "Composing tags: e.g. assign must override pending adds; order matters.",
      "Allocate 4n nodes for the recursive layout.",
    ],
    cpp: src`
// range add, range sum on inclusive [l, r]
struct LazySeg {
    int n;
    vector<long long> sum, lz;
    LazySeg(const vector<long long>& a) : n(a.size()), sum(4 * n), lz(4 * n) { build(a, 1, 0, n - 1); }
    void build(const vector<long long>& a, int x, int l, int r) {
        if (l == r) { sum[x] = a[l]; return; }
        int m = (l + r) / 2;
        build(a, 2 * x, l, m); build(a, 2 * x + 1, m + 1, r);
        sum[x] = sum[2 * x] + sum[2 * x + 1];
    }
    void apply(int x, int l, int r, long long v) { sum[x] += v * (r - l + 1); lz[x] += v; }
    void push(int x, int l, int r) {
        if (!lz[x]) return;
        int m = (l + r) / 2;
        apply(2 * x, l, m, lz[x]); apply(2 * x + 1, m + 1, r, lz[x]);
        lz[x] = 0;
    }
    void add(int ql, int qr, long long v, int x, int l, int r) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { apply(x, l, r, v); return; }
        push(x, l, r);
        int m = (l + r) / 2;
        add(ql, qr, v, 2 * x, l, m); add(ql, qr, v, 2 * x + 1, m + 1, r);
        sum[x] = sum[2 * x] + sum[2 * x + 1];
    }
    long long query(int ql, int qr, int x, int l, int r) {
        if (qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return sum[x];
        push(x, l, r);
        int m = (l + r) / 2;
        return query(ql, qr, 2 * x, l, m) + query(ql, qr, 2 * x + 1, m + 1, r);
    }
    void add(int l, int r, long long v) { add(l, r, v, 1, 0, n - 1); }
    long long query(int l, int r) { return query(l, r, 1, 0, n - 1); }
};`,
    py: src`
class LazySeg:
    """Range add, range sum on inclusive [l, r]."""
    def __init__(self, a: list[int]):
        self.n = len(a)
        self.sum = [0] * (4 * self.n)
        self.lz = [0] * (4 * self.n)
        self._build(a, 1, 0, self.n - 1)

    def _build(self, a, x, l, r):
        if l == r:
            self.sum[x] = a[l]
            return
        m = (l + r) // 2
        self._build(a, 2 * x, l, m)
        self._build(a, 2 * x + 1, m + 1, r)
        self.sum[x] = self.sum[2 * x] + self.sum[2 * x + 1]

    def _apply(self, x, l, r, v):
        self.sum[x] += v * (r - l + 1)
        self.lz[x] += v

    def _push(self, x, l, r):
        if self.lz[x]:
            m = (l + r) // 2
            self._apply(2 * x, l, m, self.lz[x])
            self._apply(2 * x + 1, m + 1, r, self.lz[x])
            self.lz[x] = 0

    def add(self, ql, qr, v, x=1, l=0, r=None):
        r = self.n - 1 if r is None else r
        if qr < l or r < ql:
            return
        if ql <= l and r <= qr:
            self._apply(x, l, r, v)
            return
        self._push(x, l, r)
        m = (l + r) // 2
        self.add(ql, qr, v, 2 * x, l, m)
        self.add(ql, qr, v, 2 * x + 1, m + 1, r)
        self.sum[x] = self.sum[2 * x] + self.sum[2 * x + 1]

    def query(self, ql, qr, x=1, l=0, r=None):
        r = self.n - 1 if r is None else r
        if qr < l or r < ql:
            return 0
        if ql <= l and r <= qr:
            return self.sum[x]
        self._push(x, l, r)
        m = (l + r) // 2
        return self.query(ql, qr, 2 * x, l, m) + self.query(ql, qr, 2 * x + 1, m + 1, r)`,
    tags: ["range-query", "range-update", "tree", "log n"],
    related: ["segment-tree", "fenwick", "prefix-sums"],
  },
  {
    kind: "algo",
    id: "sparse-table",
    name: "Sparse Table",
    aka: ["RMQ"],
    category: "Data Structures",
    idea: "st[k][i] = op over a[i .. i + 2^k - 1]. For an idempotent op (min, max, gcd, and/or) any range is covered by two overlapping power-of-two blocks.",
    time: "O(n log n) build, O(1) query",
    space: "O(n log n)",
    when: [
      "Static array (no updates) with many range-min/max/gcd queries.",
      "LCA in O(1) via Euler tour + RMQ.",
    ],
    pitfalls: [
      "O(1) only for idempotent ops; sums need the O(log n) disjoint-block query.",
      "No updates - use a segment tree if values change.",
    ],
    cpp: src`
struct SparseTable {
    vector<vector<int>> st;
    vector<int> lg;
    SparseTable(const vector<int>& a) {
        int n = a.size();
        lg.assign(n + 1, 0);
        for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
        st.assign(lg[n] + 1, a);
        for (int k = 1; k <= lg[n]; k++)
            for (int i = 0; i + (1 << k) <= n; i++)
                st[k][i] = min(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
    }
    int query(int l, int r) const {                 // inclusive [l, r]
        int k = lg[r - l + 1];
        return min(st[k][l], st[k][r - (1 << k) + 1]);   // overlap is fine for min
    }
};`,
    py: src`
class SparseTable:
    """Static range-min in O(1) after O(n log n) build (any idempotent op)."""
    def __init__(self, a: list[int]):
        n = len(a)
        self.st = [list(a)]
        k = 1
        while (1 << k) <= n:
            prev, half = self.st[-1], 1 << (k - 1)
            self.st.append([min(prev[i], prev[i + half]) for i in range(n - (1 << k) + 1)])
            k += 1

    def query(self, l: int, r: int) -> int:        # inclusive [l, r]
        k = (r - l + 1).bit_length() - 1
        return min(self.st[k][l], self.st[k][r - (1 << k) + 1])`,
    tags: ["range-query", "static", "rmq", "constant-time"],
    related: ["segment-tree", "lca"],
  },

  // ───────────────────────── Dynamic Programming ─────────────────────────
  {
    kind: "algo",
    id: "knapsack",
    name: "Knapsack (0/1 & Unbounded)",
    aka: ["subset sum", "coin change"],
    category: "Dynamic Programming",
    idea: "dp[c] = best value achievable with capacity c. For 0/1 items iterate capacity downwards so each item is used once; for unbounded items iterate upwards so it can be reused.",
    time: "O(n · W)",
    space: "O(W)",
    when: [
      "Pick items under a weight/budget limit; subset sum; partition into equal halves.",
      "Coin change (count ways = unbounded with + instead of max; min coins with min).",
      "W too large but n ≤ 40 => meet in the middle; values small => dp over value instead of weight.",
    ],
    pitfalls: [
      "Loop direction is the whole difference between 0/1 and unbounded.",
      "Counting combinations vs permutations: items outer loop = combinations; capacity outer = permutations.",
      "Pseudo-polynomial: W = 1e9 is not feasible.",
    ],
    cpp: src`
// 0/1 knapsack: max total value with capacity W
long long knapsack01(const vector<int>& wt, const vector<long long>& val, int W) {
    vector<long long> dp(W + 1, 0);
    for (size_t i = 0; i < wt.size(); i++)
        for (int c = W; c >= wt[i]; c--)              // descending: item used at most once
            dp[c] = max(dp[c], dp[c - wt[i]] + val[i]);
    return dp[W];
}

// unbounded: ascending capacity lets an item be reused
long long knapsackUnbounded(const vector<int>& wt, const vector<long long>& val, int W) {
    vector<long long> dp(W + 1, 0);
    for (size_t i = 0; i < wt.size(); i++)
        for (int c = wt[i]; c <= W; c++)
            dp[c] = max(dp[c], dp[c - wt[i]] + val[i]);
    return dp[W];
}

// subset sum with a bitset: bit s set <=> some subset sums to s
const int MAXS = 100000;
bitset<MAXS + 1> subsetSums(const vector<int>& a) {
    bitset<MAXS + 1> b; b[0] = 1;
    for (int x : a) b |= b << x;
    return b;
}`,
    py: src`
def knapsack_01(wt: list[int], val: list[int], W: int) -> int:
    dp = [0] * (W + 1)
    for w, v in zip(wt, val):
        for c in range(W, w - 1, -1):          # descending: each item at most once
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[W]

def knapsack_unbounded(wt: list[int], val: list[int], W: int) -> int:
    dp = [0] * (W + 1)
    for w, v in zip(wt, val):
        for c in range(w, W + 1):              # ascending: item reusable
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[W]

def subset_sums(a: list[int], limit: int) -> int:
    """Python int as a bitset: bit s is 1 iff some subset sums to s (s <= limit)."""
    bits, mask = 1, (1 << (limit + 1)) - 1
    for x in a:
        bits = (bits | (bits << x)) & mask
    return bits

def coin_change_ways(coins: list[int], amount: int) -> int:
    ways = [1] + [0] * amount
    for c in coins:                            # coins outer => combinations
        for s in range(c, amount + 1):
            ways[s] += ways[s - c]
    return ways[amount]`,
    tags: ["dp", "subset", "pseudo-polynomial", "bitset"],
    related: ["meet-in-the-middle", "bitmask-dp"],
  },
  {
    kind: "algo",
    id: "lis",
    name: "Longest Increasing Subsequence (O(n log n))",
    aka: ["LIS", "patience sorting"],
    category: "Dynamic Programming",
    idea: "tails[k] = smallest possible tail of an increasing subsequence of length k + 1. tails stays sorted, so each element binary-searches its slot and replaces it (or extends the list).",
    time: "O(n log n)",
    space: "O(n)",
    when: [
      "Longest strictly increasing (lower_bound) or non-decreasing (upper_bound) subsequence.",
      "Box/envelope nesting: sort by width asc, height desc, then LIS on heights.",
      "Minimum number of decreasing sequences to cover an array (Dilworth) = LIS length.",
    ],
    pitfalls: [
      "tails is NOT an actual subsequence - keep parent pointers to reconstruct.",
      "Strict vs non-strict changes lower_bound <-> upper_bound.",
    ],
    cpp: src`
// length of the longest STRICTLY increasing subsequence
int lisLength(const vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);   // upper_bound => non-decreasing
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}

// one actual LIS (indices into a), via parent pointers
vector<int> lisIndices(const vector<int>& a) {
    int n = a.size();
    vector<int> tailVal, tailIdx, par(n, -1);
    for (int i = 0; i < n; i++) {
        int k = lower_bound(tailVal.begin(), tailVal.end(), a[i]) - tailVal.begin();
        if (k == (int)tailVal.size()) { tailVal.push_back(a[i]); tailIdx.push_back(i); }
        else { tailVal[k] = a[i]; tailIdx[k] = i; }
        par[i] = k > 0 ? tailIdx[k - 1] : -1;
    }
    vector<int> res;
    for (int i = tailIdx.empty() ? -1 : tailIdx.back(); i != -1; i = par[i]) res.push_back(i);
    reverse(res.begin(), res.end());
    return res;
}`,
    py: src`
from bisect import bisect_left

def lis(a: list[int]) -> list[int]:
    """Returns one longest strictly increasing subsequence (values)."""
    tails, tails_idx = [], []               # tail values / their indices in a
    prev = [-1] * len(a)
    for i, x in enumerate(a):
        k = bisect_left(tails, x)           # bisect_right => non-decreasing
        if k == len(tails):
            tails.append(x); tails_idx.append(i)
        else:
            tails[k] = x; tails_idx[k] = i
        prev[i] = tails_idx[k - 1] if k > 0 else -1
    out, i = [], tails_idx[-1] if tails_idx else -1
    while i != -1:
        out.append(a[i])
        i = prev[i]
    return out[::-1]`,
    tags: ["dp", "binary-search", "subsequence", "log n"],
    related: ["binary-search", "fenwick"],
  },
  {
    kind: "algo",
    id: "bitmask-dp",
    name: "Bitmask DP (e.g. TSP / Held-Karp)",
    aka: ["subset DP", "Held-Karp"],
    category: "Dynamic Programming",
    idea: "Encode a subset of n ≤ ~20 items as an integer mask. dp[mask][last] = best cost to visit exactly 'mask' ending at 'last'; transitions add one new element.",
    time: "O(2^n · n^2) for TSP; O(3^n) for submask enumeration",
    space: "O(2^n · n)",
    when: [
      "Assignment / ordering problems with n ≤ 20 (TSP, Hamiltonian path, task assignment).",
      "Set cover / partition into groups via submask enumeration (n ≤ ~16).",
      "SOS (sum over subsets) DP for 'for every mask, aggregate its submasks' in O(2^n · n).",
    ],
    pitfalls: [
      "Memory: 2^20 · 20 · 8 bytes ≈ 168 MB - use int or drop a dimension if possible.",
      "Operator precedence: write (mask >> i) & 1 and mask | (1 << i) with parentheses.",
      "Iterate masks in increasing order so subsets are computed before supersets.",
    ],
    cpp: src`
// Held-Karp: shortest Hamiltonian cycle through all n cities, starting at 0
long long tsp(const vector<vector<long long>>& c) {
    int n = c.size();
    if (n == 1) return 0;
    const long long INF = LLONG_MAX / 4;
    vector<vector<long long>> dp(1 << n, vector<long long>(n, INF));
    dp[1][0] = 0;                                     // visited {0}, standing at 0
    for (int mask = 1; mask < (1 << n); mask += 2) {  // odd masks: 0 always visited
        for (int u = 0; u < n; u++) {
            if (!((mask >> u) & 1) || dp[mask][u] >= INF) continue;
            for (int v = 0; v < n; v++) {
                if ((mask >> v) & 1) continue;
                int nm = mask | (1 << v);
                dp[nm][v] = min(dp[nm][v], dp[mask][u] + c[u][v]);
            }
        }
    }
    long long best = INF;
    for (int u = 1; u < n; u++) best = min(best, dp[(1 << n) - 1][u] + c[u][0]);
    return best;
}

// enumerate all non-empty submasks s of m (descending):
//   for (int s = m; s > 0; s = (s - 1) & m) { ... }`,
    py: src`
def tsp(c: list[list[int]]) -> int:
    n = len(c)
    if n == 1:
        return 0
    INF = float("inf")
    full = 1 << n
    dp = [[INF] * n for _ in range(full)]
    dp[1][0] = 0
    for mask in range(1, full, 2):               # odd masks: city 0 visited
        row = dp[mask]
        for u in range(n):
            du = row[u]
            if du == INF or not (mask >> u) & 1:
                continue
            for v in range(n):
                if (mask >> v) & 1:
                    continue
                nm = mask | (1 << v)
                if du + c[u][v] < dp[nm][v]:
                    dp[nm][v] = du + c[u][v]
    return min(dp[full - 1][u] + c[u][0] for u in range(1, n))

def submasks(m: int):
    s = m
    while s:
        yield s
        s = (s - 1) & m`,
    tags: ["dp", "bitmask", "exponential", "subset"],
    related: ["meet-in-the-middle", "knapsack"],
  },
  {
    kind: "algo",
    id: "digit-dp",
    name: "Digit DP",
    category: "Dynamic Programming",
    idea: "Count numbers in [0, N] with a digit property by building them left-to-right. State: position, a small summary of digits so far, 'tight' (prefix equals N's prefix so far) and 'started' (past leading zeros).",
    time: "O(digits · states · 10)",
    space: "O(digits · states)",
    when: [
      "\"How many x in [L, R] such that ...\" with R up to 1e18: digit sums, forbidden patterns, divisibility.",
      "Answer for [L, R] = f(R) - f(L - 1).",
    ],
    pitfalls: [
      "Leading zeros: track 'started' when they would affect the property (e.g. adjacent digits).",
      "Memoise only non-tight states (or include tight in the key) and reset memo per N if it depends on N's length.",
      "Handle L = 0 (f(-1) = 0).",
    ],
    cpp: src`
// count x in [0, N] with no two adjacent equal digits
string D;
long long memo[20][11][2];
bool seen[20][11][2];

// prev = previous digit, or 10 if nothing placed yet
long long go(int pos, int prev, bool tight, bool started) {
    if (pos == (int)D.size()) return 1;               // one complete number (0 counts)
    if (!tight && seen[pos][prev][started]) return memo[pos][prev][started];
    long long res = 0;
    int lim = tight ? D[pos] - '0' : 9;
    for (int d = 0; d <= lim; d++) {
        bool ns = started || d != 0;
        if (started && d == prev) continue;           // adjacent equal digits
        res += go(pos + 1, ns ? d : 10, tight && d == lim, ns);
    }
    if (!tight) { seen[pos][prev][started] = true; memo[pos][prev][started] = res; }
    return res;
}

long long countUpTo(long long N) {
    if (N < 0) return 0;
    D = to_string(N);
    memset(seen, 0, sizeof seen);                    // memo depends on D's length
    return go(0, 10, true, false);
}
// count in [L, R] = countUpTo(R) - countUpTo(L - 1)`,
    py: src`
from functools import lru_cache

def count_no_adjacent_equal(N: int) -> int:
    """How many x in [0, N] have no two adjacent equal digits."""
    if N < 0:
        return 0
    D = list(map(int, str(N)))

    @lru_cache(maxsize=None)
    def go(pos: int, prev: int, tight: bool, started: bool) -> int:
        if pos == len(D):
            return 1
        res = 0
        for d in range(D[pos] + 1 if tight else 10):
            if started and d == prev:
                continue
            ns = started or d != 0
            res += go(pos + 1, d if ns else 10, tight and d == D[pos], ns)
        return res

    return go(0, 10, True, False)

# count in [L, R] = f(R) - f(L - 1)`,
    tags: ["dp", "counting", "digits", "memoisation"],
    related: ["bitmask-dp"],
  },
  {
    kind: "algo",
    id: "interval-dp",
    name: "Interval DP (e.g. Matrix-Chain)",
    aka: ["range DP"],
    category: "Dynamic Programming",
    idea: "dp[i][j] = best answer for the segment i..j, computed from smaller segments by choosing a split point k (or the last/first operation). Iterate by increasing length.",
    time: "O(n^3) typical (O(n^2) with Knuth's optimisation when it applies)",
    space: "O(n^2)",
    when: [
      "Matrix-chain multiplication, optimal BST, merging stones, burst balloons.",
      "Palindromic subsequence/partitioning, polygon triangulation.",
      "Any 'combine adjacent parts, cost depends on the segment' problem.",
    ],
    pitfalls: [
      "Fill order: by length (or i descending, j ascending) so subproblems exist.",
      "Define clearly whether k is the last split or the last element removed (burst balloons uses exclusive bounds).",
    ],
    cpp: src`
// matrix i has shape dims[i] x dims[i+1]; minimum number of scalar multiplications
long long matrixChain(const vector<long long>& dims) {
    int n = dims.size() - 1;
    vector<vector<long long>> dp(n, vector<long long>(n, 0));
    for (int len = 2; len <= n; len++)                // shorter intervals first
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = LLONG_MAX;
            for (int k = i; k < j; k++)               // split between k and k+1
                dp[i][j] = min(dp[i][j],
                               dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]);
        }
    return dp[0][n - 1];
}`,
    py: src`
def matrix_chain(dims: list[int]) -> int:
    """Matrix i has shape dims[i] x dims[i+1]. Min scalar multiplications."""
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):              # shorter intervals first
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = min(dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
                           for k in range(i, j))
    return dp[0][n - 1]

def longest_pal_subseq(s: str) -> int:
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):              # i descending, j ascending
        dp[i][i] = 1
        for j in range(i + 1, n):
            dp[i][j] = dp[i + 1][j - 1] + 2 if s[i] == s[j] else max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1] if n else 0`,
    tags: ["dp", "intervals", "cubic"],
    related: ["tree-dp", "knapsack"],
  },
  {
    kind: "algo",
    id: "tree-dp",
    name: "DP on Trees (incl. Rerooting)",
    aka: ["tree DP", "rerooting", "all-roots DP"],
    category: "Dynamic Programming",
    idea: "Compute dp[u] from its children's dp in post-order. Rerooting: a second top-down pass moves the root across each edge, deriving every vertex's answer as if it were the root in O(1) per edge.",
    time: "O(n)",
    space: "O(n)",
    when: [
      "Max independent set / vertex cover on trees, subtree sizes and sums, tree diameter.",
      "\"For every vertex as root\": sum of distances, farthest node (rerooting).",
      "Tree knapsack (merge children with small-to-large bounds for O(n^2)).",
    ],
    pitfalls: [
      "Avoid recursion on deep trees (path graphs): compute a BFS/DFS order and process it reversed.",
      "In rerooting you must 'remove' the child's contribution from the parent - store prefix/suffix aggregates when the op isn't invertible.",
    ],
    cpp: src`
// parent array + an order where every parent precedes its children
void rootTree(const vector<vector<int>>& adj, vector<int>& par, vector<int>& order) {
    int n = adj.size();
    par.assign(n, -1); order = {0}; par[0] = 0;
    for (int i = 0; i < (int)order.size(); i++)
        for (int v : adj[order[i]]) if (par[v] == -1) { par[v] = order[i]; order.push_back(v); }
}

// max weight independent set: no two chosen vertices adjacent
long long maxIndependentSet(const vector<vector<int>>& adj, const vector<long long>& w) {
    vector<int> par, order;
    rootTree(adj, par, order);
    int n = adj.size();
    vector<long long> take(w), skip(n, 0);
    for (int i = n - 1; i > 0; i--) {                // children before parents
        int u = order[i], p = par[u];
        take[p] += skip[u];
        skip[p] += max(take[u], skip[u]);
    }
    return max(take[0], skip[0]);
}

// rerooting: ans[u] = sum over v of dist(u, v)
vector<long long> sumOfDistances(const vector<vector<int>>& adj) {
    vector<int> par, order;
    rootTree(adj, par, order);
    int n = adj.size();
    vector<long long> depth(n, 0), sz(n, 1), ans(n, 0);
    for (int i = 1; i < n; i++) depth[order[i]] = depth[par[order[i]]] + 1;
    for (int i = n - 1; i > 0; i--) sz[par[order[i]]] += sz[order[i]];
    ans[0] = accumulate(depth.begin(), depth.end(), 0LL);
    for (int i = 1; i < n; i++) {                    // move root from par[u] to u
        int u = order[i];
        ans[u] = ans[par[u]] - sz[u] + (n - sz[u]);
    }
    return ans;
}`,
    py: src`
def root_tree(adj: list[list[int]], root: int = 0):
    par, order = [-1] * len(adj), [root]
    par[root] = root
    for u in order:                       # list grows while iterating = BFS order
        for v in adj[u]:
            if par[v] == -1:
                par[v] = u
                order.append(v)
    return par, order

def max_independent_set(adj: list[list[int]], w: list[int]) -> int:
    par, order = root_tree(adj)
    take, skip = list(w), [0] * len(adj)
    for u in reversed(order[1:]):         # children before parents
        p = par[u]
        take[p] += skip[u]
        skip[p] += max(take[u], skip[u])
    return max(take[order[0]], skip[order[0]])

def sum_of_distances(adj: list[list[int]]) -> list[int]:
    """Rerooting: ans[u] = sum of dist(u, v) over all v, in O(n)."""
    n = len(adj)
    par, order = root_tree(adj)
    depth, sz = [0] * n, [1] * n
    for u in order[1:]:
        depth[u] = depth[par[u]] + 1
    for u in reversed(order[1:]):
        sz[par[u]] += sz[u]
    ans = [0] * n
    ans[0] = sum(depth)
    for u in order[1:]:                   # move the root from par[u] to u
        ans[u] = ans[par[u]] - sz[u] + (n - sz[u])
    return ans`,
    tags: ["dp", "tree", "rerooting", "linear"],
    related: ["lca", "dfs", "interval-dp"],
  },

  // ───────────────────────────── Strings ─────────────────────────────
  {
    kind: "algo",
    id: "kmp",
    name: "Prefix Function / KMP",
    aka: ["Knuth-Morris-Pratt", "failure function", "pi array"],
    category: "Strings",
    idea: "pi[i] = length of the longest proper prefix of s[0..i] that is also a suffix of it. On a mismatch, fall back to pi[k-1] instead of restarting, so matching never moves backwards in the text.",
    time: "O(n + m)",
    space: "O(m)",
    when: [
      "Find all occurrences of a pattern in a text.",
      "Smallest period of a string: n - pi[n-1] (a full repetition iff it divides n).",
      "Count occurrences of every prefix; build a KMP automaton for DP over strings.",
    ],
    pitfalls: [
      "Pattern must be non-empty.",
      "After a full match, continue from k = pi[k-1] to find overlapping matches.",
    ],
    cpp: src`
vector<int> prefixFunction(const string& s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int k = pi[i - 1];
        while (k > 0 && s[i] != s[k]) k = pi[k - 1];      // fall back
        if (s[i] == s[k]) k++;
        pi[i] = k;
    }
    return pi;
}

// start indices of all (possibly overlapping) occurrences of p in t
vector<int> kmpSearch(const string& t, const string& p) {
    vector<int> pi = prefixFunction(p), res;
    for (int i = 0, k = 0; i < (int)t.size(); i++) {
        while (k > 0 && t[i] != p[k]) k = pi[k - 1];
        if (t[i] == p[k]) k++;
        if (k == (int)p.size()) { res.push_back(i - k + 1); k = pi[k - 1]; }
    }
    return res;
}`,
    py: src`
def prefix_function(s: str) -> list[int]:
    pi = [0] * len(s)
    for i in range(1, len(s)):
        k = pi[i - 1]
        while k and s[i] != s[k]:
            k = pi[k - 1]                   # fall back
        if s[i] == s[k]:
            k += 1
        pi[i] = k
    return pi

def kmp_search(t: str, p: str) -> list[int]:
    pi, res, k = prefix_function(p), [], 0
    for i, ch in enumerate(t):
        while k and ch != p[k]:
            k = pi[k - 1]
        if ch == p[k]:
            k += 1
        if k == len(p):
            res.append(i - k + 1)
            k = pi[k - 1]                   # allow overlaps
    return res

def smallest_period(s: str) -> int:
    p = len(s) - prefix_function(s)[-1]
    return p if len(s) % p == 0 else len(s)`,
    tags: ["string", "pattern-matching", "linear"],
    related: ["z-function", "rolling-hash", "trie"],
  },
  {
    kind: "algo",
    id: "z-function",
    name: "Z-Function",
    aka: ["Z-algorithm"],
    category: "Strings",
    idea: "z[i] = length of the longest common prefix of s and s[i:]. Maintain the rightmost window [l, r) that matches a prefix; inside it, reuse z[i - l] as a starting point.",
    time: "O(n)",
    space: "O(n)",
    when: [
      "Pattern matching via z of p + sep + t.",
      "Count distinct substrings incrementally, string compression/periods.",
      "Often simpler to reason about than KMP for 'prefix occurs at i' questions.",
    ],
    pitfalls: [
      "z[0] is undefined by convention (set to 0 or n).",
      "Separator must not occur in either string.",
    ],
    cpp: src`
vector<int> zFunction(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    for (int i = 1, l = 0, r = 0; i < n; i++) {      // [l, r) = rightmost prefix match
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
}

vector<int> zSearch(const string& t, const string& p) {
    string s = p + '\x01' + t;                       // separator in neither string
    vector<int> z = zFunction(s), res;
    for (int i = p.size() + 1; i < (int)s.size(); i++)
        if (z[i] >= (int)p.size()) res.push_back(i - p.size() - 1);
    return res;
}`,
    py: src`
def z_function(s: str) -> list[int]:
    n = len(s)
    z = [0] * n
    l = r = 0                                # [l, r) = rightmost prefix match
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    return z

def z_search(t: str, p: str, sep: str = "\x01") -> list[int]:
    z = z_function(p + sep + t)
    return [i - len(p) - 1 for i in range(len(p) + 1, len(z)) if z[i] >= len(p)]`,
    tags: ["string", "pattern-matching", "linear"],
    related: ["kmp", "rolling-hash"],
  },
  {
    kind: "algo",
    id: "rolling-hash",
    name: "Rolling Hash (Polynomial, mod 2^61 - 1)",
    aka: ["Rabin-Karp", "string hashing"],
    category: "Strings",
    idea: "h(s) = Σ s[i]·B^(n-1-i) mod M. With prefix hashes H and powers P, the hash of any substring is H[r] - H[l]·P[r-l], so substring equality is O(1) (with tiny collision probability).",
    time: "O(n) build, O(1) per substring hash",
    space: "O(n)",
    when: [
      "Compare substrings in O(1): longest repeated substring (+ binary search), palindromes, LCP.",
      "Rabin-Karp multi-pattern matching; deduplicating substrings.",
    ],
    pitfalls: [
      "Fixed bases/mod 1e9+7 can be attacked (anti-hash tests): random base, large mod (2^61 - 1).",
      "Compare hashes only if they were built with the SAME base and mod.",
      "Map characters to 1..σ, never 0, or 'a' and 'aa' collide.",
    ],
    cpp: src`
// hash mod 2^61-1 with a random base: collision chance ~ n / 2^61 per comparison
struct Hash {
    static constexpr uint64_t M = (1ULL << 61) - 1;
    static uint64_t mul(uint64_t a, uint64_t b) {
        __uint128_t c = (__uint128_t)a * b;
        uint64_t r = (uint64_t)(c >> 61) + (uint64_t)(c & M);   // 2^61 = 1 (mod M)
        return r >= M ? r - M : r;
    }
    static uint64_t base() {                              // one random base for all strings
        static uint64_t B = mt19937_64(random_device{}())() % (M - 1000) + 500;
        return B;
    }
    vector<uint64_t> h, pw;
    Hash(const string& s) : h(s.size() + 1, 0), pw(s.size() + 1, 1) {
        for (size_t i = 0; i < s.size(); i++) {
            h[i + 1] = mul(h[i], base()) + (unsigned char)s[i] + 1;  // chars -> 1..256
            if (h[i + 1] >= M) h[i + 1] -= M;
            pw[i + 1] = mul(pw[i], base());
        }
    }
    uint64_t get(int l, int r) const {                    // hash of s[l, r)
        uint64_t v = h[r] + M - mul(h[l], pw[r - l]);
        return v >= M ? v - M : v;
    }
};`,
    py: src`
import random

class RollingHash:
    M = (1 << 61) - 1
    B = random.randrange(10**5, M - 1)        # one random base shared by all instances

    def __init__(self, s: str):
        M, B = self.M, self.B
        self.h, self.pw = [0] * (len(s) + 1), [1] * (len(s) + 1)
        for i, ch in enumerate(s):
            self.h[i + 1] = (self.h[i] * B + ord(ch) + 1) % M   # chars -> 1..
            self.pw[i + 1] = self.pw[i] * B % M

    def get(self, l: int, r: int) -> int:     # hash of s[l:r]
        return (self.h[r] - self.h[l] * self.pw[r - l]) % self.M

def longest_repeated_substring_len(s: str) -> int:
    """Binary search on length + hashing: O(n log n)."""
    H = RollingHash(s)
    def ok(L: int) -> bool:
        seen = set()
        for i in range(len(s) - L + 1):
            h = H.get(i, i + L)
            if h in seen:
                return True
            seen.add(h)
        return False
    lo, hi = 0, len(s)                        # largest L with ok(L)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if ok(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo`,
    tags: ["string", "hashing", "randomised", "constant-time"],
    related: ["kmp", "z-function", "binary-search"],
  },
  {
    kind: "algo",
    id: "trie",
    name: "Trie (Prefix Tree)",
    aka: ["prefix tree", "radix tree"],
    category: "Strings",
    idea: "A rooted tree where each edge is a character; each word is a root-to-node path. Counting words through each node answers prefix queries; a binary trie over bits answers max-XOR queries.",
    time: "O(L) per insert / lookup (L = word length)",
    space: "O(total characters · σ) with arrays, O(total) with maps",
    when: [
      "Prefix counting, autocomplete, dictionary lookups, word games (boggle).",
      "Maximum XOR pair (binary trie of numbers, greedy from the top bit).",
      "Base structure for Aho-Corasick multi-pattern matching.",
    ],
    pitfalls: [
      "Array children (26 ints per node) are fast but memory heavy - estimate nodes = total length.",
      "Distinguish 'is a prefix' (node exists) from 'is a word' (end count > 0).",
    ],
    cpp: src`
struct Trie {
    struct Node {
        array<int, 26> nxt;
        int end = 0, cnt = 0;                 // words ending here / passing through
        Node() { nxt.fill(-1); }
    };
    vector<Node> t = vector<Node>(1);         // node 0 = root
    void insert(const string& s) {            // lowercase a-z
        int u = 0; t[0].cnt++;
        for (char ch : s) {
            int c = ch - 'a';
            if (t[u].nxt[c] == -1) { t[u].nxt[c] = t.size(); t.emplace_back(); }
            u = t[u].nxt[c];
            t[u].cnt++;
        }
        t[u].end++;
    }
    int walk(const string& s) const {
        int u = 0;
        for (char ch : s) { u = t[u].nxt[ch - 'a']; if (u == -1) return -1; }
        return u;
    }
    bool contains(const string& s) const { int u = walk(s); return u != -1 && t[u].end > 0; }
    int countPrefix(const string& p) const { int u = walk(p); return u == -1 ? 0 : t[u].cnt; }
};`,
    py: src`
class Trie:
    def __init__(self):
        self.nxt: list[dict[str, int]] = [{}]
        self.end = [0]       # words ending at node
        self.cnt = [0]       # words passing through node

    def insert(self, word: str):
        u = 0
        self.cnt[0] += 1
        for ch in word:
            if ch not in self.nxt[u]:
                self.nxt[u][ch] = len(self.nxt)
                self.nxt.append({}); self.end.append(0); self.cnt.append(0)
            u = self.nxt[u][ch]
            self.cnt[u] += 1
        self.end[u] += 1

    def _walk(self, s: str) -> int:
        u = 0
        for ch in s:
            u = self.nxt[u].get(ch, -1)
            if u == -1:
                return -1
        return u

    def contains(self, word: str) -> bool:
        u = self._walk(word)
        return u != -1 and self.end[u] > 0

    def count_prefix(self, p: str) -> int:
        u = self._walk(p)
        return 0 if u == -1 else self.cnt[u]`,
    tags: ["string", "tree", "prefix", "dictionary"],
    related: ["kmp", "rolling-hash"],
  },
  {
    kind: "algo",
    id: "manacher",
    name: "Manacher's Algorithm",
    aka: ["longest palindromic substring"],
    category: "Strings",
    idea: "Track the rightmost palindrome found so far. A new centre inside it starts from the radius of its mirror (clipped to the boundary), then expands; the right boundary only moves forward.",
    time: "O(n)",
    space: "O(n)",
    when: [
      "Longest palindromic substring; count all palindromic substrings.",
      "Check 'is s[l..r] a palindrome' in O(1) after O(n) preprocessing.",
    ],
    pitfalls: [
      "Odd and even centres differ: use two arrays (d1, d2) or the '#'-interleaving trick.",
      "Radius conventions vary (with/without centre) - convert carefully to lengths.",
    ],
    cpp: src`
// d1[i]: number of odd palindromes centred at i (radius incl. centre)
// d2[i]: number of even palindromes centred between i-1 and i
pair<vector<int>, vector<int>> manacher(const string& s) {
    int n = s.size();
    vector<int> d1(n), d2(n);
    for (int i = 0, l = 0, r = -1; i < n; i++) {
        int k = (i > r) ? 1 : min(d1[l + r - i], r - i + 1);
        while (i - k >= 0 && i + k < n && s[i - k] == s[i + k]) k++;
        d1[i] = k--;
        if (i + k > r) { l = i - k; r = i + k; }
    }
    for (int i = 0, l = 0, r = -1; i < n; i++) {
        int k = (i > r) ? 0 : min(d2[l + r - i + 1], r - i + 1);
        while (i - k - 1 >= 0 && i + k < n && s[i - k - 1] == s[i + k]) k++;
        d2[i] = k--;
        if (i + k > r) { l = i - k - 1; r = i + k; }
    }
    return {d1, d2};
}

string longestPalindrome(const string& s) {
    auto [d1, d2] = manacher(s);
    int best = 0, start = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        if (2 * d1[i] - 1 > best) { best = 2 * d1[i] - 1; start = i - d1[i] + 1; }
        if (2 * d2[i] > best) { best = 2 * d2[i]; start = i - d2[i]; }
    }
    return s.substr(start, best);
}
// number of palindromic substrings = sum(d1) + sum(d2)`,
    py: src`
def manacher(s: str) -> tuple[int, int]:
    """(start, length) of the longest palindromic substring, O(n)."""
    t = "#" + "#".join(s) + "#"          # every palindrome in t has odd length
    n = len(t)
    p = [0] * n                          # p[i] = radius in t = palindrome length in s
    c = r = 0                            # centre and right edge of rightmost palindrome
    for i in range(n):
        if i < r:
            p[i] = min(r - i, p[2 * c - i])          # mirror
        while i - p[i] - 1 >= 0 and i + p[i] + 1 < n and t[i - p[i] - 1] == t[i + p[i] + 1]:
            p[i] += 1
        if i + p[i] > r:
            c, r = i, i + p[i]
    best = max(range(n), key=p.__getitem__)
    return (best - p[best]) // 2, p[best]

# count of palindromic substrings = sum((x + 1) // 2 for x in p)`,
    tags: ["string", "palindrome", "linear"],
    related: ["rolling-hash", "z-function"],
  },

  // ───────────────────────────── Number Theory ─────────────────────────────
  {
    kind: "algo",
    id: "gcd",
    name: "GCD & Extended Euclid",
    aka: ["gcd", "egcd", "Bezout"],
    category: "Number Theory",
    idea: "gcd(a, b) = gcd(b, a mod b). Extended Euclid also returns x, y with a·x + b·y = gcd(a, b) (Bezout coefficients), back-substituting through the recursion.",
    time: "O(log min(a, b))",
    space: "O(1) iterative",
    when: [
      "Modular inverse for non-prime moduli; solving a·x ≡ c (mod m) (solvable iff gcd(a, m) | c).",
      "Linear Diophantine equations a·x + b·y = c; CRT.",
      "lcm(a, b) = a / gcd(a, b) · b (divide first to avoid overflow).",
    ],
    pitfalls: [
      "C++ % can be negative for negative operands - normalise with ((x % m) + m) % m.",
      "std::gcd (C++17, <numeric>) and math.gcd exist - don't reinvent unless you need x, y.",
    ],
    cpp: src`
long long gcdLL(long long a, long long b) {          // or std::gcd
    while (b) { a %= b; swap(a, b); }
    return a;
}

// returns g = gcd(a, b) and sets x, y so that a*x + b*y = g
long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

// one solution of a*x + b*y = c, or false if none
bool diophantine(long long a, long long b, long long c, long long& x, long long& y) {
    long long g = extgcd(llabs(a), llabs(b), x, y);
    if (c % g) return false;
    x *= c / g; y *= c / g;
    if (a < 0) x = -x;
    if (b < 0) y = -y;
    return true;                // general: x + k*(b/g), y - k*(a/g)
}`,
    py: src`
from math import gcd, lcm            # lcm: Python 3.9+

def ext_gcd(a: int, b: int) -> tuple[int, int, int]:
    """(g, x, y) with a*x + b*y = g = gcd(a, b). Iterative."""
    x0, y0, x1, y1 = 1, 0, 0, 1
    while b:
        q = a // b
        a, b = b, a - q * b
        x0, x1 = x1, x0 - q * x1
        y0, y1 = y1, y0 - q * y1
    return a, x0, y0

def solve_congruence(a: int, c: int, m: int) -> list[int]:
    """All x in [0, m) with a*x = c (mod m)."""
    g, x, _ = ext_gcd(a % m, m)
    if c % g:
        return []
    step = m // g
    x0 = x * (c // g) % step
    return [x0 + k * step for k in range(g)]`,
    tags: ["math", "number-theory", "modular", "log n"],
    related: ["mod-inverse", "crt"],
  },
  {
    kind: "algo",
    id: "fast-pow",
    name: "Fast Exponentiation (Binary Power)",
    aka: ["binpow", "exponentiation by squaring", "matrix power"],
    category: "Number Theory",
    idea: "b^e = (b^2)^(e/2) · b^(e mod 2): square the base and halve the exponent, multiplying the result in when the low bit is set. Works for any associative multiplication (matrices, permutations).",
    time: "O(log e) multiplications",
    space: "O(1)",
    when: [
      "Modular powers, Fermat inverses, primality tests (Miller-Rabin).",
      "Linear recurrences (Fibonacci, k-step sums) in O(k^3 log n) via matrix power.",
      "Applying a permutation or functional graph step 1e18 times.",
    ],
    pitfalls: [
      "Overflow: with m up to ~1e9 the product fits in 64-bit; above ~3e9 use __int128.",
      "Start with r = 1 % m so m = 1 returns 0.",
      "Python: just use pow(b, e, m).",
    ],
    cpp: src`
long long power(long long b, long long e, long long m) {      // b^e mod m, e >= 0
    long long r = 1 % m;
    b %= m; if (b < 0) b += m;
    while (e > 0) {
        if (e & 1) r = (__int128)r * b % m;
        b = (__int128)b * b % m;
        e >>= 1;
    }
    return r;
}

// Fibonacci via 2x2 matrix power: [[1,1],[1,0]]^n = [[F(n+1),F(n)],[F(n),F(n-1)]]
using Mat = array<array<long long, 2>, 2>;
Mat mul(const Mat& A, const Mat& B, long long m) {
    Mat C{};
    for (int i = 0; i < 2; i++)
        for (int k = 0; k < 2; k++)
            for (int j = 0; j < 2; j++)
                C[i][j] = (C[i][j] + (__int128)A[i][k] * B[k][j]) % m;
    return C;
}
long long fib(long long n, long long m) {
    Mat R{{{1, 0}, {0, 1}}}, M{{{1, 1}, {1, 0}}};
    for (; n > 0; n >>= 1, M = mul(M, M, m))
        if (n & 1) R = mul(R, M, m);
    return R[0][1];
}`,
    py: src`
def power(b: int, e: int, m: int) -> int:
    """b^e mod m (identical to built-in pow(b, e, m))."""
    r, b = 1 % m, b % m
    while e > 0:
        if e & 1:
            r = r * b % m
        b = b * b % m
        e >>= 1
    return r

def mat_mul(A, B, m):
    return [[sum(A[i][k] * B[k][j] for k in range(len(B))) % m
             for j in range(len(B[0]))] for i in range(len(A))]

def fib(n: int, m: int = 10**9 + 7) -> int:
    """F(n) mod m in O(log n)."""
    R, M = [[1, 0], [0, 1]], [[1, 1], [1, 0]]
    while n:
        if n & 1:
            R = mat_mul(R, M, m)
        M = mat_mul(M, M, m)
        n >>= 1
    return R[0][1]`,
    tags: ["math", "modular", "matrix", "log n"],
    related: ["mod-inverse", "ncr-mod-p"],
  },
  {
    kind: "algo",
    id: "mod-inverse",
    name: "Modular Inverse",
    aka: ["inverse mod", "Fermat inverse"],
    category: "Number Theory",
    idea: "a^-1 mod m exists iff gcd(a, m) = 1. For prime p, Fermat gives a^(p-2) mod p; for general m use extended Euclid. All inverses 1..n mod p follow from inv[i] = -(p / i) · inv[p mod i].",
    time: "O(log m) each; O(n) for all of 1..n",
    space: "O(1) / O(n)",
    when: [
      "Division under a modulus: nCr, expected values as fractions P·Q^-1, probabilities mod 998244353.",
    ],
    pitfalls: [
      "Fermat requires a prime modulus and a mod p ≠ 0.",
      "Normalise negative results into [0, m).",
      "Python 3.8+: pow(a, -1, m) raises ValueError when no inverse exists.",
    ],
    cpp: src`
long long power(long long b, long long e, long long m) {
    long long r = 1 % m; b %= m;
    for (; e > 0; e >>= 1, b = (__int128)b * b % m) if (e & 1) r = (__int128)r * b % m;
    return r;
}
long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1, g = extgcd(b, a % b, x1, y1);
    x = y1; y = x1 - (a / b) * y1;
    return g;
}

long long invPrime(long long a, long long p) { return power(a, p - 2, p); }  // p prime

long long invGeneral(long long a, long long m) {             // -1 if none exists
    long long x, y;
    long long g = extgcd(((a % m) + m) % m, m, x, y);
    if (g != 1) return -1;
    return ((x % m) + m) % m;
}

// inverses of 1..n modulo a prime p (n < p) in O(n)
vector<long long> inversesUpTo(int n, long long p) {
    vector<long long> inv(n + 1, 1);
    for (int i = 2; i <= n; i++) inv[i] = (p - p / i) * inv[p % i] % p;
    return inv;
}`,
    py: src`
def inv_prime(a: int, p: int) -> int:
    return pow(a, p - 2, p)              # Fermat; p prime, a % p != 0

def inv(a: int, m: int) -> int:
    return pow(a, -1, m)                 # Python 3.8+; ValueError if gcd(a, m) != 1

def inverses_upto(n: int, p: int) -> list[int]:
    """inv[i] for i in 1..n modulo prime p (n < p), O(n)."""
    inv = [0, 1] + [0] * (n - 1)
    for i in range(2, n + 1):
        inv[i] = (p - p // i) * inv[p % i] % p
    return inv`,
    tags: ["math", "modular", "number-theory"],
    related: ["gcd", "fast-pow", "ncr-mod-p", "crt"],
  },
  {
    kind: "algo",
    id: "sieve",
    name: "Sieve of Eratosthenes & Linear Sieve",
    aka: ["prime sieve", "smallest prime factor", "SPF"],
    category: "Number Theory",
    idea: "Cross out multiples of each prime starting at p^2. The linear sieve marks each composite exactly once by its smallest prime factor, giving spf[] for O(log x) factorisation.",
    time: "O(n log log n) Eratosthenes; O(n) linear sieve",
    space: "O(n)",
    when: [
      "All primes up to ~1e7 (1e8 with a bitset/segmented sieve).",
      "Factorising many numbers ≤ n quickly via spf[]; computing multiplicative functions (φ, μ, divisor counts).",
      "Single large n: trial division up to sqrt(n), or Pollard-rho beyond ~1e12.",
    ],
    pitfalls: [
      "Start crossing at i·i and use 64-bit for i·i to avoid overflow.",
      "Memory: vector<bool>/bytearray, not vector<int>, for n = 1e8.",
    ],
    cpp: src`
// all primes <= n
vector<int> sieve(int n) {
    vector<bool> comp(n + 1, false);
    vector<int> primes;
    for (int i = 2; i <= n; i++) {
        if (comp[i]) continue;
        primes.push_back(i);
        for (long long j = (long long)i * i; j <= n; j += i) comp[j] = true;
    }
    return primes;
}

// linear sieve: spf[x] = smallest prime factor of x
vector<int> spfSieve(int n) {
    vector<int> spf(n + 1, 0), primes;
    for (int i = 2; i <= n; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
        for (int p : primes) {
            if (p > spf[i] || (long long)i * p > n) break;
            spf[i * p] = p;
        }
    }
    return spf;
}

vector<pair<int, int>> factorize(int x, const vector<int>& spf) {   // {prime, exponent}
    vector<pair<int, int>> f;
    while (x > 1) {
        int p = spf[x], e = 0;
        while (x % p == 0) { x /= p; e++; }
        f.push_back({p, e});
    }
    return f;
}`,
    py: src`
from math import isqrt

def sieve(n: int) -> list[int]:
    """All primes <= n, O(n log log n)."""
    if n < 2:
        return []
    is_p = bytearray([1]) * (n + 1)
    is_p[0] = is_p[1] = 0
    for i in range(2, isqrt(n) + 1):
        if is_p[i]:
            is_p[i * i :: i] = bytes(len(range(i * i, n + 1, i)))   # fast slice clear
    return [i for i, v in enumerate(is_p) if v]

def spf_sieve(n: int) -> list[int]:
    """spf[x] = smallest prime factor of x (linear sieve)."""
    spf, primes = [0] * (n + 1), []
    for i in range(2, n + 1):
        if spf[i] == 0:
            spf[i] = i
            primes.append(i)
        for p in primes:
            if p > spf[i] or i * p > n:
                break
            spf[i * p] = p
    return spf

def factorize(x: int, spf: list[int]) -> dict[int, int]:
    f: dict[int, int] = {}
    while x > 1:
        p = spf[x]
        f[p] = f.get(p, 0) + 1
        x //= p
    return f`,
    tags: ["math", "primes", "number-theory", "precompute"],
    related: ["gcd", "fast-pow"],
  },
  {
    kind: "algo",
    id: "crt",
    name: "Chinese Remainder Theorem",
    aka: ["CRT", "simultaneous congruences"],
    category: "Number Theory",
    idea: "Merge x ≡ r1 (mod m1) and x ≡ r2 (mod m2) into one congruence modulo lcm(m1, m2): write x = r1 + m1·t and solve m1·t ≡ r2 - r1 (mod m2) with extended Euclid. Fold pairwise for more equations.",
    time: "O(k log M) for k congruences",
    space: "O(1)",
    when: [
      "Reconstruct a number from residues (e.g. answers mod several primes, then combine).",
      "Cyclic schedules: first time all periodic events align.",
      "Non-coprime moduli are fine with the general merge below (inconsistent => no solution).",
    ],
    pitfalls: [
      "The lcm can overflow 64-bit quickly - use __int128 or Python.",
      "Normalise residues into [0, m) first.",
    ],
    cpp: src`
long long extgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1, g = extgcd(b, a % b, x1, y1);
    x = y1; y = x1 - (a / b) * y1;
    return g;
}

// merge x = r1 (mod m1), x = r2 (mod m2). Returns {x, lcm} or {-1, -1} if inconsistent.
pair<long long, long long> crt(long long r1, long long m1, long long r2, long long m2) {
    long long x, y;
    long long g = extgcd(m1, m2, x, y);              // m1*x + m2*y = g
    if ((r2 - r1) % g != 0) return {-1, -1};
    long long l = m1 / g * m2;                       // lcm (must fit in 64-bit)
    __int128 t = (__int128)((r2 - r1) / g) * x % (m2 / g);
    long long res = (long long)(((__int128)r1 + (__int128)m1 * t) % l);
    if (res < 0) res += l;
    return {res, l};
}`,
    py: src`
def ext_gcd(a: int, b: int) -> tuple[int, int, int]:
    x0, y0, x1, y1 = 1, 0, 0, 1
    while b:
        q = a // b
        a, b = b, a - q * b
        x0, x1 = x1, x0 - q * x1
        y0, y1 = y1, y0 - q * y1
    return a, x0, y0

def crt(residues: list[int], moduli: list[int]) -> tuple[int, int] | None:
    """Solve x = r_i (mod m_i) for all i. Returns (x, lcm) or None. Moduli need not be coprime."""
    x, m = 0, 1
    for r, mi in zip(residues, moduli):
        g, p, _ = ext_gcd(m, mi)             # m*p + mi*q = g
        if (r - x) % g:
            return None
        t = (r - x) // g * p % (mi // g)
        x += m * t
        m = m // g * mi
        x %= m
    return x, m`,
    tags: ["math", "modular", "number-theory"],
    related: ["gcd", "mod-inverse"],
  },
  {
    kind: "algo",
    id: "ncr-mod-p",
    name: "Binomial Coefficients mod p",
    aka: ["nCr", "combinations", "Lucas theorem"],
    category: "Number Theory",
    idea: "Precompute factorials and inverse factorials mod a prime p > n, then C(n, r) = n! · (r!)^-1 · ((n-r)!)^-1. Compute inv_fact[n] once with Fermat and walk down: inv_fact[i-1] = inv_fact[i] · i.",
    time: "O(n) precompute, O(1) per query",
    space: "O(n)",
    when: [
      "Counting paths, distributions (stars and bars C(n+k-1, k-1)), inclusion-exclusion mod 1e9+7 / 998244353.",
      "n ≥ p for a small prime p: Lucas' theorem.",
      "Small n (≤ ~5000) with any modulus: Pascal's triangle DP.",
    ],
    pitfalls: [
      "Requires p prime and n < p for the factorial method.",
      "Return 0 when r < 0 or r > n.",
      "Multiply in steps with % between to avoid 64-bit overflow.",
    ],
    cpp: src`
const long long MOD = 1'000'000'007;
long long power(long long b, long long e, long long m) {
    long long r = 1 % m; b %= m;
    for (; e > 0; e >>= 1, b = b * b % m) if (e & 1) r = r * b % m;
    return r;
}

vector<long long> fact, inv_fact;
void initComb(int n) {                               // n < MOD
    fact.assign(n + 1, 1);
    inv_fact.assign(n + 1, 1);
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
    inv_fact[n] = power(fact[n], MOD - 2, MOD);       // Fermat: MOD is prime
    for (int i = n; i > 0; i--) inv_fact[i - 1] = inv_fact[i] * i % MOD;
}
long long nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD;
}

// Lucas: C(n, r) mod small prime p for huge n
long long lucas(long long n, long long r, int p, const vector<vector<int>>& smallC) {
    long long res = 1;                               // smallC = Pascal table mod p, size p x p
    while (n || r) {
        int ni = n % p, ri = r % p;
        if (ri > ni) return 0;
        res = res * smallC[ni][ri] % p;
        n /= p; r /= p;
    }
    return res;
}`,
    py: src`
import math

MOD = 10**9 + 7

def build_factorials(n: int, mod: int = MOD):
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i - 1] * i % mod
    inv_fact = [1] * (n + 1)
    inv_fact[n] = pow(fact[n], mod - 2, mod)     # mod prime and > n
    for i in range(n, 0, -1):
        inv_fact[i - 1] = inv_fact[i] * i % mod
    return fact, inv_fact

fact, inv_fact = build_factorials(2 * 10**5)

def nCr(n: int, r: int) -> int:
    if r < 0 or r > n:
        return 0
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD

def lucas(n: int, r: int, p: int) -> int:
    """C(n, r) mod a small prime p, any n."""
    res = 1
    while n or r:
        ni, ri = n % p, r % p
        if ri > ni:
            return 0
        res = res * math.comb(ni, ri) % p
        n //= p
        r //= p
    return res`,
    tags: ["math", "combinatorics", "modular", "precompute"],
    related: ["mod-inverse", "fast-pow"],
  },

  // ───────────────────────────── Geometry ─────────────────────────────
  {
    kind: "algo",
    id: "convex-hull",
    name: "Convex Hull (Andrew's Monotone Chain)",
    aka: ["monotone chain", "Graham scan"],
    category: "Geometry",
    idea: "Sort points by (x, y). Build the lower hull left-to-right and the upper hull right-to-left, popping the last point while it does not make a strict left (counter-clockwise) turn.",
    time: "O(n log n)",
    space: "O(n)",
    when: [
      "Smallest enclosing convex polygon; farthest pair (rotating calipers on the hull).",
      "Convex hull trick for DP: lines/points on the hull give optimal transitions.",
      "Perimeter/area of the hull (shoelace formula).",
    ],
    pitfalls: [
      "Use integer cross products (64-bit) - avoid floating point for exact coordinates.",
      "Decide whether collinear boundary points are kept (<= 0 removes them, < 0 keeps them).",
      "Deduplicate points first; handle n < 3.",
    ],
    cpp: src`
using P = pair<long long, long long>;
long long cross(const P& o, const P& a, const P& b) {      // > 0: o->a->b turns left
    return (a.first - o.first) * (b.second - o.second)
         - (a.second - o.second) * (b.first - o.first);
}

// hull in counter-clockwise order, collinear points removed
vector<P> convexHull(vector<P> pts) {
    sort(pts.begin(), pts.end());
    pts.erase(unique(pts.begin(), pts.end()), pts.end());
    int n = pts.size();
    if (n < 3) return pts;
    vector<P> h(2 * n);
    int k = 0;
    for (int i = 0; i < n; i++) {                           // lower hull
        while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {           // upper hull
        while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    h.resize(k - 1);                                        // last point == first
    return h;
}

long long area2(const vector<P>& poly) {                    // twice the signed area
    long long s = 0;
    for (size_t i = 0, n = poly.size(); i < n; i++) {
        const P &a = poly[i], &b = poly[(i + 1) % n];
        s += a.first * b.second - a.second * b.first;
    }
    return s;
}`,
    py: src`
def cross(o, a, b) -> int:
    """> 0 if o -> a -> b is a counter-clockwise (left) turn."""
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def convex_hull(pts: list[tuple[int, int]]) -> list[tuple[int, int]]:
    """Andrew's monotone chain. CCW order, collinear points removed."""
    pts = sorted(set(pts))
    if len(pts) < 3:
        return pts
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]

def area2(poly: list[tuple[int, int]]) -> int:
    """Twice the signed area (shoelace)."""
    n = len(poly)
    return sum(poly[i][0] * poly[(i + 1) % n][1] - poly[i][1] * poly[(i + 1) % n][0]
               for i in range(n))`,
    tags: ["geometry", "sorting", "cross-product"],
    related: ["sorting-compression"],
  },
];
