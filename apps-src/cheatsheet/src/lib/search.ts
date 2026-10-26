// Small fuzzy search: every query term must match some field (AND).
// Scores: token prefix > substring > typo (Damerau-Levenshtein <= 1-2) > subsequence.

export interface Doc {
  id: string;
  fields: { text: string; w: number; fuzzy?: boolean; substringOnly?: boolean }[];
}

interface Prepared {
  id: string;
  fields: { text: string; tokens: string[]; w: number; fuzzy: boolean; substringOnly: boolean }[];
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[–—-]/g, " ");

const tokenizeText = (s: string) => s.split(/[^a-z0-9+#]+/).filter(Boolean);

export function prepare(docs: Doc[]): Prepared[] {
  return docs.map((d) => ({
    id: d.id,
    fields: d.fields.map((f) => {
      const text = norm(f.text);
      return {
        text,
        tokens: f.substringOnly ? [] : tokenizeText(text),
        w: f.w,
        fuzzy: !!f.fuzzy,
        substringOnly: !!f.substringOnly,
      };
    }),
  }));
}

/** Optimal-string-alignment distance with early exit above `max`. */
function osa(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = a.length, m = b.length;
  let prev2 = new Array(m + 1).fill(0);
  let prev = Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= n; i++) {
    const cur = new Array(m + 1).fill(0);
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[m];
}

/** Subsequence match; returns compactness in (0, 1] or 0 if no match. */
function subseq(q: string, text: string): number {
  let qi = 0, first = -1, last = -1;
  for (let i = 0; i < text.length && qi < q.length; i++) {
    if (text[i] === q[qi]) {
      if (first < 0) first = i;
      last = i;
      qi++;
    }
  }
  if (qi < q.length) return 0;
  return q.length / (last - first + 1);
}

function termScore(term: string, p: Prepared, allowFuzzy: boolean): number {
  let best = 0;
  for (const f of p.fields) {
    let s = 0;
    if (f.substringOnly) {
      if (term.length >= 3 && f.text.includes(term)) s = f.w;
    } else if (f.tokens.some((t) => t.startsWith(term))) s = f.w * 3;
    else if (f.text.includes(term)) s = f.w * 2;
    else if (allowFuzzy && term.length >= 4) {
      const max = term.length >= 7 ? 2 : 1;
      if (
        f.tokens.some(
          (t) =>
            osa(term, t, max) <= max ||
            (t.length > term.length && osa(term, t.slice(0, term.length), max) <= max),
        )
      )
        s = f.w * 1.2;
      else if (f.fuzzy) {
        const c = subseq(term, f.text);
        if (c >= 0.5) s = f.w * c;
      }
    }
    if (s > best) best = s;
  }
  return best;
}

export function search(prepared: Prepared[], query: string): Map<string, number> {
  const q = norm(query).trim();
  const out = new Map<string, number>();
  if (!q) return out;
  const terms = tokenizeText(q);
  if (!terms.length) return out;
  // Typo tolerance only kicks in for terms that match nothing exactly anywhere,
  // so "tree" doesn't drag in "free"/"trie" while "dijsktra" still finds Dijkstra.
  const fuzzyOk = terms.map((t) => !prepared.some((p) => termScore(t, p, false) > 0));
  for (const p of prepared) {
    let total = 0;
    let ok = true;
    for (let k = 0; k < terms.length; k++) {
      const s = termScore(terms[k], p, fuzzyOk[k]);
      if (s <= 0) { ok = false; break; }
      total += s;
    }
    if (!ok) continue;
    // phrase bonus: whole query appears in the name
    if (p.fields[0] && p.fields[0].text.includes(q)) total += 25;
    out.set(p.id, total);
  }
  return out;
}
