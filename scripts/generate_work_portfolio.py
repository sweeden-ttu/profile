#!/usr/bin/env python3
"""
Scan repo-root data/**/*.pdf, render first-page thumbnails, and write
_data/work_portfolio.yml for the Jekyll work gallery.

Requires: pdftoppm (poppler), or falls back to PyMuPDF (fitz).

Usage (from repo root):
  python3 scripts/generate_work_portfolio.py
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "data"
OUT_DIR = REPO / "assets" / "images" / "work-pdf-thumbs"
YAML_OUT = REPO / "_data" / "work_portfolio.yml"

# PDFs excluded from the work gallery (relative to repo root, POSIX path).
EXCLUDED_PDF_PATHS = frozenset(
    {
        "data/softwarevv/Assignment 1: Functional + Structural Testing + LangSmith: Due Feb 28/24-1287_4gcj.pdf",
        # Duplicate / redundant PDFs (same or near-identical first page as kept sibling)
        "data/algorithm_analysis/Assignment 1/CS5381_Weeden_Assignment_1 (1).pdf",
        "data/intelligent-systems/Assigment 3_Report/Assignment3_Report-2-1.pdf",
        "data/intelligent-systems/Assignment 3_problem_solving/Q-Learning Problem Solving-1.pdf",
        "data/logic/Homework 1/logic_homework_assignment_1-1-1.pdf",
        "data/logic/Homework 2/scott_weeden_homework_logic-1.pdf",
        "data/softwarevv/Assignment 1: Functional + Structural Testing + LangSmith: Due Feb 28/Assignment 1 Rubric (10 Points Total)-1.pdf",
        "data/softwarevv/Quiz 3: LLM Evaluation + Rubric/NIST_Evaluation_Color.pdf",
        "data/automata/Homework 3/HW 3-1.pdf",
    }
)


TOPIC_LABELS = {
    "automata": "Theory of automata",
    "softwarevv": "Software verification and validation",
    "logic": "Logic for computer scientists",
    "cryptography": "Cryptography",
    "project_management": "Software project management",
    "intelligent-systems": "Intelligent systems",
    "algorithm_analysis": "Analysis of algorithms",
    "machine-learning": "Machine learning",
}


def stable_id(rel: str) -> str:
    h = hashlib.sha256(rel.encode("utf-8")).hexdigest()[:16]
    return f"w_{h}"


def pdf_to_png_pdftoppm(pdf: Path, png: Path) -> bool:
    png.parent.mkdir(parents=True, exist_ok=True)
    stem = png.with_suffix("")
    try:
        subprocess.run(
            [
                "pdftoppm",
                "-png",
                "-f",
                "1",
                "-l",
                "1",
                "-scale-to",
                "520",
                str(pdf),
                str(stem),
            ],
            check=True,
            capture_output=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"pdftoppm failed for {pdf}: {e}", file=sys.stderr)
        return False
    produced = Path(str(stem) + "-1.png")
    if not produced.exists():
        print(f"pdftoppm missing output {produced}", file=sys.stderr)
        return False
    shutil.move(produced, png)
    return True


def pdf_to_png_pymupdf(pdf: Path, png: Path) -> bool:
    try:
        import fitz  # type: ignore
    except ImportError:
        return False
    png.parent.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf)
    try:
        page = doc.load_page(0)
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        pix.save(png)
        return True
    except Exception as e:
        print(f"pymupdf failed for {pdf}: {e}", file=sys.stderr)
        return False
    finally:
        doc.close()


def title_from_pdf(p: Path) -> str:
    name = p.stem.replace("_", " ").replace("-", " ")
    return name.strip() or p.name


def main() -> int:
    if not DATA.is_dir():
        print(f"Missing {DATA}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    pdfs = sorted(DATA.rglob("*.pdf"))
    if not pdfs:
        print("No PDFs found under data/", file=sys.stderr)
        return 1

    topics: dict[str, list[dict]] = {}

    for pdf in pdfs:
        try:
            rel = pdf.relative_to(REPO).as_posix()
        except ValueError:
            continue
        if rel in EXCLUDED_PDF_PATHS:
            continue
        parts = rel.split("/")
        if len(parts) < 3 or parts[0] != "data":
            continue
        topic_slug = parts[1]
        doc_id = stable_id(rel)
        png = OUT_DIR / f"{doc_id}.png"

        if not png.exists():
            if not pdf_to_png_pdftoppm(pdf, png):
                if not pdf_to_png_pymupdf(pdf, png):
                    print(f"Skip thumbnail for {rel}", file=sys.stderr)
                    continue

        pdf_url = "/" + quote(rel)
        thumb_url = f"/assets/images/work-pdf-thumbs/{doc_id}.png"
        item = {
            "id": doc_id,
            "title": title_from_pdf(pdf),
            "pdf_path": rel,
            "pdf_url": pdf_url,
            "thumb_url": thumb_url,
        }
        topics.setdefault(topic_slug, []).append(item)

    ordered_slugs = sorted(
        topics.keys(),
        key=lambda s: (TOPIC_LABELS.get(s, s), s),
    )

    yaml_lines = [
        "# Auto-generated by scripts/generate_work_portfolio.py — do not hand-edit.",
        "# Re-run: python3 scripts/generate_work_portfolio.py",
        "topics:",
    ]

    for slug in ordered_slugs:
        label = TOPIC_LABELS.get(slug, slug.replace("-", " ").replace("_", " ").title())
        yaml_lines.append(f"  - slug: {json.dumps(slug)}")
        yaml_lines.append(f"    label: {json.dumps(label)}")
        yaml_lines.append("    items:")
        for it in sorted(topics[slug], key=lambda x: x["title"].lower()):
            yaml_lines.append(f"      - id: {json.dumps(it['id'])}")
            yaml_lines.append(f"        title: {json.dumps(it['title'])}")
            yaml_lines.append(f"        pdf_path: {json.dumps(it['pdf_path'])}")
            yaml_lines.append(f"        pdf_url: {json.dumps(it['pdf_url'])}")
            yaml_lines.append(f"        thumb_url: {json.dumps(it['thumb_url'])}")

    YAML_OUT.write_text("\n".join(yaml_lines) + "\n", encoding="utf-8")
    print(f"Wrote {YAML_OUT} ({len(pdfs)} pdfs scanned, {sum(len(v) for v in topics.values())} with thumbs)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
