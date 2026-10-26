import numpy as np, sys
sys.path.insert(0, "/home/claude/charts")
from style import *
R = "/home/claude/profile/assets/images/seminars/"

# ---------------- Gao: routing ----------------
G = R + "routing/"
# g1 positional encoding (Vaswani et al. 2017), computed
pos, d = 128, 128
P = np.zeros((pos, d)); i = np.arange(0, d, 2); t = np.arange(pos)[:, None]
P[:, 0::2] = np.sin(t / 10000 ** (i / d)); P[:, 1::2] = np.cos(t / 10000 ** (i / d))
fig, ax = plt.subplots(figsize=(8, 3.2)); ax.grid(False)
im = ax.imshow(P.T, aspect="auto", cmap="RdBu_r", vmin=-1, vmax=1, interpolation="nearest")
ax.set_xlabel("position (timestep) t"); ax.set_ylabel("embedding dimension")
cb = fig.colorbar(im, ax=ax, fraction=0.03, pad=0.01); cb.outline.set_visible(False)
ax.set_title("Sinusoidal positional encoding, d = 128")
source(fig, "Computed: PE(t,2i)=sin(t/10000^(2i/d)), PE(t,2i+1)=cos(t/10000^(2i/d)). Reproduces the talk's positional-encoding slide.")
save(fig, G + "g1_positional_encoding")

# g2 ToMoE table, LLaMA-3 8B (slide 17)
tasks = ["ARC-e", "ARC-c", "PIQA", "WinoGrande", "HellaSwag", "Average"]
rows = {"Dense (100%)": [77.69, 53.58, 80.63, 72.69, 79.16, 72.75],
        "ShortGPT (75%)": [38.13, 31.40, 60.94, 54.22, 31.52, 43.24],
        "SliceGPT (75%)": [44.44, 29.27, 57.56, 58.48, 41.08, 46.17],
        "ModeGPT (75%)": [67.05, 41.13, 75.52, 69.61, 66.49, 63.96],
        "ToMoE (70%)": [71.55, 44.71, 76.28, 68.98, 71.84, 66.67],
        "ToMoE (60%)": [65.87, 41.64, 73.61, 63.30, 66.42, 62.17]}
cols = [INK3, "#c9bfa6", "#a99f88", C[3], C[0], "#d98b8b"]
fig, ax = plt.subplots(figsize=(8.6, 3.8)); x = np.arange(len(tasks)); w = 0.135
for k, (name, v) in enumerate(rows.items()):
    ax.bar(x + (k - 2.5) * w, v, w * 0.92, color=cols[k], label=name)
ax.set_xticks(x, tasks); ax.set_ylabel("zero-shot accuracy (%)"); ax.set_ylim(0, 90)
ax.legend(ncol=3, fontsize=8.5, loc="upper center", bbox_to_anchor=(0.5, 1.02))
ax.set_title("ToMoE on LLaMA-3 8B, no fine-tuning (active-parameter ratio in brackets)", pad=34)
source(fig, "Data: Gao et al., ToMoE (talk slide 17). Average is the mean of the five tasks. Column names identified by matching the dense row to the published LLaMA-3 8B scores.")
save(fig, G + "g2_tomoe")

# g3 prompt routing expert usage (slide 26, read off a pie chart; approximate)
share = [21.5, 11.5, 7.7, 3.1, 0.8, 2.6, 8.2, 0.8, 4.7, 3.2, 1.6, 2.9, 6.2, 7.5, 6.7, 10.6]
util = {1: .99, 2: .95, 3: .90, 16: .72}
order = np.argsort(share)[::-1]
fig, ax = plt.subplots(figsize=(8, 3.4))
bars = ax.bar(range(16), [share[j] for j in order], color=[C[0] if (j + 1) in util else C[1] for j in order], width=0.75)
ax.set_xticks(range(16), [f"E{j+1}" for j in order], fontsize=8.5)
for k, j in enumerate(order):
    if (j + 1) in util: ax.text(k, share[j] + 0.5, f"util {util[j+1]:.2f}", ha="center", fontsize=8, color=INK2)
ax.set_ylabel("share of CC3M prompts (%)"); ax.set_title("Not All Prompts Are Made Equal: prompts routed to 16 experts")
source(fig, "Approximate: read from the pie chart on talk slide 26 (16 experts, 80% utilisation target). Utilisation shown where legible.")
save(fig, G + "g3_expert_usage")

# g4 CSCR AUDC (slide 35)
routers = ["Oracle", "UMR", "Thompson", "Soft-MoE", "Parametric", "Pareto-Random", "Random", "CSCR (ours)"]
audc = {"EmbedLLM": [0.960, 0.515, 0.472, 0.404, 0.506, 0.369, 0.379, 0.541],
        "Mix-Instruct": [0.079, 0.049, 0.044, 0.030, 0.039, 0.036, 0.037, 0.051],
        "RouterBench": [0.891, 0.568, 0.622, 0.599, 0.691, 0.5172, 0.5147, 0.7110]}
