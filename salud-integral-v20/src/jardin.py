# -*- coding: utf-8 -*-
"""Producto «Mi Jardín Digestivo / My Digestive Garden» (reemplaza a Salud digestiva):
página de venta (garden) y página del juego (garden_access). El juego es la aplicación entregada
(jardin_app/index.html + static/jardin/*), publicada sin cambios de contenido; aquí solo se
envuelve como página del sitio. Para que el juego cargue sus archivos relativos (img/, fonts/, *.js,
vendor/) desde /assets/jardin/ se usa <base>. Idioma inicial: el de la página."""
import os, re, json, html
from config import *
E = html.escape
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(HERE, "..", "jardin_app", "index.html")

def game_url(lang):
    """El juego vive bajo /privado/: el Worker lo entrega solo con la cookie si_jardin."""
    return f"/privado/jardin/{lang}/"


T = {
"es": dict(
  title="Mi Jardín Digestivo — guía interactiva y PDF personalizado | Salud Integral",
  desc="Recorra un jardín ilustrado con cinco estaciones sobre hábitos, alimentación, fermentos y microbiota, y reciba al final un PDF personalizado.",
  eyebrow="Experiencia interactiva · PDF personalizado", h1="Mi Jardín Digestivo",
  lead="Su guía práctica para una mejor digestión y bienestar. Recorra un jardín ilustrado con cinco estaciones, a su ritmo, y al final descargue un PDF con lo que usted eligió.",
  price="US$25", price_note="pago único", buy="Comprar con PayPal",
  have="¿Ya pagó? Entre a su jardín",
  incl_h="Qué incluye",
  incl=["Un jardín ilustrado con cinco estaciones para recorrer a su ritmo",
        "Estación 1 · El sendero de mis hábitos: una mirada a un día reciente, tarjeta por tarjeta",
        "Estación 2 · La cocina del jardín: arme su plato digestivo",
        "Estación 3 · El taller de fermentos: kéfir de leche y chucrut casero, paso a paso",
        "Estación 4 · Los secretos bajo la tierra: cómo se parecen el suelo y el intestino, y qué hacen los microbios",
        "Estación 5 · Mi rincón de cultivo: elija tres hábitos y planee cuándo empezar",
        "Un PDF personalizado con su día, su plato, sus fermentos, lo que descubrió y su plan"],
  how_h="Cómo funciona",
  steps=[("Pague con PayPal", "El pago se hace en la página segura de PayPal. Usted no escribe datos de pago en este sitio."),
         ("Vuelva y entre a su jardín", "El mapa del jardín es la entrada. Toque una estación y siga las tarjetas; cada una pregunta algo corto."),
         ("Descargue su PDF", "Al terminar las cinco estaciones, el PDF se crea en su dispositivo y se descarga de inmediato.")],
  priv_h="Su privacidad",
  priv="Sus respuestas se procesan únicamente en su dispositivo: no se envían ni se guardan en ningún servidor.",
  note="Finalidad educativa y de acompañamiento personal. No hace diagnósticos y no sustituye la valoración ni el tratamiento de profesionales de la salud.",
  app_title="Mi Jardín Digestivo | Salud Integral",
  a_title="Entrar a su jardín | Salud Integral", a_h1="Entre a su jardín",
  a_lead="Si acaba de pagar, su acceso se confirma en unos segundos. Si PayPal no le devolvió aquí automáticamente, escriba el número de transacción de su recibo.",
  a_label="Número de transacción de PayPal", a_ph="Ej.: 1AB23456CD789012E", a_btn="Confirmar mi pago",
  a_help="Lo encuentra en el correo de recibo de PayPal («ID de transacción»).",
  a_checking="Confirmando su pago con PayPal…",
  a_wait="Todavía no recibimos la confirmación de PayPal. Seguimos intentando; puede tardar un par de minutos.",
  a_wait_end="Aún no aparece su pago. Espere unos minutos y pulse de nuevo «Confirmar mi pago». Si ya pasó más de una hora, escríbanos por WhatsApp.",
  a_notfound="No encontramos ese número de transacción. Revise que sea el «ID de transacción» de su recibo de PayPal.",
  a_refunded="Ese pago figura como reembolsado o revertido, por lo que no da acceso.",
  a_limit="Ese pago ya se usó el máximo de veces permitido. Escríbanos por WhatsApp y lo resolvemos.",
  a_expired="Ese pago ya superó el plazo para canjear el acceso. Escríbanos por WhatsApp y lo resolvemos.",
  a_error="No pudimos comprobarlo en este momento. Inténtelo de nuevo en un minuto.",
  a_ok="Pago confirmado. Un momento…", a_enter="Ir a mi jardín", a_active="Su acceso está activo en este dispositivo.",
  a_none="¿Aún no ha pagado?", a_buy="Ver Mi Jardín Digestivo",
),
"en": dict(
  title="My Digestive Garden — interactive guide + personalized PDF | Salud Integral",
  desc="Walk through an illustrated garden with five stations about habits, food, ferments and the microbiome, and get a personalized PDF at the end.",
  eyebrow="Interactive experience · Personalized PDF", h1="My Digestive Garden",
  lead="Your practical guide to better digestion and wellbeing. Walk through an illustrated garden with five stations, at your own pace, and download a PDF of what you chose at the end.",
  price="US$25", price_note="one-time payment", buy="Buy with PayPal",
  have="Already paid? Enter your garden",
  incl_h="What's included",
  incl=["An illustrated garden with five stations to explore at your own pace",
        "Station 1 · The Path of My Habits: a look at a recent day, card by card",
        "Station 2 · The Garden Kitchen: build your digestive plate",
        "Station 3 · The Fermentation Workshop: milk kefir and homemade sauerkraut, step by step",
        "Station 4 · Secrets Beneath the Soil: how soil and gut are alike, and what microbes do",
        "Station 5 · My Growing Corner: choose three habits and plan when to start",
        "A personalized PDF with your day, your plate, your ferments, what you discovered and your plan"],
  how_h="How it works",
  steps=[("Pay with PayPal", "Payment happens on PayPal's secure page. You never enter payment details on this site."),
         ("Come back and enter your garden", "The garden map is the entrance. Tap a station and follow the cards; each one asks something short."),
         ("Download your PDF", "When you finish the five stations, the PDF is created on your device and downloads right away.")],
  priv_h="Your privacy",
  priv="Your answers are processed only on your device: they are not sent to or stored on any server.",
  note="Educational and personal-support purpose. It does not provide diagnoses and does not replace assessment or treatment by health professionals.",
  app_title="My Digestive Garden | Salud Integral",
  a_title="Enter your garden | Salud Integral", a_h1="Enter your garden",
  a_lead="If you just paid, your access is confirmed in a few seconds. If PayPal did not bring you back here automatically, enter the transaction number from your receipt.",
  a_label="PayPal transaction number", a_ph="E.g.: 1AB23456CD789012E", a_btn="Confirm my payment",
  a_help="You can find it in the PayPal receipt email (“Transaction ID”).",
  a_checking="Confirming your payment with PayPal…",
  a_wait="We have not received PayPal's confirmation yet. We keep trying; it can take a couple of minutes.",
  a_wait_end="Your payment does not appear yet. Wait a few minutes and press “Confirm my payment” again. If more than an hour has passed, write to us on WhatsApp.",
  a_notfound="We could not find that transaction number. Check that it is the “Transaction ID” on your PayPal receipt.",
  a_refunded="That payment is listed as refunded or reversed, so it does not give access.",
  a_limit="That payment has already been used the maximum number of times. Write to us on WhatsApp and we will sort it out.",
  a_expired="That payment is past the period to redeem access. Write to us on WhatsApp and we will sort it out.",
  a_error="We could not check it right now. Please try again in a minute.",
  a_ok="Payment confirmed. One moment…", a_enter="Go to my garden", a_active="Your access is active on this device.",
  a_none="Haven't paid yet?", a_buy="See My Digestive Garden",
),
}

