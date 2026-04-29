# CS5374 Software Verification and Validation — Project Rubric

## Spring 2026 | Texas Tech University

---

## Overview

This rubric establishes the guidelines by which remote students shall accomplish and submit the examples given for the class. Students must first complete the class exercises and assignments, then apply the principles and topics discussed in lectures to their initial project design. The final deliverable is a "legal-luminary" agent that accomplishes the goals set forth in the project specification.

---

## Part 1: Class Exercise Prerequisites

Before beginning the project, students must complete and submit:

### 1.1 Vague Specification Agent (Quiz 1)
- **File:** `quiz1_vague_spec_agent.py`
- **Requirements:**
  - Build a LangGraph agent that classifies specifications as vague or precise
  - Transform vague specs into precise testable requirements
  - Generate test case specifications from the refined requirements
- **Submission:** Python code + sample outputs for 5 test inputs

### 1.2 Functional & Structural Testing (Part 2A)
- **Requirements:**
  - Perform Equivalence Partitioning (EP) analysis on provided code
  - Design minimum 20 functional test cases using EP methodology
  - Achieve ≥80% statement coverage with EP tests
  - Add structural tests to reach ≥95% coverage
- **Submission:** Test files + coverage reports

### 1.3 LangSmith Tracing (Part 2B)
- **Requirements:**
  - Enable LangSmith tracing on the Quiz 1 agent
  - Demonstrate traceable chain execution
  - Document all nodes and LLM calls
- **Submission:** Traced outputs + screenshots from LangSmith dashboard

---

## Part 2: Project — Legal Luminary Agent

### 2.1 Project Objectives

The legal-luminary agent validates legal and governmental content by:

1. **Verifying court documents** against authoritative sources (CourtListener, PACER)
2. **Validating laws/statutes** via Congress.gov API
3. **Confirming judge credentials** through CourtListener
4. **Checking elected officials** via FEC and Congress.gov
5. **Verifying elections** against official records
6. **Validating templates/forms** against official registries

### 2.2 Architecture Requirements

| Component | Description | Points |
|-----------|-------------|--------|
| **Pipeline** | LangGraph-based validation pipeline with 7 validator routes | 15 |
| **Validators** | 7 independent validator agents (news, judge, official, election, law, court doc, template) | 10 |
| **State Management** | Centralized PipelineState with provenance metadata | 5 |
| **Texas Data Crawler** | LangGraph pipeline crawling data.texas.gov for ground-truth datasets | 5 |
| **Site Content Verifier** | Automated verification of legalluminary.com content against authoritative sources | 5 |

### 2.3 Technical Stack

- **Framework:** LangGraph (agentic workflow)
- **Orchestration:** LangGraph (state-based deterministic workflow)
- **LLM (Cloud):** OpenAI GPT-4o-mini (temperature=0 for deterministic testing)
- **LLM (Local/HPCC):** Ollama running granite-code:34b on Texas Tech HPCC (V100 GPU)
- **Tracing / Observability:** LangSmith for full node-by-node observability
- **APIs:** CourtListener, Congress.gov, FEC, NewsGuard, Socrata SODA (data.texas.gov)
- **Testing:** pytest with pytest-cov
- **Automation:** GitHub Actions (CI/CD test driver)
- **Compute:** Texas Tech HPCC (Slurm, matador partition, V100 GPU)

---

## Part 3: Grading Rubric

### 3.1 Component Breakdown

