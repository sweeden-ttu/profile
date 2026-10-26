import { memo } from "react";
import { ChevronDown, Link2 } from "lucide-react";
import type { AlgoEntry, Entry, PatternEntry } from "@/data/types";
import type { Lang } from "@/lib/highlight";
import { CodeBlock } from "./CodeBlock";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BinarySearchViz } from "./viz/BinarySearchViz";
import { DsuViz } from "./viz/DsuViz";
import { DijkstraViz } from "./viz/DijkstraViz";
import { cn } from "@/lib/utils";

export interface CardProps {
  entry: Entry;
  number: string;
  open: boolean;
  onToggle: (id: string) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  nameOf: (id: string) => string | undefined;
  goTo: (id: string) => void;
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <h4 className="kicker mb-1.5">{title}</h4>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="prose-cs text-[0.92rem] leading-relaxed text-ink-2">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

function Related({ ids, nameOf, goTo }: { ids: string[]; nameOf: CardProps["nameOf"]; goTo: CardProps["goTo"] }) {
  const items = ids.filter((id) => nameOf(id));
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => goTo(id)}
          className="rounded-sm border border-dashed px-2 py-0.5 text-xs text-ink-2 transition-colors hover:border-oxblood hover:text-oxblood"
        >
          {nameOf(id)}
        </button>
      ))}
    </div>
  );
}

