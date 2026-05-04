/**
 * Browser telemetry provider: batches client errors/metrics and POSTs to the
 * local git-telemetry server (commits via Git CLI on the host).
 */
(function () {
  var endpoint = "http://127.0.0.1:8787/ingest";
  var queue = [];
  var flushTimer = null;

  function isLocal() {
    var h = location.hostname;
    return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  }

  function flush() {
    if (!queue.length || !isLocal()) return;
    var batch = queue.splice(0, queue.length);
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "batch",
        href: location.href,
        events: batch,
      }),
      mode: "cors",
      keepalive: true,
    }).catch(function () {});
  }

  function enqueue(ev) {
    if (!isLocal()) return;
    ev.ts = new Date().toISOString();
    queue.push(ev);
    if (queue.length >= 8) flush();
    else if (!flushTimer) {
      flushTimer = setTimeout(function () {
        flushTimer = null;
        flush();
      }, 4000);
    }
  }

  window.addEventListener("error", function (e) {
    enqueue({
      kind: "error",
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  window.addEventListener("unhandledrejection", function (e) {
    enqueue({
      kind: "unhandledrejection",
      reason: String(e.reason && (e.reason.message || e.reason)),
    });
  });

  window.addEventListener("beforeunload", function () {
    flush();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush();
  });
})();
