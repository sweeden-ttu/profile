import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronsDownUp, ChevronsUpDown, Monitor, Moon, Search, Sun, X } from "lucide-react";
import { patterns } from "@/data/patterns";
import { algorithms } from "@/data/algorithms";
import { budget, budgetFacts, budgetNotes } from "@/data/budget";
import type { AlgoCategory, Entry, PatternCategory } from "@/data/types";
import type { Lang } from "@/lib/highlight";
import { prepare, search, type Doc } from "@/lib/search";
import { EntryCard, LangToggle } from "@/components/EntryCard";
import { BinarySearchViz } from "@/components/viz/BinarySearchViz";
import { DsuViz } from "@/components/viz/DsuViz";
import { DijkstraViz } from "@/components/viz/DijkstraViz";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Tab = "all" | "patterns" | "algorithms" | "budget" | "viz";
type Theme = "auto" | "light" | "dark";

const PATTERN_CATS: { cat: PatternCategory; title: string; blurb: string }[] = [
  { cat: "Creational", title: "Creational patterns", blurb: "How objects get made, without hard-wiring concrete classes." },
  { cat: "Structural", title: "Structural patterns", blurb: "How classes and objects compose into larger structures." },
  { cat: "Behavioral", title: "Behavioral patterns", blurb: "How objects divide responsibility and communicate." },
  { cat: "Modern", title: "Modern & distributed", blurb: "Architecture and resilience patterns from service-oriented systems." },
  { cat: "Agent", title: "LLM agent patterns", blurb: "Control loops for tool-using language-model agents." },
];
const ALGO_CATS: { cat: AlgoCategory; title: string; blurb: string }[] = [
  { cat: "Search & Techniques", title: "Search & techniques", blurb: "Binary search, windows, prefix sums, monotone structures." },
  { cat: "Graphs", title: "Graphs", blurb: "Traversal, shortest paths, spanning trees, flows, matchings, SCCs." },
  { cat: "Data Structures", title: "Data structures", blurb: "Union-find and range-query trees." },
  { cat: "Dynamic Programming", title: "Dynamic programming", blurb: "Recurring DP shapes and their loop orders." },
  { cat: "Strings", title: "Strings", blurb: "Linear-time matching, hashing, tries, palindromes." },
  { cat: "Number Theory", title: "Number theory", blurb: "Modular arithmetic toolkit." },
  { cat: "Geometry", title: "Geometry", blurb: "Integer-exact computational geometry." },
];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

const ALL: Entry[] = [...patterns, ...algorithms];
const BY_ID = new Map(ALL.map((e) => [e.id, e]));
const NUMBER = new Map<string, string>([
  ...patterns.map((p, i) => [p.id, `P${String(i + 1).padStart(2, "0")}`] as [string, string]),
  ...algorithms.map((a, i) => [a.id, `A${String(i + 1).padStart(2, "0")}`] as [string, string]),
]);
const BUDGET_ID = "complexity-budget";

const DOCS: Doc[] = [
  ...ALL.map((e) => ({
    id: e.id,
    fields: [
      { text: e.name, w: 10, fuzzy: true },
      { text: (e.aka ?? []).join(" · "), w: 8, fuzzy: true },
      { text: e.id.replace(/-/g, " "), w: 6 },
      { text: e.category, w: 4 },
      { text: e.tags.join(" "), w: 5 },
      { text: e.kind === "pattern" ? e.intent : e.idea, w: 2 },
      { text: [...e.when, ...(e.pitfalls ?? [])].join(" "), w: 1 },
      { text: e.kind === "pattern" ? `${e.code}\n${e.structure}` : `${e.cpp}\n${e.py}`, w: 0.5, substringOnly: true },
    ],
  })),
  {
    id: BUDGET_ID,
    fields: [
      { text: "Complexity budget", w: 10, fuzzy: true },
      { text: "constraints limits time limit big o operations per second tle", w: 6 },
      { text: budget.map((r) => `${r.complexity} ${r.examples}`).join(" "), w: 1 },
    ],
  },
];
const PREPARED = prepare(DOCS);

