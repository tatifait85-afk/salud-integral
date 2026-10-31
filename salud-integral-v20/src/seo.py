# -*- coding: utf-8 -*-
"""SEO de Salud Integral: títulos y descripciones únicos por página e idioma, imágenes sociales y datos estructurados (schema.org).

Reglas de este módulo:
- Solo se declaran datos que ya están publicados en el sitio (nombres, precios, enlaces). Sin reseñas, valoraciones ni precios inventados.
- Los textos en español van en registro formal (sin «tú»), salvo los nombres propios de productos tal como se publican.
- Título: ideal ≤ 65 caracteres. Descripción: ideal entre 70 y 160 caracteres. Lo comprueba tests/audit_static.py.
"""
import json, re
from config import SITE_URL, LINKS, CONTACT, BLOG_BASE, url as page_url, PAGES

ORG_ID = SITE_URL + "/#organization"
SITE_ID = SITE_URL + "/#website"
PERSON_ID = SITE_URL + "/#tatiana-fait-shaw"
LOGO = SITE_URL + "/assets/img/logo-600.webp"
AUTHOR = "Tatiana Fait Shaw"

# ---------------------------------------------------------------- título y descripción por (página, idioma)
META = {
 ("home", "es"): ("Salud Integral | Bienestar, hábitos y alimentación consciente",
                  "Recursos prácticos en línea para su bienestar: hábitos saludables, alimentación consciente, salud digestiva y una mente más tranquila. Desde Costa Rica."),
 ("home", "en"): ("Salud Integral | Wellbeing, habits and mindful eating",
                  "Practical online tools for your wellbeing: healthy habits, mindful eating, digestive health and a calmer mind. Based in Costa Rica, in English and Spanish."),
 ("food", "es"): ("Alimentación consciente y salud digestiva | Salud Integral",
                  "Herramientas para observar sus hábitos de alimentación: Mi Jardín Digestivo (guía con kéfir y chucrut), programa gratuito por correo y sesión en línea."),
 ("food", "en"): ("Mindful eating and digestive health | Salud Integral",
                  "Tools to observe your eating habits: My Digestive Garden, an interactive guide with milk kefir and homemade sauerkraut, and a one-on-one online session."),
 ("habits", "es"): ("Hábitos saludables y bienestar | Salud Integral",
                    "Observe sus hábitos y haga cambios sostenibles: Tu mapa de hábitos, un cuestionario breve con PDF personalizado, y una sesión individual en línea."),
 ("habits", "en"): ("Healthy habits and wellbeing | Salud Integral",
                    "Observe your habits and make sustainable changes: Your Habit Map, a short questionnaire with a personalized PDF, and a one-on-one online session."),
 ("mind", "es"): ("Mente tranquila y rumiación mental | Salud Integral",
                  "Herramientas para observar el pensamiento repetitivo y recuperar espacio mental: el curso «Cuando tu cabeza no para» y una sesión individual en línea."),
 ("mind", "en"): ("Calm mind: when your mind won't stop | Salud Integral",
                  "Tools to observe repetitive thinking and recover mental space: the book Overcome Depression: Your Practical Guide to Regaining Joy, and a one-on-one session."),
 ("weight", "es"): ("Bajar de peso sin restricciones extremas | Salud Integral",
                    "Programa para trabajar sus hábitos de alimentación y su relación con el peso, a su ritmo: Mi mapa de equilibrio con cuaderno en PDF o una sesión individual."),
 ("weight", "en"): ("Weight management without extreme restrictions | Salud Integral",
                    "A program to work on your eating habits and your relationship with weight at your own pace: My Balance Map with a PDF workbook, or a one-on-one session."),
 ("spiritual", "es"): ("Transpersonal y espiritual: Cábala y meditación | Salud Integral",
                       "Meditación, Cábala práctica, Ho'oponopono y psicología transpersonal: lecturas, libros y un curso para explorar la dimensión espiritual del bienestar."),
 ("spiritual", "en"): ("Transpersonal and spiritual wellbeing | Salud Integral",
                       "Meditation, practical Kabbalah, Ho'oponopono and transpersonal psychology: readings, books and the Magickal Kabbalah for Self Transformation bundle."),
 ("resources", "es"): ("Recursos de bienestar y productos digitales | Salud Integral",
                       "Productos digitales, cursos, libros y acompañamiento individual: Tu mapa de hábitos, Mi Jardín Digestivo, Mi mapa de equilibrio y artículos del blog."),
 ("resources", "en"): ("Wellbeing resources and digital products | Salud Integral",
                       "Digital products, books and one-on-one support from Salud Integral: Your Habit Map, My Digestive Garden, My Balance Map and blog articles."),
 ("session", "es"): ("Acompañamiento individual en línea (45 min) | Salud Integral",
                     "Un espacio individual de acompañamiento en línea para cuidarse, fortalecer sus hábitos y cultivar su bienestar. Sesión de 45 minutos, US$50."),
 ("session", "en"): ("One-on-one online support (45 min) | Salud Integral",
                     "A one-on-one online space to care for yourself, strengthen your habits and cultivate your wellbeing. 45-minute session, US$50."),
 ("about", "es"): ("Tatiana Fait Shaw, creadora de Salud Integral | Sobre mí",
                   "Tatiana Fait Shaw, creadora de Salud Integral: bienestar que integra pensamientos, emociones, hábitos, cuerpo y manera de vivir. Conozca mi formación."),
 ("about", "en"): ("About Tatiana Fait Shaw | Salud Integral",
                   "Tatiana Fait Shaw, creator of Salud Integral: wellbeing that brings together thoughts, emotions, habits, body and way of living. Learn about my training."),
 ("contact", "es"): ("Contacto por WhatsApp, correo o formulario | Salud Integral",
                     "Escriba a Tatiana Fait Shaw con sus preguntas: formulario en línea, WhatsApp o redes sociales. Las respuestas se envían por escrito."),
 ("contact", "en"): ("Contact Tatiana Fait Shaw | Salud Integral",
                     "Write to Tatiana Fait Shaw with your questions: online form, WhatsApp or social media. Replies are sent in writing."),
 ("privacy", "es"): ("Política de privacidad | Salud Integral",
                     "Cómo Salud Integral trata sus datos personales: formulario de contacto, correo, pagos y herramientas interactivas."),
 ("privacy", "en"): ("Privacy Policy | Salud Integral",
                     "How Salud Integral handles your personal data: contact form, email, payments and interactive tools."),
 ("terms", "es"): ("Términos de uso | Salud Integral",
                   "Condiciones para usar el sitio, reservar sesiones en línea y comprar productos digitales: pagos, acceso, cancelaciones, reembolsos y propiedad intelectual."),
 ("terms", "en"): ("Terms of Use | Salud Integral",
                   "Conditions for using the site, booking online sessions and buying digital products: payments, access, cancellations, refunds and intellectual property."),
 ("map", "es"): ("Tu mapa de hábitos: guía personalizada en PDF | Salud Integral",
                 "Responda un cuestionario breve y reciba al instante un PDF personalizado: perfil de hábitos, obstáculos, tres recomendaciones y plan de 7 días. US$9.99."),
 ("map", "en"): ("Your Habit Map: a personalized PDF guide | Salud Integral",
                 "Answer a short questionnaire and instantly get a personalized PDF: habit profile, obstacles, three recommendations and a 7-day plan. US$9.99."),
 ("garden", "es"): ("Mi Jardín Digestivo: guía interactiva con PDF | Salud Integral",
                    "Recorra un jardín ilustrado con cinco estaciones sobre hábitos, alimentación, fermentos y microbiota, y reciba al final un PDF personalizado."),
 ("garden", "en"): ("My Digestive Garden: interactive guide with PDF | Salud Integral",
                    "Walk through an illustrated garden with five stations about habits, food, ferments and the microbiome, and get a personalized PDF at the end."),
 ("eq", "es"): ("Mi mapa de equilibrio: cuaderno interactivo | Salud Integral",
                "Cuaderno interactivo para explorar seis áreas de su bienestar, identificar sus prioridades y crear su plan de acción, con cuaderno en PDF. USD 12.99."),
 ("eq", "en"): ("My Balance Map: interactive wellbeing notebook | Salud Integral",
                "An interactive notebook to explore six areas of your wellbeing, identify your priorities and create your action plan, with a PDF notebook. USD 12.99."),
 ("free", "es"): ("Hábitos saludables: programa gratuito por correo | Salud Integral",
                  "Cuatro semanas, cuatro consejos prácticos y pequeños pasos para construir hábitos más saludables, directamente en su correo electrónico. Gratis."),
 ("mind_p", "es"): ("Cuando tu cabeza no para: curso de rumiación | Salud Integral",
                    "Curso práctico para comprender y manejar la rumiación mental: cuando la mente repite las mismas preocupaciones, dudas o escenarios. USD 9.99."),
 ("mind_p", "en"): ("Overcome Depression by Tatiana Fait Shaw | Salud Integral",
                    "Overcome Depression: Your Practical Guide to Regaining Joy, a book by Tatiana Fait Shaw, available on Amazon in Kindle and paperback."),
 ("kab", "es"): ("Cábala Hermética Práctica: curso de abundancia | Salud Integral",
                 "Curso en línea que aplica la Cábala a la prosperidad: meditación, visualización, oración con nombres divinos y trabajo con creencias limitantes sobre el dinero."),
 ("kab", "en"): ("Magickal Kabbalah Self-Transformation Bundle | Salud Integral",
                 "A bundle for self-transformation through Magickal Kabbalah: a main book, a full-color workbook and two HD videos for a daily 21-minute practice. USD 33.77."),
}