fig, axs = plt.subplots(1, 3, figsize=(9.2, 3.4), sharey=False)
for ax, (bench, v) in zip(axs, audc.items()):
    cl = [INK3] + [C[1]] * 6 + [C[0]]
    ax.barh(range(8)[::-1], v, color=cl, height=0.7); ax.set_title(bench, fontsize=10.5)
    ax.set_yticks(range(8)[::-1], routers if ax is axs[0] else [""] * 8, fontsize=8.5)
    for k, val in enumerate(v): ax.text(val, 7 - k, f" {val:.3f}", va="center", fontsize=7.5, color=INK2)
    ax.set_xlim(0, max(v) * 1.3); ax.tick_params(axis="x", labelsize=8)
fig.suptitle("Cost-aware contrastive routing: area under the deferral curve (higher is better)", x=0.01, ha="left", fontweight="bold", fontsize=11.5)
fig.tight_layout()
source(fig, "Data: talk slide 35 (Shirkavand et al.). Oracle is the upper bound. Each benchmark has its own scale.")
save(fig, G + "g4_cscr_audc")

# g5 ALTER latency vs FID (slide 39, CC3M)
m = [("SDv2.1 (25 steps)", 4.0, 17.08), ("SDv2.1 (20)", 4.0, 17.37), ("BK-SDM-v2 Base", 2.5, 17.53), ("BK-SDM-v2 Small", 2.5, 18.78),
     ("APTP 0.85", 3.4, 36.77), ("APTP 0.66", 2.6, 60.04), ("ALTER 0.65 (25)", 2.6, 16.74), ("ALTER 0.65 (20)", 2.1, 17.14), ("ALTER 0.60 (20)", 1.9, 17.87)]
fig, ax = plt.subplots(figsize=(8, 3.6))
for name, lat, fid in m:
    c = C[0] if "ALTER" in name else (INK3 if "SD" in name and "BK" not in name else C[1])
    ax.scatter(lat, fid, s=60, color=c, zorder=3, edgecolor=PAPER, lw=1.5)
    off = {"SDv2.1 (20)": (8, 6), "SDv2.1 (25 steps)": (8, -10), "BK-SDM-v2 Base": (8, 0), "BK-SDM-v2 Small": (8, 2), "ALTER 0.65 (25)": (8, -12), "ALTER 0.65 (20)": (0, -16), "ALTER 0.60 (20)": (-2, 10), "APTP 0.66": (8, 0), "APTP 0.85": (8, 0)}[name]
    ax.annotate(name, (lat, fid), xytext=off, textcoords="offset points", fontsize=8, color=INK2, ha="left" if off[0] > 0 else ("center" if off[0] == 0 else "right"))
ax.set_xlabel("latency (s / image, lower is better)"); ax.set_ylabel("FID on CC3M (lower is better)")
ax.set_yscale("log"); ax.set_yticks([15, 20, 30, 40, 60], ["15", "20", "30", "40", "60"]); ax.set_xlim(1.6, 4.6); ax.set_ylim(14.5, 70)
ax.set_title("ALTER: temporal routing cuts latency at near-baseline FID")
source(fig, "Data: talk slide 39 (CC3M columns). ALTER labels give the target utilisation and step count.")
save(fig, G + "g5_alter")

# ---------------- Wu: Realm ----------------
W = R + "realm/"
gpus = [1, 8, 16, 32, 64, 128, 256, 512, 1024]
thr = [0.9, 1.5, 2.1, 3.3, 6.3, 12.2, 24, 43, 88]   # approximate, read off a log-scale chart
fig, ax = plt.subplots(figsize=(8, 3.6))
ax.plot(gpus, thr, color=C[1], marker="o", ms=7, label="cuPyNumeric (historical label cuNumeric)")
ax.scatter([1], [0.9], s=80, color=C[0], zorder=4, label="CuPy, single GPU")
ideal = [1.5 * g / 8 for g in gpus[1:]]
ax.plot(gpus[1:], ideal, ls=":", color=INK3, lw=1.3, label="linear from 8 GPUs")
ax.set_xscale("log", base=2); ax.set_yscale("log"); ax.set_xticks(gpus, [str(g) for g in gpus])
ax.set_xlabel("GPUs (DGX SuperPOD)"); ax.set_ylabel("throughput (10⁹ points / s)")
ax.set_title("Weak scaling of Richardson–Lucy deconvolution to 1,024 GPUs"); ax.legend(fontsize=8.5, loc="upper left")
source(fig, "Approximate: values read from talk slide 26 (original NVIDIA figure, May 2022, p. 27). Fixed work per GPU; total work grows.")
save(fig, W + "w1_weak_scaling")
eff = [thr[k] / ideal[k - 1] for k in range(1, len(gpus))]
print("parallel efficiency vs 8-GPU baseline:", [round(e, 2) for e in eff])

