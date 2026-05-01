#!/usr/bin/env python3
import os
from pathlib import Path
import re

# Root of the profile workspace
ROOT = Path(__file__).resolve().parents[1]  # /Users/sweeden/profile/tools/.. -> /Users/sweeden/profile


def fix_headings(lines: list[str]) -> list[str]:
    out = []
    last_level = 0
    heading_re = re.compile(r"^(#+)\s+(.*)$")
    for line in lines:
        m = heading_re.match(line)
        if m:
            level = len(m.group(1))
            new_level = min(level, last_level + 1) if last_level else level
            content = m.group(2)
            if new_level != level:
                line = ("#" * new_level) + " " + content
            last_level = new_level
        out.append(line)
    return out


def fix_typos(text: str) -> str:
    replacements = {
        " recieve ": " receive ",
        " Recieve ": " Receive ",
        " definately ": " definitely ",
        " definately,": " definitely,",
        " definately.": " definitely.",
        " adress ": " address ",
        " Adress ": " Address ",
        " occured ": " occurred ",
        " Occured ": " Occurred ",
        " occured": " occurred",
        " seperated ": " separated ",
        " teh ": " the ",
        " teh ": " the ",
        " alot ": " a lot ",
        " alot,": " a lot,",
        " alot.": " a lot.",
        " utilise ": " utilize ",
        " Utilise ": " Utilize ",
        " utilise.": " utilize.",
        " adress": " address",
        " adress.": " address.",
    }

    # Simple word-boundary replacements
    pattern = re.compile(r"\b(" + "|".join(map(re.escape, replacements.keys())) + r")\b")
    return pattern.sub(lambda m: replacements.get(m.group(0), m.group(0)), text)


def fix_links(text: str, md_path: Path) -> str:
    dir_path = md_path.parent

    def _fix(match: re.Match) -> str:
        full = match.group(2)
        # Skip external URLs or anchors
        if full.startswith("#") or full.startswith("mailto:") or full.startswith("http"):
            return match.group(0)
        target = (dir_path / full).resolve()
        if target.exists():
            return match.group(0)
        if not Path(full).suffix:
            alt = full + ".md"
            if (dir_path / alt).exists():
                return f"[{match.group(1)}]({alt})"
        return match.group(0)

    return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", _fix, text)


def process_file(path: Path) -> bool:
    try:
        original = path.read_text(encoding="utf-8")
    except Exception:
        return False
    content = original
    content = fix_typos(content)
    content = fix_links(content, path)
    # Normalize heading levels by scanning lines
    content_lines = content.splitlines()
    content_lines = fix_headings(content_lines)
    content = "\n".join(content_lines)
    if content != original:
        try:
            path.write_text(content, encoding="utf-8")
            return True
        except PermissionError:
            # Skip unwritable files gracefully
            return False
    return False


def main() -> int:
    root = ROOT
    changed = 0
    for md in root.glob("**/*.md"):
        # Exclude _site directory contents
        if "_site" in md.parts:
            continue
        if md.is_file():
            if process_file(md):
                changed += 1
    print(f"markdown_quality: changed={changed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
