"""Public-data lookups used to fill location fields, each returning its source URL.

- U.S. Census Bureau geocoder: street address -> coordinates, county, state.
- OpenStreetMap Nominatim: place names in a plot description -> coordinates.
- FCC Census Area API: coordinates -> county name, county FIPS, state.
- HUD eGIS open data (ArcGIS): Fair Market Rent area and Qualified Census Tract status.
- HUD USER API (optional, needs HUD_API_TOKEN): county median family income / income limits.

All calls are plain HTTPS GETs with short timeouts, no personal data beyond the
location text the person supplied, and nothing is cached server-side.
"""
from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from typing import Optional

import httpx

UA = {"User-Agent": "forms-engine/0.1 (+https://scottweeden.online/apps/forms-engine/)"}
TIMEOUT = httpx.Timeout(15.0)
HUD_GIS = "https://services.arcgis.com/VTyQ9soqVukalItT/ArcGIS/rest/services"

STATES = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR", "california": "CA", "colorado": "CO",
    "connecticut": "CT", "delaware": "DE", "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS", "kentucky": "KY", "louisiana": "LA",
    "maine": "ME", "maryland": "MD", "massachusetts": "MA", "michigan": "MI", "minnesota": "MN",
    "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY", "north carolina": "NC",
    "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA",
    "rhode island": "RI", "south carolina": "SC", "south dakota": "SD", "tennessee": "TN", "texas": "TX",
    "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
    "wisconsin": "WI", "wyoming": "WY",
}


@dataclass
class Place:
    query: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    county: str = ""
    county_fips: str = ""
    state: str = ""
    matched: str = ""
    sources: list[str] = field(default_factory=list)
    hud: dict = field(default_factory=dict)


def census_address(address: str) -> Optional[Place]:
    url = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress"
    params = {"address": address, "benchmark": "Public_AR_Current", "vintage": "Current_Current", "format": "json"}
    r = httpx.get(url, params=params, headers=UA, timeout=TIMEOUT)
    r.raise_for_status()
    matches = r.json().get("result", {}).get("addressMatches", [])
    if not matches:
        return None
    m = matches[0]
    p = Place(query=address, lat=m["coordinates"]["y"], lon=m["coordinates"]["x"], matched=m.get("matchedAddress", ""))
    counties = m.get("geographies", {}).get("Counties", [])
    if counties:
        p.county = counties[0].get("NAME", "")
        p.county_fips = counties[0].get("STATE", "") + counties[0].get("COUNTY", "")
    comp = m.get("addressComponents", {})
    p.state = comp.get("state", "")
    p.sources.append(str(r.url))
    return p


def nominatim(q: str) -> Optional[Place]:
    r = httpx.get("https://nominatim.openstreetmap.org/search",
                  params={"q": q, "format": "jsonv2", "addressdetails": 1, "limit": 1, "countrycodes": "us"},
                  headers=UA, timeout=TIMEOUT)
    r.raise_for_status()
    js = r.json()
    if not js:
        return None
    a = js[0]
    p = Place(query=q, lat=float(a["lat"]), lon=float(a["lon"]), matched=a.get("display_name", ""))
    p.sources.append(str(r.url))
    return p


def fcc_area(p: Place) -> Place:
    r = httpx.get("https://geo.fcc.gov/api/census/area", params={"lat": p.lat, "lon": p.lon, "format": "json"},
                  headers=UA, timeout=TIMEOUT)
    r.raise_for_status()
    res = (r.json().get("results") or [{}])[0]
    p.county = res.get("county_name") or p.county
    p.county_fips = res.get("county_fips") or p.county_fips
    p.state = res.get("state_code") or p.state
    p.sources.append(str(r.url))
    return p


