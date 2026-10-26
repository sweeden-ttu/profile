"""usdlab: a small, dependency-light lab for the USD-literate LLM plan.

* build_toy_knee()   - a procedural, licence-clean stand-in for the Archetypal Knee (bones, cartilage, menisci)
* CORRUPTIONS        - controlled corruption families for the repair task (O1)
* usdfid(ref, cand)  - the layered fidelity score: L0 parse/compose, L1 validation, L2 structure,
                       L3 attributes, L4 geometry (Chamfer + F-score@tau)
* serialize(stage, precision, payload) - text forms used for the tokenizer audit

Only needs `usd-core` and `numpy`. Tested with usd-core 26.11.
"""
from __future__ import annotations
import math, random
import numpy as np
from pxr import Usd, UsdGeom, Sdf, Gf, Vt

KNEE_PARTS = {  # name: (group, centre mm, radii mm, label)
    "Femur":            ("Bones",     (0, 0, 45),  (24, 22, 40), 2),
    "Tibia":            ("Bones",     (0, 0, -45), (22, 20, 38), 4),
    "Fibula":           ("Bones",     (28, 8, -55), (6, 6, 30),  6),
    "Patella":          ("Bones",     (0, -30, 15), (14, 6, 16), 8),
    "Femoral_Cartilage": ("Cartilage", (0, 0, 8),   (22, 20, 4),  10),
    "Tibial_Cartilage":  ("Cartilage", (0, 0, -6),  (20, 18, 3),  11),
    "Medial_Meniscus":   ("Menisci",   (-12, 0, 0), (9, 14, 3),   14),
    "Lateral_Meniscus":  ("Menisci",   (12, 0, 0),  (9, 13, 3),   15),
}


def _ellipsoid(c, r, n_u=10, n_v=8):
    pts, faces = [], []
    for i in range(n_v + 1):
        th = math.pi * i / n_v
        for j in range(n_u):
            ph = 2 * math.pi * j / n_u
            pts.append(Gf.Vec3f(c[0] + r[0] * math.sin(th) * math.cos(ph), c[1] + r[1] * math.sin(th) * math.sin(ph), c[2] + r[2] * math.cos(th)))
    for i in range(n_v):
        for j in range(n_u):
            a, b = i * n_u + j, i * n_u + (j + 1) % n_u
            faces += [a, b, b + n_u, a + n_u]
    return pts, [4] * (len(faces) // 4), faces


def build_toy_knee(path: str | None = None, side: str = "R") -> Usd.Stage:
    stage = Usd.Stage.CreateInMemory() if path is None else Usd.Stage.CreateNew(path)
    UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.z)
    UsdGeom.SetStageMetersPerUnit(stage, 0.001)
    world = UsdGeom.Xform.Define(stage, "/World"); stage.SetDefaultPrim(world.GetPrim())
    knee = UsdGeom.Xform.Define(stage, f"/World/Knee_{side}")
    knee.AddTranslateOp().Set(Gf.Vec3d(-90 if side == "R" else 90, 0, 0))
    for name, (group, c, r, label) in KNEE_PARTS.items():
        UsdGeom.Scope.Define(stage, f"/World/Knee_{side}/Anatomy/{group}")
        mesh = UsdGeom.Mesh.Define(stage, f"/World/Knee_{side}/Anatomy/{group}/{name}")
        pts, counts, idx = _ellipsoid(c, r)
        mesh.CreatePointsAttr(pts); mesh.CreateFaceVertexCountsAttr(counts); mesh.CreateFaceVertexIndicesAttr(idx)
        mesh.CreateExtentAttr(UsdGeom.PointBased.ComputeExtent(Vt.Vec3fArray(pts)))
        p = mesh.GetPrim()
        p.CreateAttribute("knee:label", Sdf.ValueTypeNames.Int).Set(label)
        p.CreateAttribute("knee:tissue", Sdf.ValueTypeNames.Token).Set(group.lower())
        p.CreateAttribute("knee:volumeMm3", Sdf.ValueTypeNames.Float).Set(float(4 / 3 * math.pi * r[0] * r[1] * r[2]))
    return stage


# ---------------------------------------------------------------- corruption families (task O1)
def _meshes(stage):
    return [p for p in stage.Traverse() if p.IsA(UsdGeom.Mesh)]


def c_delete_prim(stage, rng):
    p = rng.choice(_meshes(stage)); stage.RemovePrim(p.GetPath()); return f"deleted {p.GetPath()}"

def c_scale_prim(stage, rng):
    p = rng.choice(_meshes(stage)); s = rng.choice([0.7, 0.8, 1.25, 1.4])
    UsdGeom.Xformable(p).AddScaleOp(opSuffix="corrupt").Set(Gf.Vec3f(s, s, s)); return f"scaled {p.GetName()} x{s}"

def c_translate_prim(stage, rng):
    p = rng.choice(_meshes(stage)); d = Gf.Vec3d(*[rng.uniform(-12, 12) for _ in range(3)])
    UsdGeom.Xformable(p).AddTranslateOp(opSuffix="corrupt").Set(d); return f"moved {p.GetName()}"

