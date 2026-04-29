# Aho–Corasick Trie — Implementation Specification

This document specifies the **trie** data structure as an **Aho–Corasick automaton**: a trie of dictionary strings augmented with suffix (failure) links and dictionary-suffix (output) links for linear-time multi-pattern matching. The specification follows the [Wikipedia Aho–Corasick algorithm example](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm#Example).

---

## 1. Reference and terminology

- **Source**: [Aho–Corasick algorithm — Example](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm#Example) (Wikipedia).
- **Algorithm**: Aho & Corasick (1975), *Efficient string matching: An aid to bibliographic search*, CACM 18(6), 333–340.
- **Informal**: Build a trie from the dictionary; add **suffix links** (longest strict suffix in the graph) and **dictionary-suffix links** (next dictionary node reachable via suffix links); run the automaton over the text with no backtracking.

---

## 2. Data structures (language-independent)

### 2.1 Node

Each node represents a **path** (prefix) in the trie: the unique sequence of characters from the root to this node.

| Field | Type | Description |
|-------|------|-------------|
| `path` | `Sequence<Symbol>` | The prefix from root to this node (e.g. `"bc"`, `"caa"`). Root has path `()`. |
| `in_dictionary` | `Boolean` | True iff this path is a full dictionary string (Wikipedia “blue” node). |
| `children` | `Map<Symbol, Node>` | **Black / child arcs**: one entry per symbol that extends this path by one character. |
| `suffix_link` | `Node?` | **Blue / suffix arc**: target = longest *strict* suffix of `path` that exists in the graph. Root has no suffix link (or self). |
| `dict_suffix_link` | `Node?` | **Green / dictionary-suffix arc**: first node reachable by following `suffix_link` (repeatedly) that has `in_dictionary == true`. Null if none. |

**Invariants**

- Root is the single node with `path.length == 0`.
- For every non-root node, exactly one parent exists (via the last symbol of `path`).
- `suffix_link` target has strictly shorter path (or is root).
- `dict_suffix_link` target has `in_dictionary == true` (or is null).

### 2.2 Automaton (AC-Trie)

| Field | Type | Description |
|-------|------|-------------|
| `root` | `Node` | The node with path `()`. |
| `dictionary` | `Set<String>` | The set of strings used to build the trie (read-only after build). |
| `alphabet` | `Set<Symbol>` | Symbols that appear in `dictionary` (or explicitly provided). |

**Symbol type**: For string keys, `Symbol` is typically a character (code point or byte). For tokenized keys, `Symbol` can be a token.

---

## 3. Construction

### 3.1 Phase 1: Build the trie

**Input**: Finite set of strings `D = {s₁, s₂, …}` (the dictionary).

**Steps**:

1. Create `root` with `path = ()`, `in_dictionary = false`, `children = {}`, `suffix_link = null`, `dict_suffix_link = null`.
2. For each string `s` in `D`:
   - Let `node = root`.
   - For each symbol `c` of `s` in order:
     - If `node.children[c]` does not exist, create a new node with path `node.path + c`, `in_dictionary = false`, and set `node.children[c] = new_node`.
     - Set `node = node.children[c]`.
   - Set `node.in_dictionary = true`.
3. Result: a trie with one node per distinct prefix of any string in `D`; nodes whose path is in `D` are marked `in_dictionary`.

**Complexity**: O(total length of all strings in `D`).

### 3.2 Phase 2: Suffix links (blue arcs)

**Rule**: For each node `v`, `v.suffix_link` = the node whose path is the **longest strict suffix** of `v.path` that exists in the graph. (Strict suffix = suffix not equal to the full path.)

**Algorithm** (BFS from root; suffix targets are always at lower depth):

1. Queue = [root]. Root’s `suffix_link` is null (or root, per implementation choice; below we treat root as “no link” for clarity).
2. While queue not empty:
   - Dequeue `v`. For each symbol `c` and child `w = v.children[c]`:
     - To set `w.suffix_link`: start at `u = v.suffix_link` (or root if `v` is root). While `u` is not null:
       - If `u.children[c]` exists, set `w.suffix_link = u.children[c]` and break.
       - Else set `u = u.suffix_link` (or root).
     - If no such `u` was found, set `w.suffix_link = root`.
     - Enqueue `w`.
3. All suffix links are set. They can be computed in linear time (total size of trie).

### 3.3 Phase 3: Dictionary-suffix links (green arcs)

**Rule**: For each node `v`, `v.dict_suffix_link` = first node with `in_dictionary == true` reachable by following `suffix_link` from `v` (repeatedly). Null if none.

**Algorithm** (BFS or any order that visits a node after its suffix link target):

1. For each node `v` (e.g. BFS from root):
   - If `v.in_dictionary`: `v.dict_suffix_link = v.suffix_link.dict_suffix_link` (or follow suffix until a dictionary node; see below).
   - Else: set `u = v.suffix_link`. If `u` is null (root), `v.dict_suffix_link = null`. Else if `u.in_dictionary`, `v.dict_suffix_link = u`. Else `v.dict_suffix_link = u.dict_suffix_link` (memoized).
2. Memoize so that when computing `v.dict_suffix_link`, any node reachable by suffix chain already has `dict_suffix_link` set (e.g. process in BFS order so suffix targets are always processed first).

**Complexity**: O(number of nodes).

---

## 4. Execution (search)

**Input**: Text `T` (sequence of symbols); automaton built from dictionary `D`.

**Output**: All pairs `(pattern, end_index)` such that `pattern ∈ D` and `pattern` ends at 1-based index `end_index` in `T` (or 0-based, to be specified).

**Steps**:

1. `node = root`, `i = 0` (current index in `T`).
2. For each symbol `c = T[i]`:
   - **Transition**: While `node` is not null:
     - If `node.children[c]` exists: set `node = node.children[c]`, break.
     - Else set `node = node.suffix_link` (if null, use root and break).
   - **Output**: Let `out = node`. While `out` is not null:
     - If `out.in_dictionary`, report `(out.path, i+1)` (or `i` for 0-based).
     - Set `out = out.dict_suffix_link`.
   - Increment `i`.
3. After consuming all of `T`, all matches have been reported.

**Complexity**: O(|T| + number of matches). No backtracking.

---

## 5. Example (Wikipedia dictionary)

**Dictionary**: `D = { a, ab, bab, bc, bca, c, caa }`.

**Path convention**: `()` = root, `(a)` = path "a", etc.

### 5.1 Nodes and links (table)

| Path   | In dictionary | Suffix link | Dict suffix link |
|--------|----------------|-------------|------------------|
| ()     | –              | –           | –                |
| (a)    | +             | ()          | –                |
| (ab)   | +             | (b)         | –                |
| (b)    | –             | ()          | –                |
| (ba)   | –             | (a)         | (a)              |
| (bab)  | +             | (ab)        | (ab)             |
| (bc)   | +             | (c)         | (c)              |
| (bca)  | +             | (ca)        | (a)              |
| (c)    | +             | ()          | –                |
| (ca)   | –             | (a)         | (a)              |
| (caa)  | +             | (a)         | (a)              |

### 5.2 Example run: input `abccab`

| Node  | Remaining | Output (pattern:end)     | Transition logic                          |
|-------|-----------|--------------------------|-------------------------------------------|
| ()    | abccab    | –                        | start at root                             |
| (a)   | bccab     | a:1                      | () → child (a)                            |
| (ab)  | ccab      | ab:2                     | (a) → child (ab)                          |
| (bc)  | cab       | bc:3, c:3                | (ab) → suffix (b) → child (bc); output (bc), dict_suffix (c) |
| (c)   | ab        | c:4                      | (bc) → suffix (c) → suffix () → child (c)  |
| (ca)  | b         | a:5                      | (c) → child (ca); output dict_suffix (a)  |
| (ab)  | (done)    | ab:6                     | (ca) → suffix (a) → child (ab)             |

Implementations must reproduce this behavior for the same `D` and `T`.

---

## 6. Interface summary (recommended)

Implementations should provide at least:

| Operation | Description |
|-----------|-------------|
| `build(dictionary: Set<String>) -> AhoCorasickTrie` | Build trie + suffix + dict_suffix links from dictionary. |
| `search(text: String) -> List[(pattern, end_index)]` | Return all (pattern, end_index) for text. |
| `transition(node, symbol) -> node` | Single-step transition (for streaming or single-symbol APIs). |
| `output(node) -> List[path]` | List all dictionary paths ending at current node (node + dict_suffix chain). |

Optional: `add_pattern(s)` for dynamic dictionaries (incremental Aho–Corasick; see e.g. Meyer, *Incremental string matching*, IPL 1985).

---

## 7. References

- [Aho–Corasick algorithm — Wikipedia (Example)](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm#Example)
- Aho, A.V., Corasick, M.J. (1975). *Efficient string matching: An aid to bibliographic search*. Communications of the ACM, 18(6), 333–340.

---

*This spec defines the Aho–Corasick trie for use across all language implementations in this repository (Python, C++, Java, Swift, etc.).*
