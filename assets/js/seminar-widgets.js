/* Interactive figures for the CS graduate seminar write-ups.
 * Each widget initialises only if its root element is on the page.
 * Colours come from the CSS custom properties defined in _sass/_widgets.scss.
 */
(function () {
  "use strict";
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const el = (tag, attrs = {}, html = "") => { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; return e; };
  function rng(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }

  /* ------------------------------------------------------------------ 1. LLM router playground */
  function routerWidget(root) {
    // A synthetic model pool: cost is proportional to parameter count; skill is the difficulty a model handles half the time.
    const pool = [
      { name: "0.5B", cost: 0.5, skill: 0.30 }, { name: "7B math", cost: 7, skill: 0.62 },
      { name: "8B", cost: 8, skill: 0.60 }, { name: "70B", cost: 70, skill: 0.86 },
    ];
    const N = 600, r = rng(7);
    const sig = (z) => 1 / (1 + Math.exp(-z));
    const queries = Array.from({ length: N }, () => {
      const d = r(), math = r() < 0.35;
      return { d, correct: pool.map((m, i) => r() < sig(14 * (m.skill + (i === 1 && math ? 0.18 : 0) - d))), math, noisy: Math.min(1, Math.max(0, d + (r() - 0.5) * 0.25)) };
    });
    const maxCost = pool[3].cost;
    // router: estimate p(correct) from a noisy difficulty estimate; pick the cheapest model whose estimate clears tau
    const routeWith = (tau, aware) => {
      let acc = 0, cost = 0;
      for (const q of queries) {
        let pick = pool.length - 1;
        for (let i = 0; i < pool.length; i++) {
          const est = sig(14 * (pool[i].skill + (aware && i === 1 && q.math ? 0.18 : 0) - q.noisy));
          if (est >= tau) { pick = i; break; }
        }
        acc += q.correct[pick]; cost += pool[pick].cost;
      }
      return { acc: acc / N, cost: cost / N / maxCost };
    };
    const oracle = (() => { let acc = 0, cost = 0; for (const q of queries) { const i = q.correct.findIndex(Boolean); if (i >= 0) { acc++; cost += pool[i].cost; } else cost += pool[0].cost; } return { acc: acc / N, cost: cost / N / maxCost }; })();
    const curve = (aware) => { const pts = []; for (let k = 0; k <= 60; k++) pts.push(routeWith(k / 60, aware)); pts.sort((a, b) => a.cost - b.cost); return pts; };
    const curves = { aware: curve(true), blind: curve(false) };
    const auc = (pts) => { let a = 0; for (let i = 1; i < pts.length; i++) a += (pts[i].cost - pts[i - 1].cost) * (pts[i].acc + pts[i - 1].acc) / 2; return a; };
    const svg = root.querySelector("svg"), slider = root.querySelector("input"), out = root.querySelector(".rw-out");
    const W = 640, H = 300, P = { l: 52, r: 16, t: 14, b: 40 };
    const X = (c) => P.l + c * (W - P.l - P.r), Y = (a) => H - P.b - a * (H - P.t - P.b);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${X(p.cost).toFixed(1)},${Y(p.acc).toFixed(1)}`).join("");
    const draw = () => {
      const tau = +slider.value / 100, cur = routeWith(tau, true);
      let g = "";
      for (let v = 0; v <= 1.001; v += 0.25) g += `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule-2)"/><text x="${P.l - 6}" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="var(--ink-3)">${(v * 100).toFixed(0)}%</text><text x="${X(v)}" y="${H - P.b + 16}" font-size="10" text-anchor="middle" fill="var(--ink-3)">${v.toFixed(2)}</text>`;
      g += `<text x="${(P.l + W - P.r) / 2}" y="${H - 6}" font-size="11" text-anchor="middle" fill="var(--ink-2)">average cost per query (1 = always call the 70B model)</text>`;
      g += `<path d="${path(curves.blind)}" fill="none" stroke="var(--ink-3)" stroke-width="2" stroke-dasharray="5 4"/>`;
      g += `<path d="${path(curves.aware)}" fill="none" stroke="var(--accent)" stroke-width="2"/>`;
      pool.forEach((m, i) => { const a = queries.reduce((s, q) => s + q.correct[i], 0) / N; g += `<circle cx="${X(m.cost / maxCost)}" cy="${Y(a)}" r="4" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.5"/><text x="${X(m.cost / maxCost) + (i === pool.length - 1 ? -8 : 7)}" y="${Y(a) + (i === pool.length - 1 ? 16 : 4)}" font-size="10" text-anchor="${i === pool.length - 1 ? "end" : "start"}" fill="var(--ink-2)">${m.name} alone</text>`; });
      g += `<circle cx="${X(oracle.cost)}" cy="${Y(oracle.acc)}" r="5" fill="var(--ink)"/><text x="${X(oracle.cost) + 8}" y="${Y(oracle.acc) - 6}" font-size="10" fill="var(--ink)">oracle</text>`;
      g += `<circle cx="${X(cur.cost)}" cy="${Y(cur.acc)}" r="7" fill="var(--accent)" stroke="var(--paper)" stroke-width="2"/>`;
      svg.innerHTML = g;
      out.textContent = `threshold τ = ${tau.toFixed(2)} → accuracy ${(cur.acc * 100).toFixed(1)}% at cost ${cur.cost.toFixed(3)} · area under the curve: specialist-aware ${auc(curves.aware).toFixed(3)} vs specialist-blind ${auc(curves.blind).toFixed(3)} (oracle accuracy ${(oracle.acc * 100).toFixed(1)}% at cost ${oracle.cost.toFixed(3)})`;
    };
    slider.addEventListener("input", draw); draw();
  }

  /* ------------------------------------------------------------------ 2. Realm event-graph schedule */
  function realmWidget(root) {
    const svg = root.querySelector("svg"), out = root.querySelector(".rm-out");
    const ctl = { mode: "events", path: "nvlink", g0: 6, g1: 4 };
    const W = 640, H = 210, L = 110, R = 14, T = 16, rowH = 38;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const lanes = ["host thread", "GPU 0", "GPU 1", "DMA engine"];
    function schedule() {
      const copy = ctl.path === "nvlink" ? 2 : 5, fin = 2, launch = 0.4;
      const ev = [];
      if (ctl.mode === "events") {
        // the host submits all five operations up front; each starts when its precondition event fires
        ev.push({ lane: 0, s: 0, e: launch * 5, label: "submit 5 ops", kind: "host" });
        const g0s = launch, g1s = 2 * launch;
        ev.push({ lane: 1, s: g0s, e: g0s + ctl.g0, label: "GEMM 0 → P₀", kind: "gemm" });
        ev.push({ lane: 2, s: g1s, e: g1s + ctl.g1, label: "GEMM 1 → P₁", kind: "gemm" });
        const cs = g1s + ctl.g1; ev.push({ lane: 3, s: cs, e: cs + copy, label: ctl.path === "nvlink" ? "copy P₁ (peer)" : "copy P₁ (via host)", kind: "copy" });
        const fs = Math.max(g0s + ctl.g0, cs + copy); ev.push({ lane: 1, s: fs, e: fs + fin, label: "sum + bias + ReLU", kind: "fin" });
        return { ev, end: fs + fin, merge: fs };
      }
      // bulk-synchronous: barrier after the GEMMs and again after the copy; the host blocks at each barrier
      ev.push({ lane: 0, s: 0, e: launch * 2, label: "submit GEMMs", kind: "host" });
      const b1 = 2 * launch + Math.max(ctl.g0, ctl.g1);
      ev.push({ lane: 1, s: launch, e: launch + ctl.g0, label: "GEMM 0 → P₀", kind: "gemm" });
      ev.push({ lane: 2, s: 2 * launch, e: 2 * launch + ctl.g1, label: "GEMM 1 → P₁", kind: "gemm" });
      ev.push({ lane: 0, s: launch * 2, e: b1, label: "blocked (barrier)", kind: "wait" });
      const cs = b1 + launch; ev.push({ lane: 3, s: cs, e: cs + copy, label: ctl.path === "nvlink" ? "copy P₁ (peer)" : "copy P₁ (via host)", kind: "copy" });
      ev.push({ lane: 0, s: b1, e: cs + copy, label: "blocked", kind: "wait" });
      const fs = cs + copy + launch; ev.push({ lane: 1, s: fs, e: fs + fin, label: "sum + bias + ReLU", kind: "fin" });
      return { ev, end: fs + fin, barriers: [b1, cs + copy] };
    }
    const color = { host: "var(--ink-3)", gemm: "var(--code-fn)", copy: "var(--warn)", fin: "var(--accent)", wait: "var(--rule)" };
    let t0 = null, raf = null;
    function draw(now) {
      const sc = schedule(), span = 18, X = (t) => L + (t / span) * (W - L - R);
      const t = t0 === null ? sc.end : Math.min(sc.end, ((now - t0) / 1000) * 4);
      let g = "";
      lanes.forEach((n, i) => { g += `<text x="${L - 8}" y="${T + i * rowH + 22}" font-size="11" text-anchor="end" fill="var(--ink-2)">${n}</text><line x1="${L}" x2="${W - R}" y1="${T + i * rowH + 34}" y2="${T + i * rowH + 34}" stroke="var(--rule-2)"/>`; });
      for (let k = 0; k <= span; k += 2) g += `<text x="${X(k)}" y="${H - 4}" font-size="9" text-anchor="middle" fill="var(--ink-3)">${k}</text>`;
      for (const e of sc.ev) {
        const s = Math.min(e.s, t), en = Math.min(e.e, t); if (en <= s && t < e.s) continue;
        const y = T + e.lane * rowH + 6, w = Math.max(0, X(en) - X(s));
        g += `<rect x="${X(s)}" y="${y}" width="${w}" height="24" rx="2" fill="${color[e.kind]}" opacity="${e.kind === "wait" ? 0.6 : 0.9}"/>`;
        if (w > 60) g += `<text x="${X(s) + 6}" y="${y + 16}" font-size="10" fill="${e.kind === "wait" ? "var(--ink-2)" : "var(--paper)"}">${e.label}</text>`;
      }
      (sc.barriers || []).forEach((b) => { if (t >= b) g += `<line x1="${X(b)}" x2="${X(b)}" y1="${T}" y2="${T + 4 * rowH}" stroke="var(--ink)" stroke-dasharray="3 3"/>`; });
      if (sc.merge !== undefined && t >= sc.merge) g += `<circle cx="${X(sc.merge)}" cy="${T + rowH + 18}" r="4" fill="var(--warn)"/>`;
      g += `<line x1="${X(t)}" x2="${X(t)}" y1="${T - 6}" y2="${T + 4 * rowH}" stroke="var(--accent)" stroke-width="1.5"/>`;
      svg.innerHTML = g;
      const other = (() => { const m = ctl.mode; ctl.mode = m === "events" ? "bsp" : "events"; const e = schedule().end; ctl.mode = m; return e; })();
      out.textContent = `makespan ${sc.end.toFixed(1)} time units (${ctl.mode === "events" ? "explicit events" : "global barriers"}); the other model would take ${other.toFixed(1)}. ` +
        (ctl.mode === "events" ? "The copy of P₁ starts the moment GEMM 1's completion event fires, so it hides behind GEMM 0 whenever GEMM 0 is the longer one." : "Nothing moves until the slowest GEMM finishes, and the host thread sits idle at each barrier.");
      if (t < sc.end) raf = requestAnimationFrame(draw);
    }
    const replay = () => { cancelAnimationFrame(raf); t0 = performance.now(); raf = requestAnimationFrame(draw); };
    root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { ctl.mode = b.dataset.mode; root.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x === b)); replay(); }));
    root.querySelectorAll("[data-path]").forEach((b) => b.addEventListener("click", () => { ctl.path = b.dataset.path; root.querySelectorAll("[data-path]").forEach((x) => x.setAttribute("aria-pressed", x === b)); replay(); }));
    root.querySelector(".rm-g0").addEventListener("input", (e) => { ctl.g0 = +e.target.value; replay(); });
    root.querySelector(".rm-g1").addEventListener("input", (e) => { ctl.g1 = +e.target.value; replay(); });
    root.querySelector(".rm-replay").addEventListener("click", replay);
    replay();
  }

  /* ------------------------------------------------------------------ 3. Impairment indicator */
  function impairmentWidget(root) {
    const M = 48, grid = root.querySelector(".ii-grid"), out = root.querySelector(".ii-out");
    // each cell: [primary-task correct?, auxiliary-task correct?]
    let cells = [];
    const presets = { NOR: [0.92, 0.95, 0.01], MCI: [0.70, 0.88, 0.0], DEM: [0.80, 0.55, 0.0] };
    function fill(name) {
      const [pPT, pAT] = presets[name], r = rng(name.charCodeAt(0) * 97 + name.length);
      cells = Array.from({ length: M }, () => [r() < pPT, r() < pAT]);
      render();
    }
    function render() {
      grid.innerHTML = "";
      cells.forEach((c, i) => {
        const b = document.createElement("button");
        const hit = !c[0] && c[1];
        b.className = "ii-cell" + (hit ? " is-hit" : "");
        b.title = `instance ${i + 1}: activity ${c[0] ? "correct" : "missed"}, health status ${c[1] ? "correct" : "wrong"}`;
        b.setAttribute("aria-label", b.title);
        b.textContent = (c[0] ? "✓" : "✗") + (c[1] ? "✓" : "✗");
        b.addEventListener("click", () => { const s = (c[0] ? 2 : 0) + (c[1] ? 1 : 0); const n = (s + 1) % 4; cells[i] = [n >= 2, n % 2 === 1]; render(); });
        grid.appendChild(b);
      });
      const hits = cells.filter((c) => !c[0] && c[1]).length, miss = cells.filter((c) => !c[0]).length;
      out.innerHTML = `ζ<sub>c</sub> = 100 · ${hits} / ${M} = <strong>${(100 * hits / M).toFixed(1)}%</strong> &nbsp;·&nbsp; plain activity error rate = ${(100 * miss / M).toFixed(1)}%. Only misses where the health label is right count, so a model that is simply confused about everything does not inflate ζ.`;
    }
    root.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => { root.querySelectorAll("[data-preset]").forEach((x) => x.setAttribute("aria-pressed", x === b)); fill(b.dataset.preset); }));
    fill("MCI");
  }

  const init = () => {
    const a = document.getElementById("router-playground"); if (a) routerWidget(a);
    const b = document.getElementById("realm-schedule"); if (b) realmWidget(b);
    const c = document.getElementById("impairment-indicator"); if (c) impairmentWidget(c);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