def c_up_axis(stage, rng):
    UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.y); return "upAxis Z->Y"

def c_units(stage, rng):
    UsdGeom.SetStageMetersPerUnit(stage, 0.01); return "metersPerUnit 0.001->0.01"

def c_swap_label(stage, rng):
    a, b = rng.sample(_meshes(stage), 2)
    la, lb = a.GetAttribute("knee:label").Get(), b.GetAttribute("knee:label").Get()
    a.GetAttribute("knee:label").Set(lb); b.GetAttribute("knee:label").Set(la); return f"swapped labels {a.GetName()}<->{b.GetName()}"

def c_dangling_reference(stage, rng):
    p = stage.DefinePrim(stage.GetDefaultPrim().GetPath().AppendChild("Implant"))
    p.GetReferences().AddReference("./missing_implant.usdc"); return "dangling reference"

def c_jitter_points(stage, rng):
    m = UsdGeom.Mesh(rng.choice(_meshes(stage))); pts = np.array(m.GetPointsAttr().Get())
    pts += np.random.default_rng(rng.randrange(1 << 30)).normal(0, 1.5, pts.shape)
    m.GetPointsAttr().Set(Vt.Vec3fArray.FromNumpy(pts.astype(np.float32))); return f"jittered {m.GetPrim().GetName()}"

CORRUPTIONS = {"delete_prim": c_delete_prim, "scale_prim": c_scale_prim, "translate_prim": c_translate_prim,
               "up_axis": c_up_axis, "units": c_units, "swap_label": c_swap_label,
               "dangling_reference": c_dangling_reference, "jitter_points": c_jitter_points}


def corrupt(usda_text: str, family: str, seed: int = 0) -> tuple[str, str]:
    layer = Sdf.Layer.CreateAnonymous(".usda"); layer.ImportFromString(usda_text)
    stage = Usd.Stage.Open(layer); note = CORRUPTIONS[family](stage, random.Random(seed))
    return stage.GetRootLayer().ExportToString(), note


# ---------------------------------------------------------------- usdfid
def _open(text):
    layer = Sdf.Layer.CreateAnonymous(".usda")
    try:
        if not layer.ImportFromString(text):
            return None
    except Exception:          # Tf errors from the text parser
        return None
    return Usd.Stage.Open(layer)


def _world_points(stage, n=2048, seed=0):
    cache = UsdGeom.XformCache(); out = []
    for p in _meshes(stage):
        pts = p.GetAttribute("points").Get()
        if not pts: continue
        m = np.array(cache.GetLocalToWorldTransform(p)).T
        P = np.c_[np.array(pts, dtype=np.float64), np.ones(len(pts))] @ m.T
        out.append(P[:, :3])
    if not out: return np.zeros((0, 3))
    P = np.concatenate(out); mpu = UsdGeom.GetStageMetersPerUnit(stage)
    P = P * (mpu / 0.001)                                  # compare in millimetres
    if UsdGeom.GetStageUpAxis(stage) == UsdGeom.Tokens.y:  # a stage that declares Y-up is read as Y-up
        P = P[:, [0, 2, 1]]
    rng = np.random.default_rng(seed)
    return P[rng.choice(len(P), size=min(n, len(P)), replace=False)]


def _chamfer_f(a, b, tau):
    if len(a) == 0 or len(b) == 0: return float("inf"), 0.0
    d = np.sqrt(((a[:, None, :] - b[None, :, :]) ** 2).sum(-1))
    ab, ba = d.min(1), d.min(0)
    prec, rec = (ba < tau).mean(), (ab < tau).mean()
    f = 0.0 if prec + rec == 0 else 2 * prec * rec / (prec + rec)
    return float(ab.mean() + ba.mean()), float(f)


def validation_errors(stage) -> int:
    try:
        from pxr import UsdValidation
        ctx = UsdValidation.ValidationContext(UsdValidation.ValidationRegistry().GetOrLoadAllValidators())
        return len(ctx.Validate(stage))
    except Exception:
        return 0