# ---------------------------------------------------------------- imágenes sociales (1200×630 JPG derivadas de las imágenes del sitio)
# tools/make_og_images.py genera static/img/og/<nombre>.jpg a partir de cada static/img/<nombre>.webp de esta lista.
OG_SOURCES = [
 "acompanamiento-45", "bajar-peso", "contacto", "curso-kabbalah-en", "curso-kabbalah-es", "espiritual", "habitos-hero",
 "hero-alimentacion", "hero-home", "libro-en-overcome-depression", "lose-weight", "mente-tranquila", "producto-cabeza",
 "producto-correo", "producto-equilibrio", "producto-equilibrio-en", "producto-jardin", "producto-jardin-en",
 "producto-mapa-es", "producto-mapa-en", "recursos", "session-45", "yo-blusa-blanca",
]

# ---------------------------------------------------------------- estructura del sitio para migas de pan y listados
PARENT = {"map": "habits", "garden": "food", "eq": "weight", "free": "food", "mind_p": "mind", "kab": "spiritual"}
CHILDREN = {  # páginas temáticas → productos que realmente presentan (el orden es el de la página)
    "food": ["garden", "free", "session"], "habits": ["map", "session"], "mind": ["mind_p", "session"],
    "weight": ["eq", "session"], "spiritual": ["kab", "session"],
    "resources": ["map", "garden", "eq", "mind_p", "kab", "free", "session"],
}
PAGE_TYPE = {"about": "AboutPage", "contact": "ContactPage", "food": "CollectionPage", "habits": "CollectionPage",
             "mind": "CollectionPage", "weight": "CollectionPage", "spiritual": "CollectionPage", "resources": "CollectionPage"}

