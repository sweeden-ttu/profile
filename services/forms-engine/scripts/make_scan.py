"""Make an image-only 'scan' of a PDF (150 dpi grayscale + light noise, no text, no fields)."""
import sys
import numpy as np
import pymupdf

src, dst = sys.argv[1], sys.argv[2]
doc, out = pymupdf.open(src), pymupdf.open()
for i, pg in enumerate(doc):
    pix = pg.get_pixmap(dpi=150, colorspace=pymupdf.csGRAY, annots=False)
    a = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w).astype(np.int16)
    a = np.clip(a + np.random.default_rng(i).normal(0, 6, a.shape), 0, 255).astype(np.uint8)
    img = pymupdf.Pixmap(pymupdf.csGRAY, pix.w, pix.h, a.tobytes(), False)
    page = out.new_page(width=pg.rect.width, height=pg.rect.height)
    page.insert_image(page.rect, pixmap=img)
out.save(dst, garbage=3, deflate=True)