def usdfid(ref_text: str, cand_text: str, tau_frac: float = 0.01, weights=(0.15, 0.25, 0.25, 0.35)) -> dict:
    """Layered fidelity of a candidate stage against a reference. Higher is better; L0 failure scores 0."""
    ref, cand = _open(ref_text), _open(cand_text)
    out = {"L0_parse": cand is not None}
    if cand is None:
        return {**out, "score": 0.0}
    unresolved = [str(p.GetPath()) for p in cand.Traverse() if p.HasAuthoredReferences() and not p.GetChildren() and not p.GetTypeName()]
    out["L0_unresolved_refs"] = len(unresolved)
    e_ref, e_cand = validation_errors(ref), validation_errors(cand)
    out["L1_validation_errors"] = max(0, e_cand - e_ref)
    l1 = 1.0 / (1.0 + out["L1_validation_errors"] + len(unresolved))
    rp = {str(p.GetPath()): p.GetTypeName() for p in ref.Traverse()}
    cp = {str(p.GetPath()): p.GetTypeName() for p in cand.Traverse()}
    inter = set(rp) & set(cp)
    jacc = len(inter) / max(1, len(set(rp) | set(cp)))
    type_ok = np.mean([rp[k] == cp[k] for k in inter]) if inter else 0.0
    meta_ok = np.mean([UsdGeom.GetStageUpAxis(ref) == UsdGeom.GetStageUpAxis(cand),
                       abs(UsdGeom.GetStageMetersPerUnit(ref) - UsdGeom.GetStageMetersPerUnit(cand)) < 1e-9,
                       ref.GetDefaultPrim().GetPath() == (cand.GetDefaultPrim().GetPath() if cand.GetDefaultPrim() else None)])
    l2 = float(jacc * type_ok * (0.5 + 0.5 * meta_ok))
    out.update(L2_prim_jaccard=round(jacc, 4), L2_type_match=round(float(type_ok), 4), L2_metadata=round(float(meta_ok), 4))
    errs = []
    cache_r, cache_c = UsdGeom.XformCache(), UsdGeom.XformCache()
    for k in inter:
        pr, pc = ref.GetPrimAtPath(k), cand.GetPrimAtPath(k)
        if pr.IsA(UsdGeom.Xformable):
            mr, mc = np.array(cache_r.GetLocalToWorldTransform(pr)), np.array(cache_c.GetLocalToWorldTransform(pc))
            errs.append(min(1.0, np.abs(mr - mc).max() / 10.0))
        for a in pr.GetAuthoredAttributes():
            if a.GetName().startswith("knee:"):
                b = pc.GetAttribute(a.GetName()); va, vb = a.Get(), (b.Get() if b else None)
                if isinstance(va, (int, float)) and isinstance(vb, (int, float)):
                    errs.append(min(1.0, abs(va - vb) / (abs(va) + 1e-9)) if a.GetTypeName() != Sdf.ValueTypeNames.Int else float(va != vb))
                else:
                    errs.append(float(va != vb))
    l3 = float(1 - np.mean(errs)) if errs else 0.0
    out["L3_attributes"] = round(l3, 4)
    A, B = _world_points(ref), _world_points(cand)
    diag = np.linalg.norm(A.max(0) - A.min(0)) if len(A) else 1.0
    cd, f = _chamfer_f(A, B, tau_frac * diag)
    out.update(L4_chamfer_mm=round(cd, 3), L4_fscore=round(f, 4))
    w = weights
    out["score"] = round(float(w[0] * l1 + w[1] * l2 + w[2] * l3 + w[3] * f), 4)
    return out


# ---------------------------------------------------------------- serialisation for the tokenizer audit
def serialize(stage: Usd.Stage, precision: int | None = None, payload: bool = False) -> str:
    """precision=None keeps full float text; an int rounds every point; payload=True replaces
    inline point arrays with a reference to an external .usdc payload (the LLM writes structure only)."""
    layer = Sdf.Layer.CreateAnonymous(".usda"); layer.TransferContent(stage.GetRootLayer())
    s = Usd.Stage.Open(layer)
    for p in _meshes(s):
        m = UsdGeom.Mesh(p)
        if payload:
            for n in ("points", "faceVertexCounts", "faceVertexIndices"):
                p.RemoveProperty(n)
            p.GetPayloads().AddPayload(f"./geo/{p.GetName()}.usdc")
        elif precision is not None:
            pts = np.round(np.array(m.GetPointsAttr().Get(), dtype=np.float64), precision)
            m.GetPointsAttr().Set(Vt.Vec3fArray.FromNumpy(pts.astype(np.float32)))
    text = s.GetRootLayer().ExportToString()
    if precision is not None and not payload:   # float32 text re-expands digits; re-round in text
        import re
        text = re.sub(r"-?\d+\.\d+(e-?\d+)?", lambda mm: (f"{float(mm.group(0)):.{precision}f}" if precision > 0 else str(int(round(float(mm.group(0)))))), text)
    return text


# ---------------------------------------------------------------- SFT pairs for the repair task
TEXT_FAMILIES = ["delete_prim", "scale_prim", "translate_prim", "up_axis", "units", "swap_label", "dangling_reference"]


def make_sft_pairs(n: int, families=TEXT_FAMILIES, seed: int = 0):
    """(instruction + corrupted stage) -> repaired stage, both in payload form so the model
    writes structure, transforms and attributes rather than raw point arrays."""
    import json
    rng = random.Random(seed); keep = build_toy_knee()
    clean = serialize(keep, payload=True)
    rows = []
    for i in range(n):
        fam = families[i % len(families)]
        bad, note = corrupt(clean, fam, rng.randrange(1 << 30))
        rows.append({"input": "Repair this OpenUSD stage so it matches the healthy knee archetype. "
                              "Return the full corrected .usda only.\n\n" + bad,
                     "output": clean, "family": fam, "note": note})
    return rows
