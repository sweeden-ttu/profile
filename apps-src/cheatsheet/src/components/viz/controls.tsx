import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

/** Step through a precomputed trace with prev/next/play. */
export function useStepper(length: number, resetKey: unknown, intervalMs = 1000) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) return;
    if (step >= length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => Math.min(s + 1, length - 1)), intervalMs);
    return () => window.clearTimeout(t);
  }, [playing, step, length, intervalMs]);

  return {
    step,
    playing,
    setStep,
    prev: () => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); },
    next: () => { setPlaying(false); setStep((s) => Math.min(length - 1, s + 1)); },
    reset: () => { setPlaying(false); setStep(0); },
    toggle: () => {
      if (step >= length - 1) { setStep(0); setPlaying(true); }
      else setPlaying((p) => !p);
    },
  };
}

const btn =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-sm border bg-paper-2 px-2.5 text-sm text-ink-2 transition-colors hover:border-ink-3/60 hover:text-ink disabled:opacity-40 disabled:hover:border-rule";

export function StepControls({
  s,
  length,
}: {
  s: ReturnType<typeof useStepper>;
  length: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={btn} onClick={s.reset} aria-label="Reset to first step">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button type="button" className={btn} onClick={s.prev} disabled={s.step === 0} aria-label="Previous step">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button type="button" className={btn + " min-w-[5.5rem]"} onClick={s.toggle} aria-label={s.playing ? "Pause" : "Play"}>
        {s.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span>{s.playing ? "Pause" : "Play"}</span>
      </button>
      <button type="button" className={btn} onClick={s.next} disabled={s.step >= length - 1} aria-label="Next step">
        <ChevronRight className="h-4 w-4" />
      </button>
      <span className="ml-1 font-mono text-xs text-ink-3">
        step {s.step + 1} / {length}
      </span>
    </div>
  );
}

export const vizBtn = btn;
