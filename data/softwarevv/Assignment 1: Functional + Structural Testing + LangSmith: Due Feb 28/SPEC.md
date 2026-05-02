# Specification: Trustworthy AI Legal and Governmental Content Validator

**Course:** CS5374 Software Verification and Validation  
**Project:** Legal and Governmental Content Validator  
**Date:** February 15, 2026  
**Author:** Scott Weeden

---

## 1. Overview

This specification defines the input domain, expected output domain, and behavior for the Trustworthy AI Legal and Governmental Content Validator. The system uses LangGraph to route content through validator agents that verify legal and governmental content against authoritative sources before presenting it to users.

---

## 2. System Architecture

### 2.1 Validator Modules

The system consists of 7 independent validator agents:

1. **Legal News Source Validator** - Verifies news URLs against domain trust lists and fact-check services
2. **Judge Name Validator** - Validates judge names against federal/state court rosters
3. **Elected Official Validator** - Verifies elected officials against government APIs
4. **Election Details Validator** - Validates election information against official election board data
5. **Law/Statute Validator** - Verifies city, county, and state laws against official code repositories
6. **Court Document Validator** - Validates court documents through PACER and CourtListener API; supports PDF/DOC text extraction via Doctor
7. **Legal Template Validator** - Checks legal templates against official court form registries

### 2.3 Document Processing (Doctor Integration)

