// Tiny dependency-free syntax highlighter for the two languages we ship.
export type Lang = "cpp" | "py";
export interface Token { t: string; c?: string }

const PY_KW = new Set(
  "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case".split(" "),
);
const PY_TYPES = new Set(
  "int str float bool list dict set tuple bytes bytearray object type len range enumerate zip map sorted reversed min max sum print iter next isinstance super Exception ValueError TypeError RuntimeError PermissionError TimeoutError self cls abs any all divmod pow round repr".split(" "),
);
const CPP_KW = new Set(
  "auto break case catch class const constexpr continue default delete do else enum explicit false for friend if inline namespace new nullptr operator private protected public return sizeof static static_cast struct switch template this throw true try typedef typename using virtual while".split(" "),
);
const CPP_TYPES = new Set(
  "bool char double float int long short signed unsigned void size_t int64_t uint64_t __int128 __uint128_t ll vector string pair array deque queue priority_queue stack map set unordered_map unordered_set bitset function greater less mt19937 mt19937_64 random_device P Mat Edge E Node".split(" "),
);

const rules: Record<Lang, [RegExp, string | null][]> = {
  py: [
    [/#[^\n]*/y, "com"],
    [/[rbfuRBFU]{0,2}("""[\s\S]*?"""|'''[\s\S]*?''')/y, "str"],
    [/[rbfuRBFU]{0,2}("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y, "str"],
    [/@[A-Za-z_][\w.]*/y, "dec"],
    [/\b(?:0[xob][\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?)\b/y, "num"],
    [/[A-Za-z_]\w*/y, "id"],
    [/\s+/y, null],
    [/./y, null],
  ],
  cpp: [
    [/\/\/[^\n]*/y, "com"],
    [/\/\*[\s\S]*?\*\//y, "com"],
    [/^[ \t]*#[^\n]*/my, "pre"],
    [/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y, "str"],
    [/\b(?:0[xb][\da-fA-F']+|\d[\d']*(?:\.\d+)?(?:e[+-]?\d+)?)(?:[uUlL]{0,3})\b/y, "num"],
    [/[A-Za-z_]\w*/y, "id"],
    [/\s+/y, null],
    [/./y, null],
  ],
};

export function tokenize(code: string, lang: Lang): Token[] {
  const out: Token[] = [];
  const rs = rules[lang];
  const kw = lang === "py" ? PY_KW : CPP_KW;
  const ty = lang === "py" ? PY_TYPES : CPP_TYPES;
  let i = 0;
  const push = (t: string, c?: string) => {
    const last = out[out.length - 1];
    if (last && last.c === c) last.t += t;
    else out.push({ t, c });
  };
  while (i < code.length) {
    let matched = false;
    for (const [re, cls] of rs) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (!m || m.index !== i || m[0].length === 0) continue;
      const text = m[0];
      if (cls === "id") {
        let c: string | undefined;
        if (kw.has(text)) c = "kw";
        else if (ty.has(text)) c = "type";
        else if (/^\s*\(/.test(code.slice(i + text.length, i + text.length + 8))) c = "fn";
        push(text, c);
      } else {
        push(text, cls ?? undefined);
      }
      i += text.length;
      matched = true;
      break;
    }
    if (!matched) {
      push(code[i]);
      i++;
    }
  }
  return out;
}