| # | Component | Deliverable | Points | Deadline |
|---|-----------|-------------|--------|----------|
| 1 | Project Proposal | Written proposal with hypothesis, experiments, architecture | 5 | Week 3 |
| 2 | Source Code — Pipeline | LangGraph validation pipeline (`pipeline.py`) with 7 validator agents | 15 | Week 5 |
| 3 | Source Code — Validators | 7 validator modules: news, judge, official, election, law, court doc, template | 10 | Week 5 |
| 4 | Experiment 1 | Baseline hallucination rate measurement (10 ground-truth citations) | 10 | Week 7 |
| 5 | Experiment 2 | Pipeline effectiveness — precision, recall, hallucination rate | 10 | Week 8 |
| 6 | Experiment 3 | LangGraph node validation vs post-hoc verification comparison | 10 | Week 9 |
| 7 | Experiment 4 | Security red-team evaluation (10 adversarial tests) | 10 | Week 10 |
| 8a | Experiment 5 | Texas Data Pipeline — ground-truth discovery from data.texas.gov | 5 | Week 11 |
| 8b | Experiment 6 | legalluminary.com site content verification (SHA-256, URL reachability, legal claims, notary negative test) | 5 | Week 12 |
| 9 | EP Functional Tests | 20+ EP test cases with tabular design + implementation | 10 | Week 6 |
| 9 | Structural Tests | Minimum 40 tests achieving 80%+ coverage | 5 | Week 6 |
| 10 | Coverage Report | Statement coverage ≥80% (target: 95%+) | 5 | Week 6 |
| 11 | LangSmith Tracing | Full tracing enabled across all validators and pipeline | 5 | Week 5 |
| 12 | Blog Posts | 3 conceptual blog posts exploring theoretical foundations | 5 | Week 11 |
| **TOTAL** | | | **100** | |

### 3.2 Grading Standards

| Grade | Points | Requirements |
|-------|--------|--------------|
| A | 90-100 | All components complete + ≥95% coverage + 4 experiments documented |
| B | 80-89 | All components complete + ≥85% coverage + 3 experiments documented |
| C | 70-79 | Core pipeline + validators + ≥80% coverage |
| D | 60-69 | Partial pipeline + ≥70% coverage |
| F | <60 | Incomplete submission |

---

## Part 4: Class Topics Applied

### 4.1 Verification vs. Validation

| Concept | Application in Legal Luminary |
|---------|------------------------------|
| **Verification** (static) | Structural tests checking code paths, coverage analysis |
| **Validation** (dynamic) | EP functional tests checking product meets requirements |

### 4.2 Testing Methodologies

| Method | Implementation |
|--------|----------------|
| **Equivalence Partitioning** | 20 EP test cases covering valid/invalid inputs per validator |
| **Boundary Value Analysis** | Testing thresholds (confidence ≥0.7, tax=0, etc.) |
| **Structural Testing** | Achieving ≥95% statement coverage via pytest-cov |
| **Red-Team Testing** | Adversarial tests for prompt injection, source spoofing |

### 4.3 Agentic AI Testing

| Concept | Implementation |
|---------|----------------|
| **LangGraph Workflow** | Pipeline with classify → route → validate → aggregate → retry |
| **LangSmith Tracing** | Full observability across all nodes |
| **Test Oracle Problem** | Weighted confidence scores (domain + API + LLM) |
| **Black-Box Testing** | Validators as independent testable nodes |

---

## Part 5: Experiment Guidelines

### 5.1 Experiment 1: Baseline Hallucination Rate
- **Objective:** Measure LLM hallucination rate without verification
- **Method:** Test 10 ground-truth legal citations against GPT-4o-mini
- **Metric:** Proportion of hallucinated/incorrect citations

### 5.2 Experiment 2: Pipeline Effectiveness
- **Objective:** Measure precision, recall, and hallucination rate WITH pipeline
- **Method:** Run same 10 citations through validator pipeline
- **Compare:** Pre-pipeline vs post-pipeline hallucination rates

### 5.3 Experiment 3: LangGraph vs Post-Hoc
- **Objective:** Compare two verification architectures
- **Method:** 
  - (A) LangGraph with retry logic
  - (B) Simple LLM + post-hoc self-verification
- **Metrics:** Accuracy, latency, false positive/negative rates

### 5.4 Experiment 4: Security Red-Team
- **Objective:** Evaluate robustness against adversarial attacks
- **Test Cases:**
  1. Prompt injection attempts
  2. Source spoofing (homograph attacks)
  3. Fabricated court case citations
  4. Fake elected official names
  5. Non-existent statutes
  6. Historical manipulation (wrong dates)
  7. Domain impersonation
  8. Data exfiltration attempts
  9. Token manipulation
  10. Race condition attacks

