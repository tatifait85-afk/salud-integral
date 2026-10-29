# -*- coding: utf-8 -*-
import os, json, shutil, html, sys
sys.path.insert(0, os.path.dirname(__file__))
from config import *
import catalog, assistant, mapa, jardin
from content import COMMON, HOME
from content_food import FOOD, PRODUCTS
from content_spiritual import SPIRIT, PRODUCTS_SPIRIT
from content_habits import HABITS, PRODUCTS_HABITS
from content_weight import WEIGHT, PRODUCTS_WEIGHT
from content_mind import MIND, PRODUCTS_MIND
from content_session import SESSION, PRODUCTS_SESSION
from content_contact import CONTACT_PAGE
from content_resources import RES
from content_about import ABOUT
from content_privacy import PRIVACY, LAW
from content_terms import TERMS
from credentials import CREDENTIALS
from articles import ARTICLES, SPIRITUAL_COURSES, EN_BLOG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST = os.path.join(ROOT, "dist")
E = html.escape

ICONS = {
 "clipboard": '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/>',
 "video":  '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
 "brain":  '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5 1V4a3 3 0 0 0-2 0z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5 1V4a3 3 0 0 1 2 0z"/>',
 "leaf":   '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19l8-8"/>',
 "heart":  '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
 "laptop": '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
 "sprout": '<path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 14c0-3 2.5-5 6-5 0 3-2.5 5-6 5z"/>',
 "bowl":   '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
 "move":   '<path d="M3 12h4l2.5-6 4 12 2.5-6h5"/>',
 "wind":   '<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/>',
 "wave":   '<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/><path d="M2 17c2-4 4-4 6 0s4 4 6 0 4-4 6 0" opacity=".5"/>',
 "repeat": '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
 "compass":'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 "search": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
 "mail":   '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 "chat":   '<path d="M4 5h16v11H9l-5 4z"/>',
 "menu":   '<path d="M4 7h16M4 12h16M4 17h16"/>',
 "x":      '<path d="M6 6l12 12M18 6L6 18"/>',
}
def sprite():
    s = "".join(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items())
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>{s}</defs></svg>'
def icon(name, cls="ic"):
    return f'<svg class="{cls}" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>'

LOGO = '<img class="logo-mark" src="/assets/img/logo.webp" width="46" height="46" alt="" aria-hidden="true">'

NAV_KEYS = ["home", "food", "habits", "mind", "weight", "spiritual", "resources", "session", "about", "blog", "contact"]
NAV_SUB = {"resources": ["map", "garden"]}
def nav_href(lang, k):
    return ((BLOG_BASE if lang == "es" else EN_BLOG) + "/") if k == "blog" else url(lang, k)

def head(lang, key, title, desc, og_img="/assets/img/hero-home.webp"):
    other = "en" if lang == "es" else "es"
    canon = SITE_URL + url(lang, key)
    alts = (f'<link rel="alternate" hreflang="es" href="{SITE_URL}{url("es", key)}">'
            f'<link rel="alternate" hreflang="en" href="{SITE_URL}{url("en", key)}">'
            f'<link rel="alternate" hreflang="x-default" href="{SITE_URL}{url("es", key)}">')
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{canon}">
{alts}
<meta property="og:type" content="website"><meta property="og:site_name" content="Salud Integral">
<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{canon}"><meta property="og:image" content="{SITE_URL}{og_img}">
<meta name="theme-color" content="#F7F3E8">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16x16.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/fraunces-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jost-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
</head>
<body class="page-{key}">
{sprite()}'''

def header(lang, key):
    c = COMMON[lang]; other = "en" if lang == "es" else "es"
    items = []
    def _li(k, sub=False):
        cur = ' aria-current="page"' if k == key else ""
        ext = ' target="_blank" rel="noopener"' if k == "blog" else ""
        return f'<a href="{nav_href(lang,k)}"{cur}{ext}>{E(c["nav"][k])}</a>'
    for k in NAV_KEYS:
        if k in NAV_SUB:
            subs = "".join(f"<li>{_li(x, True)}</li>" for x in NAV_SUB[k])
            items.append(f'<li class="has-sub">{_li(k)}<ul class="sub">{subs}</ul></li>')
        else:
            items.append(f"<li>{_li(k)}</li>")
    return f'''<a class="skip" href="#main">{E(c["skip"])}</a>
<header class="site-header">
  <div class="container bar">
    <a class="brand" href="{url(lang,"home")}" aria-label="Salud Integral">{LOGO}<span class="brand-text"><span class="brand-name">Salud Integral</span><span class="brand-tag">{E(c["brand_tag"])}</span></span></a>
    <nav class="nav" id="nav" aria-label="{'Principal' if lang=='es' else 'Main'}"><ul>{"".join(items)}</ul></nav>
    <button class="search-btn" type="button" aria-label="{E(c["search"])}" aria-haspopup="dialog" data-src="/assets/js/search-{lang}.js" data-ph="{E(c["search_ph"])}" data-none="{E(c["search_none"])}" data-hint="{E(c["search_hint"])}" data-close="{E(c["close"])}">{icon("search")}</button>
    <a class="lang" href="{url(other,key)}" hreflang="{other}" lang="{other}" aria-label="{E(c["other_label"])}">{E(c["other_lang"])}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="{E(c["menu"])}">{icon("menu")}</button>
  </div>
</header>'''

def footer(lang):
    c = COMMON[lang]
    links = "".join(f'<li><a href="{nav_href(lang,k)}"{" target=_blank rel=noopener" if k=="blog" else ""}>{E(c["nav"][k])}</a></li>' for k in NAV_KEYS[1:])
    wa = wa_link(lang, COMMON["es"]["wa_msg"], COMMON["en"]["wa_msg"])
    return f'''<footer class="site-footer">
  <div class="container fgrid">
    <div class="fbrand"><a class="brand brand-inv" href="{url(lang,"home")}">{LOGO}<span class="brand-text"><span class="brand-name">Salud Integral</span></span></a>
      <p>{E(c["footer_about"])}</p></div>
    <div><h2 class="fh">{E(c["footer_explore"])}</h2><ul class="flist">{links}</ul></div>
    <div><h2 class="fh">{E(c["footer_contact"])}</h2><ul class="flist">
      <li><a href="{wa}" target="_blank" rel="noopener">{E(c["wa_label"])} {CONTACT["wa_display"]}</a></li>
      <li><a href="mailto:{CONTACT["email"]}">{CONTACT["email"]}</a></li></ul>
      <h2 class="fh fh2">{E(c["footer_follow"])}</h2><ul class="flist">
      <li><a href="{CONTACT["facebook"]}" target="_blank" rel="noopener">{E(c["facebook"])}</a></li>
      <li><a href="{CONTACT["linkedin"]}" target="_blank" rel="noopener">{E(c["linkedin"])}</a></li></ul></div>
  </div>
  <div class="container fbase"><p class="disc">{E(c["disclaimer"])}</p><p class="copy"><a href="{url(lang,"privacy")}">{E(c["privacy"])}</a> · <a href="{url(lang,"terms")}">{E(c["terms"])}</a> · {E(c["copyright"])}</p></div>
