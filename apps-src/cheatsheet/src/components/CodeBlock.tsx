import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { tokenize, type Lang } from "@/lib/highlight";
import { cn } from "@/lib/utils";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CodeBlock({
  code,
  lang,
  label,
  className,
  toolbar,
}: {
  code: string;
  lang: Lang;
  label?: string;
  className?: string;
  toolbar?: React.ReactNode;
}) {
  const tokens = useMemo(() => tokenize(code, lang), [code, lang]);
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const onCopy = async () => {
    const ok = await copyText(code);
    setState(ok ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 1600);
  };

  return (
    <figure className={cn("overflow-hidden rounded-md border bg-paper-3/70", className)}>
      <figcaption className="flex items-center justify-between gap-2 border-b bg-paper-2/60 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-3">
            {label ?? (lang === "py" ? "Python 3" : "C++17")}
          </span>
          {toolbar}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-7 items-center gap-1.5 rounded-sm px-2 font-sans text-xs text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink"
          aria-label="Copy code to clipboard"
        >
          {state === "copied" ? <Check className="h-3.5 w-3.5 text-oxblood" /> : <Copy className="h-3.5 w-3.5" />}
          <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}</span>
        </button>
      </figcaption>
      <pre className="code-scroll overflow-x-auto px-4 py-3 font-mono text-[0.78rem] leading-[1.55] text-ink sm:text-[0.8rem]">
        <code>
          {tokens.map((tk, i) =>
            tk.c ? (
              <span key={i} className={`tok-${tk.c}`}>
                {tk.t}
              </span>
            ) : (
              tk.t
            ),
          )}
        </code>
      </pre>
    </figure>
  );
}
