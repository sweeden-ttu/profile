// Compiles every C++ snippet (g++ -std=c++17) and runs every Python snippet,
// then executes small driver tests for each algorithm. Pattern examples are
// executed as-is (they are self-contained demos).
//
//   node tests/check-snippets.mjs          (Node >= 22.18: strips TS types natively)
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { algorithms } from "../src/data/algorithms.ts";
import { patterns } from "../src/data/patterns.ts";

const dir = mkdtempSync(join(tmpdir(), "cs-snippets-"));
const PRE = "#include <bits/stdc++.h>\nusing namespace std;\n";

// id -> { cpp: body of main(), py: test code appended to the snippet }
const D = {
  "binary-search": {
    cpp: `vector<int> a={1,3,3,5,8}; assert(lowerBound(a,3)==1); assert(lowerBound(a,9)==5); assert(lowerBound(a,0)==0);
      vector<int> w={1,2,3,4,5,6,7,8,9,10}; assert(shipWithinDays(w,5)==15);
      vector<int> w2={3,2,2,4,1,4}; assert(shipWithinDays(w2,3)==6);`,
    py: `assert ship_within_days(list(range(1,11)),5)==15; assert ship_within_days([3,2,2,4,1,4],3)==6
assert first_true(0,100,lambda t:t*t>=50)==8`,
  },
  "two-pointers": {
    cpp: `assert(minLenAtLeast({2,3,1,2,4,3},7)==2); assert(minLenAtLeast({1,1,1},10)==0);
      assert(longestKDistinct("eceba",2)==3); assert(longestKDistinct("aa",1)==2);
      assert(pairSum({1,2,4,7,11},15)); assert(!pairSum({1,2,4},100));`,
    py: `assert min_len_at_least([2,3,1,2,4,3],7)==2 and min_len_at_least([1,1,1],10)==0
assert longest_k_distinct("eceba",2)==3 and longest_k_distinct("aa",1)==2
assert pair_sum([1,2,4,7,11],15) and not pair_sum([1,2,4],100)`,
  },
  "prefix-sums": {
    cpp: `auto P=prefix({3,1,4,1,5}); assert(P[5]-P[1]==11);
      auto S=prefix2D({{1,2,3},{4,5,6},{7,8,9}}); assert(rectSum(S,1,1,2,2)==28); assert(rectSum(S,0,0,2,2)==45);
      auto a=applyRangeAdds(5,{{0,2,1},{1,4,2}}); assert((a==vector<long long>{1,3,3,2,2}));`,
    py: `P=prefix([3,1,4,1,5]); assert P[5]-P[1]==11
S=prefix_2d([[1,2,3],[4,5,6],[7,8,9]]); assert rect_sum(S,1,1,2,2)==28
assert range_adds(5,[(0,2,1),(1,4,2)])==[1,3,3,2,2]
assert count_subarrays_sum_k([1,1,1],2)==2 and count_subarrays_sum_k([1,-1,0],0)==3`,
  },
  "sorting-compression": {
    cpp: `auto id=compress({100,5,100,7,-3}); assert((id==vector<int>{3,1,3,2,0}));
      auto ix=argsort({3,1,2,1}); assert((ix==vector<int>{1,3,2,0}));
      assert(maxOverlap({{1,4},{2,5},{4,6}})==2); assert(maxOverlap({{1,3},{2,4},{2,5}})==3);`,
    py: `assert compress([100,5,100,7,-3])==[3,1,3,2,0]
assert argsort([3,1,2,1])==[1,3,2,0]
assert max_overlap([(1,4),(2,5),(4,6)])==2
assert max_non_overlapping([(1,2),(2,3),(3,4),(1,3)])==3
assert rows==[("al",90),("bo",90),("cy",75)]`,
  },
  "monotonic-stack": {
    cpp: `assert((nextGreater({2,1,2,4,3})==vector<int>{3,2,3,-1,-1})); assert(largestRect({2,1,5,6,2,3})==10); assert(largestRect({2,4})==4);`,
    py: `assert next_greater([2,1,2,4,3])==[3,2,3,-1,-1]; assert largest_rect([2,1,5,6,2,3])==10`,
  },
  "monotonic-queue": {
    cpp: `assert((windowMax({1,3,-1,-3,5,3,6,7},3)==vector<int>{3,3,5,5,6,7})); assert((windowMax({4,2},1)==vector<int>{4,2}));`,
    py: `assert window_max([1,3,-1,-3,5,3,6,7],3)==[3,3,5,5,6,7]`,
  },
  "meet-in-the-middle": {
    cpp: `vector<long long> a={3,34,4,12,5,2}; long long S=9, brute=0; int n=a.size();
      for(int m=0;m<(1<<n);m++){long long s=0; for(int i=0;i<n;i++) if(m>>i&1) s+=a[i]; brute+= s<=S;}
      assert(countSubsetsAtMost(a,S)==brute);`,
    py: `import itertools
a=[3,34,4,12,5,2,7]; S=15
brute=sum(1 for r in range(len(a)+1) for c in itertools.combinations(a,r) if sum(c)<=S)
assert count_subsets_at_most(a,S)==brute`,
  },
  bfs: {
    cpp: `vector<vector<int>> adj={{1,2},{0,3},{0,3},{1,2,4},{3},{}}; auto d=bfs(adj,0);
      assert((d==vector<int>{0,1,1,2,3,-1}));
      vector<string> g={"..#","..#","..."}; assert(gridBfs(g,0,0,0,1)==1); assert(gridBfs(g,0,0,2,2)==4);`,
    py: `adj=[[1,2],[0,3],[0,3],[1,2,4],[3],[]]; assert bfs(adj,0)==[0,1,1,2,3,-1]
assert grid_bfs(["..#","..#","..."],(0,0),(2,2))==4`,
  },
  dfs: {
    cpp: `vector<int> comp; assert(components({{1},{0},{3},{2},{}},comp)==3);
      assert(hasCycle({{1},{2},{0}})); assert(!hasCycle({{1,2},{2},{}}));`,
    py: `c=components([[1],[0],[3],[2],[]]); assert len(set(c))==3 and c[0]==c[1] and c[2]==c[3]
assert has_cycle([[1],[2],[0]]) and not has_cycle([[1,2],[2],[]])
import sys; n=200000; chain=[[i+1] for i in range(n-1)]+[[]]; assert not has_cycle(chain)`,
  },
  "zero-one-bfs": {
    cpp: `vector<vector<pair<int,int>>> adj(4); adj[0]={{1,1},{2,0}}; adj[2]={{1,0},{3,1}}; adj[1]={{3,1}};
      auto d=zeroOneBfs(adj,0); assert((d==vector<int>{0,0,0,1}));`,
    py: `adj=[[(1,1),(2,0)],[(3,1)],[(1,0),(3,1)],[]]; assert zero_one_bfs(adj,0)==[0,0,0,1]`,
  },
  dijkstra: {
    cpp: `vector<vector<pair<int,int>>> adj(5); auto add=[&](int u,int v,int w){adj[u].push_back({v,w});adj[v].push_back({u,w});};
      add(0,1,4); add(0,2,1); add(2,1,2); add(1,3,1); add(2,3,5); add(3,4,3);
      vector<int> par; auto d=dijkstra(adj,0,par); assert((d==vector<long long>{0,3,1,4,7}));
      assert((buildPath(par,4)==vector<int>{0,2,1,3,4}));`,
    py: `adj=[[] for _ in range(5)]
for u,v,w in [(0,1,4),(0,2,1),(2,1,2),(1,3,1),(2,3,5),(3,4,3)]:
    adj[u].append((v,w)); adj[v].append((u,w))
d,par=dijkstra(adj,0); assert d==[0,3,1,4,7] and build_path(par,4)==[0,2,1,3,4]`,
  },
  "bellman-ford": {
    cpp: `vector<Edge> e={{0,1,4},{0,2,5},{1,2,-3},{2,3,4}}; vector<long long> d; assert(bellmanFord(4,e,0,d)); assert((d==vector<long long>{0,4,1,5}));
      vector<Edge> c={{0,1,1},{1,2,-1},{2,1,-1}}; assert(!bellmanFord(3,c,0,d));
      vector<Edge> u={{1,2,-1},{2,1,-1}}; assert(bellmanFord(3,u,0,d));`,
    py: `assert bellman_ford(4,[(0,1,4),(0,2,5),(1,2,-3),(2,3,4)],0)==[0,4,1,5]
assert bellman_ford(3,[(0,1,1),(1,2,-1),(2,1,-1)],0) is None
assert bellman_ford(3,[(1,2,-1),(2,1,-1)],0) is not None`,
  },
  "floyd-warshall": {
    cpp: `const long long I=LLONG_MAX/4; vector<vector<long long>> d={{0,3,I,7},{8,0,2,I},{5,I,0,1},{2,I,I,0}};
      floydWarshall(d); assert((d[0]==vector<long long>{0,3,5,6})); assert((d[3]==vector<long long>{2,5,7,0}));`,
    py: `d=floyd_warshall(4,[(0,1,3),(0,3,7),(1,0,8),(1,2,2),(2,0,5),(2,3,1),(3,0,2)])
assert d[0]==[0,3,5,6] and d[3]==[2,5,7,0]`,
  },
  "topological-sort": {
    cpp: `auto o=topoSort({{1,2},{3},{3},{}}); assert(o.size()==4 && o[0]==0 && o[3]==3); assert(topoSort({{1},{0}}).empty());`,
    py: `o=topo_sort([[1,2],[3],[3],[]]); assert o[0]==0 and o[-1]==3; assert topo_sort([[1],[0]]) is None`,
  },
  mst: {
    cpp: `vector<array<long long,3>> e={{1,0,1},{4,0,2},{3,1,2},{2,1,3},{5,2,3}}; assert(kruskal(4,e)==6);
      vector<vector<pair<int,int>>> adj(4); for(auto [w,u,v]:e){adj[u].push_back({(int)v,(int)w});adj[v].push_back({(int)u,(int)w});}
      assert(prim(adj)==6); assert(kruskal(3,{{1,0,1}})==-1);`,
    py: `e=[(1,0,1),(4,0,2),(3,1,2),(2,1,3),(5,2,3)]; assert kruskal(4,e)==6
adj=[[] for _ in range(4)]
for w,u,v in e: adj[u].append((v,w)); adj[v].append((u,w))
assert prim(adj)==6 and kruskal(3,[(1,0,1)]) is None`,
  },
  lca: {
    cpp: `vector<vector<int>> adj(7); auto add=[&](int a,int b){adj[a].push_back(b);adj[b].push_back(a);};
      add(0,1);add(0,2);add(1,3);add(1,4);add(4,5);add(2,6); LCA t(adj);
      assert(t.lca(3,5)==1); assert(t.lca(5,6)==0); assert(t.lca(4,5)==4); assert(t.dist(3,6)==4); assert(t.kth(5,2)==1);
      int n=100000; vector<vector<int>> ch(n); for(int i=0;i+1<n;i++){ch[i].push_back(i+1);ch[i+1].push_back(i);} LCA c(ch); assert(c.lca(n-1,5)==5);`,
    py: `adj=[[] for _ in range(7)]
for a,b in [(0,1),(0,2),(1,3),(1,4),(4,5),(2,6)]: adj[a].append(b); adj[b].append(a)
t=LCA(adj); assert t.lca(3,5)==1 and t.lca(5,6)==0 and t.lca(4,5)==4 and t.dist(3,6)==4
one=LCA([[]]); assert one.lca(0,0)==0`,
  },
  dinic: {
    cpp: `Dinic g(6); g.addEdge(0,1,16); g.addEdge(0,2,13); g.addEdge(1,2,10); g.addEdge(2,1,4); g.addEdge(1,3,12);
      g.addEdge(3,2,9); g.addEdge(2,4,14); g.addEdge(4,3,7); g.addEdge(3,5,20); g.addEdge(4,5,4); assert(g.maxflow(0,5)==23);`,
    py: `g=Dinic(6)
for u,v,c in [(0,1,16),(0,2,13),(1,2,10),(2,1,4),(1,3,12),(3,2,9),(2,4,14),(4,3,7),(3,5,20),(4,5,4)]: g.add_edge(u,v,c)
assert g.max_flow(0,5)==23`,
  },
  kuhn: {
    cpp: `Kuhn k(3,3); k.addEdge(0,0); k.addEdge(0,1); k.addEdge(1,0); k.addEdge(2,1); assert(k.maxMatching()==2);
      Kuhn k2(3,3); k2.addEdge(0,0); k2.addEdge(1,0); k2.addEdge(1,1); k2.addEdge(2,1); k2.addEdge(2,2); assert(k2.maxMatching()==3);`,
    py: `s,_=kuhn(3,3,[[0,1],[0],[1]]); assert s==2
s,m=kuhn(3,3,[[0],[0,1],[1,2]]); assert s==3 and sorted(m)==[0,1,2]`,
  },
  "hopcroft-karp": {
    cpp: `mt19937 rng(7); for(int it=0;it<200;it++){ int L=rng()%7+1,R=rng()%7+1; HopcroftKarp hk(L,R);
        vector<vector<int>> adj(L); for(int u=0;u<L;u++) for(int v=0;v<R;v++) if(rng()%3==0){hk.addEdge(u,v);adj[u].push_back(v);}
        int best=0; // brute force via bitmask over right vertices
        function<void(int,int,int)> rec=[&](int u,int used,int cnt){ if(u==L){best=max(best,cnt);return;} rec(u+1,used,cnt); for(int v:adj[u]) if(!(used>>v&1)) rec(u+1,used|1<<v,cnt+1);};
        rec(0,0,0); assert(hk.maxMatching()==best);}`,
    py: `import random
random.seed(3)
for _ in range(200):
    L,R=random.randint(1,6),random.randint(1,6)
    adj=[[v for v in range(R) if random.random()<0.35] for _ in range(L)]
    def rec(u,used):
        if u==L: return 0
        best=rec(u+1,used)
        for v in adj[u]:
            if not used>>v&1: best=max(best,1+rec(u+1,used|1<<v))
        return best
    assert hopcroft_karp(L,R,adj)==rec(0,0)`,
  },
  "scc-tarjan": {
    cpp: `vector<vector<int>> g={{1},{2,3},{0},{4},{5},{3}}; TarjanSCC t(g); assert(t.ncomp==2);
      assert(t.comp[0]==t.comp[1]&&t.comp[1]==t.comp[2]); assert(t.comp[3]==t.comp[4]&&t.comp[4]==t.comp[5]);
      assert(t.comp[3] < t.comp[0]); // reverse topological: sink SCC {3,4,5} first`,
    py: `c=tarjan_scc([[1],[2,3],[0],[4],[5],[3]]); assert c[0]==c[1]==c[2] and c[3]==c[4]==c[5] and c[0]!=c[3] and c[3]<c[0]
n=100000; assert len(set(tarjan_scc([[(i+1)%n] for i in range(n)])))==1`,
  },
  "scc-kosaraju": {
    cpp: `vector<vector<int>> g={{1},{2,3},{0},{4},{5},{3}}; int nc; auto c=kosaraju(g,nc); assert(nc==2);
      assert(c[0]==c[1]&&c[1]==c[2]&&c[3]==c[4]&&c[4]==c[5]); assert(c[0]<c[3]); // topological: source SCC first`,
    py: `c=kosaraju([[1],[2,3],[0],[4],[5],[3]]); assert c[0]==c[1]==c[2] and c[3]==c[4]==c[5] and c[0]<c[3]
n=100000; assert len(set(kosaraju([[i+1] for i in range(n-1)]+[[]])))==n`,
  },
  dsu: {
    cpp: `DSU d(6); assert(d.unite(0,1)); assert(d.unite(2,3)); assert(!d.unite(1,0)); assert(d.unite(1,3)); assert(d.same(0,2)); assert(!d.same(0,4));`,
    py: `d=DSU(6); assert d.union(0,1) and d.union(2,3) and not d.union(1,0) and d.union(1,3)
assert d.find(0)==d.find(2) and d.find(4)!=d.find(0) and d.sets==3`,
  },
  fenwick: {
    cpp: `Fenwick f(6); vector<long long> a={5,0,2,0,3,1}; for(int i=0;i<6;i++) f.add(i,a[i]);
      assert(f.prefix(3)==7); assert(f.range(2,4)==5); assert(f.lowerBound(1)==0); assert(f.lowerBound(6)==2); assert(f.lowerBound(10)==4); assert(f.lowerBound(12)==6);`,
    py: `f=Fenwick(6)
for i,x in enumerate([5,0,2,0,3,1]): f.add(i,x)
assert f.prefix(3)==7 and f.range_sum(2,4)==5
assert count_inversions([3,1,2,5,4])==3 and count_inversions([1,1,1])==0`,
  },
  "segment-tree": {
    cpp: `mt19937 rng(1); vector<long long> a(37); for(auto& x:a) x=rng()%100; SegTree st(a);
      for(int it=0;it<2000;it++){ int i=rng()%37; long long v=rng()%100; a[i]=v; st.set(i,v); int l=rng()%37, r=rng()%37; if(l>r) swap(l,r); r++;
        assert(st.query(l,r)==*min_element(a.begin()+l,a.begin()+r)); }`,
    py: `import random
random.seed(1); a=[random.randrange(100) for _ in range(29)]; st=SegTree(a); sm=SegTree(a,op=lambda x,y:x+y,ident=0)
for _ in range(2000):
    i=random.randrange(29); v=random.randrange(100); a[i]=v; st.set(i,v); sm.set(i,v)
    l=random.randrange(29); r=random.randrange(l,29)+1
    assert st.query(l,r)==min(a[l:r]) and sm.query(l,r)==sum(a[l:r])
cat=SegTree(list("abcde"),op=lambda x,y:x+y,ident=""); assert cat.query(1,4)=="bcd"`,
  },
  "segment-tree-lazy": {
    cpp: `mt19937 rng(2); int n=23; vector<long long> a(n); for(auto& x:a) x=rng()%50; LazySeg s(a);
      for(int it=0;it<3000;it++){ int l=rng()%n, r=rng()%n; if(l>r) swap(l,r);
        if(rng()%2){ long long v=(long long)(rng()%21)-10; s.add(l,r,v); for(int i=l;i<=r;i++) a[i]+=v; }
        else assert(s.query(l,r)==accumulate(a.begin()+l,a.begin()+r+1,0LL)); }`,
    py: `import random
random.seed(2); n=17; a=[random.randrange(50) for _ in range(n)]; s=LazySeg(a)
for _ in range(3000):
    l=random.randrange(n); r=random.randrange(l,n)
    if random.random()<0.5:
        v=random.randint(-10,10); s.add(l,r,v)
        for i in range(l,r+1): a[i]+=v
    else:
        assert s.query(l,r)==sum(a[l:r+1])`,
  },
  "sparse-table": {
    cpp: `mt19937 rng(4); vector<int> a(50); for(auto& x:a) x=rng()%1000; SparseTable st(a);
      for(int l=0;l<50;l++) for(int r=l;r<50;r++) assert(st.query(l,r)==*min_element(a.begin()+l,a.begin()+r+1));`,
    py: `import random
random.seed(4); a=[random.randrange(1000) for _ in range(40)]; st=SparseTable(a)
assert all(st.query(l,r)==min(a[l:r+1]) for l in range(40) for r in range(l,40))
assert SparseTable([7]).query(0,0)==7`,
  },
  knapsack: {
    cpp: `assert(knapsack01({1,3,4,5},{1,4,5,7},7)==9); assert(knapsackUnbounded({1,3,4,5},{10,40,50,70},8)==110);
      auto b=subsetSums({3,34,4,12,5,2}); assert(b[9]); assert(!b[30]);`,
    py: `assert knapsack_01([1,3,4,5],[1,4,5,7],7)==9 and knapsack_unbounded([1,3,4,5],[10,40,50,70],8)==110
b=subset_sums([3,34,4,12,5,2],60); assert b>>9&1 and not b>>30&1
assert coin_change_ways([1,2,5],5)==4`,
  },
  lis: {
    cpp: `assert(lisLength({10,9,2,5,3,7,101,18})==4); assert(lisLength({7,7,7})==1); assert(lisLength({})==0);
      vector<int> a={10,9,2,5,3,7,101,18}; auto idx=lisIndices(a); assert(idx.size()==4); for(size_t i=1;i<idx.size();i++) assert(idx[i-1]<idx[i] && a[idx[i-1]]<a[idx[i]]);`,
    py: `import itertools, random
random.seed(5)
for _ in range(300):
    a=[random.randrange(8) for _ in range(random.randrange(0,9))]
    best=max((len(c) for r in range(len(a)+1) for c in itertools.combinations(a,r) if all(x<y for x,y in zip(c,c[1:]))),default=0)
    s=lis(a); assert len(s)==best and all(x<y for x,y in zip(s,s[1:]))`,
  },
  "bitmask-dp": {
    cpp: `assert(tsp({{0,10,15,20},{10,0,35,25},{15,35,0,30},{20,25,30,0}})==80); assert(tsp({{0}})==0); assert(tsp({{0,3},{4,0}})==7);`,
    py: `assert tsp([[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]])==80 and tsp([[0,3],[4,0]])==7
assert sorted(submasks(0b101))==[1,4,5]`,
  },
  "digit-dp": {
    cpp: `auto ok=[](long long x){ string s=to_string(x); for(size_t i=1;i<s.size();i++) if(s[i]==s[i-1]) return false; return true; };
      long long brute=0; for(long long x=0;x<=5000;x++){ brute+=ok(x); if(x%97==0||x==5000) assert(countUpTo(x)==brute);} assert(countUpTo(-1)==0);`,
    py: `ok=lambda x: all(a!=b for a,b in zip(str(x),str(x)[1:]))
brute=0
for x in range(0,3001):
    brute+=ok(x)
    if x%89==0 or x==3000: assert count_no_adjacent_equal(x)==brute`,
  },
  "interval-dp": {
    cpp: `assert(matrixChain({10,30,5,60})==4500); assert(matrixChain({40,20,30,10,30})==26000); assert(matrixChain({5,5})==0);`,
    py: `assert matrix_chain([10,30,5,60])==4500 and matrix_chain([40,20,30,10,30])==26000
assert longest_pal_subseq("bbbab")==4 and longest_pal_subseq("")==0`,
  },
  "tree-dp": {
    cpp: `vector<vector<int>> adj(6); auto add=[&](int a,int b){adj[a].push_back(b);adj[b].push_back(a);};
      add(0,1);add(0,2);add(2,3);add(2,4);add(2,5);
      assert((sumOfDistances(adj)==vector<long long>{8,12,6,10,10,10}));
      assert(maxIndependentSet(adj,{1,1,1,1,1,1})==4); assert(maxIndependentSet(adj,{1,1,10,1,1,1})==11);`,
    py: `adj=[[] for _ in range(6)]
for a,b in [(0,1),(0,2),(2,3),(2,4),(2,5)]: adj[a].append(b); adj[b].append(a)
assert sum_of_distances(adj)==[8,12,6,10,10,10]
assert max_independent_set(adj,[1]*6)==4 and max_independent_set(adj,[1,1,10,1,1,1])==11`,
  },
  kmp: {
    cpp: `assert((prefixFunction("aabaaab")==vector<int>{0,1,0,1,2,2,3})); assert((kmpSearch("aaaaa","aa")==vector<int>{0,1,2,3})); assert(kmpSearch("abc","d").empty());`,
    py: `assert prefix_function("aabaaab")==[0,1,0,1,2,2,3] and kmp_search("aaaaa","aa")==[0,1,2,3]
assert smallest_period("abcabcabc")==3 and smallest_period("abcab")==5`,
  },
  "z-function": {
    cpp: `assert((zFunction("aaabaab")==vector<int>{0,2,1,0,2,1,0})); assert((zSearch("abababa","aba")==vector<int>{0,2,4}));`,
    py: `assert z_function("aaabaab")==[0,2,1,0,2,1,0] and z_search("abababa","aba")==[0,2,4]`,
  },
  "rolling-hash": {
    cpp: `string s="abracadabra"; Hash h(s); assert(h.get(0,4)==h.get(7,11)); assert(h.get(0,4)!=h.get(1,5)); Hash t("cad"); assert(t.get(0,3)==h.get(4,7));`,
    py: `H=RollingHash("abracadabra"); assert H.get(0,4)==H.get(7,11) and H.get(0,4)!=H.get(1,5)
assert RollingHash("cad").get(0,3)==H.get(4,7)
assert longest_repeated_substring_len("banana")==3 and longest_repeated_substring_len("abc")==0`,
  },
  trie: {
    cpp: `Trie t; for(string w:{"apple","app","apt","bat"}) t.insert(w); assert(t.contains("app")); assert(!t.contains("ap"));
      assert(t.countPrefix("ap")==3); assert(t.countPrefix("")==4); assert(t.countPrefix("c")==0);`,
    py: `t=Trie()
for w in ["apple","app","apt","bat"]: t.insert(w)
assert t.contains("app") and not t.contains("ap") and t.count_prefix("ap")==3 and t.count_prefix("")==4 and t.count_prefix("z")==0`,
  },
  manacher: {
    cpp: `assert(longestPalindrome("babad")=="bab"||longestPalindrome("babad")=="aba"); assert(longestPalindrome("cbbd")=="bb");
      auto [d1,d2]=manacher("aaa"); assert(accumulate(d1.begin(),d1.end(),0)+accumulate(d2.begin(),d2.end(),0)==6);`,
    py: `import random
random.seed(6)
for _ in range(300):
    s="".join(random.choice("ab") for _ in range(random.randrange(0,12)))
    best=max((j-i for i in range(len(s)+1) for j in range(i,len(s)+1) if s[i:j]==s[i:j][::-1]),default=0)
    st,L=manacher(s); assert L==best and s[st:st+L]==s[st:st+L][::-1]`,
  },
  gcd: {
    cpp: `assert(gcdLL(84,36)==12); long long x,y; long long g=extgcd(240,46,x,y); assert(g==2 && 240*x+46*y==2);
      assert(diophantine(-6,4,10,x,y) && -6*x+4*y==10); assert(!diophantine(6,4,5,x,y));`,
    py: `g,x,y=ext_gcd(240,46); assert g==2 and 240*x+46*y==2
assert solve_congruence(6,4,10)==[4,9] and solve_congruence(2,1,4)==[]
assert all((6*x)%10==4 for x in solve_congruence(6,4,10))`,
  },
  "fast-pow": {
    cpp: `assert(power(2,10,1000)==24); assert(power(3,0,7)==1); assert(power(5,3,1)==0); assert(power(-2,3,7)==6);
      assert(power(123456789,987654321,1000000007)==652541198); assert(fib(10,1000000007)==55); assert(fib(90,(long long)4e18)==2880067194370816120LL);`,
    py: `assert power(2,10,1000)==24 and power(5,3,1)==0 and power(123456789,987654321,10**9+7)==pow(123456789,987654321,10**9+7)
assert fib(10)==55 and fib(1)==1 and fib(0)==0`,
  },
  "mod-inverse": {
    cpp: `long long p=1000000007; assert(3*invPrime(3,p)%p==1); assert(invGeneral(3,10)==7); assert(invGeneral(4,10)==-1);
      auto inv=inversesUpTo(100,p); for(int i=1;i<=100;i++) assert(i*inv[i]%p==1);`,
    py: `p=10**9+7; assert 3*inv_prime(3,p)%p==1 and inv(3,10)==7
inv_=inverses_upto(100,p); assert all(i*inv_[i]%p==1 for i in range(1,101))`,
  },
  sieve: {
    cpp: `auto pr=sieve(30); assert((pr==vector<int>{2,3,5,7,11,13,17,19,23,29})); assert(sieve(1000000).size()==78498);
      auto spf=spfSieve(100); assert(spf[97]==97 && spf[91]==7 && spf[64]==2);
      auto f=factorize(360,spfSieve(360)); assert((f==vector<pair<int,int>>{{2,3},{3,2},{5,1}}));`,
    py: `assert sieve(30)==[2,3,5,7,11,13,17,19,23,29] and len(sieve(10**6))==78498 and sieve(1)==[]
spf=spf_sieve(400); assert factorize(360,spf)=={2:3,3:2,5:1} and spf[97]==97`,
  },
  crt: {
    cpp: `auto r=crt(2,3,3,5); assert(r.first==8 && r.second==15); r=crt(8,15,2,7); assert(r.first==23 && r.second==105);
      r=crt(1,4,3,6); assert(r.first==9 && r.second==12); r=crt(1,4,2,6); assert(r.first==-1);`,
    py: `assert crt([2,3,2],[3,5,7])==(23,105) and crt([1,3],[4,6])==(9,12) and crt([1,2],[4,6]) is None`,
  },
  "ncr-mod-p": {
    cpp: `initComb(1000); assert(nCr(5,2)==10); assert(nCr(10,0)==1); assert(nCr(3,5)==0); assert(nCr(1000,500)==159835829);
      vector<vector<int>> C(7,vector<int>(7,0)); for(int i=0;i<7;i++){C[i][0]=1; for(int j=1;j<=i;j++) C[i][j]=(C[i-1][j-1]+C[i-1][j])%7;}
      assert(lucas(1000,300,7,C)==1); assert(lucas(10,3,7,C)==120%7);`,
    py: `import math
assert nCr(5,2)==10 and nCr(3,5)==0 and nCr(1000,500)==math.comb(1000,500)%MOD
assert all(lucas(n,r,7)==math.comb(n,r)%7 for n in range(60) for r in range(n+1))`,
  },
  "convex-hull": {
    cpp: `vector<P> pts={{0,0},{2,0},{1,1},{2,2},{0,2},{1,0},{0,0}}; auto h=convexHull(pts);
      assert((h==vector<P>{{0,0},{2,0},{2,2},{0,2}})); assert(area2(h)==8);`,
    py: `h=convex_hull([(0,0),(2,0),(1,1),(2,2),(0,2),(1,0),(0,0)]); assert h==[(0,0),(2,0),(2,2),(0,2)] and area2(h)==8
assert convex_hull([(0,0),(1,1),(2,2)])==[(0,0),(2,2)]`,
  },
};

