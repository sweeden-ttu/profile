"""Write reviewed profile values into a consolidated packet.

Because linked boxes are one field, writing `first_name` once updates the cover
sheet and every linked widget. Each widget's appearance is regenerated so the
filled packet renders the same in every viewer, including ones without JavaScript.
"""
from __future__ import annotations

from pathlib import Path

import pymupdf

from .canonical import COMPUTED, NEVER_AUTOFILL
from .consolidate import compute


def fill_packet(packet: Path, values: dict[str, str], out: Path) -> dict:
    allowed = {k: v for k, v in values.items() if v and k not in NEVER_AUTOFILL}
    allowed.update({k: v for k, v in compute(allowed).items() if v})
    doc = pymupdf.open(packet)
    written: dict[str, int] = {}
    for page in doc:
        for w in page.widgets() or []:
            name = w.field_name
            if name in allowed and w.field_type_string == "Text":
                w.field_value = allowed[name]
                w.update()
                written[name] = written.get(name, 0) + 1
    doc.save(out, garbage=3, deflate=True)
    return {"written": written, "computed": [k for k in COMPUTED if k in allowed]}