</footer>'''

def tail(lang):
    return f'''<script src="/assets/js/data-{lang}.js" defer></script>
<script src="/assets/js/site.js" defer></script>
<script src="/assets/js/romero.js" defer></script>
</body></html>'''

# ------------------------------------------------------------------ HOME
def home(lang):
    h = HOME[lang]; L = lambda a, b: a if lang == "es" else b
    cat = {r["id"]: r for r in catalog.build(lang)}
    img = {"food": "salud-digestiva", "habits": "habitos", "mind": "mente-tranquila", "spiritual": "espiritual-card"}
    sup = "".join(f'<li>{icon(i)}<span>{E(t)}</span></li>' for i, t in h["supports"])
    areas = "".join(f'''<article class="card area">
        <div class="card-img"><img src="/assets/img/{img[k]}-m.webp" alt="{E(alt)}" width="720" height="405" loading="lazy" decoding="async"></div>
        <div class="card-body"><h3>{E(t)}</h3><p>{E(d)}</p>
        <a class="more" href="{url(lang,k)}">{E(cta)}</a></div></article>''' for k, _i, t, d, cta, alt in h["areas"])
    tools = "".join(f'<li><span class="ico">{icon(i,"ic ic-lg")}</span><span>{E(t)}</span></li>' for i, t in h["tools"])
    testi = "".join(f"<p>{E(p)}</p>" for p in h["testi"])
    books = "".join(f'''<li><a class="book" href="{b["url"]}" target="_blank" rel="noopener sponsored" aria-label="{E(b["title"])} — {E(h["res_amazon_badge"])}">
        <span class="cover"><img src="{b["img"]}" alt="{E(L('Portada de ','Cover of '))}{E(b["title"])}" width="240" height="375" loading="lazy" decoding="async"><span class="badge">{E(h["res_amazon_badge"])} ↗</span></span>
        <span class="btitle">{E(b["title"])}</span></a></li>''' for b in [cat[f"libro-{i}"] for i in "12345"])
    course = cat["curso"]
    body = f'''{head(lang,"home",h["title"],h["desc"])}
{header(lang,"home")}
<main id="main">
<section class="hero">
  <picture class="hero-media"><source media="(max-width: 760px)" srcset="/assets/img/hero-home-m.webp"><img src="/assets/img/hero-home.webp" alt="{E(h["hero_img_alt"])}" width="1672" height="941" fetchpriority="high"></picture>
  <div class="container hero-inner"><div class="hero-copy">
    <h1>{E(h["hero_h1"])}</h1><p class="lead">{E(h["hero_sub"])}</p>
    <a class="btn btn-primary" href="#areas">{E(h["hero_cta"])}</a>
    <ul class="supports">{sup}</ul></div></div>
</section>

<section class="section areas" id="areas"><div class="container">
  <div class="sec-head"><h2>{E(h["areas_h2"])}</h2><p>{E(h["areas_p"])}</p></div>
  <div class="grid-4">{areas}</div>
</div></section>

<section class="guide"><div class="container guide-in">
  <img class="guide-img" src="/assets/img/romero.webp" alt="" width="200" height="260" loading="lazy">
  <div><h2>{E(h["guide_h2"])}</h2><p>{E(h["guide_p"])}</p>
  <div class="guide-actions"><button class="btn btn-terra" type="button" data-open-guide>{E(h["guide_cta"])}</button><span class="note">{E(h["guide_note"])}</span></div></div>
</div></section>

<section class="section tools"><div class="container">
  <h2 class="center">{E(h["tools_h2"])}</h2>
  <ul class="tools-grid">{tools}</ul>
</div></section>

<section class="section about"><div class="container about-in">
  <div class="about-photo"><img src="/assets/img/sobre-mi-m.webp" alt="{E(h["about_img_alt"])}" width="720" height="603" loading="lazy" decoding="async"></div>
  <div class="about-copy"><h2>{E(h["about_h2"])}</h2>
    <p class="pull">{E(h["about_quote"])}</p>
    <p>{E(h["about_p1"])}</p><p>{E(h["about_p2"])}</p>
    <a class="btn btn-outline" href="{url(lang,"about")}">{E(h["about_cta"])}</a></div>
</div></section>

<section class="section testi"><div class="container testi-in">
  <h2>{E(h["testi_h2"])}</h2>
  <figure class="quote"><blockquote>{testi}</blockquote><figcaption>— {E(h["testi_by"])}</figcaption></figure>
</div></section>

<section class="section resources"><div class="container">
  <div class="sec-head"><h2>{E(h["res_h2"])}</h2><p>{E(h["res_p"])}</p></div>
  <div class="res-books">
    <div class="rb-copy"><h3>{E(h["res_books_h"])}</h3><p>{E(h["res_books_p"])}</p>
      <a class="more" href="{LINKS["amazon_author"]}" target="_blank" rel="noopener sponsored">{E(h["res_books_cta"])}</a></div>
    <ul class="books">{books}</ul>
  </div>
  <div class="res-tiles res-tiles-2">
      <a class="tile" href="{course["url"]}" target="_blank" rel="noopener"><h3>{E(course["title"])}</h3><p>{E(h["res_course_p"])}</p><span class="more">{E(course["cta"])}</span></a>
      <a class="tile" href="{url(lang,"food")}"><h3>{E(h["res_food_h"])}</h3><p>{E(h["res_food_p"])}</p><span class="more">{E(h["res_food_cta"])}</span></a>
  </div>
  <p class="center"><a class="btn btn-primary" href="{url(lang,"resources")}">{E(h["res_all_cta"])}</a></p>
