"""Forms whose pages already carry the printed form (AcroForm or static XFA).

The original page is kept as a vector background (`\\includegraphics[page=n]`), and
every widget is re-created as a hyperref field at the same rectangle. Labels come
from the widget's tooltip; when a form has none, the nearest printed words to the
left of or above the widget are used.
"""
from __future__ import annotations

import re

import pymupdf

from .model import Form, FormField, Page
from .xfa import humanize

_KIND = {
    "Text": "text", "CheckBox": "checkbox", "RadioButton": "radio", "ComboBox": "choice",
    "ListBox": "choice", "Signature": "signature",
}


def _nearby_label(words, r: pymupdf.Rect) -> str:
    """Printed words on the same line to the left, else the line just above."""
    left = [w for w in words if abs(((w[1] + w[3]) / 2) - ((r.y0 + r.y1) / 2)) < max(r.height / 2, 5)
            and w[2] <= r.x0 + 2 and r.x0 - w[2] < 160]
    if left:
        left.sort(key=lambda w: w[0])
        return " ".join(w[4] for w in left)[-90:]
    above = [w for w in words if 0 <= r.y0 - w[3] < 16 and w[0] < r.x1 and w[2] > r.x0 - 4]
    above.sort(key=lambda w: (w[1], w[0]))
    return " ".join(w[4] for w in above)[:90]


def form_from_acroform(pdf_path: str, form_id: str, title: str) -> Form:
    doc = pymupdf.open(pdf_path)
    form = Form(form_id=form_id, title=title, source=pdf_path, kind="acroform")
    for pno, pg in enumerate(doc, start=1):
        rect = pg.rect
        page = Page(number=pno, width=rect.width, height=rect.height,
                    background_pdf=pdf_path, background_page=pno)
        words = pg.get_text("words")
        headings = []  # (y, text) of "PART X - ..." lines, used as section context
        for b in pg.get_text("dict")["blocks"]:
            for ln in b.get("lines", []):
                t = "".join(sp["text"] for sp in ln["spans"]).strip()
                if re.match(r"^PART [A-Z0-9]{1,2}\b", t):
                    headings.append((ln["bbox"][1], t[:80]))
        headings.sort()
        for w in pg.widgets() or []:
            kind = _KIND.get(w.field_type_string)
            if kind is None:
                continue
            r = w.rect
            name = w.field_name or f"p{pno}_{len(page.fields)}"
            tip = re.sub(r"\s+", " ", (w.field_label or "")).strip()
            near = "" if tip else _nearby_label(words, r)
            label = tip or near or humanize(name)
            group = None
            if kind == "radio":
                group = name
                on = (w.on_state() or "") if hasattr(w, "on_state") else ""
                name = f"{name}={on}" if on and on is not True else f"{name}={len(page.fields)}"
            section = next((t for y, t in reversed(headings) if y <= r.y0 + 1), "")
            page.fields.append(FormField(
                form=form_id, page=pno, name=name, kind=kind, section=section,
                x=r.x0, y=r.y0, w=r.width, h=r.height, label=label, tooltip=tip,
                multiline=bool(w.field_flags & 4096) if kind == "text" else False,
                max_chars=w.text_maxlen or None if kind == "text" else None,
                group=group, options=list(w.choice_values or []) if kind == "choice" else [],
                label_source="tooltip" if tip else ("nearby-text" if near else "name"),
            ))
        form.pages.append(page)
    form.notes.append(f"Kept {len(form.pages)} original page(s) as vector backgrounds; re-created {len(form.fields)} fields.")
    return form
