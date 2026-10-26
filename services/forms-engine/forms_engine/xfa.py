"""Read the XFA template inside an Adobe-only PDF and lay it out as positioned items.

Many USDA eForms are *dynamic XFA*: the PDF's real page is a placeholder that says
"requires Adobe Reader 8 or higher", and the actual form lives in an XML template.
Browsers, Preview and most PDF libraries show only the placeholder. This module
walks that template (pages, positioned subforms, text and rectangle draws,
fields, radio groups, captions) and produces the engine's page model, which the
LaTeX writer then turns into an ordinary, portable PDF with real form fields.

Scope: positioned layouts (what USDA's designers used) are reproduced exactly;
flowed sub-layouts are approximated by stacking children top-to-bottom.
"""
from __future__ import annotations

import html
import re
import xml.etree.ElementTree as ET
from typing import Optional

import pikepdf

from .model import FormField, Form, Page, RectItem, LineItem, TextItem, to_pt

# Adobe Reader UI chrome that USDA's templates add around the form (print/save/reset
# buttons, a vertical form-number strip). Not part of the form itself.
SKIP_SUBFORMS = {"sf_Top_Buttons", "sf_Bottom_Buttons", "sf_RightSide_Fields"}
SKIP_FIELD_PREFIXES = ("Button", "confNbr", "custName", "date", "PrintButton", "ResetButton")


def read_template(pdf_path: str) -> Optional[str]:
    with pikepdf.open(pdf_path) as pdf:
        acro = pdf.Root.get("/AcroForm")
        if acro is None or "/XFA" not in acro:
            return None
        xfa = acro.XFA
        if isinstance(xfa, pikepdf.Stream):
            data = xfa.read_bytes().decode("utf-8", "replace")
            m = re.search(r"<template\b.*?</template>", data, flags=re.S)
            return m.group(0) if m else None
        for i in range(0, len(xfa), 2):
            if str(xfa[i]) == "template":
                return xfa[i + 1].read_bytes().decode("utf-8", "replace")
    return None


def is_placeholder_only(pdf_path: str) -> bool:
    """True when the visible page is Adobe's 'please upgrade' placeholder."""
    import pypdf
    r = pypdf.PdfReader(pdf_path)
    text = " ".join((p.extract_text() or "") for p in r.pages[:2])
    return "requires Adobe Reader" in text or "Please wait..." in text


def _strip_ns(xml_text: str) -> ET.Element:
    xml_text = re.sub(r"<\?[^>]*\?>", "", xml_text)
    root = ET.fromstring(xml_text)
    for el in root.iter():
        if isinstance(el.tag, str) and "}" in el.tag:
            el.tag = el.tag.split("}", 1)[1]
    return root


def _color(el: Optional[ET.Element]) -> Optional[tuple[int, int, int]]:
    if el is None:
        return None
    c = el.find("color")
    if c is None or not c.get("value"):
        return None
    try:
        r, g, b = (int(v) for v in c.get("value").split(",")[:3])
        return (r, g, b)
    except ValueError:
        return None


def _font(el: ET.Element) -> tuple[float, bool, bool, tuple[int, int, int]]:
    f = el.find("font")
    size, bold, italic, color = 9.0, False, False, (0, 0, 0)
    if f is not None:
        size = to_pt(f.get("size"), "pt") or size
        bold = f.get("weight") == "bold"
        italic = f.get("posture") == "italic"
        color = _color(f.find("fill")) or color
    return size, bold, italic, color


def _exdata_text(ex: ET.Element) -> tuple[str, Optional[float], bool]:
    raw = ET.tostring(ex, encoding="unicode")
    size = None
    m = re.search(r"font-size:\s*([0-9.]+)pt", raw)
    if m:
        size = float(m.group(1))
    bold = "font-weight:bold" in raw.replace(" ", "")
    raw = re.sub(r"<br\s*/?>", "\n", raw)
    raw = re.sub(r"</p\s*>", "\n", raw)
    raw = re.sub(r"<[^>]+>", "", raw)
    text = html.unescape(raw)
    text = "\n".join(re.sub(r"[ \t ]+", " ", ln).strip() for ln in text.splitlines())
    return text.strip(), size, bold


def _geom(el: ET.Element):
    x = to_pt(el.get("x")) or 0.0
    y = to_pt(el.get("y")) or 0.0
    w = to_pt(el.get("w")) or to_pt(el.get("minW"))
    h = to_pt(el.get("h")) or to_pt(el.get("minH"))
    return x, y, w, h