### 5.5 Experiment 5: Texas Data Pipeline — Ground Truth Discovery
- **Objective:** Crawl data.texas.gov and classify datasets for use as ground-truth evidence
- **Method:**
  - Use Socrata SODA API to discover and sample Texas government datasets
  - Classify each as LAW_VERIFICATION, NEWS, or ATTORNEY_RESOURCE via Ollama LLM
  - Measure classification accuracy against human-labeled expectations
  - Evaluate ground-truth quality (record counts, identifier fields, confidence scores)
- **Datasets Include:** TDCJ inmate records, TCEQ civil judgments/administrative orders, TDLR licenses, insurance complaints, CPS investigations
- **Metrics:** API reachability rate, classification accuracy, ground-truth quality score

### 5.6 Experiment 6: legalluminary.com Site Content Verification
- **Objective:** Validate legal content published on legalluminary.com against authoritative sources
- **Method:**
  - Parse all markdown in `_pages/` and `_posts/` from the `legal-luminary-site` submodule
  - Verify SHA-256 content integrity against the verification manifest
  - Check every cited source URL for HTTPS 200 reachability
  - Cross-reference legal claims (statute numbers, court classifications, penalty ranges) against official Texas statute text
  - Run site content through the Legal Luminary validation pipeline
  - Validate LRL (Texas Legislative Reference Library) resources are accessible
  - Verify RSS feed sources from `_data/rss-feeds.yml` are reachable
- **Negative Test:** Scott Weeden should NOT be found in the TX Secretary of State Notary Public database — the pipeline must correctly FAIL this validation
- **Metrics:** Content integrity rate, URL reachability rate, legal claim verification rate, pipeline verification rate

---

## Part 5B: Presentation and Demonstration

### 5B.1 Presentation Content: The Foundations of V&V

The presentation establishes the theoretical framework based on software engineering standards:

- **Defining V&V:** Verification ensures you are "building the thing right" (following specifications). Validation ensures you are "building the right thing" (meeting user needs).
- **The Test Oracle:** The Official Allow List of sites and contacts serves as the source of expected results. This is codified in `config/settings.py` (trusted domain lists) and `verification/allowlist.yml` in the site submodule.
- **Functional Testing Strategies:**
  - **Equivalence Partitioning (EP):** Categorize sources into "Valid" (allow-listed) and "Invalid" (unauthorized) classes.
  - **Boundary Value Analysis (BVA):** Test edges such as URLs nearly identical to official sources but with subtle errors (e.g., homograph attacks in Experiment 4).
- **Syntax Checking:** Lexical-level analysis on generated markdown to ensure required tokens and formatting are present.

### 5B.2 Demonstration: The LangGraph Validation Pipeline

The demonstration shows a deterministic workflow processing content through a series of nodes:

- **Node 1: Extract Content** — An agent extracts data from a target website (e.g., legalluminary.com) and stores it in a shared `State` class.
- **Node 2: Evidence Verification (The Router)** — A Conditional Edge acts as a gatekeeper. It cross-references extracted information against the Official Allow List.
  - **Logic:** If the source is on the allow list, proceed to content generation; if not, flag as "Invalid Input" and halt.
- **Node 3: Content Generation** — Only verified evidence is used to populate markdown files.
- **Node 4: Evaluator Node** — Use an LLM to assess cohesiveness, relevancy, and toxicity of the generated output.

### 5B.3 GitHub Workflow Actions (The Test Driver)

GitHub Actions serves as the automated Test Driver, running verification on every code push or content update:

- **Trigger:** Workflow triggered by `pull_request` to markdown files.
- **Environment Setup:** Action sets up virtual environment, installs `langgraph`, `langchain`, `langsmith`.
- **Execution:** Runs the Python validation script. If the Adequacy Criterion (e.g., 100% of links verified against the oracle) is not met, the CI/CD build fails, preventing unauthorized content from being merged.
- **Secrets Management:** GitHub Secrets securely handle LangSmith API keys and other environment variables.

### 5B.4 Observability and Evidence with LangSmith

LangSmith provides the "documented evidence" required for high-degree assurance:

