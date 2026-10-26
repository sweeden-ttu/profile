import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { StepControls, useStepper, vizBtn } from "./controls";
import { cn } from "@/lib/utils";

type Mode = "lower" | "upper";
interface Frame {
  lo: number;
  hi: number;
  mid: number | null;
  goRight: boolean | null;
  note: string;
  done: boolean;
}

/** Half-open [lo, hi) search, exactly like the lowerBound() snippet. */
export function traceBinarySearch(a: number[], x: number, mode: Mode): Frame[] {
  const frames: Frame[] = [];
  let lo = 0, hi = a.length;
  const cmp = mode === "lower" ? "<" : "≤";
  frames.push({ lo, hi, mid: null, goRight: null, done: false, note: `Start: lo = 0, hi = n = ${a.length}. The answer is always in [lo, hi].` });
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const goRight = mode === "lower" ? a[mid] < x : a[mid] <= x;
    frames.push({
      lo, hi, mid, goRight, done: false,
      note: `mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}. a[${mid}] = ${a[mid]} ${cmp} ${x}? ${goRight ? `yes → lo = mid + 1 = ${mid + 1}` : `no → hi = mid = ${mid}`}`,
    });
    if (goRight) lo = mid + 1;
    else hi = mid;
  }
  const what = mode === "lower" ? `first index with a[i] ≥ ${x}` : `first index with a[i] > ${x}`;
  frames.push({
    lo, hi, mid: null, goRight: null, done: true,
    note: lo === a.length
      ? `lo = hi = ${lo} = n: no element qualifies (${what} does not exist).`
      : `lo = hi = ${lo}: ${what} is ${lo} (a[${lo}] = ${a[lo]}).`,
  });
  return frames;
}

function randomSorted(n: number): number[] {
  const out: number[] = [];
  let v = Math.floor(Math.random() * 4) + 1;
  for (let i = 0; i < n; i++) {
    out.push(v);
    v += Math.floor(Math.random() * 6) + (Math.random() < 0.2 ? 0 : 1);
  }
  return out;
}

const INITIAL = [2, 5, 5, 8, 11, 13, 13, 13, 17, 21, 24, 29, 30, 34, 38, 41];

export function BinarySearchViz() {
  const [arr, setArr] = useState<number[]>(INITIAL);
  const [target, setTarget] = useState(13);
  const [mode, setMode] = useState<Mode>("lower");
  const frames = useMemo(() => traceBinarySearch(arr, target, mode), [arr, target, mode]);
  const s = useStepper(frames.length, `${arr.join(",")}|${target}|${mode}`, 1100);
  const f = frames[Math.min(s.step, frames.length - 1)];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-ink-3">
          Target x
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value) || 0)}
            className="h-9 w-24 rounded-sm border bg-paper-2 px-2 font-mono text-sm text-ink"
          />
        </label>
        <div className="flex flex-col gap-1 text-xs text-ink-3">
          Predicate
          <div className="flex overflow-hidden rounded-sm border" role="group" aria-label="Search mode">
            {(["lower", "upper"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn(
                  "h-9 px-3 font-mono text-xs transition-colors",
                  mode === m ? "bg-ink text-paper" : "bg-paper-2 text-ink-2 hover:text-ink",
                )}
              >
                {m === "lower" ? "lower_bound (a[i] ≥ x)" : "upper_bound (a[i] > x)"}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className={vizBtn} onClick={() => setArr(randomSorted(16))}>
          <Shuffle className="h-4 w-4" /> New array
        </button>
      </div>

      <div className="code-scroll overflow-x-auto pb-1">
        <div className="grid min-w-[560px] gap-1" style={{ gridTemplateColumns: `repeat(${arr.length}, minmax(0, 1fr))` }}>
          {arr.map((v, i) => {
            const inRange = i >= f.lo && i < f.hi;
            const isMid = f.mid === i;
            const isAns = f.done && i === f.lo;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-11 w-full items-center justify-center rounded-sm border font-mono text-sm transition-all duration-300",
                    inRange ? "bg-paper-2 text-ink" : "bg-paper-3/40 text-ink-3/60 border-dashed",
                    isMid && "border-[rgb(var(--viz-a))] bg-[rgb(var(--viz-a)/0.15)] text-ink ring-2 ring-[rgb(var(--viz-a)/0.5)]",
                    isAns && "border-oxblood bg-oxblood text-paper ring-2 ring-oxblood/40",
                  )}
                >
                  {v}
                </div>
                <span className="font-mono text-[0.65rem] text-ink-3">{i}</span>
                <span className="h-4 font-mono text-[0.65rem] font-semibold">
                  {i === f.lo && <span className="text-oxblood">lo</span>}
                  {isMid && <span className="ml-0.5 text-[rgb(var(--viz-a))]">mid</span>}
                </span>
              </div>
            );
          })}
          {/* hi can equal n: show a ghost cell for the past-the-end position */}
        </div>
        <div className="mt-1 min-w-[560px] font-mono text-[0.7rem] text-ink-3">
          hi = <span className="font-semibold text-ink">{f.hi}</span>
          {f.hi === arr.length ? " (= n, past the end)" : ` (a[hi] = ${arr[f.hi]})`} · window [lo, hi) = [{f.lo}, {f.hi}) holds{" "}
          {f.hi - f.lo} element{f.hi - f.lo === 1 ? "" : "s"}
        </div>
      </div>

      <p className="min-h-[3rem] rounded-sm border-l-2 border-oxblood bg-paper-3/50 px-3 py-2 font-mono text-[0.78rem] leading-relaxed text-ink-2" aria-live="polite">
        {f.note}
      </p>
      <StepControls s={s} length={frames.length} />
    </div>
  );
}