def estimate_height(text: str, size: float, width: Optional[float]) -> float:
    """Rendered height of wrapped Helvetica/Arial text (average glyph ~0.5 em)."""
    import math
    per_line = max(int((width or 10_000) / (size * 0.5)), 1)
    n = sum(max(1, math.ceil(len(line) / per_line)) for line in text.splitlines() or [""])
    return n * size * 1.18


def humanize(name: str) -> str:
    s = re.sub(r"\[\d+\]", "", name)
    s = s.split(".")[-1]
    s = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", s)
    s = s.replace("_", " ")
    return re.sub(r"\s+", " ", s).strip()


class _Walker:
    def __init__(self, form_id: str):
        self.form_id = form_id
        self.page: Optional[Page] = None
        self.counter = 0

    def walk(self, el: ET.Element, ox: float, oy: float, group: Optional[str] = None) -> float:
        """Lay out `el` with its parent's origin at (ox, oy); return the height it occupies."""
        tag = el.tag
        if el.get("presence") in ("hidden", "invisible", "inactive"):
            return 0.0
        if tag in ("subform", "area", "exclGroup"):
            if el.get("name") in SKIP_SUBFORMS:
                return 0.0
            x, y, w, h = _geom(el)
            bx, by = ox + x, oy + y
            g = el.get("name") if tag == "exclGroup" else group
            layout = el.get("layout")
            used = 0.0
            if layout in (None, "position"):
                for c in el:
                    ch = self.walk(c, bx, by, g)
                    used = max(used, (to_pt(c.get("y")) or 0) + ch)
            else:  # flowed (tb): stack children by their rendered height
                cy = by
                for c in el:
                    if c.tag not in ("subform", "draw", "field", "exclGroup", "area"):
                        continue
                    ch = self.walk(c, bx, cy - (to_pt(c.get("y")) or 0), g)
                    cy += ch
                used = cy - by
            fixed = to_pt(el.get("h"))
            return fixed if fixed is not None else used
        if tag == "draw":
            return self._draw(el, ox, oy)
        if tag == "field":
            self._field(el, ox, oy, group)
            return _geom(el)[3] or 12.0
        return 0.0

    def _draw(self, el, ox, oy) -> float:
        x, y, w, h = _geom(el)
        x, y = ox + x, oy + y
        val = el.find("value")
        if val is None:
            return h or 0.0
        before = len(self.page.texts)
        size, bold, italic, color = _font(el)
        para = el.find("para")
        halign = para.get("hAlign", "left") if para is not None else "left"
        valign = para.get("vAlign", "top") if para is not None else "top"
        t = val.find("text")
        ex = val.find("exData")
        if t is not None and (t.text or "").strip():
            self.page.texts.append(TextItem(x, y, w, h, t.text.strip(), size, bold, italic, color, halign, valign))
        elif ex is not None:
            text, s2, b2 = _exdata_text(ex)
            if text:
                self.page.texts.append(TextItem(x, y, w, h, text, s2 or size, bold or b2, italic, color, halign, valign))
        elif val.find("rectangle") is not None:
            r = val.find("rectangle")
            edge = r.find("edge")
            stroke = None if (edge is not None and edge.get("presence") == "hidden") else (0, 0, 0)
            thick = to_pt(edge.get("thickness"), "pt") if edge is not None and edge.get("thickness") else 0.5
            fill = _color(r.find("fill"))
            if w and h:
                self.page.rects.append(RectItem(x, y, w, h, fill, stroke, thick or 0.5))
        elif val.find("line") is not None:
            ln = val.find("line")
            edge = ln.find("edge")
            thick = to_pt(edge.get("thickness"), "pt") if edge is not None and edge.get("thickness") else 0.5
            w, h = w or 0.0, h or 0.0
            if ln.get("slope") == "/":
                self.page.lines.append(LineItem(x, y + h, x + w, y, thick))
            else:
                self.page.lines.append(LineItem(x, y, x + w, y + h, thick))
        if len(self.page.texts) > before:
            t = self.page.texts[-1]
            return max(h or 0.0, estimate_height(t.text, t.size, t.w))
        return h or 0.0

    def _field(self, el, ox, oy, group):
        name = el.get("name") or ""
        ui = el.find("ui")
        kind_el = next((c for c in ui), None) if ui is not None else None
        kind_tag = kind_el.tag if kind_el is not None else "textEdit"
        if kind_tag in ("button", "barcode", "imageEdit") or name.startswith(SKIP_FIELD_PREFIXES):
            return
        x, y, w, h = _geom(el)
        x, y = ox + x, oy + y
        w, h = w or 12.0, h or 12.0
        size, *_ = _font(el)
        tip = ""
        assist = el.find("assist")
        if assist is not None:
            for k in ("toolTip", "speak"):
                e = assist.find(k)
                if e is not None and (e.text or "").strip():
                    tip = re.sub(r"\s+", " ", e.text).strip()
                    break
        # Caption: drawn text inside the field box, reserving part of it.
        cap = el.find("caption")
        cap_text = ""
        if cap is not None and cap.get("presence") not in ("hidden", "invisible"):
            cv = cap.find("value")
            if cv is not None:
                t = cv.find("text")
                ex = cv.find("exData")
                cap_text = (t.text or "").strip() if t is not None else (_exdata_text(ex)[0] if ex is not None else "")
        if cap_text:
            placement = cap.get("placement", "left")
            csize, cbold, _, ccolor = _font(cap)
            reserve = to_pt(cap.get("reserve"))
            if placement == "top":
                reserve = reserve or min(h * 0.45, csize * 1.4)
                self.page.texts.append(TextItem(x + 1, y, w, reserve, cap_text, csize, cbold, False, ccolor))
                y, h = y + reserve, max(h - reserve, 8)
            elif placement in ("left", None):
                if kind_tag == "checkButton":
                    reserve = reserve if reserve is not None else max(w - h, 0)
                    # checkbox drawn first, caption to its right (XFA default for check buttons)
                    self.page.texts.append(TextItem(x + h + 2, y, max(w - h - 2, 10), h, cap_text, csize, cbold, False, ccolor, valign="middle"))
                    w = h
                else:
                    reserve = reserve or min(w * 0.4, len(cap_text) * csize * 0.5)
                    self.page.texts.append(TextItem(x, y, reserve, h, cap_text, csize, cbold, False, ccolor, valign="middle"))
                    x, w = x + reserve, max(w - reserve, 8)
        kind = {
            "textEdit": "text", "checkButton": "checkbox", "choiceList": "choice",
            "dateTimeEdit": "date", "numericEdit": "number", "signature": "signature",
            "passwordEdit": "text",
        }.get(kind_tag, "text")
        if kind == "checkbox" and (group or (kind_el is not None and kind_el.get("shape") == "round")):
            kind = "radio"
        options = []
        if kind == "choice":
            items = el.find("items")
            if items is not None:
                options = [(i.text or "").strip() for i in items if (i.text or "").strip()]
        if kind == "radio":
            items = el.find("items")
            on = next(((i.text or "").strip() for i in (items if items is not None else []) if (i.text or "").strip()), "")
            name = name or f"{group}_{on or len(self.page.fields)}"
        if not name:
            self.counter += 1
            name = f"unnamed_{self.counter}"
        multiline = kind_el is not None and kind_el.get("multiLine") == "1"
        mc = el.find("value/text")
        max_chars = int(mc.get("maxChars")) if mc is not None and mc.get("maxChars", "").isdigit() else None
        label = tip or cap_text or humanize(name)
        src = "tooltip" if tip else ("caption" if cap_text else "name")
        self.page.fields.append(FormField(
            form=self.form_id, page=self.page.number, name=name, kind=kind,
            x=x, y=y, w=w, h=h, label=label, tooltip=tip, multiline=multiline,
            max_chars=max_chars, group=group if kind == "radio" else None,
            options=options, label_source=src,
        ))


