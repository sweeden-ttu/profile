import type { AlgoEntry } from "./types.ts";

const src = (s: TemplateStringsArray, ...v: unknown[]) =>
  String.raw(s, ...v).replace(/^\n/, "").replace(/\s+$/, "");

export const algosA: AlgoEntry[] = [
  // ───────────────────────── Search & Techniques ─────────────────────────
  {
    kind: "algo",
    id: "binary-search",
    name: "Binary Search (incl. on the answer)",
    aka: ["lower_bound", "bisect", "parametric search"],
    category: "Search & Techniques",
    idea: "Keep an interval that must contain the answer and halve it each step. 'On the answer': if a predicate ok(t) is monotone (false…false true…true), binary-search the first t where it becomes true.",
    time: "O(log n) probes (x cost of ok)",
    space: "O(1)",
    when: [
      "Sorted arrays: first/last position, insertion point, counting values in a range.",
      "\"Minimise the maximum\" / \"maximise the minimum\" problems: capacity, time, distance.",
      "Real-valued answers: iterate a fixed number of times (60-100) instead of comparing with eps.",
    ],
    pitfalls: [
      "Use mid = lo + (hi - lo) / 2 in C++ to avoid overflow.",
      "Pick ONE invariant (half-open [lo, hi) here) and keep it; mixing styles causes infinite loops.",
      "The predicate must really be monotone - test small cases by brute force.",
      "If no t may satisfy ok, check ok(result) after the loop (or search to hi + 1).",
    ],
    cpp: src`
// first index i in [0, n) with a[i] >= x (n if none) -- same as std::lower_bound
int lowerBound(const vector<int>& a, int x) {
    int lo = 0, hi = a.size();              // answer lies in [lo, hi]
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

// Binary search on the answer: smallest t in [lo, hi] with ok(t) == true.
// ok must be monotone: false ... false true ... true.
template <class F>
long long firstTrue(long long lo, long long hi, F ok) {
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (ok(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

// Example: least ship capacity to deliver weights w (in order) within D days.
long long shipWithinDays(const vector<int>& w, int D) {
    long long lo = *max_element(w.begin(), w.end());
    long long hi = accumulate(w.begin(), w.end(), 0LL);
    return firstTrue(lo, hi, [&](long long cap) {
        int days = 1; long long cur = 0;
        for (int x : w) {
            if (cur + x > cap) { days++; cur = 0; }
            cur += x;
        }
        return days <= D;
    });
}`,
    py: src`
from bisect import bisect_left, bisect_right

def first_true(lo: int, hi: int, ok) -> int:
    """Smallest t in [lo, hi] with ok(t); ok must be monotone F..F T..T."""
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

def ship_within_days(w: list[int], days: int) -> int:
    def ok(cap: int) -> bool:
        need, cur = 1, 0
        for x in w:
            if cur + x > cap:
                need, cur = need + 1, 0
            cur += x
        return need <= days
    return first_true(max(w), sum(w), ok)

a = [1, 3, 3, 5, 8]
assert bisect_left(a, 3) == 1        # first index with a[i] >= 3
assert bisect_right(a, 3) == 3       # first index with a[i] > 3
# count of values in [lo, hi]:  bisect_right(a, hi) - bisect_left(a, lo)`,
    tags: ["array", "sorted", "monotone", "log n"],
    related: ["two-pointers", "sorting-compression", "lis"],
    viz: "binary-search",
  },
  {
    kind: "algo",
    id: "two-pointers",
    name: "Two Pointers / Sliding Window",
    aka: ["caterpillar", "window"],
    category: "Search & Techniques",
    idea: "Move two indices monotonically through the array. A window [l, r] grows on the right and shrinks on the left while it stays (in)valid; each index moves at most n times.",
    time: "O(n) amortised",
    space: "O(1) or O(alphabet)",
    when: [
      "Longest/shortest subarray satisfying a condition that is monotone in window size (e.g. sum <= K with non-negative values, at most k distinct).",
      "Pair/triple sums on a sorted array (3-sum: fix one, two-pointer the rest).",
      "Merging sorted sequences; counting pairs with difference <= d.",
    ],
    pitfalls: [
      "Requires monotonicity: with negative numbers, 'sum <= K' windows are not monotone - use prefix sums + a sorted structure or deque instead.",
      "Off-by-one in window length: r - l + 1 for inclusive bounds.",
    ],
    cpp: src`
// Shortest subarray with sum >= target (all a[i] > 0). Returns 0 if none.
int minLenAtLeast(const vector<int>& a, long long target) {
    int n = a.size(), best = INT_MAX;
    long long sum = 0;
    for (int l = 0, r = 0; r < n; r++) {
        sum += a[r];                          // expand right
        while (sum >= target) {               // shrink left while still valid
            best = min(best, r - l + 1);
            sum -= a[l++];
        }
    }
    return best == INT_MAX ? 0 : best;
}

// Longest substring with at most k distinct characters.
int longestKDistinct(const string& s, int k) {
    array<int, 256> cnt{};
    int distinct = 0, best = 0;
    for (int l = 0, r = 0; r < (int)s.size(); r++) {
        if (cnt[(unsigned char)s[r]]++ == 0) distinct++;
        while (distinct > k)
            if (--cnt[(unsigned char)s[l++]] == 0) distinct--;
        best = max(best, r - l + 1);
    }
    return best;
}

// Sorted array: is there a pair with sum x?
bool pairSum(const vector<int>& s, long long x) {
    int i = 0, j = (int)s.size() - 1;
    while (i < j) {
        long long t = (long long)s[i] + s[j];
        if (t == x) return true;
        if (t < x) i++; else j--;
    }
    return false;
}`,
    py: src`
def min_len_at_least(a: list[int], target: int) -> int:
    """Shortest subarray with sum >= target, all a[i] > 0. 0 if none."""
    best, s, l = float("inf"), 0, 0
    for r, x in enumerate(a):
        s += x
        while s >= target:
            best = min(best, r - l + 1)
            s -= a[l]
            l += 1
    return 0 if best == float("inf") else best

def longest_k_distinct(s: str, k: int) -> int:
    count: dict[str, int] = {}
    best = l = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        while len(count) > k:                 # window invalid -> shrink
            count[s[l]] -= 1
            if count[s[l]] == 0:
                del count[s[l]]
            l += 1
        best = max(best, r - l + 1)
    return best

def pair_sum(s: list[int], x: int) -> bool:   # s sorted
    i, j = 0, len(s) - 1
    while i < j:
        t = s[i] + s[j]
        if t == x:
            return True
        if t < x:
            i += 1
        else:
            j -= 1
    return False`,
    tags: ["array", "window", "linear"],
    related: ["prefix-sums", "monotonic-queue", "binary-search"],
  },
  {
    kind: "algo",
    id: "prefix-sums",
    name: "Prefix Sums & Difference Arrays",
    aka: ["cumulative sums", "2D prefix", "imos"],
    category: "Search & Techniques",
    idea: "P[i] = a[0] + … + a[i-1] turns any range sum into P[r+1] - P[l]. The inverse trick, a difference array, applies many range-adds in O(1) each and materialises them with one prefix pass.",
    time: "O(n) build, O(1) per query / range-add",
    space: "O(n)  (O(nm) in 2D)",
    when: [
      "Many static range-sum queries; 2D submatrix sums.",
      "Count subarrays with sum k: hashmap of prefix-sum frequencies.",
      "Offline range updates (add v on [l, r]) followed by reads - difference array.",
    ],
    pitfalls: [
      "Use 64-bit sums (long long) - prefix sums overflow 32-bit quickly.",
      "Keep the 1-element offset consistent (P has n + 1 entries).",
      "Difference arrays need size n + 1 so d[r + 1] is valid.",
    ],
    cpp: src`
// 1-D: P[i] = a[0] + ... + a[i-1];  sum(a[l..r]) = P[r+1] - P[l]
vector<long long> prefix(const vector<int>& a) {
    vector<long long> P(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) P[i + 1] = P[i] + a[i];
    return P;
}

// 2-D: S[i+1][j+1] = sum of g[0..i][0..j]
vector<vector<long long>> prefix2D(const vector<vector<int>>& g) {
    int n = g.size(), m = g[0].size();
    vector<vector<long long>> S(n + 1, vector<long long>(m + 1, 0));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            S[i + 1][j + 1] = g[i][j] + S[i][j + 1] + S[i + 1][j] - S[i][j];
    return S;
}
long long rectSum(const vector<vector<long long>>& S, int r1, int c1, int r2, int c2) {
    return S[r2 + 1][c2 + 1] - S[r1][c2 + 1] - S[r2 + 1][c1] + S[r1][c1];  // inclusive
}

// Difference array: apply {l, r, v} range-adds, then one pass to materialise.
vector<long long> applyRangeAdds(int n, const vector<array<int, 3>>& ops) {
    vector<long long> d(n + 1, 0);
    for (auto [l, r, v] : ops) { d[l] += v; d[r + 1] -= v; }
    vector<long long> a(n);
    long long run = 0;
    for (int i = 0; i < n; i++) a[i] = (run += d[i]);
    return a;
}`,
    py: src`
from collections import defaultdict
from itertools import accumulate

def prefix(a: list[int]) -> list[int]:
    return [0, *accumulate(a)]          # sum(a[l:r+1]) == P[r+1] - P[l]

def prefix_2d(g: list[list[int]]) -> list[list[int]]:
    n, m = len(g), len(g[0])
    S = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n):
        for j in range(m):
            S[i + 1][j + 1] = g[i][j] + S[i][j + 1] + S[i + 1][j] - S[i][j]
    return S

def rect_sum(S, r1, c1, r2, c2):        # inclusive corners
    return S[r2 + 1][c2 + 1] - S[r1][c2 + 1] - S[r2 + 1][c1] + S[r1][c1]

def range_adds(n: int, ops: list[tuple[int, int, int]]) -> list[int]:
    d = [0] * (n + 1)
    for l, r, v in ops:
        d[l] += v
        d[r + 1] -= v
    return list(accumulate(d[:n]))

def count_subarrays_sum_k(a: list[int], k: int) -> int:
    seen, s, res = defaultdict(int), 0, 0
    seen[0] = 1
    for x in a:
        s += x
        res += seen[s - k]              # earlier prefix with P_j = P_i - k
        seen[s] += 1
    return res`,
    tags: ["array", "range-query", "offline", "linear"],
    related: ["fenwick", "two-pointers", "segment-tree-lazy"],
  },
  {
    kind: "algo",
    id: "sorting-compression",
    name: "Sorting Tricks & Coordinate Compression",
    aka: ["argsort", "sweep line", "rank"],
    category: "Search & Techniques",
    idea: "Sort to expose structure (greedy order, sweep events, adjacency of equal keys). Coordinate compression maps up-to-1e9 values to ranks 0..k-1 so they can index arrays/Fenwick trees.",
    time: "O(n log n)",
    space: "O(n)",
    when: [
      "Values are huge but only their relative order matters (BIT over values, counting inversions).",
      "Sweep line over interval endpoints: max overlap, union length, meeting rooms.",
      "Greedy by deadline/end time (interval scheduling: sort by end, take compatible).",
    ],
    pitfalls: [
      "C++ comparators must be a strict weak ordering (use <, never <=) or sort is UB.",
      "Tie-breaking at equal coordinates matters for sweeps: decide whether [l, r] or [l, r) and order events accordingly.",
      "std::sort is not stable; use stable_sort or include the index in the key.",
    ],
    cpp: src`
// Coordinate compression: values -> ranks 0..k-1 (order-preserving)
vector<int> compress(const vector<long long>& a) {
    vector<long long> xs(a);
    sort(xs.begin(), xs.end());
    xs.erase(unique(xs.begin(), xs.end()), xs.end());
    vector<int> id(a.size());
    for (size_t i = 0; i < a.size(); i++)
        id[i] = lower_bound(xs.begin(), xs.end(), a[i]) - xs.begin();
    return id;
}

// argsort: indices ordered by value, ties by index
vector<int> argsort(const vector<int>& a) {
    vector<int> idx(a.size());
    iota(idx.begin(), idx.end(), 0);
    sort(idx.begin(), idx.end(), [&](int i, int j) {
        return a[i] != a[j] ? a[i] < a[j] : i < j;      // strict weak ordering
    });
    return idx;
}

// Sweep line: max number of simultaneously open half-open intervals [l, r)
int maxOverlap(const vector<pair<int, int>>& iv) {
    vector<pair<int, int>> ev;
    for (auto [l, r] : iv) { ev.push_back({l, +1}); ev.push_back({r, -1}); }
    sort(ev.begin(), ev.end());      // at equal x, -1 before +1 => [l, r) semantics
    int cur = 0, best = 0;
    for (auto [x, d] : ev) best = max(best, cur += d);
    return best;
}`,
    py: src`
def compress(a: list[int]) -> list[int]:
    rank = {v: i for i, v in enumerate(sorted(set(a)))}
    return [rank[v] for v in a]

def argsort(a: list[int]) -> list[int]:
    return sorted(range(len(a)), key=a.__getitem__)   # Python's sort is stable

def max_overlap(iv: list[tuple[int, int]]) -> int:    # half-open [l, r)
    ev = sorted([(l, 1) for l, _ in iv] + [(r, -1) for _, r in iv])
    cur = best = 0
    for _, d in ev:                                   # (x, -1) sorts before (x, 1)
        cur += d
        best = max(best, cur)
    return best

def max_non_overlapping(iv: list[tuple[int, int]]) -> int:
    """Interval scheduling: greedy by earliest end."""
    count, end = 0, float("-inf")
    for l, r in sorted(iv, key=lambda t: t[1]):
        if l >= end:
            count, end = count + 1, r
    return count

rows = [("bo", 90), ("al", 90), ("cy", 75)]
rows.sort(key=lambda t: (-t[1], t[0]))   # score desc, then name asc`,
    tags: ["sorting", "greedy", "sweep-line", "offline"],
    related: ["fenwick", "binary-search", "prefix-sums"],
  },
  {
    kind: "algo",
    id: "monotonic-stack",
    name: "Monotonic Stack",
    category: "Search & Techniques",
    idea: "Maintain a stack of indices whose values are monotone. When a new element breaks monotonicity, the popped elements have just found their 'next greater/smaller' element.",
    time: "O(n) amortised (each index pushed and popped once)",
    space: "O(n)",
    when: [
      "Next/previous greater or smaller element; stock span; daily temperatures.",
      "Largest rectangle in a histogram, maximal rectangle in a binary matrix.",
      "Sum of subarray minimums (contribution technique with prev/next smaller).",
    ],
    pitfalls: [
      "Decide strict vs non-strict comparison carefully when values repeat (affects double counting in contribution sums).",
      "Store indices, not values, so you can compute widths.",
    ],
    cpp: src`
// nge[i] = smallest j > i with a[j] > a[i], or -1
vector<int> nextGreater(const vector<int>& a) {
    int n = a.size();
    vector<int> nge(n, -1), st;              // st: indices, values decreasing
    for (int i = 0; i < n; i++) {
        while (!st.empty() && a[st.back()] < a[i]) {
            nge[st.back()] = i;
            st.pop_back();
        }
        st.push_back(i);
    }
    return nge;
}

// Largest rectangle in a histogram, O(n)
long long largestRect(const vector<int>& h) {
    int n = h.size();
    vector<int> st;
    long long best = 0;
    for (int i = 0; i <= n; i++) {
        int cur = (i == n) ? 0 : h[i];       // sentinel 0 flushes the stack
        while (!st.empty() && h[st.back()] >= cur) {
            long long height = h[st.back()]; st.pop_back();
            int left = st.empty() ? -1 : st.back();
            best = max(best, height * (i - left - 1));
        }
        st.push_back(i);
    }
    return best;
}`,
    py: src`
def next_greater(a: list[int]) -> list[int]:
    nge, st = [-1] * len(a), []              # st: indices, values decreasing
    for i, x in enumerate(a):
        while st and a[st[-1]] < x:
            nge[st.pop()] = i
        st.append(i)
    return nge

def largest_rect(h: list[int]) -> int:
    st, best = [], 0
    for i, cur in enumerate(h + [0]):        # sentinel 0 flushes the stack
        while st and h[st[-1]] >= cur:
            height = h[st.pop()]
            left = st[-1] if st else -1
            best = max(best, height * (i - left - 1))
        st.append(i)
    return best`,
    tags: ["stack", "array", "linear"],
    related: ["monotonic-queue", "sparse-table"],
  },
  {
    kind: "algo",
    id: "monotonic-queue",
    name: "Monotonic Queue (Sliding Window Min/Max)",
    aka: ["monotone deque"],
    category: "Search & Techniques",
    idea: "A deque of indices with decreasing values: pop from the back anything dominated by the new element, pop from the front anything that left the window. The front is always the window maximum.",
    time: "O(n) amortised",
    space: "O(k)",
    when: [
      "Max/min of every window of size k.",
      "DP optimisation: dp[i] = max(dp[j]) + c for j in a sliding range (e.g. jump games, constrained subsequence sum).",
      "Shortest subarray with sum >= K when values can be negative (deque over prefix sums).",
    ],
    pitfalls: [
      "Store indices so you can expire elements by position.",
      "For window minimum flip the comparison (pop while back >= new).",
    ],
    cpp: src`
// max of every window of size k
vector<int> windowMax(const vector<int>& a, int k) {
    deque<int> dq;                          // indices; a[dq] strictly decreasing
    vector<int> res;
    for (int i = 0; i < (int)a.size(); i++) {
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();       // left the window
        if (i >= k - 1) res.push_back(a[dq.front()]);
    }
    return res;
}`,
    py: src`
from collections import deque

def window_max(a: list[int], k: int) -> list[int]:
    dq, res = deque(), []                   # indices; a[dq] strictly decreasing
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:                  # front left the window
            dq.popleft()
        if i >= k - 1:
            res.append(a[dq[0]])
    return res`,
    tags: ["queue", "window", "dp-optimisation", "linear"],
    related: ["monotonic-stack", "two-pointers"],
  },
  {
    kind: "algo",
    id: "meet-in-the-middle",
    name: "Meet in the Middle",
    category: "Search & Techniques",
    idea: "Split the input into two halves, enumerate all 2^(n/2) partial results of each, sort one side, and combine with binary search or two pointers.",
    time: "O(2^(n/2) · n)",
    space: "O(2^(n/2))",
    when: [
      "n up to ~40 where 2^n is too slow but 2^20 ≈ 1e6 is fine (subset sum, 4-sum, knapsack with huge weights).",
      "Bidirectional search in implicit state graphs.",
    ],
    pitfalls: [
      "Memory: 2^20 64-bit sums = 8 MB per side - fine; 2^25 is not.",
      "Duplicates when counting pairs: use upper_bound/lower_bound differences, not '=='.",
    ],
    cpp: src`
// all 2^|v| subset sums
vector<long long> subsetSums(const vector<long long>& v) {
    vector<long long> s = {0};
    for (long long x : v) {
        int m = s.size();
        for (int i = 0; i < m; i++) s.push_back(s[i] + x);
    }
    return s;
}

// number of subsets of a (n <= 40) with sum <= S
long long countSubsetsAtMost(const vector<long long>& a, long long S) {
    int h = a.size() / 2;
    auto L = subsetSums(vector<long long>(a.begin(), a.begin() + h));
    auto R = subsetSums(vector<long long>(a.begin() + h, a.end()));
    sort(R.begin(), R.end());
    long long cnt = 0;
    for (long long x : L)                   // pair each left sum with fitting right sums
        cnt += upper_bound(R.begin(), R.end(), S - x) - R.begin();
    return cnt;
}`,
    py: src`
from bisect import bisect_right

def subset_sums(v: list[int]) -> list[int]:
    s = [0]
    for x in v:
        s += [t + x for t in s]
    return s

def count_subsets_at_most(a: list[int], S: int) -> int:
    h = len(a) // 2
    L, R = subset_sums(a[:h]), sorted(subset_sums(a[h:]))
    return sum(bisect_right(R, S - x) for x in L)`,
    tags: ["exponential", "divide-and-conquer", "subset", "sorting"],
    related: ["bitmask-dp", "binary-search", "knapsack"],
  },

  // ───────────────────────────── Graphs ─────────────────────────────
  {
    kind: "algo",
    id: "bfs",
    name: "Breadth-First Search",
    aka: ["BFS", "level order"],
    category: "Graphs",
    idea: "Explore vertices in order of distance using a FIFO queue. In an unweighted graph the first time a vertex is reached is along a shortest path.",
    time: "O(V + E)",
    space: "O(V)",
    when: [
      "Shortest paths in unweighted graphs or grids; minimum number of moves/states.",
      "Multi-source BFS: push all sources with distance 0 (distance to nearest X).",
      "Bipartiteness check (2-colouring by level parity).",
    ],
    pitfalls: [
      "Mark visited when you PUSH, not when you pop, or nodes enter the queue many times.",
      "Grid bounds checks before indexing; encode states compactly for state-space BFS.",
    ],
    cpp: src`
// unweighted single-source shortest paths; -1 = unreachable
vector<int> bfs(const vector<vector<int>>& adj, int s) {
    vector<int> dist(adj.size(), -1);
    queue<int> q;
    dist[s] = 0; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u])
            if (dist[v] == -1) {             // mark when pushed
                dist[v] = dist[u] + 1;
                q.push(v);
            }
    }
    return dist;
}

// grid version: 4-neighbour moves, '#' is a wall
int gridBfs(const vector<string>& g, int sr, int sc, int tr, int tc) {
    int R = g.size(), C = g[0].size();
    vector<vector<int>> d(R, vector<int>(C, -1));
    const int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    queue<pair<int, int>> q;
    d[sr][sc] = 0; q.push({sr, sc});
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
            if (g[nr][nc] == '#' || d[nr][nc] != -1) continue;
            d[nr][nc] = d[r][c] + 1;
            q.push({nr, nc});
        }
    }
    return d[tr][tc];
}`,
    py: src`
from collections import deque

def bfs(adj: list[list[int]], s: int) -> list[int]:
    dist = [-1] * len(adj)
    dist[s] = 0
    q = deque([s])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1:               # mark when pushed
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def grid_bfs(g: list[str], start: tuple[int, int], goal: tuple[int, int]) -> int:
    R, C = len(g), len(g[0])
    d = [[-1] * C for _ in range(R)]
    d[start[0]][start[1]] = 0
    q = deque([start])
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and g[nr][nc] != "#" and d[nr][nc] == -1:
                d[nr][nc] = d[r][c] + 1
                q.append((nr, nc))
    return d[goal[0]][goal[1]]`,
    tags: ["graph", "shortest-path", "grid", "queue", "linear"],
    related: ["zero-one-bfs", "dijkstra", "dfs"],
  },
  {
    kind: "algo",
    id: "dfs",
    name: "Depth-First Search",
    aka: ["DFS", "flood fill"],
    category: "Graphs",
    idea: "Go as deep as possible before backtracking. Entry/exit times and vertex colours (white / grey-on-stack / black) expose components, cycles, bridges and topological structure.",
    time: "O(V + E)",
    space: "O(V)",
    when: [
      "Connected components, flood fill, reachability.",
      "Cycle detection (directed: grey -> grey back edge; undirected: visited neighbour that isn't the parent).",
      "Building blocks: topological order, SCC, bridges/articulation points, Euler tours on trees.",
    ],
    pitfalls: [
      "Recursion depth: 1e5+ deep paths overflow the C++ stack sometimes and Python's always - use an explicit stack.",
      "Directed cycle detection needs three colours, not a single visited flag.",
    ],
    cpp: src`
// connected components with an explicit stack; returns count, fills comp[]
int components(const vector<vector<int>>& adj, vector<int>& comp) {
    int n = adj.size(), c = 0;
    comp.assign(n, -1);
    for (int s = 0; s < n; s++) {
        if (comp[s] != -1) continue;
        vector<int> st = {s};
        comp[s] = c;
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            for (int v : adj[u])
                if (comp[v] == -1) { comp[v] = c; st.push_back(v); }
        }
        c++;
    }
    return c;
}

// directed cycle detection: 0 = white, 1 = on the recursion stack, 2 = done
bool dfsCycle(int u, const vector<vector<int>>& adj, vector<int>& color) {
    color[u] = 1;
    for (int v : adj[u]) {
        if (color[v] == 1) return true;                 // back edge
        if (color[v] == 0 && dfsCycle(v, adj, color)) return true;
    }
    color[u] = 2;
    return false;
}
bool hasCycle(const vector<vector<int>>& adj) {
    vector<int> color(adj.size(), 0);
    for (int u = 0; u < (int)adj.size(); u++)
        if (color[u] == 0 && dfsCycle(u, adj, color)) return true;
    return false;
}`,
    py: src`
def components(adj: list[list[int]]) -> list[int]:
    comp, c = [-1] * len(adj), 0
    for s in range(len(adj)):
        if comp[s] != -1:
            continue
        comp[s] = c
        stack = [s]
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if comp[v] == -1:
                    comp[v] = c
                    stack.append(v)
        c += 1
    return comp

def has_cycle(adj: list[list[int]]) -> bool:
    """Directed graph; iterative three-colour DFS (no recursion limit)."""
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * len(adj)
    for s in range(len(adj)):
        if color[s] != WHITE:
            continue
        color[s] = GRAY
        stack = [(s, iter(adj[s]))]
        while stack:
            u, it = stack[-1]
            v = next(it, None)
            if v is None:
                color[u] = BLACK
                stack.pop()
            elif color[v] == GRAY:
                return True                 # back edge
            elif color[v] == WHITE:
                color[v] = GRAY
                stack.append((v, iter(adj[v])))
    return False`,
    tags: ["graph", "traversal", "cycle", "stack", "linear"],
    related: ["bfs", "topological-sort", "scc-tarjan"],
  },
  {
    kind: "algo",
    id: "zero-one-bfs",
    name: "0-1 BFS",
    category: "Graphs",
    idea: "When every edge weight is 0 or 1, a deque replaces Dijkstra's heap: push 0-edges to the front and 1-edges to the back. The deque always holds at most two distinct distances, in order.",
    time: "O(V + E)",
    space: "O(V)",
    when: [
      "Grids where some moves are free and others cost 1 (e.g. breaking walls, changing direction).",
      "Minimum number of edge reversals / changes to reach a target.",
    ],
    pitfalls: [
      "A vertex can be pushed more than once - that's fine, the relaxation check guards correctness.",
      "Only valid for weights in {0, 1} (or {0, w} with a single w); otherwise use Dijkstra.",
    ],
    cpp: src`
// adj[u] = {v, w} with w in {0, 1}
vector<int> zeroOneBfs(const vector<vector<pair<int, int>>>& adj, int s) {
    vector<int> d(adj.size(), INT_MAX);
    deque<int> dq;
    d[s] = 0; dq.push_back(s);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto [v, w] : adj[u])
            if (d[u] + w < d[v]) {
                d[v] = d[u] + w;
                if (w == 0) dq.push_front(v);
                else dq.push_back(v);
            }
    }
    return d;
}`,
    py: src`
from collections import deque

def zero_one_bfs(adj: list[list[tuple[int, int]]], s: int) -> list[float]:
    d = [float("inf")] * len(adj)
    d[s] = 0
    dq = deque([s])
    while dq:
        u = dq.popleft()
        for v, w in adj[u]:              # w in {0, 1}
            if d[u] + w < d[v]:
                d[v] = d[u] + w
                if w == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)
    return d`,
    tags: ["graph", "shortest-path", "grid", "deque", "linear"],
    related: ["bfs", "dijkstra"],
  },
  {
    kind: "algo",
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    aka: ["SSSP", "shortest path"],
    category: "Graphs",
    idea: "Repeatedly settle the unsettled vertex with the smallest tentative distance (min-heap) and relax its edges. With non-negative weights a popped distance is final.",
    time: "O((V + E) log V) with a binary heap",
    space: "O(V + E)",
    when: [
      "Single-source shortest paths with non-negative weights.",
      "State-space graphs (vertex = (node, extra state)); k-th shortest variants.",
      "Run from the target on the reversed graph for 'distance to t' from every node.",
    ],
    pitfalls: [
      "Negative edges break it - use Bellman-Ford / SPFA (or Johnson's reweighting).",
      "Skip stale heap entries (if du != d[u] continue) or the complexity degrades.",
      "Use 64-bit distances and an INF that can't overflow when you add a weight.",
    ],
    cpp: src`
using ll = long long;
// adj[u] = {v, w}, w >= 0. par[] lets you rebuild paths.
vector<ll> dijkstra(const vector<vector<pair<int, int>>>& adj, int s, vector<int>& par) {
    const ll INF = LLONG_MAX / 4;
    int n = adj.size();
    vector<ll> d(n, INF);
    par.assign(n, -1);
    priority_queue<pair<ll, int>, vector<pair<ll, int>>, greater<>> pq;   // min-heap
    d[s] = 0; pq.push({0, s});
    while (!pq.empty()) {
        auto [du, u] = pq.top(); pq.pop();
        if (du != d[u]) continue;                     // stale entry (lazy deletion)
        for (auto [v, w] : adj[u])
            if (du + w < d[v]) {
                d[v] = du + w; par[v] = u;
                pq.push({d[v], v});
            }
    }
    return d;
}

vector<int> buildPath(const vector<int>& par, int t) {
    vector<int> p;
    for (int v = t; v != -1; v = par[v]) p.push_back(v);
    reverse(p.begin(), p.end());
    return p;
}`,
    py: src`
import heapq

def dijkstra(adj: list[list[tuple[int, int]]], s: int):
    """adj[u] = [(v, w)], w >= 0. Returns (dist, parent)."""
    d, par = [float("inf")] * len(adj), [-1] * len(adj)
    d[s] = 0
    pq = [(0, s)]
    while pq:
        du, u = heapq.heappop(pq)
        if du != d[u]:
            continue                       # stale entry
        for v, w in adj[u]:
            nd = du + w
            if nd < d[v]:
                d[v], par[v] = nd, u
                heapq.heappush(pq, (nd, v))
    return d, par

def build_path(par: list[int], t: int) -> list[int]:
    out = []
    while t != -1:
        out.append(t)
        t = par[t]
    return out[::-1]`,
    tags: ["graph", "shortest-path", "heap", "greedy", "log n"],
    related: ["zero-one-bfs", "bellman-ford", "floyd-warshall", "mst"],
    viz: "dijkstra",
  },
  {
    kind: "algo",
    id: "bellman-ford",
    name: "Bellman-Ford",
    category: "Graphs",
    idea: "Relax every edge V-1 times; shortest paths have at most V-1 edges. If a V-th pass still improves something, a negative cycle is reachable.",
    time: "O(V · E)",
    space: "O(V)",
    when: [
      "Negative edge weights; detecting negative cycles (arbitrage).",
      "Shortest paths with at most k edges (run k passes on a copy of the previous distances).",
      "Systems of difference constraints x_v - x_u <= w.",
    ],
    pitfalls: [
      "Don't relax from unreachable vertices (INF + negative weight is still 'INF').",
      "For 'at most k edges' you must relax from the previous round's array, not in place.",
      "To find vertices affected by a negative cycle, propagate from every vertex relaxed in pass V.",
    ],
    cpp: src`
struct Edge { int u, v; long long w; };

// false if a negative cycle is reachable from s
bool bellmanFord(int n, const vector<Edge>& edges, int s, vector<long long>& d) {
    const long long INF = LLONG_MAX / 4;
    d.assign(n, INF);
    d[s] = 0;
    for (int it = 0; it < n - 1; it++) {
        bool changed = false;
        for (const auto& e : edges)
            if (d[e.u] != INF && d[e.u] + e.w < d[e.v]) {
                d[e.v] = d[e.u] + e.w;
                changed = true;
            }
        if (!changed) break;                        // early exit
    }
    for (const auto& e : edges)                     // n-th pass still relaxes => cycle
        if (d[e.u] != INF && d[e.u] + e.w < d[e.v]) return false;
    return true;
}`,
    py: src`
def bellman_ford(n: int, edges: list[tuple[int, int, int]], s: int):
    """Returns distances, or None if a negative cycle is reachable from s."""
    d = [float("inf")] * n
    d[s] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if d[u] + w < d[v]:          # inf + w is still inf: unreachable u skipped
                d[v] = d[u] + w
                changed = True
        if not changed:
            break
    if any(d[u] + w < d[v] for u, v, w in edges):
        return None
    return d`,
    tags: ["graph", "shortest-path", "negative-weights", "cycle"],
    related: ["dijkstra", "floyd-warshall"],
  },
  {
    kind: "algo",
    id: "floyd-warshall",
    name: "Floyd-Warshall",
    aka: ["APSP", "all-pairs shortest paths"],
    category: "Graphs",
    idea: "DP over allowed intermediate vertices: after iteration k, d[i][j] is the shortest i->j path using only vertices 0..k inside. Three nested loops with k outermost.",
    time: "O(V^3)",
    space: "O(V^2)",
    when: [
      "All-pairs distances for V <= ~500.",
      "Transitive closure (use OR/AND, or bitsets for V ~ 2000).",
      "Minimax / maximin paths with the same loop structure.",
    ],
    pitfalls: [
      "k MUST be the outermost loop.",
      "Guard INF + INF overflow; initialise d[i][i] = 0 and keep the minimum of parallel edges.",
      "After the run, d[i][i] < 0 means i lies on a negative cycle.",
    ],
    cpp: src`
// d[i][j] = edge weight (INF if none), d[i][i] = 0.  Modified in place.
void floydWarshall(vector<vector<long long>>& d) {
    const long long INF = LLONG_MAX / 4;
    int n = d.size();
    for (int k = 0; k < n; k++)                    // k must be the OUTER loop
        for (int i = 0; i < n; i++) {
            if (d[i][k] == INF) continue;
            for (int j = 0; j < n; j++)
                if (d[k][j] != INF && d[i][k] + d[k][j] < d[i][j])
                    d[i][j] = d[i][k] + d[k][j];
        }
    // negative cycle through i  <=>  d[i][i] < 0
}`,
    py: src`
def floyd_warshall(n: int, edges: list[tuple[int, int, int]]) -> list[list[float]]:
    INF = float("inf")
    d = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    for u, v, w in edges:
        d[u][v] = min(d[u][v], w)            # keep the lightest parallel edge
    for k in range(n):                       # k outermost!
        dk = d[k]
        for i in range(n):
            dik = d[i][k]
            if dik == INF:
                continue
            di = d[i]
            for j in range(n):
                if dik + dk[j] < di[j]:
                    di[j] = dik + dk[j]
    return d                                 # d[i][i] < 0 <=> i on a negative cycle`,
    tags: ["graph", "shortest-path", "dp", "cubic"],
    related: ["dijkstra", "bellman-ford"],
  },
  {
    kind: "algo",
    id: "topological-sort",
    name: "Topological Sort (Kahn)",
    aka: ["toposort", "DAG order"],
    category: "Graphs",
    idea: "Repeatedly output a vertex with in-degree 0 and delete its outgoing edges. If some vertices are never output, the graph has a cycle.",
    time: "O(V + E)",
    space: "O(V)",
    when: [
      "Scheduling with dependencies (build systems, course prerequisites).",
      "DP on a DAG: longest/shortest path, counting paths - process in topological order.",
      "Lexicographically smallest order: replace the queue with a min-heap.",
    ],
    pitfalls: [
      "Check order.size() == n to detect cycles.",
      "DFS-based toposort = reverse post-order; don't forget to reverse.",
    ],
    cpp: src`
// returns an empty vector if the graph has a cycle
vector<int> topoSort(const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<int> indeg(n, 0), order;
    for (int u = 0; u < n; u++) for (int v : adj[u]) indeg[v]++;
    queue<int> q;           // priority_queue<int, vector<int>, greater<>> => lexicographically smallest
    for (int u = 0; u < n; u++) if (indeg[u] == 0) q.push(u);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    if ((int)order.size() != n) return {};
    return order;
}`,
    py: src`
from collections import deque

def topo_sort(adj: list[list[int]]) -> list[int] | None:
    n = len(adj)
    indeg = [0] * n
    for u in range(n):
        for v in adj[u]:
            indeg[v] += 1
    q = deque(u for u in range(n) if indeg[u] == 0)   # heapq => lexicographic order
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else None          # None: there is a cycle`,
    tags: ["graph", "dag", "ordering", "queue", "linear"],
    related: ["dfs", "scc-tarjan", "scc-kosaraju"],
  },
  {
    kind: "algo",
    id: "mst",
    name: "Minimum Spanning Tree (Kruskal & Prim)",
    aka: ["MST", "Kruskal", "Prim"],
    category: "Graphs",
    idea: "Cut property: the lightest edge crossing any cut belongs to some MST. Kruskal adds edges by increasing weight when they join two components (DSU); Prim grows one tree, always taking the lightest edge leaving it (heap).",
    time: "Kruskal O(E log E); Prim O(E log V)",
    space: "O(V + E)",
    when: [
      "Cheapest network connecting all nodes; clustering (stop Kruskal at k components).",
      "Minimax path between two nodes = max edge on their MST path.",
      "Kruskal for sparse/edge lists; Prim (or O(V^2) Prim) for dense graphs.",
    ],
    pitfalls: [
      "Disconnected graph: you get a spanning forest - check the number of edges used.",
      "Maximum spanning tree: sort descending (or negate weights).",
    ],
    cpp: src`
// Kruskal. edges = {w, u, v}. Returns -1 if the graph is disconnected.
long long kruskal(int n, vector<array<long long, 3>> edges) {
    vector<int> p(n);
    iota(p.begin(), p.end(), 0);
    auto find = [&](int x) { while (p[x] != x) x = p[x] = p[p[x]]; return x; };  // path halving
    sort(edges.begin(), edges.end());
    long long total = 0; int used = 0;
    for (auto [w, u, v] : edges) {
        int a = find(u), b = find(v);
        if (a == b) continue;                  // would form a cycle
        p[a] = b; total += w;
        if (++used == n - 1) break;
    }
    return used == n - 1 ? total : -1;
}

// Lazy Prim. adj[u] = {v, w}.
long long prim(const vector<vector<pair<int, int>>>& adj) {
    int n = adj.size();
    vector<bool> in(n, false);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;  // {w, v}
    pq.push({0, 0});
    long long total = 0; int cnt = 0;
    while (!pq.empty() && cnt < n) {
        auto [w, u] = pq.top(); pq.pop();
        if (in[u]) continue;
        in[u] = true; total += w; cnt++;
        for (auto [v, wv] : adj[u]) if (!in[v]) pq.push({wv, v});
    }
    return cnt == n ? total : -1;
}`,
    py: src`
import heapq

def kruskal(n: int, edges: list[tuple[int, int, int]]) -> int | None:
    """edges: (w, u, v). MST weight, or None if disconnected."""
    p = list(range(n))
    def find(x: int) -> int:
        while p[x] != x:
            p[x] = p[p[x]]                     # path halving
            x = p[x]
        return x
    total = used = 0
    for w, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru != rv:
            p[ru] = rv
            total += w
            used += 1
    return total if used == n - 1 else None

def prim(adj: list[list[tuple[int, int]]]) -> int | None:
    """adj[u] = [(v, w)]. Lazy Prim with a heap."""
    n = len(adj)
    seen = [False] * n
    pq, total, cnt = [(0, 0)], 0, 0
    while pq and cnt < n:
        w, u = heapq.heappop(pq)
        if seen[u]:
            continue
        seen[u] = True
        total += w
        cnt += 1
        for v, wv in adj[u]:
            if not seen[v]:
                heapq.heappush(pq, (wv, v))
    return total if cnt == n else None`,
    tags: ["graph", "greedy", "tree", "sorting", "heap"],
    related: ["dsu", "dijkstra"],
  },
  {
    kind: "algo",
    id: "lca",
    name: "Lowest Common Ancestor (Binary Lifting)",
    aka: ["LCA", "jump pointers", "k-th ancestor"],
    category: "Graphs",
    idea: "Precompute up[k][v] = 2^k-th ancestor. Lift the deeper node to the same depth, then lift both by decreasing powers while their ancestors differ; the parent is the LCA.",
    time: "O(n log n) build, O(log n) per query",
    space: "O(n log n)",
    when: [
      "Distance between tree nodes: depth[a] + depth[b] - 2·depth[lca].",
      "k-th ancestor queries; path aggregates (store min/max along jumps).",
      "Many LCA queries offline: Euler tour + sparse table gives O(1) query.",
    ],
    pitfalls: [
      "Use an iterative DFS/BFS for the parent array on deep trees.",
      "Root's parent must point to itself (or a sentinel) so jumps stay in range.",
      "LOG must satisfy 2^LOG > max depth.",
    ],
    cpp: src`
struct LCA {
    int LOG;
    vector<vector<int>> up;
    vector<int> depth;
    LCA(const vector<vector<int>>& adj, int root = 0) {
        int n = adj.size();
        LOG = 1;
        while ((1 << LOG) < n) LOG++;
        up.assign(LOG, vector<int>(n, root));
        depth.assign(n, 0);
        vector<int> st = {root};
        vector<bool> seen(n, false);
        seen[root] = true;
        while (!st.empty()) {                       // iterative DFS: parent + depth
            int u = st.back(); st.pop_back();
            for (int v : adj[u]) if (!seen[v]) {
                seen[v] = true; up[0][v] = u; depth[v] = depth[u] + 1;
                st.push_back(v);
            }
        }
        for (int k = 1; k < LOG; k++)
            for (int v = 0; v < n; v++) up[k][v] = up[k - 1][up[k - 1][v]];
    }
    int kth(int v, int k) const {                   // k-th ancestor, k <= depth[v]
        for (int j = 0; j < LOG; j++) if (k >> j & 1) v = up[j][v];
        return v;
    }
    int lca(int a, int b) const {
        if (depth[a] < depth[b]) swap(a, b);
        a = kth(a, depth[a] - depth[b]);
        if (a == b) return a;
        for (int k = LOG - 1; k >= 0; k--)
            if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    }
    int dist(int a, int b) const { return depth[a] + depth[b] - 2 * depth[lca(a, b)]; }
};`,
    py: src`
class LCA:
    def __init__(self, adj: list[list[int]], root: int = 0):
        n = len(adj)
        self.LOG = max(1, (n - 1).bit_length())     # 2^LOG > max depth
        self.depth = [0] * n
        up0 = [root] * n
        seen = [False] * n
        seen[root] = True
        stack = [root]
        while stack:                                # iterative DFS
            u = stack.pop()
            for v in adj[u]:
                if not seen[v]:
                    seen[v] = True
                    up0[v] = u
                    self.depth[v] = self.depth[u] + 1
                    stack.append(v)
        self.up = [up0]
        for _ in range(1, self.LOG):
            prev = self.up[-1]
            self.up.append([prev[prev[v]] for v in range(n)])

    def lca(self, a: int, b: int) -> int:
        if self.depth[a] < self.depth[b]:
            a, b = b, a
        diff = self.depth[a] - self.depth[b]
        for k in range(self.LOG):                   # lift a to b's depth
            if diff >> k & 1:
                a = self.up[k][a]
        if a == b:
            return a
        for k in reversed(range(self.LOG)):
            if self.up[k][a] != self.up[k][b]:
                a, b = self.up[k][a], self.up[k][b]
        return self.up[0][a]

    def dist(self, a: int, b: int) -> int:
        return self.depth[a] + self.depth[b] - 2 * self.depth[self.lca(a, b)]`,
    tags: ["tree", "graph", "binary-lifting", "log n"],
    related: ["sparse-table", "tree-dp", "dfs"],
  },
  {
    kind: "algo",
    id: "dinic",
    name: "Maximum Flow (Dinic)",
    aka: ["max-flow", "min-cut", "Dinitz"],
    category: "Graphs",
    idea: "Build a BFS level graph on the residual network, then push blocking flow with DFS along strictly increasing levels (current-arc pointers avoid re-scanning dead edges). Repeat until the sink is unreachable.",
    time: "O(V^2 · E) general; O(E·sqrt(V)) on unit-capacity / bipartite graphs",
    space: "O(V + E)",
    when: [
      "Max flow / min cut; edge- or vertex-disjoint paths (split vertices into in/out).",
      "Bipartite matching with capacities, assignment with limits, project selection (closure).",
      "Min cut = source side = vertices reachable from s in the final residual graph.",
    ],
    pitfalls: [
      "Every edge needs a reverse edge with capacity 0 (paired indices e and e^1).",
      "Undirected edge of capacity c: add both directions with capacity c.",
      "Use 64-bit capacities when sums can exceed 2^31.",
    ],
    cpp: src`
struct Dinic {
    struct E { int to; long long cap; };
    vector<E> e;
    vector<vector<int>> g;
    vector<int> level, it;
    Dinic(int n) : g(n), level(n), it(n) {}
    void addEdge(int u, int v, long long c) {          // directed u -> v
        g[u].push_back(e.size()); e.push_back({v, c});
        g[v].push_back(e.size()); e.push_back({u, 0});  // residual edge = id ^ 1
    }
    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        queue<int> q; level[s] = 0; q.push(s);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int id : g[u])
                if (e[id].cap > 0 && level[e[id].to] < 0) {
                    level[e[id].to] = level[u] + 1;
                    q.push(e[id].to);
                }
        }
        return level[t] >= 0;
    }
    long long dfs(int u, int t, long long f) {
        if (u == t) return f;
        for (int& i = it[u]; i < (int)g[u].size(); i++) {   // current-arc pointer
            int id = g[u][i], v = e[id].to;
            if (e[id].cap > 0 && level[v] == level[u] + 1) {
                long long got = dfs(v, t, min(f, e[id].cap));
                if (got > 0) { e[id].cap -= got; e[id ^ 1].cap += got; return got; }
            }
        }
        return 0;
    }
    long long maxflow(int s, int t) {
        long long flow = 0;
        while (bfs(s, t)) {
            fill(it.begin(), it.end(), 0);
            while (long long f = dfs(s, t, LLONG_MAX)) flow += f;
        }
        return flow;
    }
};`,
    py: src`
from collections import deque

class Dinic:
    def __init__(self, n: int):
        self.n, self.g = n, [[] for _ in range(n)]
        self.to, self.cap = [], []
    def add_edge(self, u: int, v: int, c: int):
        self.g[u].append(len(self.to)); self.to.append(v); self.cap.append(c)
        self.g[v].append(len(self.to)); self.to.append(u); self.cap.append(0)  # id ^ 1
    def _bfs(self, s: int, t: int) -> bool:
        self.level = [-1] * self.n
        self.level[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for e in self.g[u]:
                if self.cap[e] > 0 and self.level[self.to[e]] < 0:
                    self.level[self.to[e]] = self.level[u] + 1
                    q.append(self.to[e])
        return self.level[t] >= 0
    def _dfs(self, u: int, t: int, f) -> int:
        if u == t:
            return f
        while self.it[u] < len(self.g[u]):
            e = self.g[u][self.it[u]]
            v = self.to[e]
            if self.cap[e] > 0 and self.level[v] == self.level[u] + 1:
                got = self._dfs(v, t, min(f, self.cap[e]))
                if got:
                    self.cap[e] -= got
                    self.cap[e ^ 1] += got
                    return got
            self.it[u] += 1                     # current-arc pointer
        return 0
    def max_flow(self, s: int, t: int) -> int:
        flow = 0
        while self._bfs(s, t):
            self.it = [0] * self.n
            while f := self._dfs(s, t, float("inf")):
                flow += f
        return flow`,
    tags: ["graph", "flow", "min-cut", "matching"],
    related: ["hopcroft-karp", "kuhn", "bfs"],
  },
  {
    kind: "algo",
    id: "kuhn",
    name: "Bipartite Matching (Kuhn)",
    aka: ["augmenting paths", "maximum bipartite matching"],
    category: "Graphs",
    idea: "For each left vertex, DFS for an augmenting path: take a free right neighbour, or one whose current partner can be re-matched elsewhere.",
    time: "O(V · E)",
    space: "O(V)",
    when: [
      "Small/medium bipartite matching (V ~ 1e3-5e3) - short and fast in practice.",
      "König: in bipartite graphs, min vertex cover = max matching; max independent set = V - matching.",
      "Min path cover in a DAG = V - max matching (split each node into out/in copies).",
    ],
    pitfalls: [
      "Reset 'visited' for every left vertex (a timestamp avoids O(V) clears).",
      "Greedy initial matching speeds it up a lot.",
      "For large graphs prefer Hopcroft-Karp.",
    ],
    cpp: src`
// left 0..nL-1, right 0..nR-1; adj[u] lists right neighbours of left u
struct Kuhn {
    int nL, nR, stamp = 0;
    vector<vector<int>> adj;
    vector<int> matchR, vis;
    Kuhn(int nL, int nR) : nL(nL), nR(nR), adj(nL), matchR(nR, -1), vis(nL, 0) {}
    void addEdge(int u, int v) { adj[u].push_back(v); }
    bool tryKuhn(int u) {
        if (vis[u] == stamp) return false;
        vis[u] = stamp;
        for (int v : adj[u])
            if (matchR[v] == -1 || tryKuhn(matchR[v])) { matchR[v] = u; return true; }
        return false;
    }
    int maxMatching() {
        int res = 0;
        for (int u = 0; u < nL; u++) { stamp++; if (tryKuhn(u)) res++; }
        return res;
    }
};`,
    py: src`
def kuhn(n_left: int, n_right: int, adj: list[list[int]]) -> tuple[int, list[int]]:
    """adj[u] = right neighbours of left u. Returns (size, match_r)."""
    match_r = [-1] * n_right

    def try_kuhn(u: int, seen: list[bool]) -> bool:
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                if match_r[v] == -1 or try_kuhn(match_r[v], seen):
                    match_r[v] = u
                    return True
        return False

    size = sum(try_kuhn(u, [False] * n_right) for u in range(n_left))
    return size, match_r`,
    tags: ["graph", "matching", "bipartite", "dfs"],
    related: ["hopcroft-karp", "dinic"],
  },
  {
    kind: "algo",
    id: "hopcroft-karp",
    name: "Bipartite Matching (Hopcroft-Karp)",
    category: "Graphs",
    idea: "Phases: BFS from all free left vertices builds layers of shortest alternating paths; DFS then finds a maximal set of vertex-disjoint shortest augmenting paths. Only O(sqrt V) phases are needed.",
    time: "O(E · sqrt(V))",
    space: "O(V + E)",
    when: [
      "Large bipartite matching (V up to ~1e5, E up to ~1e6).",
      "Anything Kuhn solves, when Kuhn is too slow.",
    ],
    pitfalls: [
      "Mark dead-end vertices (dist = INF/-1) inside DFS so each phase stays linear.",
      "Recursive DFS depth can reach V - iterative or raise the stack in C++ for huge inputs.",
    ],
    cpp: src`
struct HopcroftKarp {
    int nL, nR;
    vector<vector<int>> adj;
    vector<int> mL, mR, dist;
    HopcroftKarp(int nL, int nR) : nL(nL), nR(nR), adj(nL), mL(nL, -1), mR(nR, -1), dist(nL) {}
    void addEdge(int u, int v) { adj[u].push_back(v); }
    bool bfs() {
        queue<int> q;
        bool found = false;
        for (int u = 0; u < nL; u++) {
            if (mL[u] == -1) { dist[u] = 0; q.push(u); }
            else dist[u] = -1;
        }
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : adj[u]) {
                int w = mR[v];
                if (w == -1) found = true;                    // free right vertex reachable
                else if (dist[w] == -1) { dist[w] = dist[u] + 1; q.push(w); }
            }
        }
        return found;
    }
    bool dfs(int u) {
        for (int v : adj[u]) {
            int w = mR[v];
            if (w == -1 || (dist[w] == dist[u] + 1 && dfs(w))) {
                mL[u] = v; mR[v] = u;
                return true;
            }
        }
        dist[u] = -1;                                         // dead end this phase
        return false;
    }
    int maxMatching() {
        int res = 0;
        while (bfs())
            for (int u = 0; u < nL; u++)
                if (mL[u] == -1 && dfs(u)) res++;
        return res;
    }
};`,
    py: src`
from collections import deque

def hopcroft_karp(n_left: int, n_right: int, adj: list[list[int]]) -> int:
    INF = float("inf")
    mL, mR = [-1] * n_left, [-1] * n_right
    dist = [0] * n_left

    def bfs() -> bool:
        q = deque()
        for u in range(n_left):
            if mL[u] == -1:
                dist[u] = 0
                q.append(u)
            else:
                dist[u] = INF
        found = False
        while q:
            u = q.popleft()
            for v in adj[u]:
                w = mR[v]
                if w == -1:
                    found = True
                elif dist[w] == INF:
                    dist[w] = dist[u] + 1
                    q.append(w)
        return found

    def dfs(u: int) -> bool:
        for v in adj[u]:
            w = mR[v]
            if w == -1 or (dist[w] == dist[u] + 1 and dfs(w)):
                mL[u], mR[v] = v, u
                return True
        dist[u] = INF                       # dead end this phase
        return False

    matching = 0
    while bfs():
        for u in range(n_left):
            if mL[u] == -1 and dfs(u):
                matching += 1
    return matching`,
    tags: ["graph", "matching", "bipartite", "bfs"],
    related: ["kuhn", "dinic"],
  },
  {
    kind: "algo",
    id: "scc-tarjan",
    name: "Strongly Connected Components (Tarjan)",
    aka: ["SCC", "low-link"],
    category: "Graphs",
    idea: "One DFS. tin[u] = discovery time, low[u] = smallest tin reachable via tree edges plus one back edge to a vertex still on the stack. When low[u] == tin[u], u roots an SCC: pop the stack down to u.",
    time: "O(V + E)",
    space: "O(V)",
    when: [
      "Condense a directed graph into a DAG of SCCs, then DP/toposort on it.",
      "2-SAT: x and not-x in the same SCC => unsatisfiable.",
      "Find cycles / mutually reachable groups.",
    ],
    pitfalls: [
      "Only use tin[v] of vertices still ON the stack (cross edges to finished SCCs don't count).",
      "Tarjan numbers SCCs in reverse topological order of the condensation.",
      "Recursion depth = V; Python needs the iterative form below.",
    ],
    cpp: src`
struct TarjanSCC {
    int n, timer = 0, ncomp = 0;
    vector<vector<int>> adj;
    vector<int> tin, low, comp, st;
    vector<bool> onStack;
    TarjanSCC(const vector<vector<int>>& g)
        : n(g.size()), adj(g), tin(n, -1), low(n), comp(n, -1), onStack(n, false) {
        for (int u = 0; u < n; u++) if (tin[u] == -1) dfs(u);
    }
    void dfs(int u) {
        tin[u] = low[u] = timer++;
        st.push_back(u); onStack[u] = true;
        for (int v : adj[u]) {
            if (tin[v] == -1) { dfs(v); low[u] = min(low[u], low[v]); }
            else if (onStack[v]) low[u] = min(low[u], tin[v]);
        }
        if (low[u] == tin[u]) {                       // u is the root of an SCC
            while (true) {
                int v = st.back(); st.pop_back(); onStack[v] = false;
                comp[v] = ncomp;
                if (v == u) break;
            }
            ncomp++;
        }
    }
};
// comp ids are in REVERSE topological order of the condensation DAG`,
    py: src`
def tarjan_scc(adj: list[list[int]]) -> list[int]:
    """comp[v] = SCC id (reverse topological order). Iterative, no recursion."""
    n = len(adj)
    tin, low, comp = [-1] * n, [0] * n, [-1] * n
    on_stack, st = [False] * n, []
    timer = ncomp = 0
    for s in range(n):
        if tin[s] != -1:
            continue
        tin[s] = low[s] = timer; timer += 1
        st.append(s); on_stack[s] = True
        work = [(s, 0)]                          # (vertex, next edge index)
        while work:
            u, i = work[-1]
            if i < len(adj[u]):
                work[-1] = (u, i + 1)
                v = adj[u][i]
                if tin[v] == -1:
                    tin[v] = low[v] = timer; timer += 1
                    st.append(v); on_stack[v] = True
                    work.append((v, 0))
                elif on_stack[v]:
                    low[u] = min(low[u], tin[v])
                continue
            work.pop()
            if work:                             # propagate low to the parent
                p = work[-1][0]
                low[p] = min(low[p], low[u])
            if low[u] == tin[u]:                 # u roots an SCC
                while True:
                    v = st.pop(); on_stack[v] = False
                    comp[v] = ncomp
                    if v == u:
                        break
                ncomp += 1
    return comp`,
    tags: ["graph", "scc", "dfs", "2-sat", "linear"],
    related: ["scc-kosaraju", "topological-sort", "dfs"],
  },
  {
    kind: "algo",
    id: "scc-kosaraju",
    name: "Strongly Connected Components (Kosaraju)",
    aka: ["SCC", "two-pass"],
    category: "Graphs",
    idea: "Pass 1: DFS on G records vertices by finish time. Pass 2: DFS on the transposed graph in decreasing finish time; each tree found is one SCC.",
    time: "O(V + E)",
    space: "O(V + E) (stores the transpose)",
    when: [
      "Same uses as Tarjan; conceptually simpler and easy to make iterative.",
      "Components come out in topological order of the condensation (handy for 2-SAT assignment).",
    ],
    pitfalls: [
      "Second pass must run on the TRANSPOSE in DECREASING finish order.",
      "Needs extra memory for the reversed adjacency list.",
    ],
    cpp: src`
// returns comp[v]; ids follow a topological order of the condensation DAG
vector<int> kosaraju(const vector<vector<int>>& g, int& ncomp) {
    int n = g.size();
    vector<vector<int>> rg(n);
    for (int u = 0; u < n; u++) for (int v : g[u]) rg[v].push_back(u);
    vector<int> order, comp(n, -1);
    vector<bool> vis(n, false);
    for (int s = 0; s < n; s++) {                     // pass 1: iterative post-order
        if (vis[s]) continue;
        vector<pair<int, int>> st = {{s, 0}};
        vis[s] = true;
        while (!st.empty()) {
            auto& [u, i] = st.back();
            if (i < (int)g[u].size()) {
                int v = g[u][i++];
                if (!vis[v]) { vis[v] = true; st.push_back({v, 0}); }
            } else { order.push_back(u); st.pop_back(); }
        }
    }
    ncomp = 0;
    for (int k = n - 1; k >= 0; k--) {                // pass 2: transpose, by finish time desc
        int s = order[k];
        if (comp[s] != -1) continue;
        vector<int> st = {s};
        comp[s] = ncomp;
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            for (int v : rg[u]) if (comp[v] == -1) { comp[v] = ncomp; st.push_back(v); }
        }
        ncomp++;
    }
    return comp;
}`,
    py: src`
def kosaraju(adj: list[list[int]]) -> list[int]:
    n = len(adj)
    radj = [[] for _ in range(n)]
    for u in range(n):
        for v in adj[u]:
            radj[v].append(u)
    seen, order = [False] * n, []
    for s in range(n):                       # pass 1: finish order on G
        if seen[s]:
            continue
        seen[s] = True
        stack = [(s, iter(adj[s]))]
        while stack:
            u, it = stack[-1]
            for v in it:
                if not seen[v]:
                    seen[v] = True
                    stack.append((v, iter(adj[v])))
                    break
            else:                            # iterator exhausted: u finished
                order.append(u)
                stack.pop()
    comp, c = [-1] * n, 0
    for s in reversed(order):                # pass 2: DFS on the transpose
        if comp[s] != -1:
            continue
        comp[s] = c
        stack = [s]
        while stack:
            u = stack.pop()
            for v in radj[u]:
                if comp[v] == -1:
                    comp[v] = c
                    stack.append(v)
        c += 1
    return comp                              # ids in topological order of the condensation`,
    tags: ["graph", "scc", "dfs", "2-sat", "linear"],
    related: ["scc-tarjan", "topological-sort"],
  },
];
