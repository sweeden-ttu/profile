"""Scanned or flattened forms: no XFA, no widgets, maybe no text layer.

1. Rasterize each page (or use the scan as-is).
2. OCR with Tesseract for words and their boxes.
3. Find fill-in places from the pixels: long horizontal rules (underlines and box
   bottoms) with empty space above them, and small empty squares (checkboxes).
4. Label each place with the OCR words just left of it, or just above it.
5. Optionally ask a local vision-language model to name fields whose OCR label
   is weak (see llm.py). Every label records which step produced it.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pymupdf
import pytesseract
from PIL import Image

from .model import Form, FormField, Page

DPI = 200
S = 72.0 / DPI  # pixels -> points


def _ocr_words(img: Image.Image) -> list[tuple[float, float, float, float, str, float]]:
    d = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT, config="--psm 11")
    out = []
    for i, t in enumerate(d["text"]):
        t = (t or "").strip()
        conf = float(d["conf"][i]) if d["conf"][i] not in ("-1", -1) else -1
        if t and conf > 30:
            x, y, w, h = d["left"][i], d["top"][i], d["width"][i], d["height"][i]
            out.append((x * S, y * S, (x + w) * S, (y + h) * S, t, conf))
    return out


def _runs(mask: np.ndarray, min_len: int) -> list[tuple[int, int, int]]:
    """Horizontal runs of dark pixels: (row, x0, x1)."""
    runs = []
    for r in range(mask.shape[0]):
        row = mask[r]
        if row.sum() < min_len:
            continue
        d = np.diff(np.concatenate(([0], row.astype(np.int8), [0])))
        starts, ends = np.where(d == 1)[0], np.where(d == -1)[0]
        for s, e in zip(starts, ends):
            if e - s >= min_len:
                runs.append((r, s, e))
    return runs


def _merge(runs):
    """Merge runs on adjacent rows into rules (thick lines show up as 2-3 rows)."""
    rules = []
    for r, s, e in sorted(runs):
        for rule in rules:
            if r - rule[1] <= 2 and abs(s - rule[2]) < 6 and abs(e - rule[3]) < 6:
                rule[1] = r
                break
        else:
            rules.append([r, r, s, e])
    return rules


def _vruns(mask: np.ndarray, min_len: int):
    return [(c, a, b) for c, a, b in _runs(mask.T, min_len)]


def detect_fields(img: Image.Image, words, page_no: int, form_id: str) -> list[FormField]:
    g = np.asarray(img.convert("L"))
    dark = g < 150
    H, W = dark.shape
    fields: list[FormField] = []
    taken: list[tuple[float, float, float, float]] = []

    def add(kind, X0, Y0, X1, Y1, label=""):
        for a in taken:  # skip duplicates of an existing place
            if X0 < a[2] and X1 > a[0] and Y0 < a[3] and Y1 > a[1]:
                return
        taken.append((X0, Y0, X1, Y1))
        n = len(fields) + 1
        fields.append(FormField(form=form_id, page=page_no, name=f"p{page_no}_{'c' if kind == 'checkbox' else 't'}{n}",
                                kind=kind, x=X0, y=Y0, w=X1 - X0, h=Y1 - Y0, label=label, label_source="ocr"))

    hr = _merge(_runs(dark, int(0.35 * DPI)))                 # horizontal rules >= 0.35 in
    vr = _merge(_vruns(dark, int(0.12 * DPI)))                # vertical rules >= 0.12 in (col, row0, row1)
    # 1) boxed cells: two stacked horizontal rules, split by vertical rules between them
    hr_sorted = sorted(hr, key=lambda r: r[0])
    for i, (ra, _, xa0, xa1) in enumerate(hr_sorted):
        below = next((r for r in hr_sorted[i + 1:] if r[0] - ra > int(0.1 * DPI)
                      and min(xa1, r[3]) - max(xa0, r[2]) > 0.5 * (xa1 - xa0)), None)
        if below is None or below[0] - ra > int(1.2 * DPI):
            continue
        rb = below[0]
        x0, x1 = max(xa0, below[2]), min(xa1, below[3])
        cuts = sorted({c for c, _c1, v0, v1 in vr if x0 + 4 < c < x1 - 4 and v0 <= ra + 6 and v1 >= rb - 6})
        edges = [x0] + cuts + [x1]
        for cx0, cx1 in zip(edges, edges[1:]):
            if cx1 - cx0 < int(0.5 * DPI):
                continue
            X0, X1, Y0, Y1 = cx0 * S + 1, cx1 * S - 1, ra * S + 1, rb * S - 1
            inside = [w for w in words if w[0] >= X0 - 2 and w[2] <= X1 + 2 and w[1] >= Y0 - 2 and w[3] <= Y1 + 2]
            text_bottom = max((w[3] for w in inside), default=Y0)
            gap_top = text_bottom + 1.5
            if Y1 - gap_top >= 9:
                gy0, gy1 = int(gap_top / S), int((Y1 - 1) / S)
                ink = dark[gy0:gy1, int(X0 / S) + 3:int(X1 / S) - 3].mean() if gy1 > gy0 else 1
                if ink < 0.02:
                    label = " ".join(w[4] for w in sorted(inside, key=lambda w: (round(w[1] / 4), w[0])))[:110]
                    add("text", X0 + 1, gap_top, X1 - 1, Y1 - 1, label)
    # 2) underlines with blank space above (fill-in-the-blank lines)
    for r0, r1, x0, x1 in hr:
        if x1 - x0 > 0.92 * W or x1 - x0 < int(0.6 * DPI):
            continue
        top = max(r0 - int(0.17 * DPI), 0)
        X0, X1, Y0, Y1 = x0 * S, x1 * S, top * S, r0 * S
        occupied = [w for w in words if w[0] < X1 and w[2] > X0 and w[3] > Y0 + 2 and w[1] < Y1 - 1]
        ink = dark[top:r0 - 2, x0 + 4:x1 - 4].mean() if r0 - 2 > top else 1
        if not occupied and ink < 0.03:
            add("text", X0, Y0, X1, Y1)
    # 3) checkboxes: small empty squares
    for r0, r1, x0, x1 in _merge(_runs(dark, int(0.06 * DPI))):
        w = x1 - x0
        if not (int(0.06 * DPI) <= w <= int(0.16 * DPI)):
            continue
        bottom = r0 + w
        if bottom >= H or bottom - r0 < 6:
            continue
        sides = dark[r0:bottom, x0:x0 + 2].any(axis=1).mean() > 0.85 and dark[r0:bottom, x1 - 2:x1].any(axis=1).mean() > 0.85
        floor = dark[bottom - 2:bottom + 2, x0:x1].any(axis=0).mean() > 0.85
        inside = dark[r0 + 3:bottom - 3, x0 + 3:x1 - 3].mean()
        if sides and floor and inside < 0.06:
            add("checkbox", x0 * S, r0 * S, x1 * S, bottom * S)
    return fields


def label_from_words(f: FormField, words) -> str:
    cy = f.y + f.h / 2
    if f.kind == "checkbox":
        right = [w for w in words if abs((w[1] + w[3]) / 2 - cy) < 6 and 0 <= w[0] - (f.x + f.w) < 120]
        right.sort(key=lambda w: w[0])
        return " ".join(w[4] for w in right[:8])
    left = [w for w in words if abs((w[1] + w[3]) / 2 - (f.y + f.h * 0.7)) < 8 and 0 <= f.x - w[2] < 150]
    if left:
        left.sort(key=lambda w: w[0])
        return " ".join(w[4] for w in left)[-80:]
    above = [w for w in words if 0 <= f.y - w[3] < 14 and w[0] < f.x + f.w and w[2] > f.x - 2]
    above.sort(key=lambda w: (w[1], w[0]))
    return " ".join(w[4] for w in above)[:80]


def form_from_scan(pdf_path: str, form_id: str, title: str, work: Path) -> Form:
    doc = pymupdf.open(pdf_path)
    form = Form(form_id=form_id, title=title, source=pdf_path, kind="flat")
    work.mkdir(parents=True, exist_ok=True)
    for pno, pg in enumerate(doc, start=1):
        pix = pg.get_pixmap(dpi=DPI)
        png = work / f"{form_id}-p{pno}.png"
        pix.save(png)
        img = Image.open(png)
        words = _ocr_words(img)
        # Background for the rebuilt page: 150 dpi grayscale JPEG (OCR above used the 200 dpi PNG).
        bg = work / f"{form_id}-p{pno}-bg.jpg"
        img.convert("L").resize((int(img.width * 0.75), int(img.height * 0.75))).save(bg, quality=72, optimize=True)
        page = Page(number=pno, width=pg.rect.width, height=pg.rect.height, background_png=str(bg))
        for f in detect_fields(img, words, pno, form_id):
            f.label = f.label or label_from_words(f, words) or f.name
            f.tooltip = ""
            page.fields.append(f)
        page.ocr_words = words  # kept for the VLM/Claude passes
        form.pages.append(page)
    form.notes.append(f"Scanned input: OCR'd {len(form.pages)} page(s) at {DPI} dpi; detected {len(form.fields)} fill-in places.")
    return form
