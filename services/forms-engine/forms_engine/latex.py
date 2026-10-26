"""Write a Form as LaTeX (TikZ for layout, hyperref for form fields) and compile it.

Each widget gets a stable LaTeX field name (`f0001`, `f0002`, ...). The mapping from
those names back to the source field, its label and its canonical key is saved
next to the .tex file; `consolidate.py` uses it to give fields that ask for the
same thing one shared PDF field.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

from .model import Form, FormField, Page, TextItem

_SPECIAL = {
    "\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#",
    "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
}
_UNICODE = {
    "’": "'", "‘": "`", "“": "``", "”": "''", "–": "--", "—": "---",
    "•": r"\textbullet{}", " ": "~", "…": r"\ldots{}", "§": r"\S{}",
    "®": r"\textregistered{}", "©": r"\textcopyright{}", "™": r"\texttrademark{}",
    "°": r"\textdegree{}", "≤": r"$\le$", "≥": r"$\ge$", "½": r"\textonehalf{}",
    "☐": r"$\square$", "☑": r"$\boxtimes$", "✓": r"\checkmark{}", "●": r"\textbullet{}",
    "é": r"\'e", "ñ": r"\~n", "í": r"\'i", "á": r"\'a", "ó": r"\'o",
}


def esc(s: str) -> str:
    out = []
    for ch in s:
        if ch in _SPECIAL:
            out.append(_SPECIAL[ch])
        elif ch in _UNICODE:
            out.append(_UNICODE[ch])
        elif ord(ch) < 128:
            out.append(ch)
        else:
            out.append("?")  # glyph outside the T1/pdfTeX set; logged by the review step
    return "".join(out)


def _rgb(c) -> str:
    return "{rgb,255:red,%d;green,%d;blue,%d}" % c


PREAMBLE = r"""\documentclass{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{helvet}
\renewcommand{\familydefault}{\sfdefault}
\usepackage{amssymb}
\usepackage{textcomp}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{tikz}
\usepackage[paperwidth=%(w).2fbp,paperheight=%(h).2fbp,margin=0pt]{geometry}
\usepackage[pdftitle={%(title)s},pdfsubject={%(form_id)s rebuilt by forms-engine},hidelinks]{hyperref}
\pagestyle{empty}
\setlength{\parindent}{0pt}
%% Fields are drawn on their own; the printed labels already describe them.
\def\LayoutTextField#1#2{#2}
\def\LayoutCheckField#1#2{#2}
\def\LayoutChoiceField#1#2{#2}
\newcommand{\at}[2]{([xshift=#1bp,yshift=-#2bp]current page.north west)}
%% Single-line labels: never wrap; shrink horizontally if the font runs wider than the box.
\newsavebox{\fitb}
\newcommand{\fitbox}[2]{\sbox{\fitb}{#2}\ifdim\wd\fitb>#1\resizebox{#1}{!}{\usebox{\fitb}}\else\usebox{\fitb}\fi}
\begin{document}
\begin{Form}
"""


def _text_node(t: TextItem) -> str:
    size = max(t.size, 4.0)
    font = r"\fontsize{%.1f}{%.1f}\selectfont" % (size, size * 1.18)
    if t.bold:
        font += r"\bfseries"
    if t.italic:
        font += r"\itshape"
    body = esc(t.text).replace("\n", r"\\ ")
    single = "\n" not in t.text and (not t.h or t.h <= size * 1.9)
    if single and t.w and t.w > 2:
        x, y = t.x, t.y
        anchor = "north west"
        if t.valign == "middle" and t.h:
            anchor, y = "west", t.y + t.h / 2
        elif t.valign == "bottom" and t.h:
            anchor, y = "south west", t.y + t.h
        if t.halign == "center":
            anchor, x = anchor.replace("west", "").strip() or "center", t.x + t.w / 2
            anchor = {"north": "north", "": "center", "south": "south"}.get(anchor, anchor)
        elif t.halign == "right":
            anchor, x = anchor.replace("west", "east"), t.x + t.w
        color = "" if t.color == (0, 0, 0) else r"\color[RGB]{%d,%d,%d}" % t.color
        return r"\node[anchor=%s,inner sep=0pt,outer sep=0pt] at \at{%.2f}{%.2f} {%s%s\fitbox{%.2fbp}{%s}};" % (
            anchor, x, y, color, font, t.w + 0.5, body)
    width = f",text width={t.w:.2f}bp" if t.w and t.w > 2 else ""
    align = {"center": "center", "right": "right"}.get(t.halign, "left") if width else None
    x, y = t.x, t.y
    anchor = "north west"
    if t.valign == "middle" and t.h:
        anchor, y = "west", t.y + t.h / 2
    elif t.valign == "bottom" and t.h:
        anchor, y = "south west", t.y + t.h
    color = "" if t.color == (0, 0, 0) else r"\color[RGB]{%d,%d,%d}" % t.color
    opts = f"anchor={anchor},inner sep=0pt,outer sep=0pt{width}" + (f",align={align}" if align else "")
    return r"\node[%s] at \at{%.2f}{%.2f} {%s%s %s};" % (opts, x, y, color, font, body)


def _field_cmd(f: FormField, tex_name: str) -> str:
    w, h = max(f.w, 6), max(f.h, 6)
    common = f"name={tex_name},width={w:.2f}bp,height={h:.2f}bp,borderwidth=0.4,bordercolor={{0.55 0.6 0.7}},backgroundcolor={{0.92 0.95 1}}"
    if f.kind in ("checkbox", "radio"):
        return r"\CheckBox[%s]{}" % common
    if f.kind == "choice" and f.options:
        opts = ",".join(esc(o).replace(",", " ") for o in f.options[:40])
        return r"\ChoiceMenu[combo,%s,charsize=7pt]{}{%s}" % (common, opts)
    size = 7 if h < 14 else 8
    extra = f",charsize={size}pt"
    if f.multiline or h > 26:
        extra += ",multiline=true"
    if f.max_chars:
        extra += f",maxlen={f.max_chars}"
    return r"\TextField[%s%s]{}" % (common, extra)


def write_form_tex(form: Form, out_dir: Path) -> tuple[Path, dict]:
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = form.form_id.replace(" ", "")
    first = form.pages[0]
    lines = [PREAMBLE % {"w": first.width, "h": first.height, "title": esc(form.title), "form_id": esc(form.form_id)}]
    fieldmap: dict[str, dict] = {}
    n = 0
    bg_copied = False
    for page in form.pages:
        if page is not first:
            lines.append(r"\newpage")
        lines.append(r"\begin{tikzpicture}[remember picture,overlay]")
        if page.background_pdf:
            if not bg_copied:
                shutil.copy(page.background_pdf, out_dir / f"{stem}-source.pdf")
                bg_copied = True
            lines.append(r"\node[anchor=north west,inner sep=0pt] at (current page.north west) {\includegraphics[page=%d,width=%.2fbp,height=%.2fbp]{%s-source.pdf}};"
                         % (page.background_page, page.width, page.height, stem))
        elif page.background_png:
            png = Path(page.background_png)
            shutil.copy(png, out_dir / png.name)
            lines.append(r"\node[anchor=north west,inner sep=0pt] at (current page.north west) {\includegraphics[width=%.2fbp,height=%.2fbp]{%s}};"
                         % (page.width, page.height, png.name))
        for r in page.rects:
            fill = f"fill={_rgb(r.fill)}" if r.fill else ""
            draw = f"draw,line width={r.thickness:.2f}bp" if r.stroke else ""
            style = ",".join(s for s in (fill, draw) if s)
            if style:
                lines.append(r"\path[%s] \at{%.2f}{%.2f} rectangle \at{%.2f}{%.2f};" % (style, r.x, r.y, r.x + r.w, r.y + r.h))
        for ln in page.lines:
            lines.append(r"\draw[line width=%.2fbp] \at{%.2f}{%.2f} -- \at{%.2f}{%.2f};" % (ln.thickness, ln.x1, ln.y1, ln.x2, ln.y2))
        for t in page.texts:
            lines.append(_text_node(t))
        for f in page.fields:
            n += 1
            tex_name = f"f{n:04d}"
            fieldmap[tex_name] = f.to_dict()
            lines.append(r"\node[anchor=north west,inner sep=0pt] at \at{%.2f}{%.2f} {%s};" % (f.x, f.y, _field_cmd(f, tex_name)))
        lines.append(r"\end{tikzpicture}")
        lines.append(r"\null")
    lines.append(r"\end{Form}")
    lines.append(r"\end{document}")
    tex = out_dir / f"{stem}.tex"
    tex.write_text("\n".join(lines), encoding="utf-8")
    (out_dir / f"{stem}.fields.json").write_text(json.dumps(fieldmap, indent=1))
    return tex, fieldmap


def compile_tex(tex: Path, runs: int = 2, timeout: int = 240) -> Path:
    """pdflatex twice (TikZ `remember picture` needs the second pass)."""
    for _ in range(runs):
        p = subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", tex.name],
            cwd=tex.parent, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout,
        )
        if p.returncode != 0:
            log = (tex.parent / (tex.stem + ".log"))
            tail = log.read_text(errors="replace")[-3000:] if log.exists() else p.stdout[-3000:]
            raise RuntimeError(f"pdflatex failed for {tex.name}:\n{tail}")
    return tex.with_suffix(".pdf")