</div></section>
</main>
{footer(lang)}
{tail(lang)}'''
    return body


# ------------------------------------------------------------------ helpers de artículos
def article_cards(lang, page, read_label, items=None):
    """Tarjetas de artículos (3 por tema). EN usa el artículo de flowsomatic si existe; si no, el artículo en español, marcado."""
    out = []
    for a in (items if items is not None else ARTICLES[page]):
        if lang == "en" and a["en"]:
            href, title, img, tag = a["en"]["url"], a["en"]["title"], a["img_en"], ""
        elif lang == "en":
            href, title, img, tag = a["url"], a["title"], a["img"], "In Spanish"
        else:
            href, title, img, tag = a["url"], a["title"], a["img"], ""
        portrait = False
        if img:
            from PIL import Image as _I
            _w, _h = _I.open(os.path.join(ROOT, "static", img.replace("/assets/", ""))).size; portrait = _h > _w * 1.15
        pic = (f'<div class="card-img{" contain" if portrait else ""}"><img src="{img}" alt="" width="640" height="400" loading="lazy" decoding="async"></div>' if img
               else f'<div class="card-img card-img-empty">{icon("leaf","ic ic-lg")}</div>')
        tg = f'<span class="tag">{E(tag)}</span>' if tag else ""
        out.append(f'''<article class="card art">{pic}<div class="card-body">{tg}<h3>{E(title)}</h3>
          <a class="more" href="{href}" target="_blank" rel="noopener">{E(read_label)} →</a></div></article>''')
    return "".join(out)

def products_html(lang, data=None):
    """Sección comercial (productos) + «Cómo pagar». Independiente de la sección editorial de artículos."""
    P = data or PRODUCTS[lang]
    cards = []
    for it in P["items"]:
        inc = "".join(f"<li>{E(x)}</li>" for x in it["inc"])
        if it["kind"] == "form":
            f = FOOD["es"]
            action = f'''<form class="rm-form" data-ml="{LINKS["mailerlite_programa"]}" data-ok="{E(f["free_ok"])}" data-err="{E(f["free_err"])}" novalidate>
          <input type="email" name="fields[email]" required autocomplete="email" placeholder="{E(f["free_ph"])}" aria-label="{E(f["free_label"])}">
          <button type="submit">{E(it["cta"])}</button></form>
          <p class="offer-note" role="status" aria-live="polite" data-ml-msg></p>
          <p class="offer-fine">Al suscribirse acepta recibir este programa por correo; puede darse de baja en cualquier mensaje. Más información en la <a href="{url(lang,"privacy")}">política de privacidad</a>.</p>'''
        elif it["kind"] == "wa":
            action = f'<a class="btn btn-primary" href="{wa_link(lang, it["msg"], it["msg"])}" target="_blank" rel="noopener">{E(it["cta"])} →</a>'
        else:
            href = LINKS["paypal_mapa"] if it["href"] == "PAYPAL_MAPA" else it["href"]
            action = f'<a class="btn btn-primary" href="{href}" target="_blank" rel="noopener">{E(it["cta"])} →</a>'
        extra = (f'<p class="prod-extra"><a href="{url(lang, it["extra_key"])}">{E(it["extra_text"])}</a></p>' if it.get("extra_key") else "")
        cards.append(f'''<article class="card prod">
      <div class="card-img{" contain" if it.get("contain") else ""}{" tall" if it.get("contain") == "tall" else ""}"><img src="/assets/img/{it["img"]}.webp" alt="{E(it["alt"])}" width="1200" height="800" loading="lazy" decoding="async"></div>
      <div class="card-body">
        <h3>{E(it["name"])}</h3>
        <p class="prod-desc">{E(it["desc"])}</p>
        {f'<p class="prod-h">{E(P["incl"])}</p><ul class="offer-list">{inc}</ul>' if it["inc"] else ""}
        {f'<p class="offer-meta">{icon("mail")} <span><strong>{E(P["deliv"])}:</strong> {E(it["delivery"])}</span></p>' if it["delivery"] else ""}
        <div class="offer-row"><span class="price price-lg">{E(it["price"])}</span></div>
        {action}{extra}
      </div></article>''')
    cls = "prod-grid" + (" prod-one" if len(cards) == 1 else "") + (" prod-start" if any(i.get("contain") == "tall" for i in P["items"]) else "")
    ints = (f'<div><h3>{E(P["pay_int"])}</h3><ul class="offer-list">{"".join("<li>"+E(x)+"</li>" for x in P["pay_int_l"])}</ul></div>' if P["pay_int"] else "")
    steps = "".join(f"<li>{E(x)}</li>" for x in P["pay_steps"])
    return f'''<section class="section feature" id="productos"><div class="container">
  <div class="sec-head"><h2>{E(P["h2"])}</h2><p>{E(P["p"])}</p></div>
  <div class="{cls}">{"".join(cards)}</div>
  {f'<p class="offer-note prod-note">{E(P["note"])}</p>' if P["note"] else ""}
</div></section>

<section class="offers" id="como-pagar"><div class="container">
  <div class="sec-head"><h2>{E(P["pay_h2"])}</h2><p>{E(P["pay_p"])}</p></div>
  <div class="pay-in{" pay-2" if not P["pay_int"] else ""}">
    <div><h3>{E(P["pay_cr"])}</h3><ul class="offer-list">{"".join("<li>"+E(x)+"</li>" for x in P["pay_cr_l"])}</ul></div>
    {ints}
    <div class="pay-steps"><ol class="steps">{steps}</ol>
      <a class="btn btn-outline" href="{wa_link(lang, P["pay_wa_msg"], P["pay_wa_msg"])}" target="_blank" rel="noopener">{E(P["pay_wa"])} →</a></div>
  </div>
