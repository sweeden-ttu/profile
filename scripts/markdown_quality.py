#!/usr/bin/env python3
"""Markdown quality automation

Performs lightweight, non-destructive fixes across all Markdown files:
- normalize line endings to LF and trim trailing spaces
- ensure a top-level H1 exists (derived from filename) if missing
- normalize heading syntax (ensure a space after #)
- fix simple broken internal links by attempting to resolve to existing files
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import List, Tuple


ROOT = Path(__file__).resolve().parent.parent


def read_lines(p: Path) -> List[str]:
    data = p.read_text(encoding='utf-8', errors='ignore')
    # Normalize newlines to LF once loaded
    data = data.replace('\r\n', '\n').replace('\r', '\n')
    return data.split('\n')


def write_file(p: Path, lines: List[str]) -> None:
    # Ensure trailing newline at end of file
    if lines and lines[-1] != '':
        lines.append('')
    content = '\n'.join(lines)
    p.write_text(content, encoding='utf-8')


def ensure_header(lines: List[str], stem: str) -> List[str]:
    # If file already has any H1, skip insertion
    for l in lines:
        if l.lstrip().startswith('# '):
            return lines
    # Derive a nice title from stem
    title = stem.replace('_', ' ').replace('-', ' ').title()
    return [f"# {title}"] + lines


def fix_heading_syntax(line: str) -> str:
    # Ensure there is a space after hashes, e.g. '##Heading' -> '## Heading'
    return re.sub(r'^(#{1,6})([^ \t#])', r"\1 \2", line)


def resolve_link(path_str: str, file_path: Path, root: Path) -> Tuple[str, bool]:
    # Returns (new_path, changed)
    if path_str.startswith(('http://', 'https://', 'mailto:')):
        return path_str, False
    candidate = (file_path.parent / path_str).resolve()
    if candidate.exists():
        # Return relative path from file to candidate
        try:
            rel = candidate.relative_to(file_path.parent).as_posix()
        except Exception:
            rel = path_str
        return rel, True
    # Try repo root relative path
    candidate2 = (root / path_str).resolve()
    if candidate2.exists():
        try:
            rel = candidate2.relative_to(file_path.parent).as_posix()
        except Exception:
            rel = path_str
        return rel, True
    # Heuristic: if link looks like 'foo' and a markdown file named 'foo.md' exists anywhere, link to it
    if not path_str.endswith('.md'):
        target = (root / f"{Path(path_str).stem}.md").resolve()
        if target.exists():
            try:
                rel = target.relative_to(file_path.parent).as_posix()
            except Exception:
                rel = str(target)
            return rel, True
    return path_str, False


def process_file(p: Path, root: Path) -> bool:
    original = p.read_text(encoding='utf-8', errors='ignore')
    content = original
    # Normalize line endings and trailing spaces
    lines = content.replace('\r\n', '\n').replace('\r', '\n').split('\n')
    new_lines: List[str] = []
    changed = False

    # Fix heading syntax first pass
    for i, line in enumerate(lines):
        new_line = fix_heading_syntax(line.rstrip())
        if new_line != line:
            changed = True
        new_lines.append(new_line)
    lines = new_lines
    new_lines = []

    # Remove trailing spaces on each line
    for line in lines:
        clean = line.rstrip()
        if clean != line:
            changed = True
        new_lines.append(clean)

    lines = new_lines

    # Ensure top-level header exists
    if not any(l.startswith('# ') for l in lines if l.strip()):
        stem = p.stem
        lines = ensure_header(lines, stem)
        changed = True

    # Normalize heading hierarchy on a second pass if needed
    lines = [ln for ln in lines]  # keep as is, we already fixed syntax

    # Resolve internal links
    link_pat = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
    for idx, line in enumerate(lines):
        m = link_pat.search(line)
        if not m:
            continue
        def repl(mobj):
            text = mobj.group(1)
            href = mobj.group(2)
            new_href, changed_link = resolve_link(href, p, root)
            if changed_link:
                return f"[{text}]({new_href})"
            else:
                return mobj.group(0)
        new_line = link_pat.sub(repl, line)
        if new_line != line:
            lines[idx] = new_line
            changed = True

    new_content = '\n'.join(lines) + ('\n' if content.endswith('\n') or content.endswith('\r\n') else '')
    if new_content != original:
        p.write_text(new_content, encoding='utf-8')
        return True
    return False


def main() -> int:
    root = ROOT
    changed_any = False
    md_files = sorted(root.glob('**/*.md'))
    if not md_files:
        print('No Markdown files found.')
        return 0
    for p in md_files:
        if not p.is_file():
            continue
        changed = process_file(p, root)
        if changed:
            changed_any = True
            print(f'Updated: {p}')
    if not changed_any:
        print('No changes needed.')
        return 0
    return 0


if __name__ == '__main__':
    sys.exit(main())
