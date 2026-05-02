#!/usr/bin/env python3
"""
Run Docling on each PNG under assets/images/work-pdf-thumbs, extract the first
Markdown heading as the document title, and report duplicate titles (normalized).

Requires: docling on PATH (pip/uv install docling).

Usage:
  python3 scripts/docling_thumb_titles.py
  python3 scripts/docling_thumb_titles.py --limit 5   # smoke test
  python3 scripts/docling_thumb_titles.py --force    # ignore cache mtimes
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
THUMB_DIR = REPO / "assets" / "images" / "work-pdf-thumbs"
CACHE_DIR = THUMB_DIR / ".docling-cache"
REPORT_PATH = REPO / "data" / "work-pdf-thumb-docling-report.json"


def first_heading_title(md: str) -> str | None:
    for raw in md.splitlines():
        line = raw.strip()
        if not line.startswith("#"):
            continue
        title = re.sub(r"^#+\s*", "", line).strip()
        if title:
            return title
    return None


def title_from_first_gfm_table(md: str) -> str | None:
    """When the page has no # headings, Docling often emits a leading pipe table."""
    lines = md.splitlines()
    for i, line in enumerate(lines):
        if not line.strip().startswith("|"):
            continue
        rows: list[list[str]] = []
        j = i
        while j < len(lines) and lines[j].strip().startswith("|"):
            raw = lines[j].strip()
            if re.match(r"^\|[\s\-:|]+\|$", raw):
                j += 1
                continue
            cells = [c.strip() for c in raw.strip("|").split("|")]
            rows.append(cells)
            j += 1
        if rows:
            header_cells = [c for c in rows[0] if c and not re.fullmatch(r"[-:\s]+", c)]
            if header_cells:
                return " — ".join(header_cells)
    return None


def extract_title(md: str) -> str | None:
    return first_heading_title(md) or title_from_first_gfm_table(md)


def normalize_title(title: str | None) -> str:
    if not title:
        return ""
    s = title.lower()
    s = re.sub(r"[\s\u00a0]+", " ", s)
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    return s.strip()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def run_docling(png: Path, out_dir: Path) -> Path | None:
    out_dir.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            [
                "docling",
                str(png),
                "--from",
                "image",
                "--to",
                "md",
                "--output",
                str(out_dir),
                "--pipeline",
                "standard",
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=600,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
        print(f"ERROR {png.name}: {e}", file=sys.stderr)
        return None
    md_path = out_dir / f"{png.stem}.md"
    if not md_path.exists():
        print(f"ERROR {png.name}: missing {md_path}", file=sys.stderr)
        return None
    return md_path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="Process at most N images (0 = all)")
    ap.add_argument("--force", action="store_true", help="Re-run Docling even if cache is fresh")
    args = ap.parse_args()

    if not THUMB_DIR.is_dir():
        print(f"Missing {THUMB_DIR}", file=sys.stderr)
        return 1

    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    pngs = sorted(p for p in THUMB_DIR.glob("*.png") if not p.name.startswith("."))
    if args.limit:
        pngs = pngs[: args.limit]

    entries: list[dict] = []

    for png in pngs:
        cache_sub = CACHE_DIR / png.stem
        cache_md = cache_sub / f"{png.stem}.md"
        need = args.force or not cache_md.exists()
        if not need and cache_md.stat().st_mtime < png.stat().st_mtime:
            need = True
        if need:
            if cache_sub.exists():
                for old in cache_sub.glob("*.md"):
                    old.unlink()
            md_path = run_docling(png, cache_sub)
        else:
            md_path = cache_md

        title = None
        err = None
        if md_path and md_path.exists():
            try:
                title = extract_title(md_path.read_text(encoding="utf-8", errors="replace"))
            except OSError as e:
                err = str(e)
        else:
            err = "docling_failed"

        entries.append(
            {
                "image": str(png.relative_to(REPO)).replace("\\", "/"),
                "stem": png.stem,
                "title": title,
                "title_normalized": normalize_title(title),
                "sha256": sha256_file(png),
                "error": err,
            }
        )
        label = title or err or "?"
        print(f"{png.name}\t{label[:100]}")

    by_title: dict[str, list[str]] = defaultdict(list)
    for e in entries:
        key = e["title_normalized"] or f"__empty__::{e['stem']}"
        by_title[key].append(e["stem"])

    duplicate_title_groups = {
        k: v for k, v in by_title.items() if len(v) > 1 and not k.startswith("__empty__::")
    }

    def collapse_version_key(s: str) -> str:
        if not s:
            return ""
        t = re.sub(r"\s+", " ", s.lower()).strip()
        t = re.sub(r"\s*[\(\[]?\s*1\s*[\)\]]?\s*$", "", t)
        t = re.sub(r"[-_\s]+1\s*$", "", t)
        return t.strip()

    by_near: dict[str, list[str]] = defaultdict(list)
    for e in entries:
        if not e.get("title_normalized"):
            continue
        by_near[collapse_version_key(e["title_normalized"])].append(e["stem"])
    duplicate_near_title_groups = {k: v for k, v in by_near.items() if len(v) > 1}

    by_hash: dict[str, list[str]] = defaultdict(list)
    for e in entries:
        by_hash[e["sha256"]].append(e["stem"])
    duplicate_image_groups = {h: v for h, v in by_hash.items() if len(v) > 1}

    report = {
        "thumb_dir": str(THUMB_DIR.relative_to(REPO)).replace("\\", "/"),
        "count": len(entries),
        "entries": entries,
        "duplicate_title_groups": duplicate_title_groups,
        "duplicate_near_title_groups": duplicate_near_title_groups,
        "duplicate_image_groups": duplicate_image_groups,
    }

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nWrote {REPORT_PATH}")
    if duplicate_title_groups:
        print("\nDuplicate titles (normalized):")
        for k, v in sorted(duplicate_title_groups.items(), key=lambda x: (-len(x[1]), x[0])):
            print(f"  {k!r}: {v}")
    else:
        print("\nNo duplicate titles (normalized exact match).")
    if duplicate_image_groups:
        print("\nIdentical image files (SHA-256):")
        for _h, v in duplicate_image_groups.items():
            print(f"  {v}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