</div></section>'''

def books_section(lang):
    """Bloque de libros idéntico al del inicio (mismas clases, textos y enlaces), al final de la página."""
    h = HOME[lang]; L = lambda a, b: a if lang == "es" else b
    cat = {r["id"]: r for r in catalog.build(lang)}
    books = "".join(f'''<li><a class="book" href="{b["url"]}" target="_blank" rel="noopener sponsored" aria-label="{E(b["title"])} — {E(h["res_amazon_badge"])}">
        <span class="cover"><img src="{b["img"]}" alt="{E(L('Portada de ','Cover of '))}{E(b["title"])}" width="240" height="375" loading="lazy" decoding="async"><span class="badge">{E(h["res_amazon_badge"])} ↗</span></span>
        <span class="btitle">{E(b["title"])}</span></a></li>''' for b in [cat[f"libro-{i}"] for i in "12345"])
    return f'''<section class="section resources" id="libros"><div class="container">
  <div class="res-books">
    <div class="rb-copy"><h3>{E(h["res_books_h"])}</h3><p>{E(h["res_books_p"])}</p>
      <a class="more" href="{LINKS["amazon_author"]}" target="_blank" rel="noopener sponsored">{E(h["res_books_cta"])}</a></div>
    <ul class="books">{books}</ul>
  </div>
</div></section>'''

# ------------------------------------------------------------------ ALIMENTACIÓN
def food(lang):
    f = FOOD[lang]; L = lambda a, b: a if lang == "es" else b
    sup = "".join(f'<li>{icon(i)}<span>{E(t)}</span></li>' for i, t in f["supports"])
    items = "".join(f"<li>{E(x)}</li>" for x in f["rep_items"])
    progs = "".join(f'''<div class="feature-in">
    <div class="feature-img"><img src="/assets/img/{im}.webp" alt="{E(alt)}" width="1400" height="{788 if im == "salud-digestiva" else 933}" loading="lazy" decoding="async"></div>
    <div><p class="eyebrow">{E(f["prog_eyebrow"])}</p><h3 class="feature-title">{E(t)}</h3>
      <p>{E(d)}</p>
      <p class="feature-row"><span class="price price-lg">{E(price)}</span></p>
      <a class="btn btn-terra" href="{url(lang,k)}">{E(f["prog_cta"])} →</a></div></div>''' for k, im, t, d, price, alt in f["progs"])
    free = ""
    if lang == "es":   # programa gratuito por correo: SOLO español
        free = f'''<div class="offer">
    <span class="offer-ico">{icon("mail","ic ic-lg")}</span>
    <div><h3>{E(f["free_h"])}</h3><p class="offer-sub">{E(f["free_sub"])}</p>
      <p>{E(f["free_p"])}</p>
      <div class="offer-row"><span class="price price-lg">{E(f["free_price"])}</span></div>
      <form class="rm-form" data-ml="{LINKS["mailerlite_programa"]}" data-ok="{E(f["free_ok"])}" data-err="{E(f["free_err"])}" novalidate>
        <input type="email" name="fields[email]" required autocomplete="email" placeholder="{E(f["free_ph"])}" aria-label="{E(f["free_label"])}">
        <button type="submit">{E(f["free_cta"])}</button></form>
      <p class="offer-note" role="status" aria-live="polite" data-ml-msg></p>
      <p class="offer-fine">Al suscribirse acepta recibir este programa por correo; puede darse de baja en cualquier mensaje. Más información en la <a href="{url(lang,"privacy")}">política de privacidad</a>.</p></div>
  </div>'''
    offers_cls = "offers-in offers-3" if lang == "es" else "offers-in"
    return f'''{head(lang,"food",f["title"],f["desc"],"/assets/img/hero-alimentacion.webp")}
{header(lang,"food")}
<main id="main">
<section class="hero hero-page">
  <picture class="hero-media"><source media="(max-width: 760px)" srcset="/assets/img/hero-alimentacion-m.webp"><img src="/assets/img/hero-alimentacion.webp" alt="{E(f["hero_alt"])}" width="1400" height="700" fetchpriority="high"></picture>
  <div class="container hero-inner"><div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead">{E(f["lead"])}</p>
    <a class="btn btn-primary" href="#productos">{E(f["cta"])} →</a>
    <ul class="supports">{sup}</ul></div></div>
</section>

{products_html(lang)}

<section class="weight-link"><div class="container wl-in">
  <div><h2>{E(L("¿Busca apoyo con su peso?", "Looking for support with your weight?"))}</h2>
  <p>{E(L("En Bajar de peso encontrará Mi mapa de equilibrio y el acompañamiento individual.", "In Weight management you will find My Balance Map and the one-on-one session."))}</p></div>
  <a class="btn btn-primary" href="{url(lang,"weight")}">{E(L("Ver Bajar de peso", "See Weight management"))} →</a>
</div></section>

<section class="section articles" id="articulos"><div class="container">
  <div class="art-head"><div><h2>{E(f["art_h2"])}</h2><p>{E(f["art_p"])}</p></div>
    <a class="more" href="{BLOG_BASE if lang=="es" else EN_BLOG}/" target="_blank" rel="noopener">{E(f["art_all"])} →</a></div>
  <div class="grid-3">{article_cards(lang,"food",f["art_read"])}</div>
</div></section>

{books_section(lang)}

</main>
{footer(lang)}
{tail(lang)}'''


# ------------------------------------------------------------------ TRANSPERSONAL / ESPIRITUAL
def spiritual(lang):
    f = SPIRIT[lang]
    cat = {r["id"]: r for r in catalog.build(lang)}
    course = SPIRITUAL_COURSES[lang]
    books = "".join(f'''<li><a class="book" href="{b["url"]}" target="_blank" rel="noopener sponsored" aria-label="{E(b["title"])} — {E(f["amazon_badge"])}">
        <span class="cover"><img src="{b["img"]}" alt="{E(f["cover_of"])}{E(b["title"])}" width="240" height="375" loading="lazy" decoding="async"><span class="badge">{E(f["amazon_badge"])} ↗</span></span>
        <span class="btitle">{E(b["title"])}</span></a></li>''' for b in [cat[i] for i in f["books_ids"]])
    return f'''{head(lang,"spiritual",f["title"],f["desc"],"/assets/img/espiritual.webp")}
{header(lang,"spiritual")}
<main id="main">
<section class="hero-split"><div class="container split-in">
  <div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead">{E(f["lead"])}</p>
    <a class="btn btn-primary" href="#productos">{E(f["cta"])} →</a></div>
  <div class="arch"><picture><source media="(max-width: 760px)" srcset="/assets/img/espiritual-m.webp"><img src="/assets/img/espiritual.webp" alt="{E(f["hero_alt"])}" width="999" height="1120" fetchpriority="high"></picture></div>
</div></section>

