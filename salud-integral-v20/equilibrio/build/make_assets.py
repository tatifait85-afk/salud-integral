# -*- coding: utf-8 -*-
"""Genera src/equilibrio-assets.js con portada, logo y fuentes en base64 (EQ.ASSETS)."""
import base64, io, json, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def b64(b): return base64.b64encode(b).decode()
fonts = {}
for n in ["Fraunces-Regular","Fraunces-SemiBold","Jost-Regular","Jost-Medium","Jost-SemiBold","CormorantGaramond-500","CormorantGaramond-700"]:
    fonts[n] = b64(open(os.path.join(ROOT,"vendor",n+".ttf"),"rb").read())
cov = Image.open(os.path.join(ROOT,"assets","portada.png")).convert("RGB")
bio = io.BytesIO(); cov.save(bio,"JPEG",quality=88,optimize=True,progressive=False); cover = "data:image/jpeg;base64,"+b64(bio.getvalue())
lg = Image.open(os.path.join(ROOT,"assets","logo.png")).convert("RGBA").resize((420,420), Image.LANCZOS)  # solo se reduce el tamaño, el logo no se toca
bio = io.BytesIO(); lg.save(bio,"PNG",optimize=True); logo = "data:image/png;base64,"+b64(bio.getvalue())
js = "(function(r){var E=r.EQ=r.EQ||{};E.ASSETS={fonts:%s,cover:%s,logo:%s};})(typeof window!=='undefined'?window:globalThis);" % (json.dumps(fonts), json.dumps(cover), json.dumps(logo))
open(os.path.join(ROOT,"src","equilibrio-assets.js"),"w").write(js)
# Versión del sitio con pago: lo público (portada y logo) y lo privado (fuentes del PDF) van en archivos distintos
wrap = lambda body: "(function(r){var E=r.EQ=r.EQ||{};E.ASSETS=E.ASSETS||{};%s})(typeof window!=='undefined'?window:globalThis);" % body
open(os.path.join(ROOT,"src","equilibrio-assets-pub.js"),"w").write(wrap("E.ASSETS.cover=%s;E.ASSETS.logo=%s;" % (json.dumps(cover), json.dumps(logo))))
open(os.path.join(ROOT,"src","equilibrio-assets-priv.js"),"w").write(wrap("E.ASSETS.fonts=%s;" % json.dumps(fonts)))
print("assets:", len(js)//1024, "KB  cover", len(cover)//1024, "KB  logo", len(logo)//1024, "KB")
