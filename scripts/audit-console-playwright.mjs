#!/usr/bin/env node
/**
 * Visit a list of URLs and report console errors + failed network (document).
 * Usage: BASE_URL=http://127.0.0.1:4000 node scripts/audit-console-playwright.mjs
 */
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:4000";
const paths = [
  "/",
  "/blog/",
  "/projects/",
  "/research/",
  "/resume/",
  "/feed.xml",
];

const issues = [];

async function checkPath(browser, p) {
  const url = base.replace(/\/$/, "") + (p.startsWith("/") ? p : "/" + p);
  const page = await browser.newPage();
  const local = [];

  page.on("console", (msg) => {
    const t = msg.type();
    if (t === "error") {
      local.push({ kind: "console", text: msg.text(), url });
    }
  });
  page.on("pageerror", (err) => {
    local.push({ kind: "pageerror", text: String(err), url });
  });

  let status = 0;
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    status = res?.status() ?? 0;
    if (status >= 400) {
      local.push({ kind: "http", text: `HTTP ${status}`, url });
    }
    await page.waitForTimeout(2000);
  } catch (e) {
    local.push({ kind: "navigation", text: String(e.message), url });
  }
  await page.close();
  return local;
}

const browser = await chromium.launch({ headless: true });
for (const p of paths) {
  const found = await checkPath(browser, p);
  issues.push(...found);
}
await browser.close();

if (issues.length) {
  console.log(JSON.stringify({ ok: false, issues }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, paths, base }, null, 2));
}
