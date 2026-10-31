#!/usr/bin/env python3
"""Genera static/img/og/<nombre>.jpg (1200×630) a partir de las imágenes webp indicadas en src/seo.py (OG_SOURCES).
Las originales no se modifican. Uso: python3 tools/make_og_images.py"""
import os, sys
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "src"))
import seo
W, H = 1200, 630
out = os.path.join(ROOT, "static", "img", "og"); os.makedirs(out, exist_ok=True)
for n in seo.OG_SOURCES:
    im = Image.open(os.path.join(ROOT, "static", "img", n + ".webp")).convert("RGB")
    r = im.width / im.height
    if r >= 1.75:   # muy apaisada: recorte centrado (si no, se muestra completa para no cortar textos)
        s = max(W / im.width, H / im.height); t = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        l, tp = (t.width - W) // 2, (t.height - H) // 2; c = t.crop((l, tp, l + W, tp + H))
    else:          # vertical/cuadrada: fondo difuminado + imagen completa
        s = max(W / im.width, H / im.height); bg = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        l, tp = (bg.width - W) // 2, (bg.height - H) // 2
        c = bg.crop((l, tp, l + W, tp + H)).filter(ImageFilter.GaussianBlur(28))
        s = H / im.height if im.width * (H / im.height) <= W else W / im.width
        f = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS); c.paste(f, ((W - f.width) // 2, (H - f.height) // 2))
    c.save(os.path.join(out, n + ".jpg"), "JPEG", quality=82, optimize=True, progressive=True)
    print(n, os.path.getsize(os.path.join(out, n + ".jpg")) // 1024, "KB")