def _css(h):
    return h.replace("</head>", '<link rel="stylesheet" href="/assets/css/mapa.css"></head>', 1)

def build_garden(lang, B):
    t = T[lang]
    incl = "".join(f"<li>{E(x)}</li>" for x in t["incl"])
    steps = "".join(f'<li><span class="n">{i+1}</span><div><h3>{E(a)}</h3><p>{E(b)}</p></div></li>' for i, (a, b) in enumerate(t["steps"]))
    app = url(lang, "garden_access")
    return _css(B.head(lang, "garden", t["title"], t["desc"], og_img="/assets/img/producto-jardin.webp")) + f'''
{B.header(lang, "garden")}
<main id="main">
<section class="mp-hero"><div class="container mp-hero-in">
  <div class="mp-copy">
    <p class="eyebrow">{E(t["eyebrow"])}</p>
    <h1>{E(t["h1"])}</h1><p class="lead">{E(t["lead"])}</p>
    <p class="mp-price"><span class="price price-lg">{E(t["price"])}</span> <span class="mp-pn">{E(t["price_note"])}</span></p>
    <p><a class="btn btn-primary" href="{LINKS["paypal_jardin"]}" target="_blank" rel="noopener">{E(t["buy"])} →</a></p>
    <p class="mp-have"><a href="{app}">{E(t["have"])}</a></p>
  </div>
  <aside class="mp-card" aria-labelledby="incl-h"><h2 id="incl-h">{E(t["incl_h"])}</h2><ul class="offer-list">{incl}</ul></aside>
</div></section>
<section class="section"><div class="container mp-narrow">
  <h2>{E(t["how_h"])}</h2><ol class="mp-steps">{steps}</ol>
  <h2>{E(t["priv_h"])}</h2><p>{E(t["priv"])}</p>
</div></section>
<section class="bridge bridge-note"><div class="container"><p>{E(t["note"])}</p></div></section>
</main>
{B.footer(lang)}
{B.tail(lang)}'''

