"""Optional model passes. The engine runs fully without either.

- Local multimodal model through Ollama (OLLAMA_URL, OLLAMA_VLM): names fields on
  scanned forms whose OCR label is empty or weak, from a crop of the page.
- Claude review (ANTHROPIC_API_KEY, CLAUDE_MODEL): reads each generated .tex file
  with a rendering of the rebuilt page and returns label fixes and layout issues as
  JSON. Only label text is changed automatically (then re-classified); everything
  else is reported for a person to act on. Every change is logged.
"""
from __future__ import annotations

import base64
import io
import json
import os
import re
from pathlib import Path
from typing import Optional

import httpx

from .model import Form


def ollama_enabled() -> bool:
    return bool(os.environ.get("OLLAMA_URL"))


def claude_enabled() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


def _b64_png(img) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def vlm_label_fields(form: Form, max_fields: int = 60) -> int:
    """Ask the local VLM to name weakly-labelled fields on scanned pages."""
    if not ollama_enabled() or form.kind != "flat":
        return 0
    from PIL import Image
    url = os.environ["OLLAMA_URL"].rstrip("/") + "/api/generate"
    model = os.environ.get("OLLAMA_VLM", "qwen2.5vl:3b")
    n = 0
    for page in form.pages:
        if not page.background_png:
            continue
        img = Image.open(page.background_png.replace("-bg.jpg", ".png") if page.background_png.endswith("-bg.jpg") else page.background_png)
        sx = img.width / page.width
        for f in page.fields:
            if n >= max_fields or (len(f.label.split()) >= 3 and f.label != f.name):
                continue
            box = (max(f.x - 160, 0) * sx, max(f.y - 30, 0) * sx, min(f.x + f.w + 40, page.width) * sx, min(f.y + f.h + 10, page.height) * sx)
            crop = img.crop(tuple(int(v) for v in box))
            prompt = ("This crop is part of a U.S. government form. A blank fill-in area is near the right/bottom of the crop. "
                      "In at most 8 words, what information should be written in that blank? Answer with the label only.")
            try:
                r = httpx.post(url, json={"model": model, "prompt": prompt, "images": [_b64_png(crop)], "stream": False},
                               timeout=httpx.Timeout(120.0))
                label = (r.json().get("response") or "").strip().strip('".')
            except (httpx.HTTPError, ValueError):
                continue
            if label:
                f.label, f.label_source = label[:80], "vlm"
                n += 1
    if n:
        form.notes.append(f"Local VLM ({model}) named {n} field(s).")
    return n


REVIEW_PROMPT = """You are reviewing a LaTeX reconstruction of a U.S. Department of Agriculture form.
You get: (1) the generated .tex source (TikZ layout + hyperref fields named fNNNN), (2) a rendering of
the rebuilt page, and (3) the field list with each field's label.

Return ONLY a JSON object:
{"label_fixes": [{"tex_name": "f0012", "label": "corrected short label", "why": "..."}],
 "issues": [{"severity": "high|medium|low", "where": "page/field/text", "problem": "...", "suggestion": "..."}]}

Fix a label only when the printed form clearly shows the field asks for something else.
Report overlapping text, missing printed text, misplaced fields, and unreadable glyphs as issues.
Never invent content that is not on the form."""


def claude_review(form: Form, tex_path: Path, fieldmap: dict, page_png: Optional[Path]) -> dict:
    """Send one form to Claude for review. Returns the parsed JSON (or an error record)."""
    if not claude_enabled():
        return {"skipped": "ANTHROPIC_API_KEY not set"}
    import anthropic
    client = anthropic.Anthropic()
    model = os.environ.get("CLAUDE_MODEL", "claude-sonnet-5-5")
    fields = [{"tex_name": k, "label": v["label"][:120], "kind": v["kind"], "page": v["page"]} for k, v in fieldmap.items()][:400]
    content = [{"type": "text", "text": REVIEW_PROMPT},
               {"type": "text", "text": "TEX SOURCE (truncated):\n" + tex_path.read_text()[:60000]},
               {"type": "text", "text": "FIELDS:\n" + json.dumps(fields)}]
    if page_png and page_png.exists():
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/png",
                                                     "data": base64.b64encode(page_png.read_bytes()).decode()}})
    try:
        msg = client.messages.create(model=model, max_tokens=4000, messages=[{"role": "user", "content": content}])
        text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
        m = re.search(r"\{.*\}", text, flags=re.S)
        review = json.loads(m.group(0)) if m else {"raw": text}
    except Exception as e:  # network/model errors never block a conversion
        return {"error": f"{e.__class__.__name__}: {str(e)[:200]}"}
    by_tex = {k: v for k, v in fieldmap.items()}
    applied = []
    for fx in review.get("label_fixes", [])[:200]:
        entry = by_tex.get(fx.get("tex_name"))
        if not entry or not fx.get("label"):
            continue
        for f in form.fields:
            if f.uid == entry["uid"]:
                applied.append({"field": f.uid, "from": f.label, "to": fx["label"], "why": fx.get("why", "")})
                f.label, f.label_source = fx["label"][:120], "claude"
    review["applied"] = applied
    review["model"] = model
    return review
