import { useMemo, useState } from "react";
import { StepControls, useStepper } from "./controls";
import { cn } from "@/lib/utils";

const NAMES = ["A", "B", "C", "D", "E", "F", "G"];
const POS = [
  { x: 60, y: 160 },
  { x: 190, y: 60 },
  { x: 190, y: 260 },
  { x: 330, y: 110 },
  { x: 380, y: 250 },
  { x: 500, y: 150 },
  { x: 610, y: 240 },
];
// undirected weighted edges [u, v, w]
export const EDGES: [number, number, number][] = [
  [0, 1, 4], [0, 2, 2], [1, 2, 1], [1, 3, 5], [2, 3, 8], [2, 4, 10],
  [3, 4, 2], [3, 5, 6], [4, 5, 2], [5, 6, 3], [4, 6, 7],
];

interface Frame {
  dist: number[];
  prev: number[];
  settled: boolean[];
  pq: [number, number][];
  cur: number | null;
  edge: [number, number] | null;
  improved: boolean | null;
  note: string;
}

/** Lazy-deletion Dijkstra with a binary-heap-equivalent PQ (sorted by (d, v)). */
export function traceDijkstra(src: number): Frame[] {
  const n = NAMES.length;
  const adj: [number, number][][] = Array.from({ length: n }, () => []);
  for (const [u, v, w] of EDGES) { adj[u].push([v, w]); adj[v].push([u, w]); }
  for (const l of adj) l.sort((a, b) => a[0] - b[0]);

  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const settled = Array(n).fill(false);
  let pq: [number, number][] = [];
  const frames: Frame[] = [];
  const snap = (f: Partial<Frame> & { note: string }) =>
    frames.push({
      dist: dist.slice(), prev: prev.slice(), settled: settled.slice(),
      pq: pq.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]),
      cur: null, edge: null, improved: null, ...f,
    });
  const fmt = (d: number) => (d === Infinity ? "∞" : String(d));

  dist[src] = 0;
  pq.push([0, src]);
  snap({ note: `dist[${NAMES[src]}] = 0, every other dist = ∞. Push (0, ${NAMES[src]}).` });
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [du, u] = pq.shift()!;
    if (du !== dist[u]) {
      snap({ cur: u, note: `Pop (${du}, ${NAMES[u]}): stale, dist[${NAMES[u]}] is already ${dist[u]} → skip.` });
      continue;
    }
    settled[u] = true;
    snap({ cur: u, note: `Pop (${du}, ${NAMES[u]}): smallest tentative distance, so ${NAMES[u]} is final at ${du}.` });
    for (const [v, w] of adj[u]) {
      if (settled[v]) continue;
      const cand = du + w;
      const old = dist[v];
      const improved = cand < old;
      if (improved) {
        dist[v] = cand;
        prev[v] = u;
        pq.push([cand, v]);
      }
      snap({
        cur: u, edge: [u, v], improved,
        note: `Relax ${NAMES[u]}–${NAMES[v]} (w = ${w}): ${du} + ${w} = ${cand} ${improved ? "<" : "≥"} ${fmt(old)}` +
          (improved ? ` → dist[${NAMES[v]}] = ${cand}, push (${cand}, ${NAMES[v]}).` : " → no change."),
      });
    }
  }
  snap({ note: "Queue empty: all reachable distances are final. Highlighted edges form the shortest-path tree." });
  return frames;
}