def has(lang, k): return PAGES[k][lang] is not None
def abs_url(lang, k): return SITE_URL + page_url(lang, k)

def parse_price(s):
    """'USD 12.99' / 'US$9.99' / 'USD 50 · ₡25.000' → '12.99' / '9.99' / '50'.
    None si el texto no es un único precio en dólares (p. ej. «Kindle … · Paperback …» o «₡0 · Gratis»): en ese caso no se declara oferta."""
    if not s or "Kindle" in s or "₡0" in s: return None
    m = re.findall(r"(?:USD|US\$)\s*([0-9]+(?:\.[0-9]+)?)", s)
    return m[0] if len(m) == 1 else None

PROV = {"@type": "Organization", "@id": ORG_ID, "name": "Salud Integral", "url": SITE_URL + "/"}   # referencia mínima (el nodo completo va en el mismo grafo)

def _org(full=False):
    o = {"@type": "Organization", "@id": ORG_ID, "name": "Salud Integral", "url": SITE_URL + "/",
         "logo": {"@type": "ImageObject", "url": LOGO, "width": 600, "height": 600}}
    if full:
        o["founder"] = {"@type": "Person", "@id": PERSON_ID, "name": AUTHOR}
        o["email"] = CONTACT["email"]
        o["sameAs"] = [CONTACT["facebook"], CONTACT["linkedin"], LINKS["amazon_author"], BLOG_BASE + "/"]
        o["contactPoint"] = {"@type": "ContactPoint", "contactType": "customer support", "availableLanguage": ["es", "en"],
                             "url": abs_url("es", "contact")}
    return o

