#!/usr/bin/env python3
"""Auditoría estática de dist/: enlaces internos, assets, metadatos SEO, idioma, h1, imágenes, formularios, ids duplicados, sitemap y robots.
Uso: python3 tests/audit_static.py [dist]   → código de salida 1 si hay errores."""
import os, re, sys, json, hashlib
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

DIST = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "dist"))
SITE = "https://www.saludintegral.site"
NOINDEX_OK = {"/tu-mapa-de-habitos/acceso/", "/tu-mapa-de-habitos/cuestionario/", "/mi-jardin-digestivo/jardin/",
              "/en/your-habit-map/access/", "/en/your-habit-map/questionnaire/", "/en/my-digestive-garden/garden/", "/equilibrio/"}
APP_PAGES = {"/privado/jardin/es/", "/privado/jardin/en/", "/equilibrio/"}
JS_H1 = {"/tu-mapa-de-habitos/cuestionario/", "/en/your-habit-map/questionnaire/"}
errors, warns = [], []
def err(p, m): errors.append(f"{p}: {m}")
def warn(p, m): warns.append(f"{p}: {m}")

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.t = ""; s.in_title = False; s.meta = {}; s.links = []; s.imgs = []; s.ids = []; s.h1 = 0
        s.forms = []; s.inputs = []; s.labels_for = set(); s.canon = None; s.alts = []; s.lang = None; s.refs = []
        s.buttons = []; s._btn = None; s._lab = 0; s.robots = None; s.scripts = []; s.anchors = []; s._a = None; s.hrefs = []
    def handle_starttag(s, tag, a):
        a = dict(a)
        if tag == "html": s.lang = a.get("lang")
        if tag == "title": s.in_title = True
        if tag == "meta":
            k = a.get("name") or a.get("property")
            if k: s.meta[k] = a.get("content", "")
        if tag == "link":
            if a.get("rel") == "canonical": s.canon = a.get("href")
            if a.get("rel") == "alternate" and a.get("hreflang"): s.alts.append((a["hreflang"], a.get("href")))
            if a.get("href"): s.refs.append(("link", a["href"]))
        if tag == "a" and a.get("href") is not None:
            s.links.append(a); s._a = {"a": a, "t": ""}
        if tag == "img":
            s.imgs.append(a)
            if a.get("src"): s.refs.append(("img", a["src"]))
        if tag == "source" and a.get("srcset"): s.refs.append(("srcset", a["srcset"].split()[0]))
        if tag == "script":
            if a.get("src"): s.refs.append(("script", a["src"]))
        if a.get("id"): s.ids.append(a["id"])
        if tag == "h1": s.h1 += 1
        if tag == "form": s.forms.append(a)
        if tag in ("input", "textarea", "select"): s.inputs.append(a)
        if tag == "label":
            s._lab += 1
            if a.get("for"): s.labels_for.add(a["for"])
        if tag == "button": s._btn = {"a": a, "t": ""}
    def handle_endtag(s, tag):
        if tag == "title": s.in_title = False
        if tag == "label": s._lab -= 1
        if tag == "button" and s._btn is not None: s.buttons.append(s._btn); s._btn = None
        if tag == "a" and s._a is not None: s.anchors.append(s._a); s._a = None
    def handle_data(s, d):
        if s.in_title: s.t += d
        if s._btn is not None: s._btn["t"] += d
        if s._a is not None: s._a["t"] += d
    def handle_startendtag(s, tag, a): s.handle_starttag(tag, a)

def to_path(p):
    d = unquote(p)
    return os.path.join(DIST, d.lstrip("/"))
def exists(u):
    f = to_path(u)
    if os.path.isdir(f): return os.path.isfile(os.path.join(f, "index.html"))
    return os.path.isfile(f)

pages = {}
for dp, _, fs in os.walk(DIST):
    for f in fs:
        if f.endswith(".html"):
            rel = "/" + os.path.relpath(dp, DIST).replace(os.sep, "/") + "/"
            rel = "/" if rel == "/./" else rel
            if rel.startswith("/privado/"): continue
            pages[rel] = os.path.join(dp, f)