let failures = 0, cppRun = 0, pyRun = 0;
const log = (ok, what, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${what}${extra ? "\n" + extra : ""}`);
};

for (const a of algorithms) {
  const d = D[a.id];
  if (!d) log(false, `${a.id}: no driver`);
  // C++
  const cppFile = join(dir, `${a.id}.cpp`);
  writeFileSync(cppFile, `${PRE}${a.cpp}\n\nint main() {\n${d?.cpp ?? ""}\nputs("OK");\n}\n`);
  try {
    execFileSync("g++", ["-std=c++17", "-O2", "-Wall", "-Wno-unused-variable", "-Wno-sign-compare", "-o", cppFile + ".out", cppFile], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const out = execFileSync(cppFile + ".out", [], { encoding: "utf8", timeout: 20000 });
    cppRun++;
    log(out.trim() === "OK", `${a.id} [C++]`);
  } catch (e) {
    log(false, `${a.id} [C++]`, String(e.stderr || e.message).slice(0, 3000));
  }
  // Python
  try {
    const out = execFileSync("python3", ["-c", `${a.py}\n\n${d?.py ?? ""}\nprint("OK")`], { encoding: "utf8", timeout: 60000 });
    pyRun++;
    log(out.trim().endsWith("OK"), `${a.id} [Python]`);
  } catch (e) {
    log(false, `${a.id} [Python]`, String(e.stderr || e.message).slice(0, 3000));
  }
}

for (const p of patterns) {
  try {
    execFileSync("python3", ["-c", p.code], { encoding: "utf8", timeout: 15000 });
    pyRun++;
    log(true, `${p.id} [pattern]`);
  } catch (e) {
    log(false, `${p.id} [pattern]`, String(e.stderr || e.message).slice(0, 2000));
  }
}

console.log(`\n${algorithms.length} algorithms, ${patterns.length} patterns; ${cppRun} C++ programs and ${pyRun} Python programs ran; ${failures} failure(s).`);
process.exit(failures ? 1 : 0);