def form_from_xfa(pdf_path: str, form_id: str, title: str) -> Form:
    tpl = read_template(pdf_path)
    if not tpl:
        raise ValueError("no XFA template")
    root = _strip_ns(tpl)
    top = root.find("subform")
    form = Form(form_id=form_id, title=title, source=pdf_path, kind="xfa")
    walker = _Walker(form_id)
    # master-page content (headers/footers) drawn on every page
    master = []
    ps = top.find("pageSet")
    if ps is not None:
        for pa in ps.iter("pageArea"):
            master.extend(c for c in pa if c.tag in ("draw", "field", "subform"))
    pages = [c for c in top if c.tag == "subform" and c.get("presence") not in ("hidden",)]
    if not pages:
        pages = [top]
    for i, psf in enumerate(pages, start=1):
        _, _, w, h = _geom(psf)
        page = Page(number=i, width=w or 612.0, height=h or 792.0)
        walker.page = page
        for m in master:
            walker.walk(m, 0, 0)
        for c in psf:
            walker.walk(c, 0, 0)
        if page.texts or page.fields:
            page.number = len(form.pages) + 1
            for f in page.fields:
                f.page = page.number
            form.pages.append(page)
    form.notes.append(f"Rebuilt from the XFA template: {len(form.pages)} page(s), {len(form.fields)} fields.")
    return form
