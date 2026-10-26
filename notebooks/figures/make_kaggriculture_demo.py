import json, sys, numpy as np
sys.path.insert(0, '/home/claude/kagg')
import muzero as M, playbook as P, farm as F
from kaggle_environments import make

CROP = {"WHEAT":"W","CARROT":"C","TOMATO":"T","STRAWBERRY":"S","MELON":"M"}
ANI = {"COW":"K","SHEEP":"H","GOOSE":"G"}
def code(t):
    if t == "LOCKED": return "#"
    if t is None: return "."
    k = t.get("kind")
    if k == "WEED": return "x"
    if k == "PLANT":
        c = CROP[t["crop"]]; return c.lower() if t.get("consecutive_unwatered",0) >= 1 else c
    if t.get("animal"): return ANI.get(t["animal"], "A")
    if k in ("PASTURE","COOP"): return "p" if k=="PASTURE" else "q"
    return "?"

w = dict(np.load('/home/claude/kagg/muzero_weights.npz'))
games = []
for seed in (90000, 90001):
    a = M.MuZeroAgent(M.NumpyMuZero(w), sims=32, record=True)
    b = P.PlanAgent(P.playbook_plan)
    env = make("kaggriculture", configuration={"episodeSteps": 720, "seed": seed})
    swap = seed % 2 == 1
    env.run([b, a] if swap else [a, b])
    mz = 1 if swap else 0
    frames = []
    for st in env.steps:
        o = st[0]["observation"]
        fr = {"d": o["day"], "h": o["hour"], "p": [o["market"]["prices"][k] for k in F.PRODUCTS], "f": []}
        for side in (mz, 1-mz):
            fm = o["farms"][side]
            fr["f"].append({"m": int(fm["money"]), "t": "".join(code(t) for row in fm["tiles"] for t in row),
                            "u": [fm["farmer"]] + fm["hands"]})
        frames.append(fr)
    r = [float(s.reward or 0) for s in env.steps[-1]]
    traj = [{"plan": int(x[1]), "pi": [round(float(v),4) for v in x[2]], "money": x[3],
             "legal": [int(bool(l)) for l in x[4]], "feat": [round(float(v),5) for v in x[0]]} for x in a.traj]
    games.append({"seed": seed, "muzero_seat": mz, "final": [r[mz], r[1-mz]], "frames": frames, "traj": traj})
    print(seed, r, a.calls)
weights = {k: np.round(v.astype(float), 5).tolist() for k, v in w.items()}
json.dump({"plans": F.PLANS, "products": F.PRODUCTS, "games": games}, open('/home/claude/demo/kagg_games.json','w'), separators=(',',':'))
json.dump(weights, open('/home/claude/demo/kagg_weights.json','w'), separators=(',',':'))
