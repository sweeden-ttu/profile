"""Assemble one packet PDF in which every box that asks for the same thing is ONE field.

PDF form semantics do the work: a field may own several widgets (/Kids), and all
of them display the field's single value. So the cover sheet's "First name" box,
and every linked box on every form, are widgets of the same field. Composite
boxes ("Name and Address Including Zip Code") are separate read-only fields with
a JavaScript calculation, and `fill.py` computes the same values in Python so the
packet looks right even in viewers that do not run scripts.
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import pikepdf
from pikepdf import Array, Dictionary, Name, String

from .canonical import CANONICAL_KEYS, COMPUTED
from .latex import PREAMBLE, compile_tex, esc
from .model import Form, slug

PARTS = {
    "full_name": ["first_name", "middle_name", "last_name"],
}

JS = {
    "full_name": 'event.value=["first_name","middle_name","last_name"].map(function(n){return this.getField(n).valueAsString;},this).filter(function(s){return s;}).join(" ");',
    "city_state_zip": 'var c=this.getField("city").valueAsString,s=this.getField("state").valueAsString,z=this.getField("zip").valueAsString;event.value=(c?c+", ":"")+s+(z?" "+z:"");',
    "address_block": 'var a=this.getField("street_address").valueAsString,c=this.getField("city").valueAsString,s=this.getField("state").valueAsString,z=this.getField("zip").valueAsString;event.value=[a,c,(s+" "+z).trim()].filter(function(x){return x;}).join(", ");',
    "name_address": 'var g=function(n){return this.getField(n).valueAsString;}.bind(this);var nm=[g("first_name"),g("middle_name"),g("last_name")].filter(function(s){return s;}).join(" ");var l2=g("address_line2");var csz=(g("city")?g("city")+", ":"")+g("state")+(g("zip")?" "+g("zip"):"");event.value=[nm,g("street_address"),l2,csz].filter(function(s){return s&&s.trim();}).join("\\n");',
}


def compute(values: dict[str, str]) -> dict[str, str]:
    """Python twin of the PDF calculations above."""
    g = lambda k: (values.get(k) or "").strip()
    full = " ".join(x for x in (g("first_name"), g("middle_name"), g("last_name")) if x)
    csz = (g("city") + ", " if g("city") else "") + g("state") + (" " + g("zip") if g("zip") else "")
    return {
        "full_name": full,
        "city_state_zip": csz.strip(),
        "address_block": ", ".join(x for x in (g("street_address"), g("city"), (g("state") + " " + g("zip")).strip()) if x),
        "name_address": "\n".join(x for x in (full, g("street_address"), g("address_line2"), csz.strip()) if x),
    }


def final_name(entry: dict) -> str:
    if entry.get("canonical"):
        return entry["canonical"]
    # Full original name (dots would create a PDF field hierarchy, so they become "_").
    # Widgets that shared one name in the source form stay shared; nothing else merges.
    return f'{entry["form"]}:' + re.sub(r"[.\s]+", "_", entry["name"])


def cover_sheet(forms: list[Form], out_dir: Path) -> Path:
    """A first page holding one box per shared key, listing where each is used."""
    used: dict[str, list[str]] = defaultdict(list)
    for fm in forms:
        for f in fm.fields:
            if f.canonical:
                where = f"{fm.form_id} p.{f.page}"
                if where not in used[f.canonical]:
                    used[f.canonical].append(where)
    need = set(used)
    for comp in need & set(COMPUTED):
        need |= {"first_name", "middle_name", "last_name", "street_address", "address_line2", "city", "state", "zip"} if comp != "full_name" else set(PARTS["full_name"])
    keys = [k for k in CANONICAL_KEYS if k in need and k != "tax_id"]
    comps = [k for k in COMPUTED if k in used]
    lines = [PREAMBLE % {"w": 612, "h": 792, "title": "Applicant information", "form_id": "Packet cover"}]
    lines.append(r"\begin{tikzpicture}[remember picture,overlay]")
    lines.append(r"\node[anchor=north west,inner sep=0pt,text width=520bp] at \at{46}{40} {\fontsize{16}{19}\selectfont\bfseries Applicant information};")
    n_forms = ", ".join(f.form_id for f in forms)
    lines.append(r"\node[anchor=north west,inner sep=0pt,text width=520bp] at \at{46}{64} {\fontsize{8.5}{11}\selectfont Fill these boxes once. Every linked box in this packet (%s) is the same PDF field, so it updates everywhere at the same time. Grey boxes are computed from the parts above them. Tax IDs, birth dates, signatures and demographic questions are never filled automatically and are not linked across forms.};" % esc(n_forms))
    y = 112.0
    for k in keys:
        where = ", ".join(used.get(k, [])) or ("used by: " + ", ".join(c for c in comps))
        lines.append(r"\node[anchor=north west,inner sep=0pt,text width=170bp] at \at{46}{%.1f} {\fontsize{9}{11}\selectfont\bfseries %s};" % (y + 4, esc(CANONICAL_KEYS[k])))
        lines.append(r"\node[anchor=north west,inner sep=0pt] at \at{220}{%.1f} {\TextField[name=%s,width=200bp,height=17bp,charsize=9pt,borderwidth=0.5,bordercolor={0.36 0.45 0.62},backgroundcolor={0.92 0.95 1}]{}};" % (y, k))
        lines.append(r"\node[anchor=north west,inner sep=0pt,text width=140bp] at \at{428}{%.1f} {\fontsize{6.5}{8}\selectfont\color{gray} %s};" % (y + 2, esc(where)))
        y += 25
    y += 10
    for k in comps:
        h = 44 if k == "name_address" else 17
        lines.append(r"\node[anchor=north west,inner sep=0pt,text width=170bp] at \at{46}{%.1f} {\fontsize{9}{11}\selectfont\bfseries %s\\[1pt]\fontsize{6.5}{8}\selectfont\mdseries computed};" % (y + 4, esc(COMPUTED[k])))
        lines.append(r"\node[anchor=north west,inner sep=0pt] at \at{220}{%.1f} {\TextField[name=%s,width=200bp,height=%dbp,charsize=8pt,multiline=%s,readonly=true,borderwidth=0.5,bordercolor={0.6 0.6 0.6},backgroundcolor={0.94 0.94 0.94}]{}};" % (y, k, h, "true" if h > 20 else "false"))
        lines.append(r"\node[anchor=north west,inner sep=0pt,text width=140bp] at \at{428}{%.1f} {\fontsize{6.5}{8}\selectfont\color{gray} %s};" % (y + 2, esc(", ".join(used[k]))))
        y += h + 10
    lines.append(r"\end{tikzpicture}\null")
    lines.append(r"\end{Form}\end{document}")
    # hyperref drops "_" from field names, so the TeX names are cvNN and mapped back here.
    fmap = {}
    def rename(m):
        tex_name = f"cv{len(fmap) + 1:02d}"
        fmap[tex_name] = {"canonical": m.group(1), "form": "cover", "name": m.group(1)}
        return f"name={tex_name},"
    body = re.sub(r"name=([a-z_0-9]+),", rename, "\n".join(lines))
    tex = out_dir / "00-cover.tex"
    tex.write_text(body)
    return compile_tex(tex), fmap


def build_packet(cover: tuple[Path, dict], parts: list[tuple[Form, Path, dict]], out: Path) -> dict:
    """Merge cover + forms; give same-key widgets one parent field. Returns a report."""
    dest = pikepdf.new()
    widgets: list[tuple[pikepdf.Object, str, dict | None]] = []
    dr = None

    def take(src_path: Path, fmap: dict | None):
        nonlocal dr
        src = pikepdf.open(src_path)
        if dr is None and "/AcroForm" in src.Root and "/DR" in src.Root.AcroForm:
            d = src.Root.AcroForm.DR
            dr = dest.copy_foreign(d if d.is_indirect else src.make_indirect(d))
        start = len(dest.pages)
        dest.pages.extend(src.pages)
        for page in list(dest.pages)[start:]:
            for a in page.obj.get("/Annots", []):
                if a.get("/Subtype") == "/Widget" and "/T" in a:
                    tname = str(a.T)
                    widgets.append((a, tname, fmap.get(tname) if fmap is not None else None))

    take(cover[0], cover[1])
    for form, pdf, fmap in parts:
        take(pdf, fmap)

    groups: dict[str, list] = defaultdict(list)
    for a, tname, entry in widgets:
        name = tname if entry is None else final_name(entry)
        groups[name].append(a)

    fields = Array()
    calc = Array()
    report = {"fields": 0, "widgets": len(widgets), "linked": {}}
    for name, ws in groups.items():
        computed = name in COMPUTED
        if len(ws) == 1:
            w = ws[0]
            w.T = String(name)
            target = w
        else:
            first = ws[0]
            parent = Dictionary(T=String(name), Kids=Array(ws), V=String(""))
            for k in ("/FT", "/DA", "/Ff", "/MaxLen", "/Opt"):
                if k in first:
                    parent[k] = first[k]
            parent = dest.make_indirect(parent)
            for w in ws:
                for k in ("/T", "/FT", "/Ff", "/V", "/DV", "/MaxLen"):
                    if k in w:
                        del w[k]
                w.Parent = parent
            target = parent
            if name in CANONICAL_KEYS or name in COMPUTED:
                report["linked"][name] = len(ws)
        if computed:
            target.Ff = 1 | (4096 if name == "name_address" else 0)   # read-only (+ multiline)
            target.AA = Dictionary(C=Dictionary(S=Name.JavaScript, JS=String(JS[name])))
            calc.append(target)
        fields.append(target)
        report["fields"] += 1
    acro = Dictionary(Fields=fields, NeedAppearances=True, DA=String("/Helv 0 Tf 0 g"))
    if dr is not None:
        acro.DR = dr
    if len(calc):
        acro.CO = calc
    dest.Root.AcroForm = dest.make_indirect(acro)
    dest.docinfo["/Title"] = "USDA forms packet (consolidated fields)"
    dest.docinfo["/Producer"] = "forms-engine"
    dest.save(out)
    return report