# ---------------- Ramamurthy: sensing ----------------
S = R + "sensing/"
acts = ["BH", "FL", "Ph", "PS", "Sit", "St", "Sw", "TT", "UT", "Wa", "WH", "WJ", "WS", "Wr"]
dist = [0.5, 6.7, 13.7, 13.0, 9.4, 5.7, 1.7, 7.7, 5.3, 4.4, 3.1, 3.9, 4.1, 20.3]
fig, (a0, a1) = plt.subplots(1, 2, figsize=(9.2, 3.3), gridspec_kw=dict(width_ratios=[1, 2.4]))
a0.barh([1, 0], [83, 17], color=[C[2], C[0]], height=0.6); a0.set_yticks([1, 0], ["unlabelled", "labelled"])
a0.set_xlim(0, 100); a0.set_xlabel("% of recorded data"); a0.set_title("~4 of 24 h labelled", fontsize=10.5)
for y, v in [(1, 83), (0, 17)]: a0.text(v + 2, y, f"≈{v}%", va="center", fontsize=9)
a1.bar(acts, dist, color=C[1], width=0.72); a1.set_ylabel("share of labelled windows (%)")
a1.set_title("14 activity classes, heavily imbalanced", fontsize=10.5); a1.tick_params(axis="x", labelsize=8.5)
fig.tight_layout(); source(fig, "Approximate: read from talk slide 20. Class codes as printed on the slide; the talk did not expand them.")
save(fig, S + "s1_label_imbalance")

fig, (a0, a1) = plt.subplots(1, 2, figsize=(9.2, 3.2))
a0.bar(["without\nself-taught features", "with self-taught\n(DBN pre-training)"], [54, 86], color=[INK3, C[0]], width=0.55)
for k, v in enumerate([54, 86]): a0.text(k, v + 2, f"{v}%", ha="center", fontweight="bold")
a0.set_ylim(0, 100); a0.set_ylabel("weighted F1"); a0.set_title("Self-taught learning", fontsize=10.5)
grp = ["normal\ncognition", "mild cognitive\nimpairment", "dementia"]
lo, hi = [0, 10, 0], [0.5, 23, 2]
a1.bar(grp, hi, color=[C[1], C[0], C[3]], width=0.55, alpha=0.35)
a1.bar(grp, lo, color=[C[1], C[0], C[3]], width=0.55)
for k, (l, h) in enumerate(zip(lo, hi)): a1.text(k, h + 0.8, ["≈0%", "10–23%", "≈0–2%"][k], ha="center", fontweight="bold")
a1.set_ylim(0, 28); a1.set_ylabel("impairment indicator ζ (%)"); a1.set_title("Errors as a biomarker", fontsize=10.5)
fig.tight_layout(); source(fig, "Data: talk slides 29 and 35. Shaded bars show the reported range across activity classes.")
save(fig, S + "s2_f1_impairment")

fig, (a0, a1) = plt.subplots(1, 2, figsize=(9.2, 3.4))
x = np.arange(3); w = 0.36
a0.bar(x - w/2, [0.628, 0.706, 0.694], w, color=C[1], label="action")
a0.bar(x + w/2, [0.750, 0.817, 0.791], w, color=C[4], label="object")
for k, (p, q) in enumerate(zip([0.628, 0.706, 0.694], [0.750, 0.817, 0.791])):
    a0.text(k - w/2, p + 0.01, f"{p:.3f}", ha="center", fontsize=8); a0.text(k + w/2, q + 0.01, f"{q:.3f}", ha="center", fontsize=8)
a0.set_xticks(x, ["HoloAssist\nbaseline", "teacher\n(326M video enc.)", "distilled\nstudent"]); a0.set_ylim(0, 0.95)
a0.set_ylabel("accuracy"); a0.legend(fontsize=8.5, loc="upper left"); a0.set_title("RoboSViM v2: distillation", fontsize=10.5)
a1.bar(x - w/2, [12, 56, 100], w, color=C[1], label="action"); a1.bar(x + w/2, [19, 47, 100], w, color=C[4], label="object")
for k, (p, q) in enumerate(zip([12, 56, 100], [19, 47, 100])):
    a1.text(k - w/2, p + 2, str(p), ha="center", fontsize=8); a1.text(k + w/2, q + 2, str(q), ha="center", fontsize=8)
a1.set_xticks(x, ["no graph", "graph from model\npredictions", "graph from\ncorrect labels"]); a1.set_ylim(0, 112)
a1.set_ylabel("moments named correctly (%)"); a1.set_title("Knowledge graph over 2-s clips", fontsize=10.5)
fig.tight_layout(); source(fig, "Data: talk slide 43. The slide annotates the graph gains as +44% and +38%; the bars themselves give +44 and +28 points.")
save(fig, S + "s3_robosvim")