- **Tracing:** Node-by-node trace of a successful verification run proves the system checked the allow list before generating content.
- **Evaluation Results:** "Datasets & Experiments" view shows how the pipeline scores generated content against ground-truth data.
- **Error Analysis:** LangSmith tracks failing test cases, identifying exactly why evidence was rejected (non-matching domain, high toxicity score, etc.).

### 5B.5 Demonstration Hardware/Software Summary

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Automation** | GitHub Actions | CI/CD Test Driver |
| **Orchestration** | LangGraph | State-based deterministic workflow |
| **Observability** | LangSmith | Tracing and Evaluation |
| **LLM (HPCC)** | Ollama (granite-code:34b) | Deterministic, cost-effective testing on V100 GPU |
| **LLM (Local)** | Ollama (Llama 3.2) | Local development and rapid iteration |
| **LLM (Cloud)** | OpenAI GPT-4o-mini | Production classification (temperature=0) |
| **Data Source** | data.texas.gov (Socrata SODA API) | Ground-truth Texas government datasets |
| **Site Under Test** | legalluminary.com (GitHub Pages) | Content verification target |

---

## Part 6: Submission Requirements

### 6.1 Directory Structure

```
legal-luminary/
├── pipeline.py              # Main LangGraph validation pipeline
├── state.py                # PipelineState, ValidationResult schemas
├── config/
│   └── settings.py         # API keys, trusted domains, thresholds
├── validators/
│   ├── news_validator.py   # News source validation
│   ├── judge_validator.py  # Judge verification
│   ├── official_validator.py   # Elected official validation
│   ├── election_validator.py    # Election validation
│   ├── law_validator.py    # Statute validation
│   ├── court_doc_validator.py  # Court document validation
│   └── template_validator.py    # Official form validation
├── experiments/
│   ├── exp1_baseline.py
│   ├── exp2_pipeline_effectiveness.py
│   ├── exp3_validator_vs_posthoc.py
│   └── exp4_security_redteam.py
├── tests/
│   ├── test_ep_functional.py   # EP functional tests
│   └── test_structural.py      # Structural coverage tests
└── Project_Rubric_and_Report.html  # Final report
```

### 6.2 How to Run

```bash
# Set environment variables
export OPENAI_API_KEY="sk-..."
export LANGSMITH_API_KEY="lsv2_pt_..."
export LANGCHAIN_TRACING_V2=true

# Install dependencies
pip install langgraph langchain langchain-openai langsmith pytest pytest-cov requests

# Run all tests with coverage
python -m pytest tests/ -v --cov=validators --cov=state

# Run pipeline demo
python pipeline.py

# Run experiments
python experiments/exp1_baseline.py
python experiments/exp2_pipeline_effectiveness.py
python experiments/exp3_validator_vs_posthoc.py
python experiments/exp4_security_redteam.py
```

---

## Part 7: Trusted Domains (Texas Focus)

### 7.1 News & Legal Resources

| Domain | Type |
|--------|------|
| `texaslawhelp.org` | Texas legal aid |
| `texascourthelp.gov` | Texas court resources |
| `texasbar.com` | Texas Bar Association |
| `edtexweblog.com` | Texas law blog |

### 7.2 Texas Courts

| Domain | Description |
|--------|-------------|
| `texascourthelp.gov` | Texas courts help portal |
| `txcourts.gov` | Texas Judicial Branch |
| `txcourts.net` | Texas court system |

### 7.3 Major Law Firms

| Firm |
|------|
| Allen & Overy (allenoverry.com) |
| Clifford Chance (cliffordchance.com) |
| Freshfields (freshfields.com) |
| Linklaters (linklaters.com) |
| Slaughter and May (slaughterandmay.com) |

---

## References

- **NIST AI Risk Management Framework:** Seven pillars of Trustworthy AI
- **LangChain/LangGraph:** Agentic workflow documentation
- **CourtListener API:** Court document verification
- **Congress.gov API:** Legislation verification
- **FEC API:** Election official verification

---

**Last Updated:** February 2026  
**Instructor:** Texas Tech CS5374  
**Author:** Scott Weeden
