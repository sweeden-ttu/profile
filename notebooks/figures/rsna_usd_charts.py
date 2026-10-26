import sys, csv, shutil, numpy as np
sys.path.insert(0, "/home/claude/charts")
from style import *
from PIL import Image
O = "/home/claude/profile/assets/images/projects/rsna-knee/"
import os; os.makedirs(O, exist_ok=True)
for f in os.listdir("/mnt/user-data/uploads/rsna-knee-challenge/analysis/charts"):
    shutil.copy("/mnt/user-data/uploads/rsna-knee-challenge/analysis/charts/" + f, O + f)
subs = [("own models v18\n(16 Oct)", .791, .763), ("V1 tri-model copy\n(15 Oct)", .956, .941), ("R0 reproduction", .956, .941),
        ("E01 per-finding\n224 share", .956, .940), ("V2 symmetric TTA", .956, .941), ("V3 V2 + Kangaroo\nhalf (0.5/0.5)", .955, .939)]
fig, ax = plt.subplots(figsize=(8.4, 3.6))
y = np.arange(len(subs))[::-1]
for yy, (n, pu, pr) in zip(y, subs):
    ax.plot([pr, pu], [yy, yy], color=RULE, lw=3, zorder=1)
ax.scatter([s[1] for s in subs], y, color=C[1], s=55, zorder=3, label="public")
ax.scatter([s[2] for s in subs], y, color=C[0], s=55, zorder=3, label="private (final)")
for yy, s in zip(y, subs): ax.text(s[1] + 0.003, yy, f"{s[1]:.3f} / {s[2]:.3f}", va="center", fontsize=8.5, color=INK2)
ax.axvline(0.960, color=INK3, ls=":", lw=1); ax.text(0.9605, y[0] + 0.35, "1st place\nprivate 0.960", fontsize=8, color=INK3)
ax.set_yticks(y, [s[0] for s in subs], fontsize=8.5); ax.set_xlim(0.75, 1.0)
ax.set_xlabel("mean per-finding AUC (12 findings)"); ax.legend(loc="center", bbox_to_anchor=(0.45, 0.45), fontsize=9)
ax.set_title("RSNA Knee: every submission, public vs private")
source(fig, "Source: kaggle competitions submissions -c rsna-knee-abnormality-detection (pulled 2026-10-26).")
save(fig, O + "r6_submissions")

# zoomed version for the blends
fig, ax = plt.subplots(figsize=(8.4, 2.8))
b = subs[1:]; y = np.arange(len(b))[::-1]
for yy, (n, pu, pr) in zip(y, b): ax.plot([pr, pu], [yy, yy], color=RULE, lw=3)
ax.scatter([s[1] for s in b], y, color=C[1], s=55, zorder=3, label="public"); ax.scatter([s[2] for s in b], y, color=C[0], s=55, zorder=3, label="private")
ax.set_yticks(y, [s[0].replace("\n", " ") for s in b], fontsize=8.5); ax.set_xlim(0.936, 0.962)
ax.axvspan(0.941 - 0.002, 0.941 + 0.002, color=C[4], alpha=0.10, lw=0); ax.text(0.9412, y[-1] - 0.45, "±0.002 around V1", fontsize=8, color=C[4], ha="center")
ax.legend(loc="center right", fontsize=9); ax.set_xlabel("AUC"); ax.set_title("Zoom: the blend changes all land inside ±0.002 of V1")
save(fig, O + "r7_blends_zoom")

# USD archetype review
U = "/home/claude/profile/assets/images/projects/usd-llm/"; os.makedirs(U, exist_ok=True)
im = Image.open("/home/claude/knee/archetype/previews/knee_R_3d.png").convert("RGB"); im.save(U + "knee_archetype_render.jpg", quality=86, optimize=True)
im.crop((180, 20, 620, 680)).save(U + "knee_archetype_card.jpg", quality=86, optimize=True)
rows = [r for r in csv.DictReader(open("/home/claude/knee/archetype_structures.csv")) if r["side"] == "R"]
g = {}
for r in rows: g.setdefault(r["group"], [0, 0, 0]); g[r["group"]][0] += float(r["volume_mm3"]) / 1000; g[r["group"]][1] += 1; g[r["group"]][2] += int(r["mesh_faces"])
items = sorted(g.items(), key=lambda kv: kv[1][0])
fig, (a0, a1) = plt.subplots(1, 2, figsize=(9.2, 3.6), sharey=True)
a0.barh([k for k, _ in items], [v[0] for _, v in items], color=C[1]); a0.set_xscale("log"); a0.set_xlabel("total volume (cm³, log)")
for k, v in items: a0.text(v[0] * 1.08, k, f"{v[1]}", va="center", fontsize=8, color=INK3)
a1.barh([k for k, _ in items], [v[2] / 1000 for _, v in items], color=C[2]); a1.set_xlabel("mesh faces (thousands)")
a0.set_title("The Archetypal Knee (right): 58 structures by group", fontsize=11)
fig.tight_layout(); source(fig, "Source: archetype_structures.csv in kaggle.com/datasets/scottweeden/the-archetypal-knee (numbers after bars = structure count).")
save(fig, U + "u1_archetype_structures")
print(len(rows), sum(int(r["mesh_faces"]) for r in rows))