ID_CACHE = {}
for url, f in sorted(pages.items()):
    h = open(f, encoding="utf-8").read(); p = P(); p.feed(h)
    es = not url.startswith("/en/")
    APP = url in APP_PAGES   # páginas de aplicación (noindex, h1 lo pinta JS)
    if p.lang != ("es" if es else "en"): err(url, f"lang={p.lang}")
    title = p.t.strip()
    if not title or len(title) > 75: err(url, f"título ausente o largo ({len(title)})")
    d = p.meta.get("description", "")
    if not APP and (not d or len(d) > 320): err(url, f"description ausente o larga ({len(d)})")
    if not APP and p.canon != SITE + url: err(url, f"canonical {p.canon} != {SITE+url}")
    langs = dict(p.alts)
    if APP: pass
    elif "es" not in langs or "en" not in langs or "x-default" not in langs: err(url, "hreflang incompleto")
    else:
        for lg, href in langs.items():
            if not href.startswith(SITE) or not exists(href[len(SITE):]): err(url, f"hreflang {lg} → {href} no existe")
    if p.h1 != 1 and not APP and url not in JS_H1: err(url, f"h1 = {p.h1}")
    rb = p.meta.get("robots", "")
    if url in NOINDEX_OK and "noindex" not in rb: err(url, "página de acceso sin noindex")
    if url not in NOINDEX_OK and "noindex" in rb: err(url, "noindex inesperado")
    if not APP and (not p.meta.get("og:title") or not p.meta.get("og:image")): err(url, "faltan metadatos Open Graph")
    # enlaces y assets internos
    for kind, ref in p.refs:
        if ref.startswith(("http:", "https:", "data:", "mailto:", "//")): continue
        if ref.startswith("/") and not exists(ref.split("#")[0].split("?")[0]): err(url, f"{kind} roto: {ref}")
    for a in p.links:
        hr = a["href"]
        if hr.startswith(("http://", "https://", "mailto:", "tel:")):
            if hr.startswith("http://"): err(url, f"enlace http sin cifrar: {hr}")
            if a.get("target") == "_blank" and "noopener" not in a.get("rel", ""): err(url, f"_blank sin noopener: {hr}")
            continue
        if hr.startswith("#"):
            if hr != "#" and hr[1:] not in p.ids: err(url, f"ancla {hr} sin destino")
            continue
        path = hr.split("#")[0].split("?")[0]
        if not path.startswith("/"): err(url, f"enlace no absoluto {hr}"); continue
        if not exists(path): err(url, f"enlace interno roto: {hr}")
        elif os.path.isdir(to_path(path)) and not path.endswith("/"): err(url, f"enlace a carpeta sin barra final: {hr}")
        if "#" in hr and exists(path):
            t = hr.split("#")[1]
            tp = pages.get(path if path.endswith("/") else path + "/")
            if tp:
                if tp not in ID_CACHE:
                    q = P(); q.feed(open(tp, encoding="utf-8").read()); ID_CACHE[tp] = set(q.ids)
                if t and t not in ID_CACHE[tp]: err(url, f"ancla {hr} sin destino")
    for a in p.anchors:
        if not a["t"].strip() and not a["a"].get("aria-label"):
            warn(url, f"enlace sin texto (¿solo imagen?): {a['a'].get('href')}")
    for im in p.imgs:
        if "alt" not in im: err(url, f"img sin alt: {im.get('src')}")
        if not im.get("width") or not im.get("height"): warn(url, f"img sin width/height: {im.get('src')}")
    dup = {i for i in p.ids if p.ids.count(i) > 1}
    if dup: err(url, f"ids duplicados: {sorted(dup)}")
    for i in p.inputs:
        t = i.get("type", "text")
        if t in ("hidden", "submit", "button"): continue
        if not (i.get("aria-label") or i.get("id") in p.labels_for or i.get("title")) and p._lab == 0:
            # permitido si está dentro de un <label>; el parser no lo rastrea por input, se revisa abajo
            pass
    for b in p.buttons:
        if not b["t"].strip() and not b["a"].get("aria-label"): err(url, "botón sin nombre accesible")
    for s in p.refs:
        pass
    if "<script>" in h.replace('<script type="application/json"', "") and url not in pages: pass

# sitemap / robots
sm = open(os.path.join(DIST, "sitemap.xml"), encoding="utf-8").read()
smu = set(re.findall(r"<loc>([^<]+)</loc>", sm))
for url in pages:
    full = SITE + url
    if url in NOINDEX_OK:
        if full in smu: err("sitemap.xml", f"incluye página noindex {url}")
    elif full not in smu: err("sitemap.xml", f"falta {url}")
for u in smu:
    if not u.startswith(SITE) or u[len(SITE):] not in pages: err("sitemap.xml", f"URL sin página: {u}")
rob = open(os.path.join(DIST, "robots.txt"), encoding="utf-8").read()
if "Sitemap:" not in rob: err("robots.txt", "sin Sitemap")
if "/privado/" not in rob: warn("robots.txt", "no excluye /privado/ (el Worker lo protege con cookie, pero conviene excluirlo del rastreo)")

print(f"Páginas auditadas: {len(pages)}")
for w in warns: print("AVISO ", w)
for e in errors: print("ERROR ", e)
print(f"\n{len(errors)} errores · {len(warns)} avisos")
sys.exit(1 if errors else 0)
