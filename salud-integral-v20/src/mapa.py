# -*- coding: utf-8 -*-
"""Producto «Tu mapa de hábitos / Your Habit Map»: página de venta, página de acceso y cuestionario."""
import json, html
from config import *
E = html.escape

T = {
"es": dict(
  title="Tu mapa de hábitos — guía personalizada en PDF | Salud Integral",
  desc="Responda un cuestionario breve y reciba al instante un PDF personalizado: perfil orientativo, obstáculos, tres recomendaciones, plan de 7 días y hoja de seguimiento.",
  eyebrow="Guía personalizada · PDF al instante", h1="Tu mapa de hábitos",
  lead="Responda un cuestionario breve y reciba, en el momento, un documento en PDF hecho a partir de sus respuestas: para entender qué le ayuda, qué le frena y por dónde empezar.",
  price="US$9.99", price_note="pago único · sin suscripción", buy="Comprar con PayPal",
  have="¿Ya pagó? Continúe con su cuestionario",
  incl_h="Qué incluye su documento",
  incl=["Su perfil orientativo de hábitos", "Sus principales obstáculos, explicados con claridad", "Tres recomendaciones prácticas y personalizadas",
        "Un plan de acción de 7 días", "Una hoja de seguimiento para imprimir", "Un compromiso personal con su nombre"],
  how_h="Cómo funciona",
  steps=[("Pague con PayPal", "El pago se hace en la página segura de PayPal. Usted no escribe datos de pago en este sitio."),
         ("Vuelva y responda", "Son unas 13 preguntas breves, pensadas para el teléfono. Dura unos 4 minutos."),
         ("Descargue su PDF", "Se crea en su dispositivo y se descarga de inmediato.")],
  priv_h="Su privacidad",
  priv="Sus respuestas se procesan únicamente en su dispositivo: no se envían ni se guardan en ningún servidor. Para dar acceso, solo se conserva el número de transacción del pago.",
  note="Herramienta educativa y orientativa. No es un test psicológico, no hace diagnósticos y no sustituye la atención médica ni psicológica profesional.",
  # acceso
  a_title="Acceder a su cuestionario | Salud Integral", a_h1="Acceda a su cuestionario",
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
  a_ok="Pago confirmado. Un momento…", a_enter="Ir al cuestionario", a_active="Su acceso está activo en este dispositivo.",
  a_none="¿Aún no ha pagado?", a_buy="Ver Tu mapa de hábitos",
  q_title="Su cuestionario | Salud Integral", q_noaccess_h="Necesita confirmar su pago",
  q_noaccess="Para responder el cuestionario primero confirme su pago.", q_noaccess_btn="Confirmar mi pago",
  q_loading="Cargando…", q_loaderr="No se pudo cargar el cuestionario. Recargue la página.",
),
"en": dict(
  title="Your Habit Map — a personalized PDF guide | Salud Integral",
  desc="Answer a short questionnaire and instantly get a personalized PDF: orientation profile, obstacles, three recommendations, a 7-day plan and a tracking sheet.",
  eyebrow="Personalized guide · Instant PDF", h1="Your Habit Map",
  lead="Answer a short questionnaire and get, right away, a PDF built from your answers: to understand what helps you, what holds you back and where to start.",
  price="US$9.99", price_note="one-time payment · no subscription", buy="Buy with PayPal",
  have="Already paid? Continue to your questionnaire",
  incl_h="What your document includes",
  incl=["Your orientation profile for habits", "Your main obstacles, clearly explained", "Three practical, personalized recommendations",
        "A 7-day action plan", "A printable tracking sheet", "A personal commitment with your name"],
  how_h="How it works",
  steps=[("Pay with PayPal", "Payment happens on PayPal's secure page. You never enter payment details on this site."),
         ("Come back and answer", "About 13 short questions, designed for your phone. It takes around 4 minutes."),
         ("Download your PDF", "It is created on your device and downloads right away.")],
  priv_h="Your privacy",
  priv="Your answers are processed only on your device: they are not sent to or stored on any server. To grant access, only the payment's transaction number is kept.",
  note="Educational and orientation tool. It is not a psychological test, does not provide diagnoses and does not replace professional medical or psychological care.",
  a_title="Access your questionnaire | Salud Integral", a_h1="Access your questionnaire",
  a_lead="If you have just paid, your access is confirmed within seconds. If PayPal did not bring you back here automatically, enter the transaction number from your receipt.",
  a_label="PayPal transaction number", a_ph="E.g.: 1AB23456CD789012E", a_btn="Confirm my payment",
  a_help="You can find it in the PayPal receipt email (“Transaction ID”).",
  a_checking="Confirming your payment with PayPal…",
  a_wait="We have not received PayPal's confirmation yet. We keep trying; it can take a couple of minutes.",
  a_wait_end="Your payment does not show up yet. Wait a few minutes and press “Confirm my payment” again. If more than an hour has passed, message us on WhatsApp.",
  a_notfound="We could not find that transaction number. Check that it is the “Transaction ID” on your PayPal receipt.",
  a_refunded="That payment shows as refunded or reversed, so it does not grant access.",
  a_limit="That payment has already been used the maximum number of times. Message us on WhatsApp and we'll sort it out.",
  a_expired="That payment is past the window to redeem access. Message us on WhatsApp and we'll sort it out.",
  a_error="We could not check it right now. Please try again in a minute.",
  a_ok="Payment confirmed. One moment…", a_enter="Go to the questionnaire", a_active="Your access is active on this device.",
  a_none="Haven't paid yet?", a_buy="See Your Habit Map",
  q_title="Your questionnaire | Salud Integral", q_noaccess_h="Please confirm your payment",
  q_noaccess="To answer the questionnaire, first confirm your payment.", q_noaccess_btn="Confirm my payment",
  q_loading="Loading…", q_loaderr="The questionnaire could not be loaded. Please reload the page.",
),
}

