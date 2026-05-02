#!/usr/bin/env node
/**
 * Local telemetry sink: accepts JSON POST bodies, appends NDJSON to a git repo,
 * and commits with the git CLI (object database + commit graph = Git protocol).
 *
 * Usage: node scripts/git-telemetry-server.mjs [--port 8787] [--repo path]
 *
 * Optional push after each commit (uses `origin`, e.g. ssh:// or https://):
 *   GIT_TELEMETRY_AUTO_PUSH=1 node scripts/git-telemetry-server.mjs
 *
 * Remote URL when `origin` is missing (also set by LaunchAgent):
 *   GIT_TELEMETRY_REMOTE_URL (default: git@github.com:sweeden-ttu/profile-telemetry.git)
 */
import http from "node:http";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEFAULT_REPO = path.join(ROOT, ".telemetry");

function parseArgs(argv) {
  let port = 8787;
  let repo = DEFAULT_REPO;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--port" && argv[i + 1]) {
      port = Number(argv[++i]);
    } else if (argv[i] === "--repo" && argv[i + 1]) {
      repo = path.resolve(argv[++i]);
    }
  }
  return { port, repo };
}

const DEFAULT_REMOTE_URL =
  process.env.GIT_TELEMETRY_REMOTE_URL ||
  "git@github.com:sweeden-ttu/profile-telemetry.git";

function git(repo, args, input = null) {
  const r = spawnSync("git", ["-C", repo, ...args], {
    input,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${r.stderr || r.stdout}`);
  }
  return r.stdout;
}

function ensureOriginRemote(repo) {
  const r = spawnSync("git", ["-C", repo, "remote", "get-url", "origin"], {
    encoding: "utf8",
  });
  if (r.status === 0) {
    return;
  }
  const add = spawnSync(
    "git",
    ["-C", repo, "remote", "add", "origin", DEFAULT_REMOTE_URL],
    { encoding: "utf8" },
  );
  if (add.status !== 0) {
    console.warn(
      `[git-telemetry] could not add origin (${add.stderr || add.stdout?.trim()})`,
    );
    return;
  }
  console.error(`[git-telemetry] added origin -> ${DEFAULT_REMOTE_URL}`);
}

function ensureRepo(repo) {
  fs.mkdirSync(repo, { recursive: true });
  const gitDir = path.join(repo, ".git");
  if (!fs.existsSync(gitDir)) {
    git(repo, ["init", "-b", "main"]);
    git(repo, ["config", "user.email", "telemetry@localhost"]);
    git(repo, ["config", "user.name", "site-telemetry"]);
    fs.writeFileSync(
      path.join(repo, "README.md"),
      "# Telemetry log store\n\nAppend-only NDJSON in `events.ndjson`, committed by `scripts/git-telemetry-server.mjs`.\n",
      "utf8",
    );
    fs.writeFileSync(path.join(repo, "events.ndjson"), "", "utf8");
    git(repo, ["add", "README.md", "events.ndjson"]);
    git(repo, ["commit", "-m", "chore: init telemetry log store"]);
  }
}

function appendAndCommit(repo, line) {
  const file = path.join(repo, "events.ndjson");
  fs.appendFileSync(file, line, "utf8");
  git(repo, ["add", "events.ndjson"]);
  const msg = `telemetry: ${JSON.stringify({ t: new Date().toISOString() })}`.slice(0, 120);
  git(repo, ["commit", "-m", msg]);
  if (process.env.GIT_TELEMETRY_AUTO_PUSH === "1") {
    try {
      git(repo, ["push", "-u", "origin", "HEAD"]);
    } catch (e) {
      console.warn("[git-telemetry] push failed:", e.message);
    }
  }
}

const { port, repo } = parseArgs(process.argv);
ensureRepo(repo);
ensureOriginRemote(repo);

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method !== "POST" || req.url !== "/ingest") {
    res.writeHead(req.method === "GET" && req.url === "/health" ? 200 : 404, {
      "Content-Type": "text/plain",
    });
    res.end(req.url === "/health" ? "ok\n" : "not found\n");
    return;
  }
  let body = "";
  req.on("data", (c) => {
    body += c;
    if (body.length > 2_000_000) req.destroy();
  });
  req.on("end", () => {
    try {
      const payload = JSON.parse(body || "{}");
      const line = JSON.stringify({ receivedAt: new Date().toISOString(), ...payload }) + "\n";
      appendAndCommit(repo, line);
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
      });
      res.end();
    } catch (e) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(String(e.message));
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.error(`[git-telemetry] listening on http://127.0.0.1:${port}/ingest repo=${repo}`);
});