{products_html(lang, PRODUCTS_SPIRIT[lang])}

<section class="section articles" id="articulos"><div class="container">
  <div class="art-head"><div><h2>{E(f["art_h2"])}</h2><p>{E(f["art_p"])}</p></div>
    <a class="more" href="{BLOG_BASE if lang=="es" else EN_BLOG}/" target="_blank" rel="noopener">{E(f["art_all"])} →</a></div>
  <div class="grid-3">{article_cards(lang,"spiritual",f["art_read"])}</div>
</div></section>

{books_section(lang)}

</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ HÁBITOS Y BIENESTAR
def habits(lang):
    f = HABITS[lang]; fa = FOOD[lang]
    sup = "".join(f'<li>{icon(i)}<span>{E(t)}</span></li>' for i, t in f["supports"])
    return f'''{head(lang,"habits",f["title"],f["desc"],"/assets/img/habitos-hero.webp")}
{header(lang,"habits")}
<main id="main">
<section class="hero hero-page">
  <picture class="hero-media"><source media="(max-width: 760px)" srcset="/assets/img/habitos-hero-m.webp"><img src="/assets/img/habitos-hero.webp" alt="{E(f["hero_alt"])}" width="1672" height="941" fetchpriority="high"></picture>
  <div class="container hero-inner"><div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead">{E(f["lead"])}</p>
    <a class="btn btn-primary" href="#productos">{E(f["cta"])} →</a>
    <ul class="supports">{sup}</ul></div></div>
</section>

{products_html(lang, PRODUCTS_HABITS[lang])}

<section class="section articles" id="articulos"><div class="container">
  <div class="art-head"><div><h2>{E(fa["art_h2"])}</h2><p>{E(fa["art_p"])}</p></div>
    <a class="more" href="{BLOG_BASE if lang=="es" else EN_BLOG}/" target="_blank" rel="noopener">{E(fa["art_all"])} →</a></div>
  <div class="grid-3">{article_cards(lang,"habits",fa["art_read"])}</div>
</div></section>

{books_section(lang)}

</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ BAJAR DE PESO
def weight(lang):
    f = WEIGHT[lang]
    sup = "".join(f'<li>{icon(i)}<span>{E(t)}</span></li>' for i, t in f["supports"])
    return f'''{head(lang,"weight",f["title"],f["desc"],"/assets/img/"+f["hero_img"]+".webp")}
{header(lang,"weight")}
<main id="main">
<section class="hero hero-page">
  <picture class="hero-media"><source media="(max-width: 760px)" srcset="/assets/img/{f["hero_img_m"]}.webp"><img src="/assets/img/{f["hero_img"]}.webp" alt="{E(f["hero_alt"])}" width="1400" height="933" fetchpriority="high"></picture>
  <div class="container hero-inner"><div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead">{E(f["lead"])}</p>
    <a class="btn btn-primary" href="#productos">{E(f["cta"])} →</a>
    <ul class="supports">{sup}</ul></div></div>
</section>

{products_html(lang, PRODUCTS_WEIGHT[lang])}

{books_section(lang)}

</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ MENTE TRANQUILA
def mind(lang):
    f = MIND[lang]; fa = FOOD[lang]
    sup = "".join(f'<li>{icon(i)}<span>{E(t)}</span></li>' for i, t in f["supports"])
    return f'''{head(lang,"mind",f["title"],f["desc"],"/assets/img/mente-tranquila.webp")}
{header(lang,"mind")}
<main id="main">
<section class="hero hero-page">
  <picture class="hero-media"><source media="(max-width: 760px)" srcset="/assets/img/mente-tranquila-m.webp"><img src="/assets/img/mente-tranquila.webp" alt="{E(f["hero_alt"])}" width="1400" height="788" fetchpriority="high"></picture>
  <div class="container hero-inner"><div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead">{E(f["lead"])}</p>
    <a class="btn btn-primary" href="#productos">{E(f["cta"])} →</a>
    <ul class="supports">{sup}</ul></div></div>
</section>

{products_html(lang, PRODUCTS_MIND[lang])}

<section class="section articles" id="articulos"><div class="container">
  <div class="art-head"><div><h2>{E(fa["art_h2"])}</h2><p>{E(fa["art_p"])}</p></div>
    <a class="more" href="{BLOG_BASE if lang=="es" else EN_BLOG}/" target="_blank" rel="noopener">{E(fa["art_all"])} →</a></div>
  <div class="grid-3">{article_cards(lang,"mind",fa["art_read"])}</div>
</div></section>

{books_section(lang)}

</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ ACOMPAÑAMIENTO
def session(lang):
    f = SESSION[lang]
    cards = "".join(f'''<article class="acomp-card"><span class="ico">{icon(i,"ic ic-lg")}</span><h3>{E(t)}</h3><p>{E(d)}</p></article>''' for i, t, d in f["areas"])
    facts = "".join(f'<li><strong>{E(a)}</strong><span>{E(b)}</span></li>' for a, b in f["facts"])
    return f'''{head(lang,"session",f["title"],f["desc"],"/assets/img/"+f["hero_img"]+".webp")}
{header(lang,"session")}
<main id="main">
<section class="hero-split"><div class="container split-in split-fig">
  <div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead">{E(f["lead"])}</p>
    <a class="btn btn-primary" href="#productos">{E(f["cta"])} →</a></div>
  <div class="fig"><img src="/assets/img/{f["hero_img"]}.webp" alt="{E(f["hero_alt"])}" width="1400" height="933" fetchpriority="high"></div>
</div></section>

<section class="section"><div class="container acomp-in">
  <p class="acomp-intro">{E(f["intro_p1"])}</p>
  <div class="sec-head"><h2>{E(f["areas_h2"])}</h2><p>{E(f["areas_p"])}</p></div>
  <div class="acomp-grid">{cards}</div>
  <p class="acomp-intro acomp-extra">{E(f["areas_extra"])}</p>
</div></section>

<section class="section how"><div class="container acomp-in">
  <div class="sec-head"><h2>{E(f["how_h2"])}</h2></div>
  <ul class="facts">{facts}</ul>
  <p class="acomp-intro">{E(f["how_p"])}</p>
</div></section>

<section class="section"><div class="container acomp-in acomp-center">
  <h2>{E(f["appr_h2"])}</h2><p class="acomp-intro">{E(f["appr_p"])}</p>