def build_garden_app(lang, B):
    """Página del juego: pantalla completa, sin cabecera del sitio (la app trae la suya)."""
    t = T[lang]
    src = open(APP, encoding="utf-8").read()
    i = src.index("<style>"); j = src.index("</style>") + len("</style>")
    style, body = src[i:j], src[j:]
    old = "lang:((navigator.language||'es')+'').toLowerCase().indexOf('en')===0?'en':'es'"
    assert body.count(old) == 1, "no se encontró la línea del idioma inicial"
    body = body.replace(old, "lang:(document.documentElement.lang==='en'?'en':'es')")
    for js in ("core2", "st2", "st3", "st4", "st5", "pdf", "boot"):
        o = f'<script src="{js}.js"></script>'
        assert body.count(o) == 1, js
        body = body.replace(o, f'<script src="/privado/jardin/{js}.js"></script>')
    # Enlace de vuelta al sitio en la barra superior del mapa (el juego ocupa toda la pantalla y no lleva la cabecera del sitio)
    tb = "</button>`:'';\n  const seeds="
    assert body.count(tb) == 1, "no se encontró la barra superior del juego"
    body = body.replace(tb, "</button>`:`<a class=\"pill gard\" href=\"${SITE_HOME[S.lang]}\" aria-label=\"Salud Integral\">←<span class=\"hide-sm\"> Salud Integral</span></a>`;\n  const seeds=")
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(t["app_title"])}</title>
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#F7F3E8">
<base href="/assets/jardin/">
<script>window.SITE_HOME={{"es":"/","en":"/en/"}};</script>
{style}
<style>a.pill{{text-decoration:none}}</style>
</head>
<body>{body}
</body></html>'''

def build_garden_access(lang, B):
    """Página pública de acceso: confirma el pago con el Worker (/api/jardin/acceso) y abre el juego privado."""
    t = T[lang]
    cfg = {k: v for k, v in t.items() if k.startswith("a_")}
    cfg["quiz"] = game_url(lang); cfg["buy_url"] = url(lang, "garden"); cfg["api"] = "/api/jardin"
    h = B.head(lang, "garden_access", t["a_title"], t["desc"]).replace("</head>", '<meta name="robots" content="noindex,nofollow"></head>', 1)
    return _css(h) + f'''
{B.header(lang, "garden_access")}
<main id="main">
<section class="section"><div class="container mp-narrow">
  <h1>{E(t["a_h1"])}</h1><p class="lead">{E(t["a_lead"])}</p>
  <form class="mp-form" id="acceso-form" novalidate>
    <label for="tx">{E(t["a_label"])}</label>
    <input id="tx" name="tx" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" placeholder="{E(t["a_ph"])}">
    <p class="hint">{E(t["a_help"])}</p>
    <button class="btn btn-primary" type="submit">{E(t["a_btn"])}</button>
  </form>
  <p class="mp-status" id="acceso-msg" role="status" aria-live="polite"></p>
  <p><a class="btn btn-terra" id="acceso-go" href="{game_url(lang)}" hidden>{E(t["a_enter"])} →</a></p>
  <p class="mp-alt">{E(t["a_none"])} <a href="{url(lang,"garden")}">{E(t["a_buy"])}</a></p>
</div></section>
</main>
{B.footer(lang)}
<script type="application/json" id="mapa-cfg">{json.dumps(cfg, ensure_ascii=False)}</script>
<script src="/assets/js/site.js" defer></script>
<script src="/assets/js/mapa-acceso.js" defer></script>
</body></html>'''

BUILDERS = {"garden": build_garden, "garden_access": build_garden_access}