export function LangToggle({ lang, setLang, size = "sm" }: { lang: Lang; setLang: (l: Lang) => void; size?: "sm" | "md" }) {
  return (
    <ToggleGroup
      type="single"
      value={lang}
      onValueChange={(v) => v && setLang(v as Lang)}
      aria-label="Code language"
      className="gap-0 overflow-hidden rounded-sm border"
    >
      {(["cpp", "py"] as Lang[]).map((l) => (
        <ToggleGroupItem
          key={l}
          value={l}
          aria-label={l === "cpp" ? "Show C++" : "Show Python"}
          className={cn(
            "min-w-0 rounded-none font-mono font-normal text-ink-2 hover:bg-paper-3 hover:text-ink data-[state=on]:bg-ink data-[state=on]:text-paper",
            size === "sm" ? "h-6 px-2 text-[0.68rem]" : "h-10 px-3 text-xs",
          )}
        >
          {l === "cpp" ? "C++" : "Python"}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function PatternBody({ e, nameOf, goTo }: { e: PatternEntry } & Pick<CardProps, "nameOf" | "goTo">) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Section title="When to use">
          <Bullets items={e.when} />
        </Section>
        {e.pitfalls && (
          <Section title="Watch out">
            <Bullets items={e.pitfalls} />
          </Section>
        )}
      </div>
      <Section title="Structure">
        <figure className="rounded-md border border-dashed bg-paper/60">
          <pre className="code-scroll overflow-x-auto px-3 py-3 font-mono text-[0.72rem] leading-[1.45] text-ink-2 sm:text-[0.76rem]">{e.structure}</pre>
          <figcaption className="border-t border-dashed px-3 py-1.5 font-mono text-[0.65rem] text-ink-3">
            ---&gt; uses / calls · ^ inherits or implements · &lt;&gt;--- has-a · * abstract
          </figcaption>
        </figure>
      </Section>
      <CodeBlock code={e.code} lang="py" label="Python 3.10+ · runnable" />
      <Section title="Related">
        <Related ids={e.related} nameOf={nameOf} goTo={goTo} />
      </Section>
    </div>
  );
}

function AlgoBody({ e, lang, setLang, nameOf, goTo }: { e: AlgoEntry } & Pick<CardProps, "lang" | "setLang" | "nameOf" | "goTo">) {
  return (
    <div className="space-y-5">
      <p className="max-w-[72ch] text-[0.95rem] leading-relaxed text-ink">{e.idea}</p>
      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border bg-rule sm:grid-cols-2">
        <div className="bg-paper-2 px-3 py-2">
          <dt className="kicker">Time</dt>
          <dd className="font-mono text-[0.82rem] text-ink">{e.time}</dd>
        </div>
        <div className="bg-paper-2 px-3 py-2">
          <dt className="kicker">Space</dt>
          <dd className="font-mono text-[0.82rem] text-ink">{e.space}</dd>
        </div>
      </dl>
      <div className="grid gap-5 md:grid-cols-2">
        <Section title="When to use">
          <Bullets items={e.when} />
        </Section>
        <Section title="Pitfalls">
          <Bullets items={e.pitfalls} />
        </Section>
      </div>
      {e.viz && (
        <Section title="Try it">
          <div className="rounded-md border bg-paper/50 p-3 sm:p-4">
            {e.viz === "binary-search" && <BinarySearchViz />}
            {e.viz === "dsu" && <DsuViz />}
            {e.viz === "dijkstra" && <DijkstraViz />}
          </div>
        </Section>
      )}
      <CodeBlock
        code={lang === "cpp" ? e.cpp : e.py}
        lang={lang}
        label={lang === "cpp" ? "C++17" : "Python 3"}
        toolbar={<LangToggle lang={lang} setLang={setLang} />}
      />
      {e.related && e.related.length > 0 && (
        <Section title="Related">
          <Related ids={e.related} nameOf={nameOf} goTo={goTo} />
        </Section>
      )}
    </div>
  );
}

export const EntryCard = memo(function EntryCard({ entry: e, number, open, onToggle, lang, setLang, nameOf, goTo }: CardProps) {
  const summary = e.kind === "pattern" ? e.intent : e.idea;
  const bodyId = `body-${e.id}`;
  return (
    <article
      id={e.id}
      className={cn(
        "group scroll-mt-40 rounded-md border bg-paper-2 transition-[border-color,box-shadow] duration-150",
        open ? "border-ink-3/50 shadow-[inset_3px_0_0_rgb(var(--accent))]" : "hover:border-ink-3/40",
      )}
    >
      <h3 className="m-0">
        <button
          type="button"
          onClick={() => onToggle(e.id)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex w-full items-start gap-3 px-4 py-3 text-left sm:px-5"
        >
          <span className="mt-1 w-9 shrink-0 font-mono text-[0.68rem] tabular-nums text-ink-3">{number}</span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-serif text-[1.12rem] font-semibold leading-snug text-ink">{e.name}</span>
              {e.aka && e.aka.length > 0 && (
                <span className="font-sans text-xs font-normal text-ink-3">aka {e.aka.slice(0, 2).join(", ")}</span>
              )}
            </span>
            {(e.kind === "pattern" || !open) && (
              <span className={cn("mt-0.5 block font-sans text-[0.88rem] font-normal leading-snug text-ink-2", !open && "line-clamp-2")}>
                {e.kind === "pattern" ? <em className="font-serif text-[0.98rem]">{summary}</em> : summary}
              </span>
            )}
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-sm bg-oxblood-soft px-1.5 py-px font-sans text-[0.66rem] font-semibold uppercase tracking-wider text-oxblood">
                {e.category}
              </span>
              {e.kind === "algo" && (
                <span className="rounded-sm border px-1.5 py-px font-mono text-[0.66rem] text-ink-2">{e.time.split(/[;(]/)[0].trim()}</span>
              )}
              {e.tags.slice(0, 3).map((t) => (
                <span key={t} className="font-mono text-[0.66rem] text-ink-3">
                  #{t}
                </span>
              ))}
            </span>
          </span>
          <ChevronDown
            className={cn("mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200", open && "rotate-180 text-oxblood")}
            aria-hidden
          />
        </button>
      </h3>
      {open && (
        <div id={bodyId} className="border-t px-4 pb-5 pt-4 sm:px-5 sm:pl-[4.25rem]">
          {e.kind === "pattern" ? (
            <PatternBody e={e} nameOf={nameOf} goTo={goTo} />
          ) : (
            <AlgoBody e={e} lang={lang} setLang={setLang} nameOf={nameOf} goTo={goTo} />
          )}
          <a
            href={`#${e.id}`}
            className="mt-4 inline-flex items-center gap-1 font-mono text-[0.68rem] text-ink-3 no-underline hover:text-oxblood"
          >
            <Link2 className="h-3 w-3" /> #{e.id}
          </a>
        </div>
      )}
    </article>
  );
});