</div></section>

{products_html(lang, PRODUCTS_SESSION[lang])}

<section class="section scope"><div class="container acomp-in acomp-center">
  <h2>{E(f["scope_h2"])}</h2><p class="acomp-intro">{E(f["scope_p"])}</p>
</div></section>

</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ CONTACTO
def contact(lang):
    f = CONTACT_PAGE[lang]
    return f'''{head(lang,"contact",f["title"],f["desc"],"/assets/img/"+f["hero_img"]+".webp")}
{header(lang,"contact")}
<main id="main">
<section class="hero-split"><div class="container split-in split-fig">
  <div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead">{E(f["lead"])}</p>
    <a class="btn btn-primary" href="#formulario">{E(f["form_h2"])} →</a></div>
  <div class="fig"><img src="/assets/img/{f["hero_img"]}.webp" alt="{E(f["hero_alt"])}" width="1400" height="933" fetchpriority="high"></div>
</div></section>

<section class="section" id="formulario"><div class="container contact-grid">
  <div class="contact-form card">
    <h2>{E(f["form_h2"])}</h2><p>{E(f["form_p"])}</p>
    <form class="cform" data-mail="{E(CONTACT["email"])}" data-subject="{E(f["mail_subject"])}"{(' data-endpoint="'+E(CONTACT_ENDPOINT)+'"') if CONTACT_ENDPOINT else ''} data-lang="{lang}" data-ok="{E(f["f_ok"])}" data-sent="{E(f["f_sent"])}" data-sending="{E(f["f_sending"])}" data-err="{E(f["f_hp"])}" data-e-name="{E(f["f_e_name"])}" data-e-email="{E(f["f_e_email"])}" data-e-msg="{E(f["f_e_msg"])}" data-e-srv="{E(f["f_e_srv"])}" data-e-net="{E(f["f_e_net"])}" novalidate>
      <label>{E(f["f_name"])}<input name="name" type="text" autocomplete="name" maxlength="120" required></label>
      <label>{E(f["f_email"])}<input name="email" type="email" autocomplete="email" maxlength="200" required></label>
      <label>{E(f["f_msg"])}<textarea name="message" rows="6" maxlength="5000" required></textarea></label>
      <div class="hp" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
      <button class="btn btn-primary" type="submit">{E(f["f_send"])} →</button>
      <p class="cform-msg" role="status" aria-live="polite"></p>
      <p class="cform-note">{E(f["f_note"])}</p>
    </form>
  </div>
  <aside class="contact-side">
    <div class="card cside"><span class="ico">{icon("chat","ic ic-lg")}</span><h3>{E(f["wa_h"])}</h3><p>{E(f["wa_p"])}</p>
      <a class="btn btn-primary" href="{wa_link(lang, f["wa_msg"], f["wa_msg"])}" target="_blank" rel="noopener">{E(f["wa_cta"])} →</a>
      <p class="cside-note">{E(CONTACT["wa_display"])}</p></div>
    <div class="card cside"><span class="ico">{icon("mail","ic ic-lg")}</span><h3>{E(f["mail_h"])}</h3>
      <p><a href="mailto:{CONTACT["email"]}">{E(CONTACT["email"])}</a></p></div>
    <div class="card cside"><span class="ico">{icon("heart","ic ic-lg")}</span><h3>{E(f["soc_h"])}</h3><p>{E(f["soc_p"])}</p>
      <div class="cside-btns"><a class="btn btn-outline" href="{CONTACT["facebook"]}" target="_blank" rel="noopener">{E(f["fb"])}</a>
      <a class="btn btn-outline" href="{CONTACT["linkedin"]}" target="_blank" rel="noopener">{E(f["li"])}</a></div></div>
  </aside>
</div></section>
</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ RECURSOS
def resources(lang):
    f = RES[lang]; es = lang == "es"
    def card(it, page_key):
        tall = it.get("contain") == "tall"
        cont = " contain" if it.get("contain") else ""
        return f'''<article class="card prod res-card">
      <div class="card-img{cont}{" tall" if tall else ""}"><img src="/assets/img/{it["img"]}.webp" alt="{E(it["alt"])}" width="1200" height="800" loading="lazy" decoding="async"></div>
      <div class="card-body"><h3>{E(it["name"])}</h3><p class="prod-desc">{E(it["desc"])}</p>
        <div class="offer-row"><span class="price price-lg">{E(it["price"])}</span></div>
        <a class="btn btn-outline" href="{url(lang, page_key)}">{E(f["more"])} →</a></div></article>'''
    if es:
        sel = [(PRODUCTS_HABITS["es"]["items"][0], "map"), (PRODUCTS["es"]["items"][1], "garden"), (PRODUCTS_WEIGHT["es"]["items"][0], "weight"),
               (PRODUCTS_MIND["es"]["items"][0], "mind"), (PRODUCTS_SPIRIT["es"]["items"][1], "spiritual"), (PRODUCTS["es"]["items"][0], "food")]
    else:
        sel = [(PRODUCTS_HABITS["en"]["items"][0], "map"), (PRODUCTS["en"]["items"][0], "garden"), (PRODUCTS_WEIGHT["en"]["items"][0], "weight"),
               (PRODUCTS_MIND["en"]["items"][0], "mind"), (PRODUCTS_SPIRIT["en"]["items"][1], "spiritual")]
    cards = "".join(card(i, k) for i, k in sel)
    ses = (PRODUCTS_SESSION[lang]["items"][0])
    ses_inc = "".join(f"<li>{E(x)}</li>" for x in ses["inc"])
    feat = [a for a in ARTICLES["food"][:2]] + [ARTICLES["habits"][0], ARTICLES["mind"][0], ARTICLES["weight"][0], ARTICLES["spiritual"][0]]
    chips = "".join(f'<li><a href="#{a}">{E(t)}</a></li>' for a, t in f["nav"])
    return f'''{head(lang,"resources",f["title"],f["desc"],"/assets/img/recursos.webp")}
{header(lang,"resources")}
<main id="main">
<section class="hero hero-page hero-rec">
  <picture class="hero-media"><source media="(max-width: 760px)" srcset="/assets/img/recursos-m.webp"><img src="/assets/img/recursos.webp" alt="{E(f["hero_alt"])}" width="2000" height="750" fetchpriority="high"></picture>
  <div class="container hero-inner"><div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead">{E(f["lead"])}</p>
    <ul class="chips">{chips}</ul></div></div>