def _hud_point(service: str, p: Place) -> tuple[dict, str]:
    url = f"{HUD_GIS}/{service}/FeatureServer/0/query"
    params = {"geometry": f"{p.lon},{p.lat}", "geometryType": "esriGeometryPoint", "inSR": 4326,
              "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "returnGeometry": "false", "f": "json"}
    r = httpx.get(url, params=params, headers=UA, timeout=TIMEOUT)
    r.raise_for_status()
    feats = r.json().get("features", [])
    return (feats[0]["attributes"] if feats else {}), str(r.url)


def hud(p: Place) -> Place:
    """HUD open data for the point; optional HUD USER income limits with a token."""
    try:
        fmr, u1 = _hud_point("Fair_Market_Rents", p)
        if fmr:
            p.hud["fmr_area"] = fmr.get("FMR_AREANAME", "")
            p.hud["fmr_2br_usd"] = fmr.get("FMR_2BDR")
        p.sources.append(u1)
        qct, u2 = _hud_point("QUALIFIED_CENSUS_TRACTS", p)
        p.hud["qualified_census_tract"] = bool(qct)
        p.sources.append(u2)
    except httpx.HTTPError as e:
        p.hud["error"] = f"HUD eGIS unavailable: {e.__class__.__name__}"
    token = os.environ.get("HUD_API_TOKEN")
    if token and p.county_fips:
        try:
            r = httpx.get(f"https://www.huduser.gov/hudapi/public/il/data/{p.county_fips}99999",
                          headers={**UA, "Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
            if r.status_code == 200:
                d = r.json().get("data", {})
                p.hud["median_family_income_usd"] = d.get("median_income")
                p.sources.append(str(r.url))
        except httpx.HTTPError:
            pass
    return p


_COORD = re.compile(r"(-?\d{1,2}\.\d{3,})\s*[, ]\s*(-?\d{2,3}\.\d{3,})")
_COUNTY = re.compile(r"\b([A-Z][A-Za-z .'-]+?) County\b,?\s*(?:in\s+)?([A-Z][a-z]+(?: [A-Z][a-z]+)?|[A-Z]{2})?")
_TOWN = re.compile(r"\b(?:near|outside|north of|south of|east of|west of|in|at)\s+([A-Z][A-Za-z .'-]+?),\s*([A-Z][a-z]+(?: [A-Z][a-z]+)?|[A-Z]{2})\b")


def _state_code(s: str) -> str:
    s = (s or "").strip()
    return s.upper() if len(s) == 2 else STATES.get(s.lower(), "")


def locate_plot(description: str) -> Optional[Place]:
    """Coordinates, a street address, a 'near <town>, <state>' phrase, or '<X> County, <state>'."""
    m = _COORD.search(description)
    if m:
        p = Place(query=description, lat=float(m.group(1)), lon=float(m.group(2)), matched="coordinates in description")
        return hud(fcc_area(p))
    if re.search(r"\d+ [A-Za-z0-9 .]+ (St|Street|Rd|Road|Ave|Avenue|Hwy|Highway|FM|CR|Dr|Drive|Ln|Lane)\b", description):
        try:
            p = census_address(description)
            if p:
                return hud(fcc_area(p))
        except httpx.HTTPError:
            pass
    queries = []
    t = _TOWN.search(description)
    if t and _state_code(t.group(2)):
        queries.append(f"{t.group(1).strip()}, {_state_code(t.group(2))}")
    c = _COUNTY.search(description)
    if c and _state_code(c.group(2) or ""):
        queries.append(f"{c.group(1).strip()} County, {_state_code(c.group(2))}")
    for q in queries:
        try:
            p = nominatim(q)
        except httpx.HTTPError:
            continue
        if p:
            p.query = description
            return hud(fcc_area(p))
    return None


def github_profile(handle: str) -> Optional[dict]:
    """Public GitHub profile (the only social platform with an open, ToS-friendly API)."""
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})", handle or ""):
        return None
    r = httpx.get(f"https://api.github.com/users/{handle}", headers={**UA, "Accept": "application/vnd.github+json"}, timeout=TIMEOUT)
    if r.status_code != 200:
        return None
    d = r.json()
    return {"name": d.get("name") or "", "location": d.get("location") or "", "email": d.get("email") or "",
            "blog": d.get("blog") or "", "company": d.get("company") or "", "source": str(r.url)}
