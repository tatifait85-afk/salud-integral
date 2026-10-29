# -*- coding: utf-8 -*-
"""Construye dos salidas desde src/:
   dist/preview.html  -> contenido para publicar como artefacto de vista previa (todo en un solo archivo)
   dist/index.html    -> página completa autónoma (para probar en local o desplegar en Cloudflare Pages)"""
import base64, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda *p: open(os.path.join(ROOT, *p), encoding="utf-8").read()
b64 = lambda *p: base64.b64encode(open(os.path.join(ROOT, *p), "rb").read()).decode()
faces = [("Fraunces","Fraunces-Regular",400),("Fraunces","Fraunces-SemiBold",600),("Jost","Jost-Regular",400),("Jost","Jost-Medium",500),("Jost","Jost-SemiBold",600),("Cormorant","CormorantGaramond-700",700)]
fonts_css = "".join('@font-face{font-family:"%s";font-weight:%d;font-style:normal;font-display:swap;src:url(data:font/ttf;base64,%s) format("truetype")}' % (f, w, b64("vendor", n + ".ttf")) for f, n, w in faces)
scripts = ["vendor/jspdf.umd.min.js","vendor/pdf-lib.min.js","src/equilibrio-assets.js","src/equilibrio-datos.js","src/equilibrio-iconos.js","src/equilibrio-mapa.js","src/equilibrio-motor.js","src/equilibrio-pdf.js","src/equilibrio-pago.js","src/equilibrio-ui.js"]
js = "\n".join("<script>\n" + rd(*s.split("/")) + "\n</script>" for s in scripts) + "\n<script>EQ.UI.start();</script>"
body = ('<title>Mi mapa de equilibrio</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n' + fonts_css + "\n" + rd("src","equilibrio.css") + "\n</style>\n"
        '<header id="top" class="top"></header>\n<main id="main"></main>\n<div id="foot"></div>\n' + js + "\n")
os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
open(os.path.join(ROOT, "dist", "preview.html"), "w", encoding="utf-8").write(body)
full = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
        body.replace("</title>", "</title>", 1) + "</head><body>" if False else "")
head_end = body.index("<header")
full = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + body[:head_end] + "</head><body>\n" + body[head_end:] + "</body></html>"
open(os.path.join(ROOT, "dist", "index.html"), "w", encoding="utf-8").write(full)

# ---------- sitio con pago real (Cloudflare): parte pública + paquete privado del PDF ----------
import json
PAYPAL = "https://www.paypal.com/ncp/payment/VA4SE3UYS3BBS"
cfg = '<script>window.EQ=window.EQ||{};EQ.CONFIG=%s;</script>' % json.dumps({"modo":"pago","paypal":PAYPAL,"api":"/api/equilibrio","producto":"equilibrio","privado":"/privado/equilibrio/pdf.js"})
pub = ["src/equilibrio-datos.js","src/equilibrio-iconos.js","src/equilibrio-mapa.js","src/equilibrio-motor.js","src/equilibrio-assets-pub.js","src/equilibrio-pago.js","src/equilibrio-ui.js"]
js2 = cfg + "\n" + "\n".join("<script>\n" + rd(*x.split("/")) + "\n</script>" for x in pub) + "\n<script>EQ.UI.start();</script>"
body2 = body[:body.index("<header")] + '<header id="top" class="top"></header>\n<main id="main"></main>\n<div id="foot"></div>\n' + js2 + "\n"
he = body2.index("<header")
site = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex">\n' + body2[:he] + "</head><body>\n" + body2[he:] + "</body></html>"
os.makedirs(os.path.join(ROOT,"dist","sitio","equilibrio"), exist_ok=True); os.makedirs(os.path.join(ROOT,"dist","sitio","privado","equilibrio"), exist_ok=True)
open(os.path.join(ROOT,"dist","sitio","equilibrio","index.html"),"w",encoding="utf-8").write(site)
priv = "\n".join(rd(*x.split("/")) for x in ["vendor/jspdf.umd.min.js","vendor/pdf-lib.min.js","src/equilibrio-assets-priv.js","src/equilibrio-pdf.js"])
open(os.path.join(ROOT,"dist","sitio","privado","equilibrio","pdf.js"),"w",encoding="utf-8").write(priv)
print("sitio: publico %d KB, privado %d KB" % (len(site)//1024, len(priv)//1024))
print("preview.html %d KB, index.html %d KB" % (len(body)//1024, len(full)//1024))