def _noindex(h):
    return h.replace("</head>", '<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/assets/css/mapa.css"></head>', 1)

def _css(h):
    return h.replace("</head>", '<link rel="stylesheet" href="/assets/css/mapa.css"></head>', 1)

def build_map(lang, B):
    t = T[lang]
    incl = "".join(f"<li>{E(x)}</li>" for x in t["incl"])
    steps = "".join(f'<li><span class="n">{i+1}</span><div><h3>{E(a)}</h3><p>{E(b)}</p></div></li>' for i, (a, b) in enumerate(t["steps"]))
    acc = url(lang, "map_access")
    return _css(B.head(lang, "map", t["title"], t["desc"])) + f'''
{B.header(lang, "map")}
<main id="main">
<section class="mp-hero"><div class="container mp-hero-in">
  <div class="mp-copy">
    <p class="eyebrow">{E(t["eyebrow"])}</p>
    <h1>{E(t["h1"])}</h1><p class="lead">{E(t["lead"])}</p>
    <p class="mp-price"><span class="price price-lg">{E(t["price"])}</span> <span class="mp-pn">{E(t["price_note"])}</span></p>
    <p><a class="btn btn-primary" href="{LINKS["paypal_mapa"]}" rel="noopener">{E(t["buy"])} →</a></p>
    <p class="mp-have"><a href="{acc}">{E(t["have"])}</a></p>
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

def build_access(lang, B):
    t = T[lang]
    cfg = {k: v for k, v in t.items() if k.startswith("a_")}
    cfg["quiz"] = url(lang, "map_quiz"); cfg["buy_url"] = url(lang, "map")
    return _noindex(B.head(lang, "map_access", t["a_title"], t["desc"])) + f'''
{B.header(lang, "map_access")}
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
  <p><a class="btn btn-terra" id="acceso-go" href="{url(lang,"map_quiz")}" hidden>{E(t["a_enter"])} →</a></p>
  <p class="mp-alt">{E(t["a_none"])} <a href="{url(lang,"map")}">{E(t["a_buy"])}</a></p>
</div></section>
</main>
{B.footer(lang)}
<script type="application/json" id="mapa-cfg">{json.dumps(cfg, ensure_ascii=False)}</script>
<script src="/assets/js/site.js" defer></script>
<script src="/assets/js/mapa-acceso.js" defer></script>
</body></html>'''

def build_quiz(lang, B):
    t = T[lang]
    cfg = {k: v for k, v in t.items() if k.startswith("q_")}
    cfg["lang"] = lang; cfg["access"] = url(lang, "map_access")
    return _noindex(B.head(lang, "map_quiz", t["q_title"], t["desc"])) + f'''
{B.header(lang, "map_quiz")}
<main id="main">
<section class="section"><div class="container mp-narrow">
  <div id="mapa-app" aria-live="polite"><p>{E(t["q_loading"])}</p></div>
</div></section>
</main>
{B.footer(lang)}
<script type="application/json" id="mapa-cfg">{json.dumps(cfg, ensure_ascii=False)}</script>
<script src="/assets/js/site.js" defer></script>
<script src="/assets/js/mapa-cuestionario.js" defer></script>
</body></html>'''

BUILDERS = {"map": build_map, "map_access": build_access, "map_quiz": build_quiz}
