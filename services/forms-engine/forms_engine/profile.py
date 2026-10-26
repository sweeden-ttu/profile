"""Build an applicant profile from what the person provides, with provenance per value.

Sources (all optional, all supplied by the applicant):
- resume text: name, email, phone, mailing address
- plot description: farm location -> county / state via Census, OSM, FCC, plus HUD context
- GitHub handle: public profile name, location, email (GitHub's documented public API)

Every value records where it came from and how sure the engine is, and nothing is
written into a form until the person reviews it.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from typing import Optional

from . import lookups


@dataclass
class Value:
    value: str
    source: str
    evidence: str
    confidence: float


@dataclass
class Profile:
    values: dict[str, Value] = field(default_factory=dict)
    context: dict = field(default_factory=dict)
    notes: list[str] = field(default_factory=list)

    def put(self, key: str, v: Value):
        cur = self.values.get(key)
        if v.value and (cur is None or v.confidence > cur.confidence):
            self.values[key] = v

    def plain(self) -> dict[str, str]:
        return {k: v.value for k, v in self.values.items()}

    def to_dict(self) -> dict:
        return {"values": {k: asdict(v) for k, v in self.values.items()}, "context": self.context, "notes": self.notes}


_EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
_PHONE = re.compile(r"(?:\+?1[\s.-]?)?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b")
_CSZ = re.compile(r"^\s*([A-Za-z .'-]+),\s*([A-Z]{2})\s+(\d{5})(?:-\d{4})?\s*$")
_STREET = re.compile(r"^\s*(\d+[A-Za-z]?\s+[\w .#'-]+|P\.?\s?O\.?\s+Box\s+\d+)\s*$", re.I)


def split_name(full: str) -> tuple[str, str, str]:
    parts = [p for p in re.split(r"\s+", full.strip()) if p]
    parts = [p for p in parts if not re.fullmatch(r"(Mr|Mrs|Ms|Dr|Jr|Sr|II|III)\.?", p, re.I)]
    if not parts:
        return "", "", ""
    if len(parts) == 1:
        return parts[0], "", ""
    if len(parts) == 2:
        return parts[0], "", parts[1]
    return parts[0], " ".join(parts[1:-1]), parts[-1]


def from_resume(text: str, prof: Profile) -> None:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if not lines:
        return
    head = lines[0]
    if len(head.split()) <= 5 and not _EMAIL.search(head) and not re.search(r"\d", head):
        f, m, l = split_name(head)
        for k, v in (("first_name", f), ("middle_name", m), ("last_name", l)):
            prof.put(k, Value(v, "resume", f"first line: “{head}”", 0.9))
    if (m := _EMAIL.search(text)):
        prof.put("email", Value(m.group(0), "resume", "email address in résumé", 0.95))
    if (m := _PHONE.search(text)):
        prof.put("phone_primary", Value(f"({m.group(1)}) {m.group(2)}-{m.group(3)}", "resume", "phone number in résumé", 0.9))
    for i, ln in enumerate(lines[:12]):
        c = _CSZ.match(ln)
        if c:
            prof.put("city", Value(c.group(1).strip(), "resume", f"address line: “{ln}”", 0.9))
            prof.put("state", Value(c.group(2), "resume", f"address line: “{ln}”", 0.9))
            prof.put("zip", Value(c.group(3), "resume", f"address line: “{ln}”", 0.9))
            if i > 0 and _STREET.match(lines[i - 1]):
                prof.put("street_address", Value(lines[i - 1], "resume", f"line above “{ln}”", 0.85))
            break


def from_github(handle: str, prof: Profile) -> None:
    gh = lookups.github_profile(handle)
    if not gh:
        prof.notes.append(f"GitHub handle '{handle}' not found or not public.")
        return
    if gh["name"]:
        f, m, l = split_name(gh["name"])
        for k, v in (("first_name", f), ("middle_name", m), ("last_name", l)):
            prof.put(k, Value(v, "github", gh["source"], 0.7))
    if gh["email"]:
        prof.put("email", Value(gh["email"], "github", gh["source"], 0.75))
    if gh["location"]:
        prof.context["github_location"] = gh["location"]


def from_plot(description: str, prof: Profile) -> Optional[lookups.Place]:
    try:
        place = lookups.locate_plot(description)
    except Exception as e:  # network errors must not break the form
        prof.notes.append(f"Plot lookup failed: {e.__class__.__name__}")
        return None
    if not place:
        prof.notes.append("Could not locate the plot description; county left blank.")
        return None
    county = re.sub(r"\s+County$", "", place.county or "")
    evidence = f"“{description[:80]}” → {place.matched[:80]}"
    if county:
        prof.put("county", Value(county, "plot lookup (FCC Census Area API)", evidence, 0.88))
    prof.context["farm_location"] = {
        "lat": place.lat, "lon": place.lon, "county": county, "county_fips": place.county_fips,
        "state": place.state, "hud": place.hud, "sources": place.sources,
    }
    return place


def build(resume_text: str = "", plot_description: str = "", github_handle: str = "") -> Profile:
    prof = Profile()
    if resume_text:
        from_resume(resume_text, prof)
    if github_handle:
        from_github(github_handle, prof)
    if plot_description:
        from_plot(plot_description, prof)
    return prof
