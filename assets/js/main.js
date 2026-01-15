// main.js
// Minimal JavaScript for mobile menu and progressive enhancements

(function() {
  'use strict';

  // ============================================================================
  // Mobile Menu Toggle
  // ============================================================================

  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (mobileMenuToggle && siteNav) {
    mobileMenuToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', !isExpanded);
      siteNav.classList.toggle('site-nav--open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.site-header')) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('site-nav--open');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('site-nav--open');
      }
    });
  }

  // ============================================================================
  // Smooth Scroll Enhancement (if not supported natively)
  // ============================================================================

  if (!('scrollBehavior' in document.documentElement.style)) {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ============================================================================
  // External Links - Open in New Tab
  // ============================================================================

  const externalLinks = document.querySelectorAll('a[href^="http"]');

  externalLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    const currentDomain = window.location.hostname;

    // Check if link is external
    if (!href.includes(currentDomain)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // ============================================================================
  // Copy Code Button for Code Blocks (optional enhancement)
  // ============================================================================

  const codeBlocks = document.querySelectorAll('pre code');

  codeBlocks.forEach(function(codeBlock) {
    const pre = codeBlock.parentElement;
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    button.addEventListener('click', function() {
      const code = codeBlock.textContent;

      navigator.clipboard.writeText(code).then(function() {
        button.textContent = 'Copied!';
        setTimeout(function() {
          button.textContent = 'Copy';
        }, 2000);
      }).catch(function(err) {
        console.error('Failed to copy:', err);
      });
    });

    pre.style.position = 'relative';
    pre.appendChild(button);
  });

  // ============================================================================
  // MCP SSE Connector (GitHub Pages-compatible)
  // ============================================================================
  //
  // This is a browser-side connector to an external MCP server over SSE.
  // GitHub Pages cannot host SSE itself; you must point `mcp.sse_url` (and
  // optionally `mcp.post_url`) at an external service that supports CORS.
  //
  // Transport:
  // - Server -> Client: EventSource(SSE) messages with `event.data` as JSON.
  // - Client -> Server: fetch(POST) JSON-RPC 2.0 to `post_url` (if provided).
  //
  // Notes:
  // - EventSource cannot set custom headers; if you need auth, use cookies on the
  //   SSE origin or a short-lived token in the querystring.
  // - If your SSE server emits an `endpoint` event with a URL in `data`, we will
  //   adopt it as the POST endpoint automatically.
  //

  function readMeta(name) {
    const el = document.querySelector(`meta[name="${name}"]`);
    return el ? (el.getAttribute('content') || '').trim() : '';
  }

  function isTruthyString(s) {
    return ['1', 'true', 'yes', 'on'].includes(String(s).toLowerCase());
  }

  function nowIso() {
    try { return new Date().toISOString(); } catch (_) { return String(Date.now()); }
  }

  class McpSseClient {
    constructor(options) {
      this.sseUrl = options.sseUrl || '';
      this.postUrl = options.postUrl || '';
      this.timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : 30000;
      this.onStatus = typeof options.onStatus === 'function' ? options.onStatus : function() {};
      this.onNotification = typeof options.onNotification === 'function' ? options.onNotification : function() {};
      this.onLog = typeof options.onLog === 'function' ? options.onLog : function() {};

      this._es = null;
      this._nextId = 1;
      this._pending = new Map(); // id -> { resolve, reject, timer }
    }

    isConnected() {
      return !!this._es;
    }

    connect() {
      if (!this.sseUrl) throw new Error('MCP SSE: missing sseUrl');
      if (this._es) return;
      if (!('EventSource' in window)) throw new Error('MCP SSE: EventSource not supported in this browser');

      this.onLog({ level: 'info', message: 'Connecting SSE', at: nowIso(), sseUrl: this.sseUrl });
      this.onStatus({ state: 'connecting' });

      const es = new EventSource(this.sseUrl, { withCredentials: true });
      this._es = es;

      es.onopen = () => {
        this.onLog({ level: 'info', message: 'SSE open', at: nowIso() });
        this.onStatus({ state: 'open' });
      };

      es.onerror = (err) => {
        // EventSource will auto-retry. We surface state so UI can show degraded mode.
        this.onLog({ level: 'warn', message: 'SSE error', at: nowIso(), error: serializeError(err) });
        this.onStatus({ state: 'error' });
      };

      es.onmessage = (event) => {
        this._handleSseEvent('message', event);
      };

      // Optional: server tells the client where to POST JSON-RPC messages.
      es.addEventListener('endpoint', (event) => {
        try {
          const url = (event && event.data ? String(event.data) : '').trim();
          if (url) {
            this.postUrl = url;
            this.onLog({ level: 'info', message: 'Adopted POST endpoint from SSE', at: nowIso(), postUrl: url });
          }
        } catch (_) {}
      });
    }

    disconnect() {
      if (!this._es) return;
      this.onLog({ level: 'info', message: 'Disconnecting SSE', at: nowIso() });
      try { this._es.close(); } catch (_) {}
      this._es = null;
      this.onStatus({ state: 'closed' });

      // Reject any inflight requests.
      for (const [id, pending] of this._pending.entries()) {
        clearTimeout(pending.timer);
        pending.reject(new Error(`MCP SSE: disconnected (id=${id})`));
      }
      this._pending.clear();
    }

    async request(method, params, options) {
      if (!method) throw new Error('MCP SSE: request requires method');
      if (!this.postUrl) throw new Error('MCP SSE: missing postUrl (client->server POST endpoint)');

      const id = this._nextId++;
      const timeoutMs = (options && typeof options.timeoutMs === 'number') ? options.timeoutMs : this.timeoutMs;
      const payload = { jsonrpc: '2.0', id, method, params: params === undefined ? null : params };

      const p = new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this._pending.delete(id);
          reject(new Error(`MCP SSE: request timeout (id=${id}, method=${method})`));
        }, timeoutMs);
        this._pending.set(id, { resolve, reject, timer });
      });

      await this._postJson(payload);
      return p;
    }

    async notify(method, params) {
      if (!method) throw new Error('MCP SSE: notify requires method');
      if (!this.postUrl) throw new Error('MCP SSE: missing postUrl (client->server POST endpoint)');
      const payload = { jsonrpc: '2.0', method, params: params === undefined ? null : params };
      await this._postJson(payload);
    }

    async _postJson(payload) {
      this.onLog({ level: 'debug', message: 'POST JSON-RPC', at: nowIso(), postUrl: this.postUrl, payload });
      const res = await fetch(this.postUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
        mode: 'cors'
      });

      // Some MCP SSE servers respond 202/204; some respond with JSON.
      if (!res.ok) {
        const text = await safeReadText(res);
        throw new Error(`MCP SSE: POST failed (${res.status}) ${text ? `- ${text}` : ''}`.trim());
      }
    }

    _handleSseEvent(type, event) {
      try {
        const data = event && typeof event.data === 'string' ? event.data : '';
        if (!data) return;
        const msg = JSON.parse(data);
        this.onLog({ level: 'debug', message: 'SSE message', at: nowIso(), type, msg });
        this._handleJsonRpc(msg);
      } catch (err) {
        this.onLog({ level: 'warn', message: 'Failed to parse SSE JSON', at: nowIso(), error: serializeError(err) });
      }
    }

    _handleJsonRpc(msg) {
      // JSON-RPC 2.0 response
      if (msg && Object.prototype.hasOwnProperty.call(msg, 'id')) {
        const pending = this._pending.get(msg.id);
        if (!pending) return;
        clearTimeout(pending.timer);
        this._pending.delete(msg.id);

        if (Object.prototype.hasOwnProperty.call(msg, 'error') && msg.error) {
          const e = new Error(msg.error.message || 'MCP SSE: JSON-RPC error');
          e.data = msg.error.data;
          e.code = msg.error.code;
          pending.reject(e);
          return;
        }

        pending.resolve(msg.result);
        return;
      }

      // Notification (server -> client)
      if (msg && typeof msg.method === 'string' && !Object.prototype.hasOwnProperty.call(msg, 'id')) {
        this.onNotification({ method: msg.method, params: msg.params });
      }
    }
  }

  function serializeError(err) {
    if (!err) return null;
    if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack };
    try { return JSON.parse(JSON.stringify(err)); } catch (_) { return String(err); }
  }

  async function safeReadText(res) {
    try { return await res.text(); } catch (_) { return ''; }
  }

  function shouldShowMcpPanel() {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('mcp') === '1') return true;
    if (localStorage.getItem('mcpDebug') === '1') return true;
    return false;
  }

  function ensureMcpPanel() {
    let panel = document.getElementById('mcp-sse-panel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'mcp-sse-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'MCP SSE Connector');
    panel.style.position = 'fixed';
    panel.style.right = '12px';
    panel.style.bottom = '12px';
    panel.style.zIndex = '9999';
    panel.style.width = '340px';
    panel.style.maxWidth = 'calc(100vw - 24px)';
    panel.style.background = 'rgba(15, 23, 42, 0.92)';
    panel.style.color = '#e2e8f0';
    panel.style.border = '1px solid rgba(148, 163, 184, 0.25)';
    panel.style.borderRadius = '12px';
    panel.style.padding = '12px';
    panel.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace';
    panel.style.fontSize = '12px';
    panel.style.backdropFilter = 'blur(8px)';

    panel.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">',
      '  <div style="font-weight:600;">MCP SSE</div>',
      '  <button type="button" id="mcp-sse-close" style="background:transparent;border:1px solid rgba(148,163,184,0.35);color:#e2e8f0;border-radius:8px;padding:4px 8px;cursor:pointer;">Hide</button>',
      '</div>',
      '<div id="mcp-sse-status" style="margin-bottom:8px;">Status: <span style="font-weight:600;">idle</span></div>',
      '<div style="display:flex;gap:8px;margin-bottom:8px;">',
      '  <button type="button" id="mcp-sse-connect" style="flex:1;background:#2563eb;border:0;color:white;border-radius:8px;padding:6px 10px;cursor:pointer;">Connect</button>',
      '  <button type="button" id="mcp-sse-disconnect" style="flex:1;background:transparent;border:1px solid rgba(148,163,184,0.35);color:#e2e8f0;border-radius:8px;padding:6px 10px;cursor:pointer;">Disconnect</button>',
      '</div>',
      '<div style="margin-bottom:6px;opacity:0.85;">Tip: add <code>?mcp=1</code> or set <code>localStorage.mcpDebug=1</code></div>',
      '<pre id="mcp-sse-log" style="margin:0;max-height:160px;overflow:auto;white-space:pre-wrap;background:rgba(2,6,23,0.55);padding:8px;border-radius:8px;border:1px solid rgba(148,163,184,0.15);"></pre>'
    ].join('');

    document.body.appendChild(panel);
    panel.querySelector('#mcp-sse-close').addEventListener('click', () => {
      panel.remove();
      localStorage.setItem('mcpDebug', '0');
    });
    return panel;
  }

  function initMcpFromConfig() {
    const enabled = isTruthyString(readMeta('mcp-enabled'));
    const sseUrl = readMeta('mcp-sse-url');
    const postUrl = readMeta('mcp-post-url');

    if (!enabled && !shouldShowMcpPanel()) return;
    if (!sseUrl) {
      if (shouldShowMcpPanel()) {
        const p = ensureMcpPanel();
        p.querySelector('#mcp-sse-log').textContent = 'Missing config: set `mcp.sse_url` in _config.yml';
      }
      return;
    }

    const panel = shouldShowMcpPanel() ? ensureMcpPanel() : null;
    const statusEl = panel ? panel.querySelector('#mcp-sse-status span') : null;
    const logEl = panel ? panel.querySelector('#mcp-sse-log') : null;

    function appendLog(line) {
      if (!logEl) return;
      logEl.textContent = (logEl.textContent + (logEl.textContent ? '\n' : '') + line).slice(-8000);
      logEl.scrollTop = logEl.scrollHeight;
    }

    const client = new McpSseClient({
      sseUrl,
      postUrl,
      onStatus: (s) => {
        if (statusEl) statusEl.textContent = s.state;
      },
      onNotification: (n) => {
        appendLog(`[notify] ${n.method}`);
      },
      onLog: (entry) => {
        if (entry.level === 'debug' && !shouldShowMcpPanel()) return;
        appendLog(`[${entry.level}] ${entry.message}${entry.postUrl ? ` (${entry.postUrl})` : ''}`);
      }
    });

    // Expose for debugging / page scripts.
    window.mcpSse = {
      client,
      connect: () => client.connect(),
      disconnect: () => client.disconnect(),
      request: (method, params, options) => client.request(method, params, options),
      notify: (method, params) => client.notify(method, params)
    };

    if (panel) {
      panel.querySelector('#mcp-sse-connect').addEventListener('click', () => client.connect());
      panel.querySelector('#mcp-sse-disconnect').addEventListener('click', () => client.disconnect());
      appendLog(`Configured sseUrl=${sseUrl}`);
      if (postUrl) appendLog(`Configured postUrl=${postUrl}`);
    }

    if (enabled) {
      // Auto-connect when enabled by config.
      client.connect();
    }
  }

  // Initialize after DOM is ready (this file is loaded at end of body anyway).
  try { initMcpFromConfig(); } catch (e) { /* no-op */ }

})();