</section>

<section class="section feature" id="productos"><div class="container">
  <div class="sec-head"><h2>{E(f["prod_h2"])}</h2><p>{E(f["prod_p"])}</p></div>
  <div class="res-grid">{cards}</div>
</div></section>

<section class="section ses-band" id="acompanamiento"><div class="container ses-in">
  <div class="ses-img"><img src="/assets/img/{ses["img"]}.webp" alt="{E(ses["alt"])}" width="1200" height="800" loading="lazy" decoding="async"></div>
  <div class="ses-copy"><p class="eyebrow">{E(f["ses_h2"]).upper()}</p><h2>{E(ses["name"])}</h2><p>{E(ses["desc"])}</p>
    <ul class="offer-list">{ses_inc}</ul>
    <div class="offer-row"><span class="price price-lg">{E(ses["price"])}</span></div>
    <div class="ses-btns"><a class="btn btn-primary" href="{url(lang,"session")}">{E(f["ses_more"])} →</a>
    <a class="btn btn-outline" href="{wa_link(lang, ses["msg"], ses["msg"])}" target="_blank" rel="noopener">{E(ses["cta"])} →</a></div></div>
</div></section>

{books_section(lang)}

<section class="section articles" id="blog"><div class="container">
  <div class="art-head"><div><h2>{E(f["art_h2"])}</h2><p>{E(f["art_p"])}</p></div>
    <a class="more" href="{BLOG_BASE if es else EN_BLOG}/" target="_blank" rel="noopener">{E(f["art_all"])} →</a></div>
  <div class="grid-3">{article_cards(lang,None,f["art_read"],feat)}</div>
</div></section>

</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ SOBRE MÍ
def about(lang):
    f = ABOUT[lang]; es = lang == "es"
    paras = "".join(f"<p>{E(t)}</p>" for t in f["paras"])
    slides = []
    for c in CREDENTIALS:
        det = c["detail_es"] if es else c["detail_en"]
        yr = f'<span class="cred-year">{c["year"]}</span>' if c.get("year") else ""
        slides.append(f'''<li class="cred"><a class="cred-img" href="/assets/img/{c["img"]}" target="_blank" rel="noopener" aria-label="{E(f["open"])}: {E(c["es"] if es else c["en"])}"><img src="/assets/img/{c["img"]}" alt="{E(f["open"])}: {E(c["es"] if es else c["en"])}" width="800" height="600" loading="lazy" decoding="async"></a>
        <div class="cred-body">{yr}<h3>{E(c["es"] if es else c["en"])}</h3><p>{E(det)}</p></div></li>''')
    return f'''{head(lang,"about",f["title"],f["desc"],"/assets/img/yo-blusa-blanca.webp")}
{header(lang,"about")}
<main id="main">
<section class="hero-split"><div class="container split-in">
  <div class="hero-copy">
    <p class="eyebrow">{E(f["eyebrow"])}</p>
    <h1>{E(f["h1"])}</h1><p class="lead lead-strong">{E(f["lead"])}</p>
    <p class="about-hero-p">{E(f["hero_p"])}</p></div>
  <div class="fig"><img src="/assets/img/yo-blusa-blanca.webp" alt="{E(f["photo_alt"])}" width="1000" height="837" fetchpriority="high"></div>
</div></section>

<section class="section"><div class="container about-text">
  {paras}
  <p class="about-welcome">{E(f["welcome"])}</p>
</div></section>

<section class="section creds" id="acreditaciones"><div class="container">
  <div class="sec-head"><h2>{E(f["cred_h2"])}</h2><p>{E(f["cred_p"])}</p></div>
  <div class="carousel" data-prev="{E(f["prev"])}" data-next="{E(f["next"])}" role="region" aria-label="{E(f["carousel"])}">
    <ul class="cred-track">{"".join(slides)}</ul>
  </div>
</div></section>
</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ PRIVACIDAD
def privacy(lang):
    f = PRIVACY[lang]; body = []
    for h, ps, bl in f["S"]:
        block = f"<h2>{E(h)}</h2>" + "".join(f"<p>{E(t)}</p>" for t in ps)
        if bl:
            lis = "".join("<li><strong>" + E(t.split(". ", 1)[0]) + ".</strong> " + E(t.split(". ", 1)[1]) + "</li>" for t in bl)
            block += f'<ul class="priv-list">{lis}</ul>'
        if h in ("Sus derechos", "Your rights (Costa Rica)"):
            block += f'<p>{E(f["law_pre"])}<a href="{LAW}" target="_blank" rel="noopener">{E(f["law_txt"])}</a>{E(f["law_post"])}</p>'
        body.append(block)
    return f'''{head(lang,"privacy",f["title"],f["desc"])}
{header(lang,"privacy")}
<main id="main">
<section class="priv-hero"><div class="container priv-in">
  <p class="eyebrow">{E(f["eyebrow"])}</p><h1>{E(f["h1"])}</h1><p class="priv-date">{E(f["updated"])}</p>
</div></section>
<section class="section"><div class="container priv-in priv-body">{"".join(body)}</div></section>
</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ TÉRMINOS DE USO
def terms(lang):
    f = TERMS[lang]; body = []; pv = url(lang, "privacy")
    for h, ps, bl in f["S"]:
        block = f"<h2>{E(h)}</h2>" + "".join(f"<p>{E(t)}</p>" for t in ps)
        if bl:
            lis = "".join("<li><strong>" + E(t.split(". ", 1)[0]) + ".</strong> " + E(t.split(". ", 1)[1]) + "</li>" for t in bl)
            block += f'<ul class="priv-list">{lis}</ul>'
        if h in ("Privacidad", "Privacy"):
            block += f'<p><a href="{pv}">{E(PRIVACY[lang]["h1"])} →</a></p>'
        body.append(block)
    return f'''{head(lang,"terms",f["title"],f["desc"])}
{header(lang,"terms")}
<main id="main">
<section class="priv-hero"><div class="container priv-in">
  <p class="eyebrow">{E(f["eyebrow"])}</p><h1>{E(f["h1"])}</h1><p class="priv-date">{E(f["updated"])}</p>
</div></section>
<section class="section"><div class="container priv-in priv-body">{"".join(body)}</div></section>
</main>
{footer(lang)}
{tail(lang)}'''

