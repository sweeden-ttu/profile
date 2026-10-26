/* In-browser runner for the local-Llama agent examples.
 *
 * The browser cannot run Llama, so Python runs in Pyodide (CPython on WebAssembly) and the
 * examples' LLM calls are served by llm.py's ReplayBackend from the transcripts the latest
 * GitHub Actions run recorded with a real Ollama model (falling back to the bundled samples).
 * Tools, parsing, validation and retries are real Python executing in the page.
 */
(function () {
  "use strict";

  const root = document.querySelector("[data-agent-runner]");
  if (!root) return;

  const cfg = {
    pyodideUrl: root.dataset.pyodideUrl,          // pinned, e.g. https://cdn.jsdelivr.net/pyodide/v0.27.7/full/
    pyBase: root.dataset.pyBase,                  // /assets/toolkit/llama-agents/py
    sampleBase: root.dataset.sampleBase,          // /assets/toolkit/llama-agents/samples
    examples: JSON.parse(root.dataset.examples),  // [{name, file, title}]
  };
  const dataEl = document.getElementById("agent-runs-data");
  let runs = {};
  try { runs = JSON.parse(dataEl ? dataEl.textContent : "{}") || {}; } catch (e) { runs = {}; }
  const latest = runs.latest || null;

  const $ = (sel) => root.querySelector(sel);
  const els = {
    select: $("[data-example-select]"),
    run: $("[data-run]"),
    reset: $("[data-reset]"),
    status: $("[data-status]"),
    editor: $("[data-editor]"),
    output: $("[data-output]"),
    source: $("[data-replay-source]"),
    file: $("[data-file]"),
    steps: $("[data-steps]"),
    meta: $("[data-meta]"),
  };

  const originals = {};     // name -> original source text
  const edits = {};         // name -> edited source text (kept while switching examples)
  const transcripts = {};   // name -> {doc, origin}
  let llmSource = null;
  let pyodidePromise = null;

  // ── helpers ──────────────────────────────────────────────────────────
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const short = (s, n) => { s = typeof s === "string" ? s : JSON.stringify(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  const current = () => cfg.examples.find((e) => e.name === els.select.value) || cfg.examples[0];

  function setStatus(text, state) {
    els.status.textContent = text;
    els.status.className = "tk-pill" + (state ? " is-" + state : "");
  }
  function write(text, cls) {
    const span = document.createElement("span");
    if (cls) span.className = cls;
    span.textContent = text;
    els.output.appendChild(span);
    els.output.scrollTop = els.output.scrollHeight;
  }
  async function fetchText(url) {
    const r = await fetch(url, { cache: "no-cache" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.text();
  }

  // Latest CI transcript for this example if the last run produced one, else bundled sample.
  async function loadTranscript(ex) {
    if (transcripts[ex.name]) return transcripts[ex.name];
    const entry = latest && (latest.examples || []).find((e) => e.name === ex.name);
    if (entry && entry.transcript) {
      try {
        const doc = JSON.parse(await fetchText(entry.transcript));
        const origin = latest.backend === "ollama" ? "ci" : "seed";
        return (transcripts[ex.name] = { doc, origin, entry });
      } catch (e) { /* fall through to the bundled sample */ }
    }
    const doc = JSON.parse(await fetchText(`${cfg.sampleBase}/${ex.name}.json`));
    return (transcripts[ex.name] = { doc, origin: "sample", entry: null });
  }

  function describeSource(t) {
    const d = t.doc;
    const when = (d.started_at || "").replace("T", " ").replace("+00:00", " UTC");
    if (t.origin === "ci") return `replaying ${d.calls.length} recorded calls from CI (${d.model}, ${when})`;
    if (t.origin === "seed") return `replaying ${d.calls.length} calls from the offline seed run (${d.backend}, synthetic)`;
    return `replaying ${d.calls.length} calls from the bundled sample (synthetic)`;
  }

  function renderSteps(t) {
    const steps = (t.doc.steps || []);
    els.steps.innerHTML = steps.map((s) => `
      <li class="tk-step${s.ok === false ? " is-fail" : ""}">
        <span class="tk-step__kind">${esc(s.kind)}</span>
        <span class="tk-step__io"><b>${esc(s.name)}</b> · ${esc(short(s.input, 110))}<br>→ ${esc(short(s.output, 160))}</span>
        <span class="tk-step__ms">${s.latency_ms ? Math.round(s.latency_ms) + " ms" : ""}</span>
      </li>`).join("") || "<li class=\"tk-step\">No steps recorded.</li>";
  }

  function renderMeta() {
    if (!latest) { els.meta.innerHTML = "<dt>Status</dt><dd>No run data yet.</dd>"; return; }
    const sha = latest.sha ? `<code>${esc(latest.sha.slice(0, 7))}</code>` : "—";
    const runLink = latest.run_url ? `<a href="${esc(latest.run_url)}">#${esc(latest.run_number || latest.run_id)}</a>` : "local seed (no CI run yet)";
    const report = latest.report ? `<a href="${esc(latest.report)}">Evidently report</a>` : "—";
    const tests = latest.tests ? `${latest.tests.passed}/${latest.tests.total}` : "—";
    const when = (latest.generated_at || "").replace("T", " ").replace("+00:00", " UTC");
    els.meta.innerHTML = `
      <div><dt>Model</dt><dd><code>${esc(latest.model || "?")}</code> · ${esc(latest.backend || "")}</dd></div>
      <div><dt>Generated</dt><dd>${esc(when)}</dd></div>
      <div><dt>Actions run</dt><dd>${runLink}</dd></div>
      <div><dt>Commit</dt><dd>${sha}</dd></div>
      <div><dt>Examples passed</dt><dd>${esc(latest.passed)}/${esc(latest.total)}</dd></div>
      <div><dt>Evidently tests</dt><dd>${esc(tests)} · ${report}</dd></div>`;
  }

  async function selectExample() {
    const ex = current();
    if (els.file.dataset.name) edits[els.file.dataset.name] = els.editor.value; // keep edits per example
    els.file.textContent = `examples/${ex.file}`;
    els.file.dataset.name = ex.name;
    try {
      if (!originals[ex.name]) originals[ex.name] = await fetchText(`${cfg.pyBase}/examples/${ex.file}`);
      els.editor.value = edits[ex.name] != null ? edits[ex.name] : originals[ex.name];
      const t = await loadTranscript(ex);
      els.source.textContent = describeSource(t);
      renderSteps(t);
    } catch (e) {
      els.editor.value = `# could not load example: ${e.message}`;
    }
  }

  // ── Pyodide ──────────────────────────────────────────────────────────
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous";
      s.onload = resolve; s.onerror = () => reject(new Error("failed to load " + src));
      document.head.appendChild(s);
    });
  }
  function getPyodide() {
    if (!pyodidePromise) {
      pyodidePromise = (async () => {
        setStatus("loading Python (Pyodide)…", "busy");
        await loadScript(cfg.pyodideUrl + "pyodide.js");
        const py = await window.loadPyodide({ indexURL: cfg.pyodideUrl });
        py.FS.mkdirTree("/home/pyodide/agents/examples");
        py.FS.mkdirTree("/home/pyodide/agents/transcripts");
        return py;
      })().catch((e) => { pyodidePromise = null; throw e; });
    }
    return pyodidePromise;
  }

  async function run() {
    const ex = current();
    els.run.disabled = true;
    els.output.textContent = "";
    try {
      const py = await getPyodide();
      if (!llmSource) llmSource = await fetchText(`${cfg.pyBase}/llm.py`);
      const t = await loadTranscript(ex);
      const dir = "/home/pyodide/agents";
      py.FS.writeFile(`${dir}/llm.py`, llmSource);
      py.FS.writeFile(`${dir}/transcripts/${ex.name}.json`, JSON.stringify(t.doc));
      const path = `${dir}/examples/${ex.file}`;
      py.FS.writeFile(path, els.editor.value);
      py.setStdout({ batched: (s) => write(s + "\n") });
      py.setStderr({ batched: (s) => write(s + "\n", "tk-err") });
      write(`$ LLAMA_BACKEND=replay python examples/${ex.file}\n# ${describeSource(t)}\n\n`, "tk-dim");
      setStatus("running…", "busy");
      // Fresh globals per run; drop cached llm module so the replay backend reloads.
      const globals = py.toPy({ __name__: "__main__", __file__: path });
      await py.runPythonAsync(`
import os, sys
sys.modules.pop("llm", None)
os.environ["LLAMA_BACKEND"] = "replay"
os.environ["LLAMA_REPLAY"] = "${dir}/transcripts"
os.chdir("${dir}")
`);
      const t0 = performance.now();
      await py.runPythonAsync(els.editor.value, { globals, filename: path });
      globals.destroy();
      setStatus(`done in ${Math.round(performance.now() - t0)} ms`, "ok");
    } catch (e) {
      write("\n" + (e && e.message ? e.message : String(e)) + "\n", "tk-err");
      setStatus("error", "fail");
    } finally {
      els.run.disabled = false;
    }
  }

  // ── wire up ──────────────────────────────────────────────────────────
  els.select.innerHTML = cfg.examples.map((e) => `<option value="${esc(e.name)}">${esc(e.title)}</option>`).join("");
  const fromHash = location.hash.replace("#run-", "");
  if (cfg.examples.some((e) => e.name === fromHash)) els.select.value = fromHash;
  els.select.addEventListener("change", selectExample);
  els.run.addEventListener("click", run);
  els.reset.addEventListener("click", () => {
    const ex = current();
    if (originals[ex.name] != null) { els.editor.value = originals[ex.name]; delete edits[ex.name]; }
  });
  // Ctrl/Cmd+Enter runs. Tab is left alone on purpose so keyboard users can leave the editor.
  els.editor.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
  });
  renderMeta();
  setStatus("ready (Python loads on first run)");
  selectExample();
  window.__agentRunner = { run, getPyodide }; // handy for debugging / tests
})();