def graph(lang, key, title, desc, image, label, item=None):
    """Grafo JSON-LD de una página indexable.
    label(k) → nombre visible de la página k (migas de pan). item → producto/servicio de la página (dict con name, price_text, buy, kind) o None."""
    url = abs_url(lang, key)
    g = [_org(full=(key in ("home", "about"))),
         {"@type": "WebSite", "@id": SITE_ID, "url": SITE_URL + "/", "name": "Salud Integral", "inLanguage": ["es", "en"],
          "publisher": {"@id": ORG_ID}}]
    page = {"@type": PAGE_TYPE.get(key, "WebPage"), "@id": url + "#webpage", "url": url, "name": title, "description": desc,
            "inLanguage": lang, "isPartOf": {"@id": SITE_ID}, "publisher": {"@id": ORG_ID},
            "primaryImageOfPage": {"@type": "ImageObject", "url": image, "width": 1200, "height": 630}}
    if key == "home": page["about"] = {"@id": ORG_ID}
    if key != "home": page["breadcrumb"] = {"@id": url + "#breadcrumb"}
    # --- entidad principal
    if key == "about":
        g.append({"@type": "Person", "@id": PERSON_ID, "name": AUTHOR, "url": url,
                  "image": SITE_URL + "/assets/img/yo-blusa-blanca.webp", "worksFor": {"@id": ORG_ID},
                  "sameAs": [CONTACT["linkedin"], CONTACT["facebook"], LINKS["amazon_author"]]})
        page["mainEntity"] = {"@id": PERSON_ID}
    elif key in CHILDREN:
        lst = [k for k in CHILDREN[key] if has(lang, k)]
        page["mainEntity"] = {"@type": "ItemList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": label(k), "url": abs_url(lang, k)} for i, k in enumerate(lst)]}
    elif item and item.get("kind"):
        t = item["kind"]   # Product | Course | Service | Book
        ent = {"@type": t, "@id": url + "#item", "name": item["name"], "description": desc, "url": url, "image": image}
        if t == "Book":
            ent["inLanguage"] = lang
            ent["author"] = {"@type": "Person", "@id": PERSON_ID, "name": AUTHOR}
            if item.get("buy"): ent["sameAs"] = item["buy"]   # ficha del libro en Amazon (dos formatos y precios: no se declara oferta única)
        else:
            if t == "Product": ent["brand"] = {"@type": "Brand", "name": "Salud Integral"}
            if t in ("Course", "Service"): ent["provider"] = PROV
            if t == "Course": ent["inLanguage"] = lang
            price = parse_price(item.get("price_text"))
            if price:
                ent["offers"] = {"@type": "Offer", "price": price, "priceCurrency": "USD", "availability": "https://schema.org/InStock",
                                 "url": item.get("buy") or url, "seller": PROV}
        page["mainEntity"] = {"@id": url + "#item"}
        g.append(ent)
    g.append(page)
    # --- migas de pan: Inicio › (tema) › página
    if key != "home":
        crumbs = [("home", None)]
        if key in PARENT and has(lang, PARENT[key]): crumbs.append((PARENT[key], None))
        crumbs.append((key, None))
        g.append({"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": label(k), "item": abs_url(lang, k)} for i, (k, _) in enumerate(crumbs)]})
    return {"@context": "https://schema.org", "@graph": g}

def script(obj):
    s = json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return f'<script type="application/ld+json">{s}</script>'
