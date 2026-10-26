import sys, json, numpy as np
sys.path.insert(0, "/home/claude/profile/notebooks/usd-llm"); sys.path.insert(0, "/home/claude/charts")
import usdlab as U
from pxr import Tf
from style import *
from tokenizers import Tokenizer
_st0 = U.build_toy_knee(); ref = _st0.GetRootLayer().ExportToString()
assert U.usdfid(ref, "#usda 1.0\n( nope")["score"] == 0.0
fams = list(U.CORRUPTIONS); layers = ["L1", "L2", "L3", "L4", "score"]
res = {}
for f in fams:
    rows = []
    for seed in range(20):
        c, _ = U.corrupt(ref, f, seed); r = U.usdfid(ref, c)
        l1 = 1 / (1 + r["L1_validation_errors"] + r["L0_unresolved_refs"])
        l2 = r["L2_prim_jaccard"] * r["L2_type_match"] * (0.5 + 0.5 * r["L2_metadata"])
        rows.append([l1, l2, r["L3_attributes"], r["L4_fscore"], r["score"]])
    res[f] = np.mean(rows, 0)
json.dump({k: v.tolist() for k, v in res.items()}, open("/home/claude/profile/notebooks/usd-llm/usdfid_by_family.json", "w"), indent=1)
M = np.array([res[f] for f in fams])
fig, ax = plt.subplots(figsize=(7.6, 3.9)); ax.grid(False)
from matplotlib.colors import LinearSegmentedColormap
cm = LinearSegmentedColormap.from_list("seq", ["#7a1f1f", "#b23a3a", "#e8b9a8", PAPER])
im = ax.imshow(M, cmap=cm, vmin=0, vmax=1, aspect="auto")
ax.set_xticks(range(5), ["L1 validity", "L2 structure", "L3 attributes", "L4 F-score@1%", "usdfid"]); ax.set_yticks(range(len(fams)), [f.replace("_", " ") for f in fams])
for i in range(M.shape[0]):
    for j in range(M.shape[1]): ax.text(j, i, f"{M[i, j]:.2f}", ha="center", va="center", fontsize=9, color=PAPER if M[i, j] < 0.5 else INK)
ax.set_title("usdfid by corruption family (toy knee, 20 seeds each; darker = worse)")
source(fig, "Each family moves a different layer, which is why the score is reported per layer. Code: notebooks/usd-llm/usdlab.py.")
save(fig, "/home/claude/profile/assets/images/projects/usd-llm/u2_usdfid_families")

st = U.build_toy_knee()
forms = {"inline, full float": U.serialize(st), "inline, 3 dp": U.serialize(st, 3), "inline, 1 dp": U.serialize(st, 1),
         "inline, integer mm": U.serialize(st, 0), "payload reference": U.serialize(st, payload=True)}
toks = {"Llama-3.x": "unsloth/Llama-3.2-1B-Instruct", "Gemma 4": "unsloth/gemma-4-E4B-it", "Qwen3": "Qwen/Qwen3-8B", "Mistral": "mistralai/Mistral-7B-v0.1"}
T = {k: Tokenizer.from_pretrained(v) for k, v in toks.items()}
counts = {f: {k: len(t.encode(txt).ids) for k, t in T.items()} for f, txt in forms.items()}
nverts = sum(len(p.GetAttribute("points").Get()) for p in st.Traverse() if p.GetTypeName() == "Mesh")
json.dump({"counts": counts, "chars": {f: len(t) for f, t in forms.items()}, "toy_vertices": nverts}, open("/home/claude/profile/notebooks/usd-llm/token_audit.json", "w"), indent=1)
print(json.dumps(counts, indent=1), nverts)
fig, ax = plt.subplots(figsize=(8.4, 3.6)); x = np.arange(len(forms)); w = 0.2
for k, name in enumerate(toks):
    ax.bar(x + (k - 1.5) * w, [counts[f][name] for f in forms], w * 0.92, color=C[k], label=name)
ax.set_xticks(x, list(forms), fontsize=9); ax.set_ylabel("tokens for the whole stage"); ax.legend(fontsize=9, ncol=4, loc="upper right")
ax.set_title(f"Tokenizer audit: the same 8-mesh toy knee ({nverts} vertices) in five text forms")
source(fig, "Measured with each model's Hugging Face tokenizer. Llama-3 groups digits in threes; Gemma, Qwen3 and Mistral split every digit.")
save(fig, "/home/claude/profile/assets/images/projects/usd-llm/u3_token_audit")
