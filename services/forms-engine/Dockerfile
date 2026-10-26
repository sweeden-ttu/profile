# forms-engine: PDF -> LaTeX -> consolidated fillable packet.
# Multi-arch (linux/amd64, linux/arm64): OCI's Always Free Ampere A1 nodes are arm64.
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    DATA_DIR=/data SAMPLES_DIR=/app/samples HF_HOME=/tmp/hf DOCLING_ARTIFACTS_PATH=/opt/docling OMP_NUM_THREADS=2

RUN apt-get update && apt-get install -y --no-install-recommends \
      texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended \
      texlive-pictures lmodern tesseract-ocr tesseract-ocr-eng pandoc curl ca-certificates \
      libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# Optional build secret for networks that re-sign TLS (corporate/agent proxies):
#   docker build --secret id=extra_ca,src=/path/ca.crt .   (not needed on GitHub Actions)
RUN --mount=type=secret,id=extra_ca,required=false \
    if [ -f /run/secrets/extra_ca ]; then cp /run/secrets/extra_ca /usr/local/share/ca-certificates/extra.crt && update-ca-certificates; fi
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt PIP_CERT=/etc/ssl/certs/ca-certificates.crt REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
COPY requirements.txt .
# CPU-only torch keeps the image ~2 GB smaller; on arm64 the default wheel is already CPU-only.
RUN if [ "$(dpkg --print-architecture)" = "amd64" ]; then \
      pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision; \
    else pip install torch torchvision; fi
RUN pip install -r requirements.txt
# Pre-fetch docling's layout/table models so pods never need Hugging Face at runtime.
# Only the layout and table models (~0.4 GB); OCR uses the system Tesseract.
RUN python -c "from pathlib import Path; from docling.utils.model_downloader import download_models as d; d(Path('/opt/docling'), with_code_formula=False, with_picture_classifier=False, with_rapidocr=False)" \
 && chmod -R a+rX /opt/docling

COPY forms_engine ./forms_engine
COPY scripts ./scripts
RUN mkdir -p samples && ./scripts/fetch_samples.sh

RUN useradd --uid 10001 --create-home app && mkdir -p /data && chown app /data
USER 10001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD curl -fs http://localhost:8080/healthz || exit 1
CMD ["uvicorn", "forms_engine.app:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
