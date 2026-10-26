import json, csv, numpy as np, sys
sys.path.insert(0, "/home/claude/charts")
from style import *
from datetime import datetime
OUT = "/home/claude/profile/assets/images/projects/kaggriculture/"
K = "/home/claude/kagg/"
# 1 submissions timeline
rows = list(csv.DictReader(open(K + "submissions.csv")))
pts = []
for r in rows:
    d = datetime.fromisoformat(r["date"][:19])
    s = r["publicScore"].strip()
    pts.append((d, float(s) if s and s != "None" else None, "ERROR" in r["status"]))
pts.sort()
fig, ax = plt.subplots(figsize=(8, 3.6))
ok = [(d, s) for d, s, e in pts if s is not None and not e]
err = [d for d, s, e in pts if s is None or e]
ax.scatter([d for d, _ in ok], [s for _, s in ok], s=28, color=C[1], zorder=3, label="scored submission")
ax.scatter(err, [0] * len(err), marker="x", s=36, color=C[0], zorder=3, label=f"error ({len(err)})")
best = max(ok, key=lambda x: x[1])
ax.annotate(f"best public {best[1]:.1f}\n(not active at the deadline)", best, xytext=(-150, -6), textcoords="offset points",
            fontsize=9, color=INK2, arrowprops=dict(arrowstyle="-", color=INK3, lw=0.8))
hy = [p for p in ok if p[0].month == 9 and p[0].day == 25]
ax.set_ylabel("public ladder rating"); ax.set_ylim(-150, 2400)
ax.set_title(f"Kaggriculture: {len(pts)} submissions in 17 days")
ax.legend(loc="upper left")
fig.autofmt_xdate()
source(fig, "Source: kaggle competitions submissions -c kaggriculture (team 4H). Ratings settle over time; errored uploads plotted at 0.")
save(fig, OUT + "k1_submissions")

# 2 training history
h = json.load(open(K + "training_history.json"))["history"]
it = [x["iter"] for x in h]; a = [x["mean_a"] for x in h]; b = [x["mean_b"] for x in h]
fig, ax = plt.subplots(figsize=(8, 3.4))
ax.plot(it, a, color=C[0], marker="o", ms=4, label="MuZero candidate (gate eval)")
ax.plot(it, b, color=INK3, ls="--", label="expert playbook (same games)")
pr = [x for x in h if x.get("promoted")]
ax.scatter([x["iter"] for x in pr], [x["mean_a"] for x in pr], s=110, facecolors="none", edgecolors=C[0], lw=1.6, zorder=4, label="promoted to champion")
ax.annotate("iteration 0 = after behaviour\ncloning on soft expert labels", (0, h[0]["mean_a"]), xytext=(1.5, 56000), fontsize=8.5, color=INK3, arrowprops=dict(arrowstyle="-", color=INK3, lw=0.8))
ax.set_xticks(range(0, 21, 2))
ax.set_xlabel("self-play iteration"); ax.set_ylabel("mean final cash ($)")
ax.yaxis.set_major_formatter(lambda v, p: f"${v/1000:.0f}k")
ax.set_title("Promotion gate: 10 seat-swapped seeds per iteration"); ax.legend(loc="lower right", fontsize=9)
source(fig, "Source: postmortem/dataset/training_history.json (4-phase curriculum, 32 simulations, ~28 min on 2 CPU cores).")
save(fig, OUT + "k2_training")

# 3 held-out evaluation incl. weight-swap
e = json.load(open(K + "final_eval.json"))
labels = ["MuZero vs\nexpert playbook", "MuZero vs\nrandom plans", "MuZero vs\nKaggle starter", "random weights\nvs playbook", "playbook vs\nrandom plans"]
keys = ["playbook", "random_plans", "starter", "random_weights_vs_playbook", "playbook_vs_random_plans"]
x = np.arange(len(keys)); w = 0.36
fig, ax = plt.subplots(figsize=(8.4, 3.8))
A = [e[k]["mean_a"] for k in keys]; B = [e[k]["mean_b"] for k in keys]
seA = [np.std([r["a"] for r in e[k]["rows"]], ddof=1) / np.sqrt(len(e[k]["rows"])) for k in keys]
seB = [np.std([r["b"] for r in e[k]["rows"]], ddof=1) / np.sqrt(len(e[k]["rows"])) for k in keys]
ax.bar(x - w/2 - 0.01, A, w, yerr=seA, color=C[0], label="first-named agent", capsize=3, error_kw=dict(ecolor=INK3, lw=1))
ax.bar(x + w/2 + 0.01, B, w, yerr=seB, color=C[1], label="its opponent", capsize=3, error_kw=dict(ecolor=INK3, lw=1))
for i, k in enumerate(keys):
    ax.text(i, max(A[i], B[i]) + 4500, f"{e[k]['wins_a']}/{e[k]['games']} wins", ha="center", fontsize=8.5, color=INK2)
ax.set_xticks(x, labels, fontsize=8.8); ax.yaxis.set_major_formatter(lambda v, p: f"${v/1000:.0f}k")
ax.set_ylabel("mean final cash, 40 games"); ax.set_ylim(0, 82000)
ax.axvspan(2.5, 3.5, color=C[4], alpha=0.08, lw=0)
ax.text(3, 76000, "weight-swap test", ha="center", fontsize=9, color=C[4], fontweight="bold")
ax.set_title("Held-out, seat-swapped evaluation (seeds 90000+, never seen by the gate)"); ax.legend(loc="upper left", fontsize=9)
source(fig, "Source: postmortem/dataset/final_eval.json; error bars are ±1 standard error over 40 games.")
save(fig, OUT + "k3_eval")

# 4 final leaderboard
sc = np.array(json.load(open(K + "final_leaderboard_scores.json")))
fig, ax = plt.subplots(figsize=(8, 3.2))
ax.hist(sc, bins=80, color=C[1], alpha=0.85)
p90 = np.sort(sc)[::-1][int(len(sc) * 0.10)]
ax.axvline(4166.2, color=C[0], lw=2); ax.axvline(p90, color=INK3, lw=1, ls="--")
ax.text(4166.2 - 40, ax.get_ylim()[1] * 0.9, "team 4H\n4166.2 · rank 2,301", ha="right", fontsize=9, color=C[0], fontweight="bold")
ax.text(p90 + 40, ax.get_ylim()[1] * 0.6, f"top-10% line\n{p90:.1f}", fontsize=8.5, color=INK3)
ax.set_xlabel("final leaderboard score"); ax.set_ylabel("teams")
ax.set_title(f"Final leaderboard: {len(sc):,} teams")
source(fig, "Source: private leaderboard snapshot, 2026-10-21.")
save(fig, OUT + "k4_leaderboard")
print("p90", p90)
