"""End-to-end: PDFs in -> per-form .tex/.pdf, readable content .tex, one consolidated packet.

    forms-engine convert samples/*.pdf --out out/
    forms-engine fill out/ --resume resume.txt --plot "near Shallowater, Texas" --github octocat
"""
from __future__ import annotations

import argparse
import json
import re
import time
import zipfile
from pathlib import Path

import pymupdf
import pypdf

from . import canonical, consolidate, content, fill, latex, llm, profile
from .acro import form_from_acroform
from .flat import form_from_scan
from .xfa import form_from_xfa, is_placeholder_only, read_template


def identify(pdf: Path) -> tuple[str, str]:
    title = (pypdf.PdfReader(pdf).metadata or {}).get("/Title") or pdf.stem
    m = re.match(r"\s*([A-Z]{2,4})[- ]?(\d{3,5}[A-Z]?)", title) or re.match(r"([A-Z]{2,4})[- ]?(\d{3,5}[A-Z]?)", pdf.stem.upper())
    form_id = f"{m.group(1)}-{m.group(2)}" if m else re.sub(r"\W+", "-", pdf.stem)[:20]
    return form_id, str(title)


def detect_kind(pdf: Path) -> str:
    if read_template(str(pdf)) and is_placeholder_only(str(pdf)):
        return "xfa"
    doc = pymupdf.open(pdf)
    if any(True for p in doc for _ in (p.widgets() or [])):
        return "acroform"
    return "flat"


def convert(pdfs: list[Path], out: Path, *, readable: bool = True, review: bool = True, log=print) -> dict:
    out.mkdir(parents=True, exist_ok=True)
    work = out / "work"
    manifest: dict = {"forms": [], "timings": {}}
    parts = []
    forms = []
    t0 = time.time()
    for pdf in pdfs:
        t = time.time()
        form_id, title = identify(pdf)
        kind = detect_kind(pdf)
        log(f"{form_id}: {kind}")
        if kind == "xfa":
            form = form_from_xfa(str(pdf), form_id, title)
        elif kind == "acroform":
            form = form_from_acroform(str(pdf), form_id, title)
        else:
            form = form_from_scan(str(pdf), form_id, title, work)
            llm.vlm_label_fields(form)
        canonical.classify_all(form.fields)
        tex, fmap = latex.write_form_tex(form, out / "tex")
        built = latex.compile_tex(tex)
        rev = {}
        if review and llm.claude_enabled():
            png = out / "tex" / f"{tex.stem}-p1.png"
            pymupdf.open(built)[0].get_pixmap(dpi=110).save(png)
            rev = llm.claude_review(form, tex, fmap, png)
            if rev.get("applied"):
                for f in form.fields:
                    f.canonical = None
                canonical.classify_all(form.fields)
                tex, fmap = latex.write_form_tex(form, out / "tex")
                built = latex.compile_tex(tex)
        readable_tex = None
        cached = out / "tex" / f"{tex.stem}-content.tex"
        if readable and cached.exists() and cached.stat().st_mtime > pdf.stat().st_mtime:
            readable_tex = cached
        elif readable:
            try:
                readable_tex = content.content_tex(built, out / "tex" / f"{tex.stem}-content.tex", title, ocr=(kind == "flat"))
            except Exception as e:  # docling is heavy; never block the fillable output on it
                form.notes.append(f"Readable export skipped: {e.__class__.__name__}: {str(e)[:120]}")
        forms.append(form)
        parts.append((form, built, fmap))
        manifest["forms"].append({
            "form_id": form_id, "title": title, "kind": kind, "pages": len(form.pages),
            "fields": len(form.fields), "linked": sum(1 for f in form.fields if f.canonical),
            "tex": f"tex/{tex.name}", "pdf": f"tex/{built.name}",
            "content_tex": f"tex/{readable_tex.name}" if readable_tex else None,
            "notes": form.notes, "review": rev,
            "field_table": [{"uid": f.uid, "page": f.page, "kind": f.kind, "label": f.label[:140], "label_source": f.label_source,
                             "canonical": f.canonical, "confidence": round(f.canonical_confidence, 2),
                             "rule": f.canonical_rule, "autofill": f.autofill_allowed} for f in form.fields],
        })
        manifest["timings"][form_id] = round(time.time() - t, 1)
    cover = consolidate.cover_sheet(forms, out / "tex")  # (pdf, fieldmap)
    report = consolidate.build_packet(cover, parts, out / "packet.pdf")
    manifest["packet"] = {"pdf": "packet.pdf", **report}
    manifest["timings"]["total"] = round(time.time() - t0, 1)
    (out / "manifest.json").write_text(json.dumps(manifest, indent=1))
    with zipfile.ZipFile(out / "latex-sources.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for p in sorted((out / "tex").glob("*")):
            if p.suffix in (".tex", ".json", ".md") or p.name.endswith("-source.pdf") or p.suffix in (".png", ".jpg") and "-p" in p.stem:
                z.write(p, f"latex/{p.name}")
    return manifest


def main(argv=None):
    ap = argparse.ArgumentParser(prog="forms-engine")
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("convert")
    c.add_argument("pdfs", nargs="+", type=Path)
    c.add_argument("--out", type=Path, default=Path("out"))
    c.add_argument("--no-readable", action="store_true")
    c.add_argument("--no-review", action="store_true")
    f = sub.add_parser("fill")
    f.add_argument("out", type=Path)
    f.add_argument("--resume", type=Path)
    f.add_argument("--plot", default="")
    f.add_argument("--github", default="")
    a = ap.parse_args(argv)
    if a.cmd == "convert":
        m = convert(a.pdfs, a.out, readable=not a.no_readable, review=not a.no_review)
        print(json.dumps({k: m[k] for k in ("packet", "timings")}, indent=1))
    else:
        prof = profile.build(a.resume.read_text() if a.resume else "", a.plot, a.github)
        (a.out / "profile.json").write_text(json.dumps(prof.to_dict(), indent=1))
        rep = fill.fill_packet(a.out / "packet.pdf", prof.plain(), a.out / "packet-filled.pdf")
        print(json.dumps({"profile": prof.to_dict(), "fill": rep}, indent=1))


if __name__ == "__main__":
    main()