# ------------------------------------------------------------------ BÚSQUEDA
def search_js(lang):
    cat = [r for r in catalog.build(lang) if r["id"] not in ("informe", "area-alimentacion", "area-habitos", "area-mente")]
    c = COMMON[lang]; out = []; seen = set()
    def add(t, d, u, kw="", ext=False):
        if u in seen: return
        seen.add(u); out.append(dict(t=t, d=d, u=u, k=kw, x=1 if ext else 0))
    for k in ["food", "habits", "mind", "weight", "spiritual", "resources", "session", "map", "garden", "about", "contact", "privacy", "terms"]:
        add(c["nav"][k], "", url(lang, k))
    for r in cat:
        add(r["title"], r.get("subtitle", ""), r["url"], " ".join(r.get("keywords", [])), r.get("external", False))
    done = set()
    for page, lst in ARTICLES.items():
        for a in lst:
            if a["slug"] in done: continue
            done.add(a["slug"])
            if lang == "en" and a["en"]: add(a["en"]["title"], "Blog", a["en"]["url"], "", True)
            else: add(a["title"], "Blog", a["url"], "", True)
    return "window.SI_SEARCH=" + json.dumps(out, ensure_ascii=False) + ";"

# ------------------------------------------------------------------ escritura
def write(path, content):
    full = os.path.join(DIST, path.lstrip("/"))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(content)

def page_path(lang, key):
    return url(lang, key) + "index.html"

def data_js(lang):
    cat = catalog.build(lang)
    art = next(r["url"] for r in cat if r["id"] == "art-2am")
    a = assistant.build(lang)
    blob = json.dumps(a, ensure_ascii=False).replace("__ART2AM__", art)
    return "window.SI_DATA=" + blob + ";window.SI_CATALOG=" + json.dumps([r for r in cat if r["id"] != "informe"], ensure_ascii=False) + ";"

BUILDERS = {"terms": terms, "home": home, "food": food, "habits": habits, "spiritual": spiritual, "weight": weight, "mind": mind, "session": session, "contact": contact, "resources": resources, "about": about, "privacy": privacy}
_self = sys.modules[__name__]
for _k, _fn in mapa.BUILDERS.items():
    BUILDERS[_k] = (lambda f: (lambda lang: f(lang, _self)))(_fn)
for _k, _fn in jardin.BUILDERS.items():
    BUILDERS[_k] = (lambda f: (lambda lang: f(lang, _self)))(_fn)
NOINDEX = {"map_access", "map_quiz", "garden_access"}

def main():
    if os.path.exists(DIST): shutil.rmtree(DIST)
    os.makedirs(DIST)
    shutil.copytree(os.path.join(ROOT, "static"), os.path.join(DIST, "assets"))
    built = []
    for key, fn in BUILDERS.items():
        for lang in ("es", "en"):
            write(page_path(lang, key), fn(lang)); built.append((lang, key))
    for lang in ("es", "en"):
        write(f"/assets/js/data-{lang}.js", data_js(lang))
        write(f"/assets/js/search-{lang}.js", search_js(lang))
    urls = "".join(f"<url><loc>{SITE_URL}{url(l,k)}</loc></url>" for l, k in built if k not in NOINDEX)
    # Archivos del producto: se publican bajo /privado/ (el Worker los entrega solo con acceso válido)
    pv = os.path.join(DIST, "privado"); os.makedirs(pv)
    src = os.path.join(ROOT, "static_privado")
    for f in os.listdir(src):
        if f == "mapa-fuentes.js": continue
        if os.path.isdir(os.path.join(src, f)): shutil.copytree(os.path.join(src, f), os.path.join(pv, f))
        else: shutil.copy(os.path.join(src, f), pv)
    eq = os.path.join(ROOT, "app_equilibrio", "index.html")  # «Mi mapa de equilibrio»: página pública (el PDF es lo que se paga: /privado/equilibrio/pdf.js)
    if os.path.exists(eq):
        os.makedirs(os.path.join(DIST, "equilibrio")); shutil.copy(eq, os.path.join(DIST, "equilibrio", "index.html"))
    for lang in ("es", "en"):  # el juego del jardín: solo con la cookie si_jardin
        write(jardin.game_url(lang) + "index.html", jardin.build_garden_app(lang, _self))
    import base64
    pa = os.path.join(ROOT, "pdf_assets"); fnt = {}
    for n in ["Fraunces-Regular","Fraunces-SemiBold","Fraunces-Italic","Jost-Regular","Jost-Medium","Jost-SemiBold"]:
        fnt[n] = base64.b64encode(open(os.path.join(pa, n + ".ttf"), "rb").read()).decode()
    logo = base64.b64encode(open(os.path.join(pa, "logo.png"), "rb").read()).decode()
    open(os.path.join(pv, "mapa-fuentes.js"), "w").write("window.MAPA_FONTS=" + json.dumps(fnt) + ";window.MAPA_LOGO='data:image/png;base64," + logo + "';window.MAPA_PORTADA=" + json.dumps({l: "data:image/jpeg;base64," + base64.b64encode(open(os.path.join(pa, "portada-" + l + ".jpg"), "rb").read()).decode() for l in ("es", "en")}) + ";")
    write("/sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>')
    shutil.copy(os.path.join(ROOT, "static", "img", "favicon.ico"), os.path.join(DIST, "favicon.ico"))
    write("/robots.txt", f"User-agent: *\nAllow: /\nDisallow: /privado/\nDisallow: /api/\nSitemap: {SITE_URL}/sitemap.xml\n")
    # Los archivos de /assets/ no llevan huella en el nombre: solo las fuentes (nunca cambian) son "immutable"; el resto se revalida
    # para que un CSS/JS/imagen corregido llegue a los visitantes. /privado/ no se guarda en cachés compartidas ni se indexa.
    short = "  Cache-Control: public, max-age=3600, must-revalidate\n"
    write("/_headers", "/assets/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n"
          + "".join(f"/assets/{d}/*\n{short}" for d in ("css", "js", "img", "jardin"))
          + "/privado/*\n  Cache-Control: private, no-store\n  X-Robots-Tag: noindex, nofollow\n"
          + "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n")
    print("páginas:", built)

if __name__ == "__main__":
    main()