export function DijkstraViz() {
  const [src, setSrc] = useState(0);
  const frames = useMemo(() => traceDijkstra(src), [src]);
  const s = useStepper(frames.length, String(src), 1200);
  const f = frames[Math.min(s.step, frames.length - 1)];

  const treeEdge = (u: number, v: number) => f.prev[v] === u || f.prev[u] === v;
  const isCur = (u: number, v: number) =>
    !!f.edge && ((f.edge[0] === u && f.edge[1] === v) || (f.edge[0] === v && f.edge[1] === u));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
        <span>Source</span>
        <div className="flex overflow-hidden rounded-sm border" role="group" aria-label="Source vertex">
          {NAMES.map((nm, i) => (
            <button
              key={nm}
              type="button"
              aria-pressed={src === i}
              onClick={() => setSrc(i)}
              className={cn(
                "h-9 w-9 font-mono text-xs transition-colors",
                src === i ? "bg-ink text-paper" : "bg-paper-2 text-ink-2 hover:text-ink",
              )}
            >
              {nm}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
        <div className="code-scroll overflow-x-auto rounded-sm border bg-paper-2/70">
          <svg viewBox="0 0 670 320" className="block h-auto w-full min-w-[520px]" role="img" aria-label="Weighted graph for Dijkstra's algorithm">
            {EDGES.map(([u, v, w]) => {
              const a = POS[u], b = POS[v];
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
              const cur = isCur(u, v);
              const tree = treeEdge(u, v);
              return (
                <g key={`${u}-${v}`}>
                  <line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={cur ? (f.improved ? "rgb(var(--viz-b))" : "rgb(var(--viz-a))") : tree ? "rgb(var(--accent))" : "rgb(var(--rule))"}
                    strokeWidth={cur ? 4 : tree ? 3 : 2}
                    strokeDasharray={cur && !f.improved ? "6 4" : undefined}
                    style={{ transition: "all 250ms ease" }}
                  />
                  <rect x={mx - 11} y={my - 10} width={22} height={18} rx={3} fill="rgb(var(--paper-2))" stroke="rgb(var(--rule))" />
                  <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="11" className="font-mono" fill="rgb(var(--ink-2))">
                    {w}
                  </text>
                </g>
              );
            })}
            {POS.map((p, i) => {
              const settled = f.settled[i];
              const cur = f.cur === i;
              const d = f.dist[i];
              return (
                <g key={i} transform={`translate(${p.x},${p.y})`}>
                  <circle
                    r={20}
                    fill={settled ? "rgb(var(--accent))" : "rgb(var(--paper))"}
                    stroke={cur ? "rgb(var(--viz-a))" : settled ? "rgb(var(--accent))" : "rgb(var(--ink-3))"}
                    strokeWidth={cur ? 4 : 2}
                    style={{ transition: "all 250ms ease" }}
                  />
                  <text textAnchor="middle" dy="0.35em" fontSize="14" fontWeight={700} className="font-serif" fill={settled ? "rgb(var(--paper))" : "rgb(var(--ink))"}>
                    {NAMES[i]}
                  </text>
                  <text textAnchor="middle" y={36} fontSize="12" className="font-mono" fill={d === Infinity ? "rgb(var(--ink-3))" : "rgb(var(--ink))"}>
                    {d === Infinity ? "∞" : d}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div>
            <div className="kicker mb-1">dist / prev</div>
            <table className="w-full border-collapse font-mono text-xs">
              <tbody>
                {NAMES.map((nm, i) => (
                  <tr key={nm} className={cn("border-b last:border-0", f.cur === i && "bg-[rgb(var(--viz-a)/0.12)]")}>
                    <td className={cn("py-0.5 pr-2 font-semibold", f.settled[i] && "text-oxblood")}>{nm}</td>
                    <td className="py-0.5 pr-2 text-right">{f.dist[i] === Infinity ? "∞" : f.dist[i]}</td>
                    <td className="py-0.5 text-right text-ink-3">{f.prev[i] === -1 ? "–" : NAMES[f.prev[i]]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="kicker mb-1">min-heap (d, v)</div>
            <div className="flex flex-wrap gap-1">
              {f.pq.length === 0 && <span className="font-mono text-xs text-ink-3">empty</span>}
              {f.pq.map(([d, v], k) => (
                <span
                  key={`${d}-${v}-${k}`}
                  className={cn(
                    "rounded-sm border px-1.5 py-0.5 font-mono text-[0.7rem]",
                    k === 0 ? "border-oxblood text-oxblood" : "text-ink-2",
                    d !== f.dist[v] && "line-through opacity-60",
                  )}
                  title={d !== f.dist[v] ? "stale entry (will be skipped)" : undefined}
                >
                  ({d}, {NAMES[v]})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="min-h-[3rem] rounded-sm border-l-2 border-oxblood bg-paper-3/50 px-3 py-2 font-mono text-[0.78rem] leading-relaxed text-ink-2" aria-live="polite">
        {f.note}
      </p>
      <StepControls s={s} length={frames.length} />
      <p className="text-xs text-ink-3">
        Filled = settled (final). Oxblood edges = current shortest-path tree. Green/solid = a relaxation that improved a distance; blue/dashed = no improvement. Struck-through heap entries are stale and get skipped when popped.
      </p>
    </div>
  );
}
