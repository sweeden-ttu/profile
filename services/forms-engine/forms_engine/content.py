"""Readable, reflowed LaTeX of each form's printed text, via docling.

The positioned .tex reproduces the page; this one is for reading, search and
accessibility: headings, paragraphs and tables in document order. Docling reads
the rebuilt PDF (so Adobe-only XFA forms work too) with OCR on for scans; pandoc
turns its Markdown into LaTeX.
"""
from __future__ import annotations

import subprocess
from pathlib import Path


def docling_markdown(pdf: Path, ocr: bool) -> str:
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions, TesseractCliOcrOptions
    from docling.document_converter import DocumentConverter, PdfFormatOption

    opts = PdfPipelineOptions()
    opts.do_ocr = ocr
    if ocr:
        opts.ocr_options = TesseractCliOcrOptions(lang=["eng"], force_full_page_ocr=True)
    opts.do_table_structure = True
    conv = DocumentConverter(format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=opts)})
    return conv.convert(str(pdf)).document.export_to_markdown()


def content_tex(pdf: Path, out_tex: Path, title: str, ocr: bool = False) -> Path:
    md = docling_markdown(pdf, ocr)
    md_path = out_tex.with_suffix(".md")
    md_path.write_text(md)
    subprocess.run(["pandoc", str(md_path), "-s", "-o", str(out_tex), "--metadata", f"title={title}",
                    "-V", "geometry:margin=1in", "-V", "fontfamily=helvet"], check=True, timeout=120)
    return out_tex
