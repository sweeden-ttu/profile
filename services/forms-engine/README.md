# forms-engine

PDF → LaTeX → one consolidated, fillable packet. Built for USDA farm-program paperwork, where:

- many forms are **Adobe-only dynamic XFA**: every browser and most viewers show only "requires Adobe Reader 8 or higher";
- the same facts (name, address, county, phone) are typed again on every form;
- some applicants only have a scan or a fax.

The engine rebuilds each form as LaTeX and compiles it back to a standard AcroForm PDF. It then links every box that asks for the same thing into **one PDF field**, so typing a first name once fills every first-name, full-name and name-and-address box in the packet.

```
input PDF ─┬─ dynamic XFA ───► read the XFA template (pages, positioned text, rules, fields, tooltips)
           ├─ AcroForm ──────► keep each original page as a vector background, re-create the widgets
           └─ scan / flat ───► OCR (Tesseract) + rule/box/checkbox detection, optional local VLM labels
                                │
                 labels ──► canonical keys (first_name, county, …) with rule + confidence + deny list
                                │
            LaTeX (TikZ layout + hyperref fields) ──► pdflatex ──► optional Claude review of .tex + render
                                │
     cover sheet + all forms ──► one packet; same-key widgets share one field; composite boxes computed
                                │
   profile from résumé / plot description / GitHub handle (+ Census, OSM, FCC, HUD lookups) ──► review ──► fill
```

## Measured on the demo set (Oct 2026)

| Form | Input type | Pages | Fields | Linked to the cover sheet |
|---|---|---|---|---|
| AD-2047 Customer Data Worksheet | Adobe-only XFA | 2 | 57 | 7 |
| CCC-941 AGI Certification | Adobe-only XFA | 4 | 9 | 1 |
| FSA-2001 Request for Direct Loan Assistance | AcroForm | 14 | 1,097 | 11 |
| AD-3030 Felony/Tax Delinquency Representations | AcroForm | 1 | 10 | 2 |
| CCC-860 (rasterized to a 150 dpi scan) | scan | 4 | 24 detected | 0 |

- **Packet:** 1,215 widgets become 1,194 fields. The 15 shared keys cover 36 boxes across the forms and cover sheet. Conversion takes about 40 s on 2 CPUs.
- **Scan detection:** on a rasterized AD-3030, it finds 10 of 10 fields and labels them correctly from OCR. On CCC-860 it finds 9 of 16 fields, plus false positives. That is why scanned forms are never linked automatically without review.

## Trust and safety rules

- **Never filled automatically:** taxpayer IDs, birth dates, signatures, signature dates, bank details, and race, ethnicity, sex or veteran questions. These are also not linked across forms. A full TIN and a "last 4 digits" box must never share a value.
- **Other people's sections stay separate:** boxes in sections about other people (entity members, spouses, lenders, county office) are not linked to the applicant.
- **Provenance and review:** every linked box records the rule that linked it and a confidence score. Every filled value records its source and evidence. The UI shows all of it, and the person edits before filling.
- **Data handling:** jobs are deleted after 60 minutes and the applicant's text is never logged. The only external calls are to public-data APIs (Census geocoder, OpenStreetMap Nominatim, FCC Area API, HUD eGIS), plus the GitHub public-profile API if a handle is given.
- **Optional model passes, logged and reviewable:**
  - *Local VLM via Ollama:* names fields on scans.
  - *Claude review:* reads every generated .tex file with a rendering of the page. It may only change field labels, and every change is listed in `manifest.json`. All other findings are reported for a person to act on.

## Run locally

```bash
pip install -r requirements.txt            # plus: texlive (latex-extra, pictures), tesseract-ocr, pandoc
./scripts/fetch_samples.sh                 # downloads the USDA forms, makes the scanned copy
python -m forms_engine.pipeline convert samples/*.pdf --out out
python -m forms_engine.pipeline fill out --resume demo/resume.txt --plot "$(cat demo/plot.txt)"
uvicorn forms_engine.app:app --port 8080   # UI at http://localhost:8080
```

Optional environment variables:

- `ANTHROPIC_API_KEY`: enables the Claude review pass. `CLAUDE_MODEL` selects the model.
- `OLLAMA_URL` and `OLLAMA_VLM`: enable the local multimodal model for scans.
- `HUD_API_TOKEN`: enables HUD USER income limits.

## Deploy on Oracle Cloud's Always Free Kubernetes (OKE)

**What's free:**

- A *Basic* OKE cluster.
- Ampere A1 Arm compute up to 4 OCPUs / 24 GB in total. These can be split across nodes, e.g. 2 nodes of 2 OCPU / 12 GB.
- 200 GB of block storage, which covers the boot volumes.
- One 10 Mbps flexible load balancer.

The image is built for `linux/arm64` and `linux/amd64` by `.github/workflows/forms-engine.yml`, and published as `ghcr.io/sweeden-ttu/forms-engine`.

1. **Create the account** at <https://signup.cloud.oracle.com>. A card is needed to verify identity; the Always Free resources are not charged. Pick a home region with Ampere capacity. If A1 nodes fail with "out of capacity", upgrading to Pay As You Go usually gets capacity, and staying within the limits above remains free.
2. **Create the cluster:** Console → Developer Services → Kubernetes Clusters (OKE) → *Create cluster* → **Quick create**.
   - Type: **Basic** cluster, public endpoint, private workers.
   - Shape: `VM.Standard.A1.Flex`, **2 OCPUs / 12 GB**, **2 nodes**.
   - Image: Oracle Linux. Boot volume: 50 GB.
3. **Get a kubeconfig:** install the OCI CLI, then:
   ```bash
   oci ce cluster create-kubeconfig --cluster-id <cluster OCID> --file ~/.kube/config --region <region> --token-version 2.0.0 --kube-endpoint PUBLIC_ENDPOINT
   ```
4. **Make the image public:** the first time the workflow runs, set the GHCR package's visibility to public. Alternatively, add an image pull secret.
5. **Deploy:**
   ```bash
   kubectl apply -k services/forms-engine/k8s
   kubectl -n forms-engine create secret generic forms-engine-secrets --from-literal=anthropic-api-key=sk-ant-...   # optional
   kubectl -n forms-engine get svc forms-engine -w     # wait for the load balancer's EXTERNAL-IP
   ```
6. **Point a hostname at the IP:** for example, add a DNS A record for `forms.scottweeden.online`.
7. **Optional, deploy from GitHub Actions:**
   - Run `scripts/make-ci-kubeconfig.sh`, which creates a namespace-scoped service account and prints a base64 kubeconfig.
   - Store that output as the repository secret `OKE_KUBECONFIG`, in an environment named `oci-oke`.
   - Then run the workflow with **deploy** checked.
