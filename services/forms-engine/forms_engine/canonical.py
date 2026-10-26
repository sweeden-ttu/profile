"""Map each field's label to a shared ("canonical") key.

Fields with the same key become one PDF field with several widgets, so typing a
first name once fills every first-name box in the packet. Composite boxes
("Name and Address Including Zip Code") are computed from the parts.

Every decision records the rule that fired and a confidence, and a deny list keeps
sensitive fields (tax IDs, signatures, demographics, birth dates, bank details)
from ever being filled automatically. They can still be linked, so a person types
their TIN once, but the engine never supplies the value.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from .model import FormField

# Keys the cover sheet shows, in order, with human labels.
CANONICAL_KEYS: dict[str, str] = {
    "first_name": "First name",
    "middle_name": "Middle name or initial",
    "last_name": "Last name",
    "street_address": "Street or mailing address",
    "address_line2": "Address line 2 (optional)",
    "city": "City",
    "state": "State (2 letters)",
    "zip": "ZIP code",
    "county": "County of the farm operation",
    "phone_primary": "Primary phone",
    "phone_mobile": "Mobile phone",
    "phone_business": "Business phone",
    "phone_alt": "Additional phone",
    "email": "Email",
    "business_type": "Business type (Individual, LLC, Trust ...)",
    "tax_id": "Taxpayer ID (never auto-filled)",
}

# Read-only boxes computed from the parts above (JavaScript in the PDF, Python on fill).
COMPUTED: dict[str, str] = {
    "full_name": "Full legal name",
    "name_address": "Name and address including ZIP",
    "city_state_zip": "City, state and ZIP",
    "address_block": "Address including ZIP",
}

NEVER_AUTOFILL = {"tax_id", "date_of_birth", "signature", "signature_date", "demographic", "bank"}

_NEG_PERSON = r"office|lender|spouse|member|agent|representative|witness|bank|employer|landlord|landowner|official|preparer|attorney|county fsa|servicing|loan officer|creditor|business partner"


@dataclass
class Rule:
    key: str
    pattern: str
    kinds: tuple[str, ...] = ("text",)
    negative: str = ""
    autofill: bool = True


RULES: list[Rule] = [
    # sensitive: linked or excluded, never auto-filled
    Rule("signature", r"\bsignature\b|signed by|\bsign here\b", ("text", "signature")),
    Rule("signature_date", r"date\b.*\bsign|sign.*\bdate|\bdate signed", ("text", "date")),
    Rule("tax_id", r"\bssn\b|social security (number|card|no)|taxpayer identification|\btin\b|\bein\b|tax ?id\b|tax identification", ("text",)),
    Rule("date_of_birth", r"birth ?date|date of birth|\bdob\b", ("text", "date")),
    Rule("demographic", r"\brace\b|ethnic|hispanic|\bsex\b|gender|veteran|disabilit", ("text", "checkbox", "radio")),
    Rule("bank", r"routing|bank account|account number|financial institution", ("text",)),
    # identity
    Rule("name_address", r"name\b.*\baddress", negative=_NEG_PERSON),
    Rule("address_block", r"address.{0,25}(including|with|and) zip", negative=_NEG_PERSON),
    Rule("first_name", r"\bfirst name\b|given name", negative=_NEG_PERSON),
    Rule("middle_name", r"middle (name|initial)|\bm\.?i\.?\b", negative=_NEG_PERSON),
    Rule("last_name", r"\blast name\b|surname|family name", negative=_NEG_PERSON),
    Rule("full_name", r"(full|legal|applicant.?s?|customer.?s?|producer.?s?|borrower.?s?|participant.?s?|printed|exact) (full )?(legal )?name\b|^name$|^2\.? ?name\b|name of (applicant|customer|producer|participant)",
         negative=_NEG_PERSON + r"|business name only"),
    Rule("city_state_zip", r"city.{0,12}state.{0,12}zip"),
    Rule("address_line2", r"address line 2|p\.?o\.? box,? if applicable|apartment|suite"),
    Rule("street_address", r"street address|mailing address|address line|^address\b|p\.?o\.? box", negative=r"e-?mail|" + _NEG_PERSON),
    Rule("city", r"\bcity\b", negative=r"state.{0,10}zip|" + _NEG_PERSON),
    Rule("state", r"\b2.digit state\b|^state\b|\bstate$|your state\b", negative=r"united states|statement|" + _NEG_PERSON),
    Rule("zip", r"\bzip\b|postal code", negative=_NEG_PERSON),
    Rule("county", r"\bcounty\b", negative=r"county (fsa )?office|office|" + _NEG_PERSON),
    Rule("phone_alt", r"(additional|alternate|second).{0,30}(phone|telephone)"),
    Rule("phone_primary", r"home or cell|home (tele)?phone|primary phone"),
    Rule("phone_mobile", r"mobile|\bcell\b|cellular"),
    Rule("phone_business", r"business (tele)?phone|work (tele)?phone|business telephone"),
    Rule("phone_primary", r"phone|telephone", negative=r"office|lender|fax|" + _NEG_PERSON.replace("|business partner", "")),
    Rule("email", r"e-?mail address|^e-?mail\b|your e-?mail", negative=r"receive|" + _NEG_PERSON),
    Rule("business_type", r"business type|type of (business|entity)|legal entity type"),
]

# Parts of a form about someone other than the applicant: never linked to the applicant.
OTHER_PERSON_SECTION = r"member|spouse|co-?applicant|entity|lender|landlord|creditor|reference|preparer|representative|other"

_CONF = {"name": 0.82, "tooltip": 0.92, "caption": 0.9, "nearby-text": 0.75, "name": 0.7, "ocr": 0.6, "vlm": 0.8, "claude": 0.85}


def _norm(f: FormField) -> str:
    text = f"{f.label} | {f.tooltip}" if f.tooltip and f.tooltip != f.label else f.label
    text = text.lower().replace("’", "'")
    return re.sub(r"\s+", " ", text).strip()


def _texts(f: FormField) -> list[tuple[str, str]]:
    """Descriptive field names first (XFA/AcroForm names are often full sentences), then labels."""
    from .xfa import humanize
    out = []
    hn = humanize(f.name.split("=")[0]).lower()
    if len(hn.split()) >= 2:
        out.append(("name", hn))
    out.append((f.label_source or "label", _norm(f)))
    return out


SENSITIVE = {"signature", "signature_date", "tax_id", "date_of_birth", "demographic", "bank"}


def _match(text: str, kind: str) -> Rule | None:
    for rule in RULES:
        if kind in rule.kinds and re.search(rule.pattern, text) and not (rule.negative and re.search(rule.negative, text)):
            return rule
    return None


def classify(f: FormField) -> FormField:
    """Match the descriptive field name and the label/tooltip separately, then choose.

    The label usually wins (it is what a person reads), except that a sensitive word
    in a long tooltip ("...exactly as it appears on your SSN card") does not
    override a name that clearly says "Full Name and Address".
    """
    if re.match(r"^\s*row \d+", f.label, re.I):
        return f  # table rows describe different items; never linked
    label_text = _norm(f)
    other = bool(f.section and re.search(OTHER_PERSON_SECTION, f.section, re.I)) or bool(re.search(_NEG_PERSON + r"|entity contact|additional member", label_text))
    from .xfa import humanize
    hn = humanize(f.name.split("=")[0]).lower()
    by_name = _match(hn, f.kind) if len(hn.split()) >= 2 else None
    by_label = _match(label_text, f.kind)
    if by_label and by_name and by_label.key in SENSITIVE and by_name.key not in SENSITIVE:
        rule, src = by_name, "name"
    elif by_label:
        rule, src = by_label, f.label_source or "label"
    elif by_name:
        rule, src = by_name, "name"
    else:
        return f
    if rule.key in ("signature", "signature_date", "demographic", "bank", "tax_id", "date_of_birth"):
        # Sensitive: kept on its own form (a full TIN and a "last 4 digits" box must not
        # be linked) and never filled by the engine.
        f.autofill_allowed = False
        f.canonical_rule = f"{rule.key} (sensitive: not linked, never auto-filled)"
        return f
    if other:
        f.canonical_rule = f"{rule.key} (not linked: about another person)"
        return f
    f.canonical = rule.key
    f.canonical_rule = f"{src}: {rule.pattern[:50]}"
    f.canonical_confidence = _CONF.get(src, 0.8)
    f.autofill_allowed = rule.key not in NEVER_AUTOFILL
    return f


def _item_no(f: FormField) -> str | None:
    from .xfa import humanize
    for t in (humanize(f.name.split("=")[0]), f.label):
        m = re.match(r"^\s*(\d{1,2})[A-Za-z]?\b", t)
        if m:
            return m.group(1)
    return None


def classify_all(fields: list[FormField]) -> dict[str, int]:
    """Classify every field. Items whose sibling boxes are about someone else
    (e.g. 1A "County FSA Office Name and Address", 1B "Telephone") stay unlinked."""
    other_items: set[tuple[str, int, str]] = set()
    for f in fields:
        n = _item_no(f)
        if n and re.search(_NEG_PERSON, _norm(f)):
            other_items.add((f.form, f.page, n))
    counts: dict[str, int] = {}
    for f in fields:
        n = _item_no(f)
        if n and (f.form, f.page, n) in other_items:
            f.canonical_rule = "not linked: item is about another party"
            continue
        classify(f)
        if f.canonical:
            counts[f.canonical] = counts.get(f.canonical, 0) + 1
    return counts
