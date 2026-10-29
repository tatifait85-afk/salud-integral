# -*- coding: utf-8 -*-
"""Configuración única del sitio Salud Integral. Todo dato de contacto/enlace vive AQUÍ."""

SITE_URL  = "https://www.saludintegral.site"
# El blog (Blogger) ya vive en el subdominio blog.saludintegral.site. Los artículos se abren aquí.
BLOG_BASE = "https://blog.saludintegral.site"

CONTACT = dict(
    wa="50672212372", wa_display="+506 7221 2372",
    email="terapiaholisticacr@gmail.com",
    facebook="https://www.facebook.com/holisticaterapiacr",
    linkedin="https://www.linkedin.com/in/tatianafait/",
)

# Punto de integración del formulario de contacto (envío de correo desde el servidor).
# Vacío = el formulario usa el respaldo mailto: (abre el programa de correo; no confirma el envío).
# Para activarlo: CONTACT_ENDPOINT=/api/contacto python3 src/build.py   (contrato en DEPLOY.md)
import os
CONTACT_ENDPOINT = os.environ.get("CONTACT_ENDPOINT", "").strip()

LINKS = dict(
    amazon_author="https://www.amazon.com/stores/Tatiana-Fait-Shaw/author/B0H18V8TXG",
    payhip_course="https://payhip.com/b/KpXIH",   # curso «Cuando tu cabeza no para» (solo versión en español)
    kabbalah_bundle_en="https://magickal-kabbalah-shop.fourthwall.com/products/magickal-kabbalah-for-self-transformation-bundle",
    mailerlite_programa="https://assets.mailerlite.com/jsonp/2483050/forms/191795565514720934/subscribe",   # programa gratuito por correo: SOLO español
    paypal_informe="https://www.paypal.com/ncp/payment/CJMKXJ3MD2RWJ",
    paypal_jardin="https://www.paypal.com/ncp/payment/CJMKXJ3MD2RWJ",   # «Mi Jardín Digestivo» (USD 25): se mantiene el enlace y el precio del producto anterior de Salud digestiva
    paypal_mapa="https://www.paypal.com/ncp/payment/QR4TYYLX4AYHC",   # «Tu mapa de hábitos», US$9.99 (enlace ya creado; no se cambia)
)

# Slugs por idioma. '' = inicio.
PAGES = {
    "home":       {"es": "",                      "en": ""},
    "food":       {"es": "alimentacion",          "en": "mindful-eating"},
    "habits":     {"es": "habitos-y-bienestar",   "en": "habits-and-wellbeing"},
    "mind":       {"es": "mente-tranquila",       "en": "calm-mind"},
    "resources":  {"es": "recursos",              "en": "resources"},
    "about":      {"es": "sobre-mi",              "en": "about"},
    "contact":    {"es": "contacto",              "en": "contact"},
    "weight":     {"es": "bajar-de-peso",         "en": "weight-management"},
    "digestive":  {"es": "salud-digestiva",       "en": "digestive-health"},
    "report":     {"es": "informe-personalizado", "en": "personalized-report"},
    "session":    {"es": "acompanamiento",        "en": "one-on-one-session"},
    "spiritual":  {"es": "transpersonal-espiritual", "en": "transpersonal-spiritual"},
    "privacy":    {"es": "privacidad",            "en": "privacy"},
    "terms":      {"es": "terminos-de-uso",       "en": "terms-of-use"},
    "map":        {"es": "tu-mapa-de-habitos",    "en": "your-habit-map"},
    "map_access": {"es": "tu-mapa-de-habitos/acceso",        "en": "your-habit-map/access"},
    "map_quiz":   {"es": "tu-mapa-de-habitos/cuestionario",  "en": "your-habit-map/questionnaire"},
    "garden":     {"es": "mi-jardin-digestivo",              "en": "my-digestive-garden"},
    "garden_access": {"es": "mi-jardin-digestivo/jardin",     "en": "my-digestive-garden/garden"},
}

def url(lang, key):
    slug = PAGES[key][lang]
    if lang == "es":
        return "/" if not slug else f"/{slug}/"
    return "/en/" if not slug else f"/en/{slug}/"

def wa_link(lang, msg_es, msg_en):
    from urllib.parse import quote
    m = msg_es if lang == "es" else msg_en
    return f"https://wa.me/{CONTACT['wa']}?text={quote(m)}"