The pipeline integrates [Free Law Project Doctor](https://github.com/freelawproject/doctor) for document conversion:

| Capability | Endpoint / Method | Use Case |
|------------|-------------------|----------|
| **PDF to text** | Doctor `/extract/doc/text/` or PyPDF2 fallback | Extract text from court filings for content validation |
| **RECAP PDF extraction** | Doctor `/extract/recap/text/` | PACER-style documents with margin stripping |
| **DOC/DOCX/HTML/TXT** | Doctor `/extract/doc/text/` | Word docs, HTML, plain text |
| **OCR** | Doctor with `ocr_available=True` | Scanned PDFs |
| **Page count** | Doctor `/utils/page-count/pdf/` | Document metadata |
| **Redaction check** | Doctor `/utils/check-redactions/pdf/` | X-Ray bad redaction detection |

When Doctor is unavailable, PDF extraction falls back to PyPDF2 or pdfplumber. Set `DOCTOR_BASE_URL` (default `http://localhost:5050`) or run `docker run -p 5050:5050 freelawproject/doctor`.

### 2.2 Pipeline Flow

```
Input Content → [Router Node] → [Appropriate Validator] → [Pass/Fail Decision]
                                                              ↓
                                            ┌─────────────────┴─────────────────┐
                                            ↓                                   ↓
                                      PASS: Index                       FAIL: Reject/
                                      + Add Provenance                  Human Review
```

---

## 3. Specification Tables by Validator

### 3.1 Legal News Source Validator

| Component | Input Variable | Equivalence Partition | Description | Expected Output |
|-----------|---------------|----------------------|-------------|-----------------|
| **News Validator** | URL/Domain | **Valid (Allow-Listed)** | URL present on trusted domain list (e.g., `nytimes.com`, `scotusblog.com`, `kdhnews.com`, `bellcountytx.com`) | `{ "verified": true, "source": "domain_trust_list", "category": "news" }` |
| **News Validator** | URL/Domain | **Valid (NewsGuard)** | URL verified by NewsGuard API with rating ≥ 80 | `{ "verified": true, "source": "NewsGuard", "rating": 85 }` |
| **News Validator** | URL/Domain | **Invalid (Hallucinated/Fake)** | URL looks legal but does not exist (e.g., `supremecourt-official-news.xyz`) | `{ "verified": false, "reason": "Domain does not exist" }` |
| **News Validator** | URL/Domain | **Invalid (Satire/Misinformation)** | URL flagged by NewsGuard as satire or misinformation | `{ "verified": false, "reason": "Flagged as satire/misinformation" }` |
| **News Validator** | URL/Domain | **Invalid (Malformed)** | Non-URL strings, empty strings, or 404 links | `{ "verified": false, "reason": "Malformed URL or 404 response" }` |
| **News Validator** | URL/Domain | **Invalid (Homograph Attack)** | URL using similar-looking characters (e.g., `nytimes.com` with Cyrillic 'e') | `{ "verified": false, "reason": "Homograph attack detected" }` |

**Preconditions:** 
- Input must be a non-empty string
- Input must be a valid URL format

**Postconditions (Pass):** 
- If URL is on allow list or passes NewsGuard verification → route to "Index" node
- Add provenance metadata: `source`, `verified_at`, `verification_method`

**Postconditions (Fail):** 
- If URL fails verification → route to "Reject" or "Human Review" node
- Return error with specific reason

---

### 3.2 Judge Name Validator

| Component | Input Variable | Equivalence Partition | Description | Expected Output |
|-----------|---------------|----------------------|-------------|-----------------|
| **Judge Validator** | Judge Name + Jurisdiction | **Valid (Federal)** | Name found in U.S. Courts directory (e.g., "Chief Justice John Roberts", "Judge Avera") | `{ "verified": true, "source": "uscourts.gov", "jurisdiction": "federal" }` |
| **Judge Validator** | Judge Name + Jurisdiction | **Valid (State - TX)** | Name found in Texas Judicial Branch directory (e.g., "Justice Jane Bland") | `{ "verified": true, "source": "txcourts.gov", "jurisdiction": "texas" }` |
| **Judge Validator** | Judge Name + Jurisdiction | **Invalid (Hallucinated)** | Name sounds plausible but not in roster (e.g., "Judge Marcus Thornberry") | `{ "verified": false, "reason": "Not found in court roster" }` |
| **Judge Validator** | Judge Name + Jurisdiction | **Invalid (Historical/Retired)** | Judge who has retired or is no longer active (if spec defines valid as "currently presiding") | `{ "verified": false, "reason": "Judge is retired/inactive" }` |
| **Judge Validator** | Judge Name + Jurisdiction | **Invalid (Wrong Jurisdiction)** | Real judge name but wrong court level (e.g., "Chief Justice" for a federal district judge) | `{ "verified": false, "reason": "Jurisdiction mismatch" }` |
| **Judge Validator** | Judge Name + Jurisdiction | **Invalid (Empty/Malformed)** | Empty string, numbers only, or special characters | `{ "verified": false, "reason": "Invalid name format" }` |

**Preconditions:**
- Input must be a non-empty string
- Input must contain at least a name (jurisdiction optional for some validators)

**Postconditions (Pass):**
- If name found in authoritative roster → route to "Index" node
- Add provenance: `source`, `verified_at`, `court`, `position`

**Postconditions (Fail):**
- If name not found or invalid → route to "Reject" or "Human Review" node

---

### 3.3 Elected Official Validator

| Component | Input Variable | Equivalence Partition | Description | Expected Output |
|-----------|---------------|----------------------|-------------|-----------------|
| **Official Validator** | Official Name + Role | **Valid (Senator)** | Name exists in Congress.gov API (e.g., "Senator Ted Cruz") | `{ "verified": true, "source": "congress.gov", "role": "senator", "state": "TX" }` |
| **Official Validator** | Official Name + Role | **Valid (Representative)** | Name exists in Congress.gov API (e.g., "Representative John Ratcliffe") | `{ "verified": true, "source": "congress.gov", "role": "representative", "district": 4 }` |
| **Official Validator** | Official Name + Role | **Valid (State Official)** | Name found in Texas Secretary of State database (e.g., "Governor Greg Abbott") | `{ "verified": true, "source": "sos.state.tx.us", "role": "governor" }` |
| **Official Validator** | Official Name + Role | **Invalid (Hallucinated)** | Name not in API (e.g., "Senator John Doe") | `{ "verified": false, "reason": "Not found in official registry" }` |
| **Official Validator** | Official Name + Role | **Invalid (Role Mismatch)** | Name exists but wrong role (e.g., "President Ted Cruz") | `{ "verified": false, "reason": "Role mismatch" }` |
| **Official Validator** | Official Name + Role | **Invalid (Term Expired)** | Official was valid but term has ended | `{ "verified": false, "reason": "Term expired" }` |

**Preconditions:**
- Input must be a non-empty string
- Input should contain a name and optionally a role

**Postconditions (Pass):**
- If official found in API with matching role → route to "Index" node
- Add provenance: `source`, `verified_at`, `term_start`, `term_end`

**Postconditions (Fail):**
- If official not found or mismatch → route to "Reject" node

---

### 3.4 Election Details Validator

| Component | Input Variable | Equivalence Partition | Description | Expected Output |
|-----------|---------------|----------------------|-------------|-----------------|
| **Election Validator** | Election Query | **Valid (FEC Record)** | Election data found in FEC API (e.g., "2024 Texas Senate race") | `{ "verified": true, "source": "fec.gov", "election_type": "senate" }` |
| **Election Validator** | Election Query | **Valid (State Election Board)** | Election data found in state election board (e.g., Texas Secretary of State) | `{ "verified": true, "source": "sos.state.tx.us", "election_type": "general" }` |
| **Election Validator** | Election Query | **Valid (Candidate)** | Candidate exists in candidate registry with valid filing | `{ "verified": true, "source": "fec.gov", "candidate_name": "Ted Cruz", "status": "active" }` |
| **Election Validator** | Election Query | **Invalid (Fabricated)** | Election details that don't exist (e.g., "2024 Texas Presidential Primary in March") | `{ "verified": false, "reason": "Election not found in official records" }` |
| **Election Validator** | Election Query | **Invalid (Wrong Date)** | Real election but wrong date | `{ "verified": false, "reason": "Date mismatch" }` |
| **Election Validator** | Election Query | **Invalid (Opponent Fabricated)** | Real candidate with fabricated opponent | `{ "verified": false, "reason": "Opponent not found in filing" }` |

**Preconditions:**
- Input must be a non-empty string
- Input should contain election-related query

**Postconditions (Pass):**
- If election data found in authoritative source → route to "Index" node

**Postconditions (Fail):**
- If election data not found → route to "Reject" node

---

### 3.5 Law/Statute Validator

| Component | Input Variable | Equivalence Partition | Description | Expected Output |
|-----------|---------------|----------------------|-------------|-----------------|
| **Law Validator** | Statute Citation | **Valid (Texas Statutes)** | Citation found in statutes.capitol.texas.gov (e.g., "Penal Code Chapter 22") | `{ "verified": true, "source": "statutes.capitol.texas.gov", "chapter": "22", "title": "Penal Code" }` |
| **Law Validator** | Statute Citation | **Valid (Texas Administrative Code)** | Citation found in TX Admin Code (e.g., "1 TAC § 3.3701") | `{ "verified": true, "source": "sos.state.tx.us", "code": "TAC", "section": "3.3701" }` |
| **Law Validator** | Statute Citation | **Valid (City Ordinance)** | Ordinance found in eCode360 or city code repository | `{ "verified": true, "source": "ecode360.com", "jurisdiction": "bell_county" }` |
| **Law Validator** | Statute Citation | **Invalid (Non-existent)** | Citation formatted correctly but doesn't exist (e.g., "Penal Code Chapter 99") | `{ "verified": false, "reason": "Statute not found in official code" }` |
| **Law Validator** | Statute Citation | **Invalid (Amended/Repealed)** | Statute existed but has been amended or repealed | `{ "verified": false, "reason": "Statute has been amended/repealed" }` |
| **Law Validator** | Statute Citation | **Invalid (Malformed)** | Incorrect citation format or typographical errors | `{ "verified": false, "reason": "Malformed citation format" }` |

**Preconditions:**
- Input must be a non-empty string
- Input should be a recognizable citation format

**Postconditions (Pass):**
- If statute found and current → route to "Index" node
- Add provenance: `source`, `verified_at`, `code_title`, `effective_date`

**Postconditions (Fail):**
- If statute not found or invalid → route to "Reject" node

---

### 3.6 Court Document Validator

| Component | Input Variable | Equivalence Partition | Description | Expected Output |
| **Court Doc Validator** | document_path / document_bytes | **Valid (with extraction)** | PDF/DOC path or bytes provided; text extracted via Doctor or fallback; used to enrich citation validation | `{ "verified": true, "source": "courtlistener.com + document_extraction", ... }` |
| **Court Doc Validator** | Case Citation/Docket ID | **Valid (Federal - CourtListener)** | Citation returns 200 OK with JSON from CourtListener (e.g., "Mata v. Avianca, Inc., 22-CV-1461") | `{ "verified": true, "source": "courtlistener.com", "docket_id": "63107798", "case_name": "Mata v. Avianca" }` |
| **Court Doc Validator** | Case Citation/Docket ID | **Valid (Federal - PACER)** | Document found in PACER system | `{ "verified": true, "source": "pacer.gov", "docket_number": "22-cv-1461" }` |
| **Court Doc Validator** | Case Citation/Docket ID | **Valid (Texas State)** | Document found in Texas eFiling or state court records | `{ "verified": true, "source": "efiletexas.gov", "case_number": "12345" }` |
| **Court Doc Validator** | Case Citation/Docket ID | **Invalid (Non-existent)** | Citation formatted correctly but returns "Not Found" | `{ "verified": false, "reason": "Case not found in court records" }` |
| **Court Doc Validator** | Case Citation/Docket ID | **Invalid (Sealed/Restricted)** | Document exists but is sealed or access restricted | `{ "verified": false, "reason": "Document sealed or restricted" }` |
| **Court Doc Validator** | Case Citation/Docket ID | **Invalid (Malformed)** | Incorrect citation format (e.g., "Case v. Case, 123 F.3d 456" with invalid reporter) | `{ "verified": false, "reason": "Malformed citation format" }` |

**Preconditions:**
- Input must be a non-empty string
- Input should contain a recognizable case citation or docket number

**Postconditions (Pass):**
- If document found and accessible → route to "Index" node
- Add provenance: `source`, `verified_at`, `docket_number`, `filing_date`, `status`

**Postconditions (Fail):**
- If document not found or restricted → route to "Reject" node

---

### 3.7 Legal Template Validator

| Component | Input Variable | Equivalence Partition | Description | Expected Output |
|-----------|---------------|----------------------|-------------|-----------------|
| **Template Validator** | Template Name/Form ID | **Valid (Federal Forms)** | Form found in USCourt.gov forms database | `{ "verified": true, "source": "uscourts.gov", "form_id": "AO 199", "form_name": "Notice, Consent, and Reference of a Dispositive Motion" }` |
| **Template Validator** | Template Name/Form ID | **Valid (Texas State Forms)** | Form found in Texas Courts forms registry | `{ "verified": true, "source": "txcourts.gov", "form_number": "CR-100", "form_name": "Defendant's Motion to Suppress" }` |
| **Template Validator** | Template Name/Form ID | **Valid (Checksum)** | Template file matches official SHA-256 hash | `{ "verified": true, "source": "checksum_validation", "checksum_match": true }` |
| **Template Validator** | Template Name/Form ID | **Invalid (Non-existent)** | Form doesn't exist in official registry | `{ "verified": false, "reason": "Form not found in official registry" }` |
| **Template Validator** | Template Name/Form ID | **Invalid (Modified)** | Template exists but has been modified from official version | `{ "verified": false, "reason": "Checksum mismatch - template modified" }` |
| **Template Validator** | Template Name/Form ID | **Invalid (Outdated)** | Form has been superseded by newer version | `{ "verified": false, "reason": "Form has been superseded" }` |

**Preconditions:**
- Input must be a non-empty string
- Input should contain a form name, form ID, or file

**Postconditions (Pass):**
- If template verified against official source → route to "Index" node
- Add provenance: `source`, `verified_at`, `version`, `checksum`

**Postconditions (Fail):**
- If template invalid → route to "Reject" node

---

## 4. Common Output Schema

All validators return a consistent JSON schema:

### 4.1 Success Output (Valid Content)
```json
{
  "verified": true,
  "source": "<authoritative_source>",
  "verified_at": "2026-02-15T14:30:00Z",
  "verification_method": "<method_used>",
  "metadata": {
    // Validator-specific fields
  }
}
```

### 4.2 Failure Output (Invalid Content)
```json
{
  "verified": false,
  "reason": "<specific_failure_reason>",
  "verified_at": "2026-02-15T14:30:00Z",
  "source": "<validator_name>",
  "recommendation": "reject" | "human_review"
}
```

---

## 5. Test Oracle

The specification serves as the **Test Oracle** for Black Box Testing:

| Oracle Type | Implementation | Location |
|-------------|----------------|----------|
| **Domain Allow List** | Trusted domain sets for news, courts, legislation | `config/settings.py` |
| **API Responses** | CourtListener, Congress.gov, FEC, PACER | External APIs |
| **Checksum Manifest** | SHA-256 hashes for template integrity | `legal-luminary-site/verification/manifest.json` |
| **Ground Truth Citations** | 10+ landmark legal cases with known-correct citations | `experiments/exp1_baseline.py` |

---

## 6. Verification vs. Validation

| Concept | Definition | Application in This System |
|---------|------------|---------------------------|
| **Verification** | Are we building the spec correctly? | Structural tests, coverage analysis, SHA-256 validation |
| **Validation** | Does the product meet user needs? | EP functional tests, pipeline smoke tests, LLM quality evaluations |

---

## 7. Equivalence Partitioning Summary

| Validator | Valid Partition | Invalid Partition (Hallucinated) | Invalid Partition (Malformed) |
|-----------|----------------|--------------------------------|------------------------------|
| News Source | Allow-listed domains | Fake domains | Non-URL strings |
| Judge | Court roster names | Fabricated names | Empty/special chars |
| Official | Congress.gov names | Fake officials | Wrong role |
| Election | FEC/State records | Fabricated elections | Wrong dates |
| Law | Official statutes | Non-existent chapters | Bad format |
| Court Doc | CourtListener/PACER | Fake case citations | Invalid docket format |
| Template | Official forms registry | Non-existent forms | Checksum mismatch |

---

## 8. Boundary Value Analysis Points

| Boundary | Below | At | Above | Interior |
|----------|-------|----|-------|----------|
| Confidence threshold | < 0.7 | 0.7 | > 0.7 | 0.85 |
| URL similarity (homograph) | `txcourts.gov` ✓ | Homograph ✗ | `txcourts.gov.evil.com` ✗ | `search.txcourts.gov` ✓ |
| Retry limit | 2 | 3 | 4 | 1 |
| Empty input | `""` | `" "` | `"a"` | Valid input |

---

## 9. Human Test Questions (User-Facing)

The following natural-language questions are representative of what humans might ask; the Legal Luminary agent classifies and routes them to the appropriate validator. These questions serve as **acceptance test cases** and **demo inputs** for the pipeline.

| # | Human question / request | Expected content type | Example query used | Expected behavior |
|---|--------------------------|------------------------|--------------------|--------------------|
| H1 | "Is this news site trustworthy?" / "Check this URL" | news_source | URL (e.g. `https://www.supremecourt.gov/...`) | Verify against allow list / NewsGuard |
| H2 | "Is Chief Justice John Roberts a real judge?" | judge | "Chief Justice John Roberts" | Verify against CourtListener / court roster |
| H3 | "Is Ted Cruz really a U.S. Senator from Texas?" | official | "Senator Ted Cruz, Texas" | Verify against Congress.gov |
| H4 | "When was the 2024 presidential election?" / "Who ran in 2024?" | election | "2024 Presidential Election" | Verify against FEC / state election board |
| H5 | "What does Texas Penal Code Chapter 22 say?" / "Is this statute real?" | law | "Texas Penal Code Chapter 22" or citation | Verify against statutes.capitol.texas.gov |
| H6 | "Can you verify this court case?" / "Is this case citation real?" | court_document | "Brown v. Board of Education, 347 U.S. 483 (1954)" | Verify against CourtListener / PACER |
| H7 | "Is federal form AO 440 the right summons form?" | legal_template | "AO 440 - Summons in a Civil Action" | Verify against USCourt.gov forms |
| H8 | "Is [Name] a notary in Texas?" | notary_public | Person name or "Notary, Austin TX" | Verify against Texas SOS Notary dataset (data.texas.gov) |
| H9 | "Was Judge Marcus Thornberry on the Supreme Court?" | judge | Fabricated name | Reject / not found in roster |
| H10 | "Is Scott Weeden a Texas notary?" | notary_public | "Scott Weeden" | **Must fail** (negative test per rubric — not in SOS database) |

**Demo and sample outputs:** Demonstration API calls and example outputs for these questions are on the **Artificial Intelligence** page: [Legal Luminary Agent — Demonstration](/artificial-intelligence/#legal-luminary-agent-demonstration) (example calls and sample JSON outputs).

---

## 10. References

- CourtListener API: https://www.courtlistener.com/api/
- Free Law Project Doctor: https://github.com/freelawproject/doctor
- PACER: https://www.pacer.gov/
- Congress.gov API: https://www.congress.gov/
- FEC API: https://www.fec.gov/
- Texas Statutes: https://statutes.capitol.texas.gov
- Texas Courts: https://www.txcourts.gov/
- NewsGuard: https://www.newsguardtech.com/
- NIST AI Risk Management Framework

---

**End of Specification**