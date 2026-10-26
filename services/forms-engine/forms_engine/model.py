"""Shared data model: a form is a list of pages; a page holds drawn items and fields.

All geometry is in PDF points (1/72 in) measured from the page's top-left corner,
which is how XFA and most layout tools describe it. The LaTeX writer converts to
the bottom-left origin PDF uses.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from typing import Literal, Optional

FieldKind = Literal["text", "checkbox", "radio", "choice", "date", "signature", "number"]


@dataclass
class TextItem:
    x: float
    y: float
    w: Optional[float]
    h: Optional[float]
    text: str
    size: float = 9.0
    bold: bool = False
    italic: bool = False
    color: tuple[int, int, int] = (0, 0, 0)
    halign: str = "left"
    valign: str = "top"


@dataclass
class RectItem:
    x: float
    y: float
    w: float
    h: float
    fill: Optional[tuple[int, int, int]] = None
    stroke: Optional[tuple[int, int, int]] = (0, 0, 0)
    thickness: float = 0.5


@dataclass
class LineItem:
    x1: float
    y1: float
    x2: float
    y2: float
    thickness: float = 0.5


@dataclass
class FormField:
    """One widget on one page. `name` is unique inside the source form."""
    form: str
    page: int
    name: str
    kind: FieldKind
    x: float
    y: float
    w: float
    h: float
    label: str = ""
    tooltip: str = ""
    multiline: bool = False
    max_chars: Optional[int] = None
    group: Optional[str] = None          # radio group / exclusion group
    options: list[str] = field(default_factory=list)
    # Filled in by later stages
    canonical: Optional[str] = None      # shared key, e.g. "first_name"
    canonical_confidence: float = 0.0
    canonical_rule: str = ""
    autofill_allowed: bool = True
    label_source: str = ""               # tooltip | name | nearby-text | ocr | vlm | claude
    section: str = ""                    # printed part/section heading above the field

    @property
    def uid(self) -> str:
        return f"{self.form}.p{self.page}.{slug(self.name)}"

    def to_dict(self) -> dict:
        d = asdict(self)
        d["uid"] = self.uid
        return d


@dataclass
class Page:
    number: int
    width: float = 612.0
    height: float = 792.0
    texts: list[TextItem] = field(default_factory=list)
    rects: list[RectItem] = field(default_factory=list)
    lines: list[LineItem] = field(default_factory=list)
    fields: list[FormField] = field(default_factory=list)
    background_pdf: Optional[str] = None     # vector background: original page
    background_page: Optional[int] = None    # 1-based page in background_pdf
    background_png: Optional[str] = None     # raster background (scanned input)


@dataclass
class Form:
    form_id: str                 # e.g. "AD-2047"
    title: str
    source: str                  # path of the input PDF
    kind: Literal["xfa", "acroform", "flat"]
    pages: list[Page] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    @property
    def fields(self) -> list[FormField]:
        return [f for p in self.pages for f in p.fields]


def slug(s: str) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")
    return s[:60] or "field"


_UNIT = {"pt": 1.0, "in": 72.0, "mm": 72.0 / 25.4, "cm": 72.0 / 2.54, "px": 0.75, "em": 10.0}


def to_pt(v: Optional[str], default_unit: str = "in") -> Optional[float]:
    """XFA measurements: '12pt', '0.5in', '10mm'. A bare number uses inches (XFA default)."""
    if v is None or v == "":
        return None
    m = re.fullmatch(r"\s*(-?[0-9]*\.?[0-9]+)\s*([a-z]*)\s*", v)
    if not m:
        return None
    unit = m.group(2) or default_unit
    return float(m.group(1)) * _UNIT.get(unit, 1.0)
