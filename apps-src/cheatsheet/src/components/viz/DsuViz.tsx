import { useMemo, useRef, useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import { vizBtn } from "./controls";
import { cn } from "@/lib/utils";

const N = 10;

interface DsuState {
  p: number[];
  r: number[];
}

const fresh = (): DsuState => ({ p: Array.from({ length: N }, (_, i) => i), r: Array(N).fill(0) });

function rootPath(p: number[], x: number): number[] {
  const path = [x];
  while (p[path[path.length - 1]] !== path[path.length - 1]) path.push(p[path[path.length - 1]]);
  return path; // x ... root
}

/** find with full path compression (matches the DSU snippet). */
function findCompress(st: DsuState, x: number): { root: number; path: number[]; p: number[] } {
  const path = rootPath(st.p, x);
  const root = path[path.length - 1];
  const p = st.p.slice();
  for (const v of path) p[v] = root;
  return { root, path, p };
}

interface Layout {
  pos: { x: number; y: number }[];
  width: number;
  height: number;
}

/** Tidy-ish forest layout: leaves get consecutive columns, parents centre over children. */
function layoutForest(p: number[]): Layout {
  const children: number[][] = Array.from({ length: N }, () => []);
  const roots: number[] = [];
  for (let v = 0; v < N; v++) (p[v] === v ? roots : children[p[v]]).push(v);
  const pos = Array.from({ length: N }, () => ({ x: 0, y: 0 }));
  let col = 0, maxDepth = 0;
  const place = (u: number, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    const ch = children[u];
    let x: number;
    if (ch.length === 0) x = col++;
    else {
      const xs = ch.map((c) => place(c, depth + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    pos[u] = { x, y: depth };
    return x;
  };
  roots.forEach((r, i) => {
    place(r, 0);
    if (i < roots.length - 1) col += 0.35; // gap between trees
  });
  const GX = 56, GY = 62, PAD = 36;
  return {
    pos: pos.map(({ x, y }) => ({ x: PAD + x * GX, y: PAD + y * GY })),
    width: PAD * 2 + Math.max(0, col - 1) * GX,
    height: PAD * 2 + maxDepth * GY,
  };
}

export function DsuViz() {
  const [st, setSt] = useState<DsuState>(fresh);
  const [sel, setSel] = useState<number | null>(null);
  const [hl, setHl] = useState<{ path: number[]; root: number } | null>(null);
  const [log, setLog] = useState<string[]>(["Click two nodes to union them, or pick a node and press find(x)."]);
  const timer = useRef<number | undefined>(undefined);
  const layout = useMemo(() => layoutForest(st.p), [st.p]);

  const push = (msg: string) => setLog((l) => [msg, ...l].slice(0, 6));

  const flash = (path: number[], root: number) => {
    window.clearTimeout(timer.current);
    setHl({ path, root });
    timer.current = window.setTimeout(() => setHl(null), 1600);
  };

  const doFind = (x: number) => {
    const { root, path, p } = findCompress(st, x);
    const changed = path.slice(0, -1).filter((v) => st.p[v] !== root);
    flash(path, root);
    setSt({ p, r: st.r });
    push(
      `find(${x}): path ${path.join(" → ")}, root = ${root}` +
        (changed.length ? `; compress: parent[${changed.join("], parent[")}] = ${root}` : "; already flat"),
    );
  };

  const doUnion = (a: number, b: number) => {
    const fa = findCompress(st, a);
    const fb = findCompress({ p: fa.p, r: st.r }, b);
    const p = fb.p, r = st.r.slice();
    let ra = fa.root, rb = fb.root;
    flash([...new Set([...fa.path, ...fb.path])], ra);
    if (ra === rb) {
      setSt({ p, r });
      push(`union(${a}, ${b}): same root ${ra} → nothing to do (would form a cycle)`);
      return;
    }
    let msg = `union(${a}, ${b}): roots ${ra} (rank ${r[ra]}) and ${rb} (rank ${r[rb]}) → `;
    if (r[ra] < r[rb]) [ra, rb] = [rb, ra];
    p[rb] = ra;
    msg += `parent[${rb}] = ${ra}`;
    if (r[ra] === r[rb]) {
      r[ra]++;
      msg += `, ranks equal so rank[${ra}] = ${r[ra]}`;
    }
    setSt({ p, r });
    push(msg);
  };

  const onNode = (v: number) => {
    if (sel === null) setSel(v);
    else if (sel === v) setSel(null);
    else {
      doUnion(sel, v);
      setSel(null);
    }
  };

  const randomUnion = () => {
    const a = Math.floor(Math.random() * N);
    let b = Math.floor(Math.random() * (N - 1));
    if (b >= a) b++;
    doUnion(a, b);
  };

  const sets = st.p.filter((v, i) => v === i).length;
  const { pos, width, height } = layout;
  const vbW = Math.max(width, 320);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={vizBtn} onClick={randomUnion}>
          <Shuffle className="h-4 w-4" /> Random union
        </button>
        <button type="button" className={vizBtn} disabled={sel === null} onClick={() => sel !== null && (doFind(sel), setSel(null))}>
          find({sel ?? "x"})
        </button>
        <button type="button" className={vizBtn} onClick={() => { setSt(fresh()); setSel(null); setHl(null); setLog(["Reset: every node is its own set."]); }}>
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        <span className="font-mono text-xs text-ink-3">{sets} set{sets === 1 ? "" : "s"}</span>
        {sel !== null && <span className="font-mono text-xs text-oxblood">selected {sel} - click another node to union</span>}
      </div>

      <div className="code-scroll overflow-x-auto rounded-sm border bg-paper-2/70">
        <svg
          viewBox={`0 0 ${vbW} ${Math.max(height, 120)}`}
          className="mx-auto block h-auto"
          style={{ width: "100%", minWidth: Math.min(vbW, 560), maxWidth: vbW * 1.25 }}
          role="img"
          aria-label="Union-find forest; arrows point from each node to its parent"
        >
          <defs>
            <marker id="dsu-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="rgb(var(--ink-3))" />
            </marker>
          </defs>
          {st.p.map((par, v) => {
            if (par === v) return null;
            const a = pos[v], b = pos[par];
            const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
            const R = 17;
            const onPath = hl?.path.includes(v) ?? false;
            return (
              <line
                key={`e${v}`}
                x1={a.x + (dx / len) * R}
                y1={a.y + (dy / len) * R}
                x2={b.x - (dx / len) * (R + 3)}
                y2={b.y - (dy / len) * (R + 3)}
                stroke={onPath ? "rgb(var(--viz-a))" : "rgb(var(--ink-3))"}
                strokeWidth={onPath ? 2.5 : 1.4}
                markerEnd="url(#dsu-arrow)"
                style={{ transition: "all 300ms ease" }}
              />
            );
          })}
          {pos.map((q, v) => {
            const isRoot = st.p[v] === v;
            const onPath = hl?.path.includes(v) ?? false;
            const isSel = sel === v;
            return (
              <g
                key={v}
                transform={`translate(${q.x},${q.y})`}
                style={{ transition: "transform 400ms ease", cursor: "pointer" }}
                onClick={() => onNode(v)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNode(v); } }}
                tabIndex={0}
                role="button"
                aria-label={`node ${v}, parent ${st.p[v]}${isRoot ? ", root" : ""}`}
              >
                <circle
                  r={17}
                  fill={isSel ? "rgb(var(--accent))" : onPath ? "rgb(var(--viz-a) / 0.18)" : "rgb(var(--paper))"}
                  stroke={isRoot ? "rgb(var(--accent))" : onPath ? "rgb(var(--viz-a))" : "rgb(var(--ink-3))"}
                  strokeWidth={isRoot ? 2.5 : 1.5}
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  className="font-mono"
                  fontSize="13"
                  fontWeight={600}
                  fill={isSel ? "rgb(var(--paper))" : "rgb(var(--ink))"}
                >
                  {v}
                </text>
                {isRoot && (
                  <text textAnchor="middle" y={-23} fontSize="9.5" className="font-mono" fill="rgb(var(--accent))">
                    r={st.r[v]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="code-scroll overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse font-mono text-xs">
          <tbody>
            {[
              ["i", (i: number) => i],
              ["parent[i]", (i: number) => st.p[i]],
              ["rank[i]", (i: number) => st.r[i]],
            ].map(([label, get]) => (
              <tr key={label as string} className="border-b last:border-0">
                <th className="w-20 py-1 pr-2 text-left font-medium text-ink-3">{label as string}</th>
                {Array.from({ length: N }, (_, i) => (
                  <td
                    key={i}
                    className={cn(
                      "py-1 text-center",
                      label === "parent[i]" && st.p[i] === i && "text-oxblood font-semibold",
                      label === "i" && "text-ink-3",
                    )}
                  >
                    {(get as (i: number) => number)(i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ol className="space-y-1 rounded-sm border-l-2 border-oxblood bg-paper-3/50 px-3 py-2 font-mono text-[0.75rem] leading-relaxed text-ink-2" aria-live="polite">
        {log.map((m, i) => (
          <li key={i} className={i === 0 ? "text-ink" : "opacity-70"}>
            {m}
          </li>
        ))}
      </ol>
    </div>
  );
}
