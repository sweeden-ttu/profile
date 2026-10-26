import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
# validated categorical order (dataviz validate_palette.js, light, all checks PASS)
C = ["#b23a3a", "#2f6fb0", "#3f8a4a", "#7a55b0", "#a87814"]
INK, INK2, INK3, RULE, PAPER = "#0f0f0f", "#2a2522", "#5a534c", "#d8cfb8", "#faf7ef"
plt.rcParams.update({
    "figure.facecolor": PAPER, "axes.facecolor": PAPER, "savefig.facecolor": PAPER,
    "font.family": "DejaVu Sans", "font.size": 10.5, "text.color": INK2,
    "axes.edgecolor": INK3, "axes.labelcolor": INK2, "xtick.color": INK3, "ytick.color": INK3,
    "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.color": RULE,
    "grid.linewidth": 0.6, "axes.axisbelow": True, "axes.titleweight": "bold", "axes.titlesize": 12,
    "axes.titlelocation": "left", "legend.frameon": False, "svg.fonttype": "none",
    "lines.linewidth": 2,
})
def save(fig, path, png=True):
    p = Path(path); p.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(p.with_suffix(".svg"), bbox_inches="tight")
    if png: fig.savefig(p.with_suffix(".png"), dpi=180, bbox_inches="tight")
    plt.close(fig); print("wrote", p)
def source(fig, text):
    fig.text(0.01, -0.02, text, fontsize=8, color=INK3, ha="left", va="top")
