"""HTTP service and a small single-page UI.

POST /api/convert          multipart PDFs (or demo=1 for the bundled USDA set) -> job manifest
POST /api/jobs/{id}/fill   JSON {resume_text, plot_description, github_handle, overrides} -> filled packet
GET  /api/jobs/{id}/{path} files of a job (packet.pdf, latex-sources.zip, tex/*.tex, manifest.json)
GET  /healthz              liveness

Jobs live under DATA_DIR and are deleted after JOB_TTL_MINUTES (default 60). Nothing
the applicant types is logged or kept beyond that.
"""
from __future__ import annotations

import json
import os
import shutil
import threading
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel

from . import fill, llm, pipeline, profile

DATA = Path(os.environ.get("DATA_DIR", "/data"))
SAMPLES = Path(os.environ.get("SAMPLES_DIR", Path(__file__).resolve().parent.parent / "samples"))
TTL = int(os.environ.get("JOB_TTL_MINUTES", "60")) * 60
MAX_MB = int(os.environ.get("MAX_UPLOAD_MB", "25"))
DEMO_SET = ["AD2047.pdf", "CCC941.pdf", "FSA2001.pdf", "AD3030.pdf", "CCC860-scanned.pdf"]

app = FastAPI(title="forms-engine", version="0.1.0")
_lock = threading.Lock()


def _job_dir(job: str) -> Path:
    if not job.replace("-", "").isalnum():
        raise HTTPException(400, "bad job id")
    d = DATA / job
    if not d.exists():
        raise HTTPException(404, "job not found or expired")
    return d


def _sweep():
    now = time.time()
    for d in DATA.glob("*"):
        if d.is_dir() and now - d.stat().st_mtime > TTL:
            shutil.rmtree(d, ignore_errors=True)


@app.get("/healthz")
def healthz():
    return {"ok": True, "claude_review": llm.claude_enabled(), "local_vlm": llm.ollama_enabled()}


@app.post("/api/convert")
async def convert(files: list[UploadFile] | None = File(None), demo: int = Form(0), readable: int = Form(0)):
    _sweep()
    job = uuid.uuid4().hex[:12]
    d = DATA / job / "in"
    d.mkdir(parents=True)
    pdfs: list[Path] = []
    if demo:
        for name in DEMO_SET:
            if (SAMPLES / name).exists():
                shutil.copy(SAMPLES / name, d / name)
                pdfs.append(d / name)
    for f in files or []:
        data = await f.read()
        if len(data) > MAX_MB * 2**20 or not data.startswith(b"%PDF"):
            raise HTTPException(400, f"{f.filename}: not a PDF or larger than {MAX_MB} MB")
        p = d / Path(f.filename or f"upload{len(pdfs)}.pdf").name
        p.write_bytes(data)
        pdfs.append(p)
    if not pdfs:
        raise HTTPException(400, "no PDFs")
    with _lock:  # pdflatex + docling are CPU-heavy; one conversion at a time per pod
        manifest = pipeline.convert(pdfs, DATA / job, readable=bool(readable), log=lambda *_: None)
    return {"job": job, **{k: manifest[k] for k in ("packet", "timings")},
            "forms": [{k: f[k] for k in ("form_id", "title", "kind", "pages", "fields", "linked", "notes")} for f in manifest["forms"]]}


class FillRequest(BaseModel):
    resume_text: str = ""
    plot_description: str = ""
    github_handle: str = ""
    overrides: dict[str, str] = {}


@app.post("/api/jobs/{job}/profile")
def build_profile(job: str, req: FillRequest):
    _job_dir(job)
    prof = profile.build(req.resume_text[:20000], req.plot_description[:2000], req.github_handle[:40])
    return prof.to_dict()


@app.post("/api/jobs/{job}/fill")
def fill_job(job: str, req: FillRequest):
    d = _job_dir(job)
    prof = profile.build(req.resume_text[:20000], req.plot_description[:2000], req.github_handle[:40])
    values = prof.plain()
    values.update({k: v for k, v in req.overrides.items() if isinstance(v, str)})
    rep = fill.fill_packet(d / "packet.pdf", values, d / "packet-filled.pdf")
    return {"profile": prof.to_dict(), "fill": rep, "pdf": f"/api/jobs/{job}/packet-filled.pdf"}


@app.get("/api/jobs/{job}/{path:path}")
def job_file(job: str, path: str):
    d = _job_dir(job)
    p = (d / path).resolve()
    if not str(p).startswith(str(d.resolve())) or not p.is_file():
        raise HTTPException(404)
    return FileResponse(p)


@app.get("/", response_class=HTMLResponse)
def index():
    return (Path(__file__).parent / "static" / "index.html").read_text()
