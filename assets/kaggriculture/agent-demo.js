/* Kaggriculture MuZero agent demo.
 *
 * Replays two recorded games (MuZero macrocontroller vs the expert playbook, seat-swapped)
 * and re-runs the MuZero planner in the browser with the real trained weights.
 * The search below is a line-for-line port of run_mcts() in postmortem/dataset/muzero.py:
 * pUCT with c1 = 1.25, c2 = 19652, tree-wide min-max Q normalisation, discount 1, no root noise.
 */
(function () {
  "use strict";
  const root = document.getElementById("kagg-demo");
  if (!root) return;
  const BASE = root.dataset.base || "/assets/kaggriculture/";
  const $ = (sel) => root.querySelector(sel);
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";

  // ---------------------------------------------------------------- networks
  const A = 10, LATENT = 64;
  function linear(W, b, x, out, inDim) {
    const n = b.length;
    for (let i = 0; i < n; i++) {
      let s = b[i]; const row = i * inDim;
      for (let j = 0; j < inDim; j++) s += W[row + j] * x[j];
      out[i] = s;
    }
    return out;
  }
  const relu = (v) => { for (let i = 0; i < v.length; i++) if (v[i] < 0) v[i] = 0; return v; };
  function scale(s) {
    let mn = Infinity, mx = -Infinity;
    for (const v of s) { if (v < mn) mn = v; if (v > mx) mx = v; }
    const d = mx - mn + 1e-5;
    for (let i = 0; i < s.length; i++) s[i] = (s[i] - mn) / d;
    return s;
  }
  function makeNet(w) {
    const P = (n) => w[n];
    return {
      represent(o) {
        const h = relu(linear(P("h1.weight"), P("h1.bias"), o, new Float64Array(128), 64));
        return scale(linear(P("h2.weight"), P("h2.bias"), h, new Float64Array(64), 128));
      },
      dynamics(s, a) {
        const x = new Float64Array(LATENT + A); x.set(s); x[LATENT + a] = 1;
        const h = relu(linear(P("g1.weight"), P("g1.bias"), x, new Float64Array(128), LATENT + A));
        const s2 = scale(linear(P("g2.weight"), P("g2.bias"), h, new Float64Array(64), 128));
        const r = linear(P("gr.weight"), P("gr.bias"), h, new Float64Array(1), 128)[0];
        return [s2, r];
      },
      predict(s) {
        const h = relu(linear(P("f1.weight"), P("f1.bias"), s, new Float64Array(128), 64));
        return [linear(P("fp.weight"), P("fp.bias"), h, new Float64Array(A), 128),
                linear(P("fv.weight"), P("fv.bias"), h, new Float64Array(1), 128)[0]];
      },
    };
  }
  // torch.nn.Linear default init: U(-1/sqrt(fan_in), 1/sqrt(fan_in)) for weights and biases
  function randomWeights(manifest, seed) {
    let t = seed >>> 0;
    const rnd = () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
    const out = {};
    const fanIn = {};
    for (const m of manifest) if (m.name.endsWith(".weight")) fanIn[m.name.split(".")[0]] = m.shape[1];
    for (const m of manifest) {
      const n = m.shape.reduce((a, b) => a * b, 1), k = 1 / Math.sqrt(fanIn[m.name.split(".")[0]]);
      const arr = new Float32Array(n);
      for (let i = 0; i < n; i++) arr[i] = (rnd() * 2 - 1) * k;
      out[m.name] = arr;
    }
    return out;
  }

  // ---------------------------------------------------------------- MCTS (port of run_mcts)
  function softmax(x) {
    let m = -Infinity; for (const v of x) if (v > m) m = v;
    const e = x.map((v) => Math.exp(v - m)); const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  }
  function Node(prior) { return { prior, s: null, r: 0, children: null, n: 0, w: 0 }; }
  const value = (nd) => (nd.n ? nd.w / nd.n : 0);
  function* mctsSteps(net, obs, legal, sims) {
    const c1 = 1.25, c2 = 19652;
    const rootN = Node(1);
    rootN.s = net.represent(Float64Array.from(obs));
    const [logits] = net.predict(rootN.s);
    const pri = softmax(Array.from(logits, (v, i) => (legal[i] ? v : -1e9)));
    rootN.children = new Map();
    for (let a = 0; a < A; a++) if (legal[a]) rootN.children.set(a, Node(pri[a]));
    let lo = Infinity, hi = -Infinity;
    const norm = (v) => (hi > lo ? (v - lo) / (hi - lo) : v);
    for (let k = 0; k < sims; k++) {
      let node = rootN; const path = [rootN], actions = [];
      while (node.children && node.children.size) {
        const sq = Math.sqrt(node.n), cb = (c1 + Math.log((node.n + c2 + 1) / c2)) * sq;
        let best = -1e18, bestA = null;
        for (const [a, ch] of node.children) {
          const q = ch.n ? norm(ch.r + value(ch)) : 0;
          const u = q + (ch.prior * cb) / (1 + ch.n);
          if (u > best) { best = u; bestA = a; }
        }
        node = node.children.get(bestA); path.push(node); actions.push(bestA);
      }
      const parent = path[path.length - 2];
      [node.s, node.r] = net.dynamics(parent.s, actions[actions.length - 1]);
      let [lg, v] = net.predict(node.s);
      const p = softmax(Array.from(lg));
      node.children = new Map(); for (let a = 0; a < A; a++) node.children.set(a, Node(p[a]));
      for (let i = path.length - 1; i >= 0; i--) {
        const nd = path[i]; nd.w += v; nd.n += 1;
        const q = nd.r + value(nd); if (q < lo) lo = q; if (q > hi) hi = q;
        v = nd.r + v;
      }
      const visits = new Array(A).fill(0); for (const [a, ch] of rootN.children) visits[a] = ch.n;
      yield { sim: k + 1, visits, path: actions.slice(), rootValue: value(rootN), prior: pri };
    }
  }

  // ---------------------------------------------------------------- data
  let G, manifest, trained, randomW = null;
  const state = { game: 0, frame: 0, playing: false, speed: 6, weights: "trained", sims: 32, timer: null, search: null };

  Promise.all([
    fetch(BASE + "games.json").then((r) => r.json()),
    fetch(BASE + "muzero_weights.json").then((r) => r.json()),
    fetch(BASE + "muzero_weights.bin").then((r) => r.arrayBuffer()),
  ]).then(([games, man, buf]) => {
    G = games; manifest = man;
    const f32 = new Float32Array(buf); trained = {};
    for (const m of man) trained[m.name] = f32.subarray(m.offset, m.offset + m.shape.reduce((a, b) => a * b, 1));
    $(".kd-loading").hidden = true; $(".kd-body").hidden = false;
    buildControls(); render(); runSearch(false);
  }).catch((e) => { $(".kd-loading").textContent = "Could not load the replay data (" + e.message + ")."; });

  // ---------------------------------------------------------------- rendering
  const TILE = { "#": "--paper-sink", ".": "--paper", x: "--ink-4", W: "--warn", C: "--accent", T: "--accent", S: "--accent", M: "--success", K: "--code-fn", H: "--ink-3", G: "--code-number", p: "--rule", q: "--rule" };
  const CROPNAME = { W: "wheat", C: "carrot", T: "tomato", S: "strawberry", M: "melon", K: "cow", H: "sheep", G: "goose", x: "weed", p: "pasture", q: "coop" };
  const GLYPH = { W: "w", C: "c", T: "t", S: "s", M: "m", K: "♉", H: "♈", G: "g" };

  function drawFarm(canvas, farm, label) {
    const ctx = canvas.getContext("2d"), dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth || 300; canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = size / 10;
    ctx.fillStyle = css("--paper"); ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const ch = farm.t[y * 10 + x], up = ch.toUpperCase(), thirsty = ch !== up && ch !== "x" && ch !== "p" && ch !== "q";
      ctx.fillStyle = css(TILE[up] || TILE[ch] || "--rule");
      ctx.globalAlpha = ch === "#" ? 1 : (up === ch || ch === "x" || ch === "p" || ch === "q" ? 0.85 : 0.45);
      ctx.fillRect(x * c + 1, y * c + 1, c - 2, c - 2);
      ctx.globalAlpha = 1;
      if (GLYPH[up]) {
        ctx.fillStyle = css("--paper"); ctx.font = `600 ${Math.round(c * 0.45)}px ${css("--mono")}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(GLYPH[up], x * c + c / 2, y * c + c / 2 + 1);
      }
      if (thirsty) { ctx.strokeStyle = css("--accent"); ctx.lineWidth = 1.5; ctx.strokeRect(x * c + 2.5, y * c + 2.5, c - 5, c - 5); }
    }
    // quadrant rule + shed
    ctx.strokeStyle = css("--ink-3"); ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(5 * c, 0); ctx.lineTo(5 * c, size); ctx.moveTo(0, 5 * c); ctx.lineTo(size, 5 * c); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = css("--ink"); ctx.lineWidth = 2; ctx.strokeRect(4 * c, 4 * c, 2 * c, 2 * c);
    // units
    farm.u.forEach(([x, y], i) => {
      ctx.beginPath(); ctx.arc(x * c + c / 2 + (i % 3 - 1) * 3, y * c + c / 2 + (Math.floor(i / 3) - 1) * 3, i === 0 ? c * 0.22 : c * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? css("--ink") : css("--paper"); ctx.fill();
      ctx.strokeStyle = css("--ink"); ctx.lineWidth = 1.5; ctx.stroke();
    });
    canvas.setAttribute("aria-label", `${label} farm: ${farm.u.length} units, $${farm.m.toLocaleString()} cash`);
  }

  function drawCash(svg, g, frame) {
    const W = 640, H = 170, P = { l: 52, r: 12, t: 12, b: 24 };
    const n = g.frames.length, maxM = Math.max(...g.frames.map((f) => Math.max(f.f[0].m, f.f[1].m)), 1);
    const X = (i) => P.l + (i / (n - 1)) * (W - P.l - P.r), Y = (m) => H - P.b - (m / maxM) * (H - P.t - P.b);
    const line = (k) => g.frames.map((f, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(f.f[k].m).toFixed(1)}`).join("");
    let ticks = ""; for (let v = 0; v <= maxM; v += 20000) ticks += `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule-2)"/><text x="${P.l - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="10" fill="var(--ink-3)">$${v / 1000}k</text>`;
    let days = ""; for (let d = 0; d <= 30; d += 5) days += `<text x="${X(Math.min(n - 1, d * 24))}" y="${H - 6}" text-anchor="middle" font-size="10" fill="var(--ink-3)">day ${d}</text>`;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = ticks + days +
      `<path d="${line(1)}" fill="none" stroke="var(--ink-3)" stroke-width="1.5" stroke-dasharray="4 3"/>` +
      `<path d="${line(0)}" fill="none" stroke="var(--accent)" stroke-width="2"/>` +
      `<line x1="${X(frame)}" x2="${X(frame)}" y1="${P.t}" y2="${H - P.b}" stroke="var(--ink)" stroke-width="1"/>` +
      `<text x="${W - P.r}" y="${Y(g.frames[n - 1].f[0].m) - 6}" text-anchor="end" font-size="11" fill="var(--accent)" font-weight="600">MuZero</text>` +
      `<text x="${W - P.r}" y="${Y(g.frames[n - 1].f[1].m) + 14}" text-anchor="end" font-size="11" fill="var(--ink-3)">Playbook</text>`;
  }

  function drawVisits(svg, visits, legal, recorded, chosen) {
    const W = 640, rowH = 22, H = A * rowH + 8, L = 150, R = 60;
    const tot = Math.max(1, visits.reduce((a, b) => a + b, 0));
    let out = "";
    G.plans.forEach((p, a) => {
      const y = 4 + a * rowH, frac = visits[a] / tot, w = frac * (W - L - R);
      const lbl = p.replace("PLANT_", "plant ").replace("ADD_", "add ").replace("BUY_LAND", "buy land").replace("FALLOW", "fallow").toLowerCase();
      out += `<text x="${L - 8}" y="${y + 15}" text-anchor="end" font-size="12" fill="${legal[a] ? "var(--ink)" : "var(--ink-4)"}"${a === chosen ? ' font-weight="700"' : ""}>${lbl}${legal[a] ? "" : " ✕"}</text>`;
      out += `<rect x="${L}" y="${y + 3}" width="${W - L - R}" height="${rowH - 8}" fill="var(--paper-sink)"/>`;
      out += `<rect x="${L}" y="${y + 3}" width="${w.toFixed(1)}" height="${rowH - 8}" fill="${a === chosen ? "var(--accent)" : "var(--ink-3)"}"/>`;
      if (recorded) out += `<line x1="${L + recorded[a] * (W - L - R)}" x2="${L + recorded[a] * (W - L - R)}" y1="${y + 1}" y2="${y + rowH - 3}" stroke="var(--ink)" stroke-width="2"/>`;
      out += `<text x="${W - R + 6}" y="${y + 15}" font-size="11" fill="var(--ink-3)">${visits[a]}</text>`;
    });
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = out;
  }

  function render() {
    const g = G.games[state.game], fr = g.frames[state.frame];
    drawFarm($(".kd-farm-a"), fr.f[0], "MuZero"); drawFarm($(".kd-farm-b"), fr.f[1], "Playbook");
    $(".kd-cash-a").textContent = "$" + fr.f[0].m.toLocaleString();
    $(".kd-cash-b").textContent = "$" + fr.f[1].m.toLocaleString();
    $(".kd-clock").textContent = `day ${fr.d + 1} / 30 · hour ${fr.h} · turn ${state.frame + 1} / ${g.frames.length}`;
    $(".kd-scrub").value = state.frame;
    const day = Math.min(29, fr.d), t = g.traj[day];
    $(".kd-plan").textContent = G.plans[t.plan].replace("_", " ").toLowerCase();
    $(".kd-day").textContent = day + 1;
    drawCash($(".kd-cash"), g, state.frame);
    const prices = G.products.map((p, i) => `${p.toLowerCase()} $${fr.p[i]}`).join(" · ");
    $(".kd-prices").textContent = prices;
    if (state.lastDay !== day || state.lastGame !== state.game) { state.lastDay = day; state.lastGame = state.game; runSearch(state.playing); }
  }

  // ---------------------------------------------------------------- search panel
  function runSearch(instant) {
    if (state.search) cancelAnimationFrame(state.search);
    const g = G.games[state.game], day = Math.min(29, g.frames[state.frame].d), t = g.traj[day];
    const w = state.weights === "trained" ? trained : (randomW = randomW || randomWeights(manifest, 1234));
    const it = mctsSteps(makeNet(w), t.feat, t.legal, state.sims);
    let last = null;
    const recorded = state.weights === "trained" && state.sims === 32 ? t.pi : null;
    const step = () => {
      for (let k = 0; k < (instant ? 1e9 : Math.max(1, Math.ceil(state.sims / 40))); k++) {
        const r = it.next(); if (r.done) { finish(last); return; } last = r.value;
      }
      const chosen = last.visits.indexOf(Math.max(...last.visits));
      drawVisits($(".kd-visits"), last.visits, t.legal, recorded, chosen);
      $(".kd-sim").textContent = `simulation ${last.sim} / ${state.sims} · path: ${last.path.map((a) => G.plans[a].split("_").pop().toLowerCase()).join(" → ")}`;
      state.search = requestAnimationFrame(step);
    };
    const finish = (r) => {
      state.search = null; if (!r) return;
      const chosen = r.visits.indexOf(Math.max(...r.visits));
      drawVisits($(".kd-visits"), r.visits, t.legal, recorded, chosen);
      const agree = chosen === t.plan;
      const nice = (a) => G.plans[a].toLowerCase().replace("_", " ");
      $(".kd-sim").textContent = `${state.sims} simulations · root value ≈ $${(r.rootValue * 1e4).toLocaleString(undefined, { maximumFractionDigits: 0 })} still to come · picks “${nice(chosen)}”` +
        (state.weights === "trained" ? (agree ? " — the same plan the agent played" : ` — the recorded game used 32 simulations and played “${nice(t.plan)}”`) : " — random weights: this is the weight-swap test");
    };
    step();
  }

  // ---------------------------------------------------------------- controls
  function buildControls() {
    const g = () => G.games[state.game];
    $(".kd-scrub").max = g().frames.length - 1;
    $(".kd-game").innerHTML = G.games.map((x, i) => `<option value="${i}">seed ${x.seed} · MuZero in seat ${x.muzero_seat} · final $${x.final[0].toLocaleString()} vs $${x.final[1].toLocaleString()}</option>`).join("");
    $(".kd-game").onchange = (e) => { state.game = +e.target.value; state.frame = 0; render(); };
    $(".kd-play").onclick = () => toggle();
    $(".kd-scrub").oninput = (e) => { state.frame = +e.target.value; render(); };
    $(".kd-speed").oninput = (e) => { state.speed = +e.target.value; if (state.playing) { toggle(); toggle(); } };
    $(".kd-prev").onclick = () => { state.frame = Math.max(0, (Math.min(29, g().frames[state.frame].d) - 1) * 24); render(); };
    $(".kd-next").onclick = () => { state.frame = Math.min(g().frames.length - 1, (g().frames[state.frame].d + 1) * 24); render(); };
    $(".kd-sims").oninput = (e) => { state.sims = +e.target.value; $(".kd-sims-v").textContent = state.sims; };
    $(".kd-sims").onchange = () => runSearch(false);
    $(".kd-rerun").onclick = () => runSearch(false);
    root.querySelectorAll("[data-weights]").forEach((b) => b.onclick = () => {
      state.weights = b.dataset.weights;
      root.querySelectorAll("[data-weights]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      runSearch(false);
    });
    root.addEventListener("keydown", (e) => { if (e.key === " " && e.target.tagName !== "SELECT") { e.preventDefault(); toggle(); } });
    window.addEventListener("resize", () => render());
    if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => render());
  }
  function toggle() {
    state.playing = !state.playing;
    $(".kd-play").textContent = state.playing ? "❚❚ pause" : "▶ play";
    $(".kd-play").setAttribute("aria-pressed", state.playing ? "true" : "false");
    clearInterval(state.timer);
    if (state.playing) state.timer = setInterval(() => {
      const n = G.games[state.game].frames.length;
      state.frame = Math.min(n - 1, state.frame + 1); render();
      if (state.frame >= n - 1) toggle();
    }, Math.max(10, 220 / state.speed));
  }
})();