function readLS<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable: fine */
  }
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readLS("cs-theme", ["auto", "light", "dark"] as const, "auto"));
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    writeLS("cs-theme", theme);
  }, [theme]);
  return [theme, setTheme] as const;
}

function Chip({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-sm border px-2.5 text-xs transition-colors",
        active ? "border-ink bg-ink text-paper" : "bg-paper-2 text-ink-2 hover:border-ink-3/60 hover:text-ink",
      )}
    >
      {children}
      {count !== undefined && <span className={cn("font-mono text-[0.65rem]", active ? "text-paper/70" : "text-ink-3")}>{count}</span>}
    </button>
  );
}

function BudgetSection() {
  return (
    <section id={BUDGET_ID} className="scroll-mt-40 rounded-md border bg-paper-2">
      <div className="border-b px-4 py-3 sm:px-5">
        <div className="kicker">Reference</div>
        <h3 className="font-serif text-xl font-semibold">Complexity budget</h3>
        <p className="mt-1 max-w-[70ch] text-sm text-ink-2">Read the constraints first: the largest n tells you which complexity class is allowed.</p>
      </div>
      <div className="code-scroll overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-paper-3/60 text-left">
              <th className="px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-3 sm:px-5">Input size</th>
              <th className="px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-3">Feasible</th>
              <th className="px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink-3">Typical techniques</th>
            </tr>
          </thead>
          <tbody>
            {budget.map((r) => (
              <tr key={r.n} className="border-b last:border-0 hover:bg-paper-3/40">
                <td className="whitespace-nowrap px-4 py-2 font-mono text-[0.8rem] text-ink sm:px-5">{r.n}</td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-[0.8rem] font-semibold text-oxblood">{r.complexity}</td>
                <td className="px-3 py-2 text-ink-2">{r.examples}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 border-t px-4 py-4 sm:px-5 md:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="kicker mb-2">Numbers to remember</div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[0.78rem]">
            {budgetFacts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-dotted py-0.5">
                <dt className="text-ink-2">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <div className="kicker mb-2">Notes</div>
          <ul className="prose-cs text-sm text-ink-2">
            {budgetNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function VizSection() {
  const items = [
    { id: "viz-binary-search", title: "Binary search: lower_bound / upper_bound", entry: "binary-search", el: <BinarySearchViz /> },
    { id: "viz-dsu", title: "Union-find: union by rank + path compression", entry: "dsu", el: <DsuViz /> },
    { id: "viz-dijkstra", title: "Dijkstra with a lazy-deletion heap", entry: "dijkstra", el: <DijkstraViz /> },
  ];
  return (
    <div className="space-y-6">
      {items.map((it, i) => (
        <section key={it.id} id={it.id} className="rounded-md border bg-paper-2">
          <div className="border-b px-4 py-3 sm:px-5">
            <div className="kicker">Figure {i + 1}</div>
            <h3 className="font-serif text-xl font-semibold">{it.title}</h3>
          </div>
          <div className="p-4 sm:p-5">{it.el}</div>
        </section>
      ))}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [showAllTags, setShowAllTags] = useState(false);
  const [lang, setLangState] = useState<Lang>(() => readLS("cs-lang", ["cpp", "py"] as const, "cpp"));
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [scrollTo, setScrollTo] = useState<string | null>(null);
  const smoothRef = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeLS("cs-lang", l);
  }, []);

  // "/" focuses search; Esc clears it
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (ev.key === "/" && !typing && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // deep links (#dijkstra) open and scroll to the entry
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (BY_ID.has(id)) {
        setOpen((o) => new Set(o).add(id));
        setScrollTo(id);
      } else if (id === BUDGET_ID) setScrollTo(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    if (!scrollTo) return;
    const raf = requestAnimationFrame(() => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: smoothRef.current ? "smooth" : "auto", block: "start" });
      smoothRef.current = true;
      setScrollTo(null);
    });
    return () => cancelAnimationFrame(raf);
  }, [scrollTo]);

  const onQuery = (q: string) => {
    setQuery(q);
    if (q && (tab === "budget" || tab === "viz")) setTab("all");
  };

  const scores = useMemo(() => search(PREPARED, query), [query]);
  const searching = query.trim().length > 0;

  const inTab = useCallback(
    (e: Entry) => tab === "all" || (tab === "patterns" && e.kind === "pattern") || (tab === "algorithms" && e.kind === "algo"),
    [tab],
  );

  // entries before tag filtering (used for tag chip counts)
  const base = useMemo(
    () => ALL.filter((e) => inTab(e) && (!cats.size || cats.has(e.category)) && (!searching || scores.has(e.id))),
    [inTab, cats, searching, scores],
  );
  const visible = useMemo(() => {
    const v = base.filter((e) => [...tags].every((t) => e.tags.includes(t)));
    if (searching) v.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
    return v;
  }, [base, tags, searching, scores]);

  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of base) for (const t of e.tags) m.set(t, (m.get(t) ?? 0) + 1);
    for (const t of tags) if (!m.has(t)) m.set(t, 0);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [base, tags]);

  const catOptions = useMemo(() => {
    const list = [
      ...(tab !== "algorithms" ? PATTERN_CATS.map((c) => c.cat as string) : []),
      ...(tab !== "patterns" ? ALGO_CATS.map((c) => c.cat as string) : []),
    ];
    return list.map((c) => ({
      c,
      n: ALL.filter((e) => e.category === c && (!searching || scores.has(e.id))).length,
    }));
  }, [tab, searching, scores]);

  const showBudgetInList =
    (tab === "all" || tab === "algorithms") && !cats.size && !tags.size && (!searching || scores.has(BUDGET_ID));

  // where the budget table slots into ranked search results
  const budgetRank = useMemo(() => {
    const b = scores.get(BUDGET_ID) ?? 0;
    const i = visible.findIndex((e) => (scores.get(e.id) ?? 0) < b);
    return i === -1 ? visible.length : i;
  }, [scores, visible]);

  const toggle = useCallback((id: string) => {
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {
      /* sandboxed: ignore */
    }
  }, []);

  const nameOf = useCallback((id: string) => BY_ID.get(id)?.name, []);
  const goTo = useCallback(
    (id: string) => {
      if (!BY_ID.has(id)) return;
      const e = BY_ID.get(id)!;
      const isVisible = visible.some((v) => v.id === id);
      if (!isVisible) {
        setQuery("");
        setCats(new Set());
        setTags(new Set());
        if (!inTab(e)) setTab("all");
      }
      setOpen((o) => new Set(o).add(id));
      setScrollTo(id);
    },
    [visible, inTab],
  );

  const allOpen = visible.length > 0 && visible.every((e) => open.has(e.id));
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(visible.map((e) => e.id)));

  const clearFilters = () => {
    setQuery("");
    setCats(new Set());
    setTags(new Set());
  };

  const onSearchKey = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Escape") {
      if (query) setQuery("");
      else searchRef.current?.blur();
    } else if (ev.key === "Enter" && visible[0]) {
      const id = visible[0].id;
      setOpen((o) => new Set(o).add(id));
      setScrollTo(id);
      searchRef.current?.blur();
    }
  };

  const counts = { patterns: patterns.length, algorithms: algorithms.length };
  const tabs: { id: Tab; label: string; n?: number }[] = [
    { id: "all", label: "Everything", n: counts.patterns + counts.algorithms },
    { id: "patterns", label: "Design patterns", n: counts.patterns },
    { id: "algorithms", label: "Algorithms", n: counts.algorithms },
    { id: "budget", label: "Complexity budget" },
    { id: "viz", label: "Visualizers", n: 3 },
  ];

  const renderCard = (e: Entry) => (
    <EntryCard
      key={e.id}
      entry={e}
      number={NUMBER.get(e.id)!}
      open={open.has(e.id)}
      onToggle={toggle}
      lang={lang}
      setLang={setLang}
      nameOf={nameOf}
      goTo={goTo}
    />
  );

  const groups = useMemo(() => {
    const g: { key: string; numeral: string; title: string; blurb: string; part: string; items: Entry[] }[] = [];
    PATTERN_CATS.forEach((c, i) => {
      const items = visible.filter((e) => e.category === c.cat);
      if (items.length) g.push({ key: c.cat, numeral: ROMAN[i], title: c.title, blurb: c.blurb, part: "Part one · Design patterns", items });
    });
    ALGO_CATS.forEach((c, i) => {
      const items = visible.filter((e) => e.category === c.cat);
      if (items.length) g.push({ key: c.cat, numeral: ROMAN[i], title: c.title, blurb: c.blurb, part: "Part two · Algorithms", items });
    });
    return g;
  }, [visible]);

  const ThemeIcon = theme === "auto" ? Monitor : theme === "light" ? Sun : Moon;
  const nextTheme: Theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
  const listMode = tab === "all" || tab === "patterns" || tab === "algorithms";
  const firstAlgoGroup = groups.findIndex((g) => ALGO_CATS.some((c) => c.cat === g.key));

  return (
    <TooltipProvider delayDuration={300}>
    <div className="min-h-screen bg-paper text-ink">
      {/* ── Masthead ── */}
      <header className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-8 sm:pt-10">
        <div className="flex items-center justify-between gap-3 text-xs">
          <a href="/" className="inline-flex items-center gap-1.5 text-ink-2 no-underline hover:text-oxblood">
            <ArrowLeft className="h-3.5 w-3.5" /> Scott Weeden
          </a>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setTheme(nextTheme)}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm border bg-paper-2 px-2.5 text-ink-2 transition-colors hover:text-ink"
                aria-label={`Theme: ${theme}. Switch to ${nextTheme}`}
              >
                <ThemeIcon className="h-3.5 w-3.5" />
                <span className="capitalize">{theme}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="rounded-sm bg-ink text-paper">
              {theme === "auto" ? "Following your system setting" : `Forced ${theme}`} · click for {nextTheme}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="mt-6 border-t-[3px] border-ink pt-1">
          <div className="border-t border-ink" />
        </div>
        <div className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-end sm:py-7">
          <div>
            <div className="kicker">Field reference · patterns &amp; algorithms</div>
            <h1 className="mt-2 font-serif text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[4rem]">
              The Cheat Sheet<span className="text-oxblood">.</span>
            </h1>
            <p className="mt-3 max-w-[62ch] font-serif text-[1.08rem] italic leading-snug text-ink-2 sm:text-[1.2rem]">
              Twenty-three Gang-of-Four patterns, the modern and agentic ones that followed, and the
              competitive-programming algorithms worth knowing by heart, each with code that compiles and runs.
            </p>
          </div>
          <dl className="flex gap-6 font-mono text-xs text-ink-3 sm:flex-col sm:gap-1 sm:text-right">
            <div><dt className="inline">patterns </dt><dd className="inline text-ink">{counts.patterns}</dd></div>
            <div><dt className="inline">algorithms </dt><dd className="inline text-ink">{counts.algorithms}</dd></div>
            <div><dt className="inline">snippets </dt><dd className="inline text-ink">{counts.patterns + counts.algorithms * 2}</dd></div>
          </dl>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="sticky top-0 z-30 border-y bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-2.5 sm:px-8">
          <div className="flex items-center gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search patterns and algorithms</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={onSearchKey}
                placeholder="Search: dijkstra, segment tree lazy, observer, 'retry'…"
                className="h-10 w-full rounded-sm border bg-paper-2 pl-9 pr-16 font-sans text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-oxblood focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-oxblood/25 [&::-webkit-search-cancel-button]:hidden"
                autoComplete="off"
                spellCheck={false}
              />
              <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {query ? (
                  <button type="button" onClick={() => setQuery("")} className="rounded-sm p-1 text-ink-3 hover:text-ink" aria-label="Clear search">
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <kbd className="kbd" aria-hidden>/</kbd>
                )}
              </span>
            </label>
            <div className="hidden sm:block">
              <LangToggle lang={lang} setLang={setLang} size="md" />
            </div>
            {listMode && (
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex h-10 items-center gap-1.5 rounded-sm border bg-paper-2 px-2.5 text-xs text-ink-2 hover:text-ink"
                aria-label={allOpen ? "Collapse all entries" : "Expand all visible entries"}
              >
                {allOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
                <span className="hidden md:inline">{allOpen ? "Collapse" : "Expand"} all</span>
              </button>
            )}
          </div>
          <nav className="code-scroll -mx-4 flex items-center gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "relative h-8 whitespace-nowrap px-2.5 font-sans text-[0.83rem] transition-colors",
                  tab === t.id ? "font-semibold text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                {t.label}
                {t.n !== undefined && <span className="ml-1 font-mono text-[0.65rem] text-ink-3">{t.n}</span>}
                {tab === t.id && <span className="absolute inset-x-2 -bottom-[3px] h-[2px] bg-oxblood" />}
              </button>
            ))}
            <div className="ml-auto pl-2 sm:hidden">
              <LangToggle lang={lang} setLang={setLang} />
            </div>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-5 sm:px-8">
        {listMode && (
          <div className="mb-6 space-y-2.5">
            <div className="code-scroll -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
              <span className="kicker mr-1 shrink-0">Category</span>
              {catOptions.filter(({ c, n }) => n > 0 || cats.has(c)).map(({ c, n }) => (
                <Chip
                  key={c}
                  active={cats.has(c)}
                  count={n}
                  onClick={() =>
                    setCats((s) => {
                      const x = new Set(s);
                      if (x.has(c)) x.delete(c);
                      else x.add(c);
                      return x;
                    })
                  }
                >
                  {c}
                </Chip>
              ))}
            </div>
            <div className="code-scroll -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
              <span className="kicker mr-1 shrink-0">Tags</span>
              {(showAllTags ? tagCounts : tagCounts.slice(0, 14)).map(([t, n]) => (
                <Chip
                  key={t}
                  active={tags.has(t)}
                  count={n}
                  onClick={() =>
                    setTags((s) => {
                      const x = new Set(s);
                      if (x.has(t)) x.delete(t);
                      else x.add(t);
                      return x;
                    })
                  }
                >
                  #{t}
                </Chip>
              ))}
              {tagCounts.length > 14 && (
                <button type="button" onClick={() => setShowAllTags((v) => !v)} className="h-7 shrink-0 whitespace-nowrap px-1.5 text-xs text-oxblood underline-offset-2 hover:underline">
                  {showAllTags ? "fewer" : `+${tagCounts.length - 14} more`}
                </button>
              )}
            </div>
            {(searching || cats.size > 0 || tags.size > 0) && (
              <div className="flex items-center gap-3 pt-1 text-sm text-ink-2" aria-live="polite">
                <span>
                  <span className="font-semibold text-ink">{visible.length}</span> match{visible.length === 1 ? "" : "es"}
                  {searching && <> for “<span className="text-ink">{query.trim()}</span>”</>}
                  {searching && " · sorted by relevance · Enter opens the top hit"}
                </span>
                <button type="button" onClick={clearFilters} className="text-xs text-oxblood underline-offset-2 hover:underline">
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        <div className={cn(listMode && !searching && "lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10")}>
          {listMode && !searching && (
            <aside className="hidden lg:block">
              <nav className="code-scroll sticky top-[7.5rem] max-h-[calc(100vh-9rem)] overflow-y-auto pb-8 pr-1 text-[0.8rem]" aria-label="Contents">
                <div className="kicker mb-2">Contents</div>
                {groups.map((g, gi) => (
                  <div key={g.key} className="mb-3">
                    {(gi === 0 || g.part !== groups[gi - 1].part) && (
                      <div className="mb-1 mt-3 font-serif text-[0.8rem] italic text-ink-3">{g.part}</div>
                    )}
                    <a href={`#group-${g.key}`} className="block font-semibold text-ink no-underline hover:text-oxblood"
                      onClick={(ev) => { ev.preventDefault(); document.getElementById(`group-${g.key.replace(/\W+/g, "-")}`)?.scrollIntoView({ behavior: "smooth" }); }}>
                      <span className="mr-1 font-serif text-oxblood">{g.numeral}.</span> {g.title}
                    </a>
                    <ul className="mt-0.5 space-y-px border-l pl-2.5">
                      {g.items.map((e) => (
                        <li key={e.id}>
                          <button
                            type="button"
                            onClick={() => goTo(e.id)}
                            className={cn("w-full truncate py-px text-left text-ink-2 hover:text-oxblood", open.has(e.id) && "text-oxblood")}
                            title={e.name}
                          >
                            {e.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>
          )}

          <div className="min-w-0">
            {tab === "budget" && <BudgetSection />}
            {tab === "viz" && <VizSection />}

            {listMode && searching && (
              <div className="space-y-2.5">
                {showBudgetInList && budgetRank === 0 && <BudgetSection />}
                {visible.map((e, i) => (
                  <div key={e.id}>
                    {renderCard(e)}
                    {showBudgetInList && budgetRank === i + 1 && <div className="mt-2.5"><BudgetSection /></div>}
                  </div>
                ))}
              </div>
            )}

            {listMode && !searching && (
              <div className="space-y-10">
                {groups.map((g, gi) => (
                  <section key={g.key} id={`group-${g.key.replace(/\W+/g, "-")}`} className="scroll-mt-36">
                    {(gi === 0 || g.part !== groups[gi - 1].part) && (
                      <div className="mb-4 flex items-center gap-3">
                        <span className="font-serif text-sm italic text-ink-3">{g.part}</span>
                        <span className="h-px flex-1 bg-rule" />
                      </div>
                    )}
                    {gi === firstAlgoGroup && showBudgetInList && (
                      <div className="mb-8">
                        <BudgetSection />
                      </div>
                    )}
                    <header className="mb-3 flex items-baseline gap-3">
                      <span className="font-serif text-2xl font-semibold text-oxblood">{g.numeral}.</span>
                      <div>
                        <h2 className="font-serif text-[1.55rem] font-semibold">{g.title}</h2>
                        <p className="text-sm text-ink-3">{g.blurb}</p>
                      </div>
                    </header>
                    <div className="space-y-2.5">{g.items.map(renderCard)}</div>
                  </section>
                ))}
                {groups.length === 0 && !showBudgetInList && <Empty onClear={clearFilters} />}
              </div>
            )}
            {listMode && searching && visible.length === 0 && !showBudgetInList && <Empty onClear={clearFilters} />}
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-8 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>
            Every snippet is compiled (g++ -std=c++17) or executed (Python 3.13) against test cases before publishing.
          </span>
          <span className="font-mono">
            <kbd className="kbd">/</kbd> search · <kbd className="kbd">Enter</kbd> open top hit · <kbd className="kbd">Esc</kbd> clear
          </span>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
}

function Empty({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-md border border-dashed px-6 py-12 text-center">
      <p className="font-serif text-lg italic text-ink-2">Nothing matches that.</p>
      <p className="mt-1 text-sm text-ink-3">Try a broader term, a different spelling, or fewer filters.</p>
      <button type="button" onClick={onClear} className="mt-4 text-sm text-oxblood underline-offset-2 hover:underline">
        Clear search and filters
      </button>
    </div>
  );
}
