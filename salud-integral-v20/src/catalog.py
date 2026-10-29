# -*- coding: utf-8 -*-
"""CATÁLOGO ÚNICO de recursos. Lo usan: páginas, Romero y el Orientador.
Para agregar/cambiar un recurso se edita SOLO este archivo. Cada URL es real."""
from config import LINKS, BLOG_BASE, url

def build(lang):
    L = lambda es, en: es if lang == "es" else en
    art = lambda path: BLOG_BASE + path
    R = []
    # ---- Libros (títulos leídos de las portadas de Amazon; enlaces amzn.to de Tatiana) ----
    books = [
        ("1", "https://amzn.to/4rDL6RH", "Reconfigura tu mente", "Tu guía práctica para detener los pensamientos negativos",
              "Reconfigure Your Mind", "Your practical guide to stopping negative thoughts",
              {"mente": 3, "estres": 1}),
        ("2", "https://amzn.to/4xt3oGl", "Florecer en el Trabajo", "Guía de Psicología Positiva para el Bienestar y el Rendimiento Laboral",
              "Florecer en el Trabajo", "Positive Psychology guide to wellbeing and performance at work",
              {"estres": 2, "habitos": 2}),
        ("3", "https://amzn.to/4yLNNmo", "Ho'oponopono", "Sanación Consciente para la Mente, el Cuerpo y el Espíritu",
              "Ho'oponopono", "Conscious healing for mind, body and spirit",
              {"mente": 1, "personal": 2, "estres": 1}),
        ("4", "https://amzn.to/4dJPl8a", "Neurociencia y Ho'oponopono", "Sanando Mente y Alma",
              "Neuroscience and Ho'oponopono", "Healing mind and soul",
              {"mente": 2, "personal": 1}),
        ("5", "https://amzn.to/4iCjhXg", "Psicología Transpersonal y la Espiritualidad", "",
              "Transpersonal Psychology and Spirituality", "",
              {"personal": 3, "explorar": 1}),
    ]
    if lang == "en":
        # Libros en inglés (BOOKS_EN, mismo orden que dio Tatiana). 'topics' sale de cada título, igual que en la matriz en español.
        from books_en import BOOKS_EN
        topics_en = [{"mente": 2, "personal": 1}, {"mente": 3, "estres": 1}, {"estres": 2, "habitos": 2},
                     {"personal": 3, "explorar": 1}, {"mente": 1, "personal": 2, "estres": 1}]
        for n, (b, tp) in enumerate(zip(BOOKS_EN, topics_en), start=1):
            R.append(dict(
                id=f"libro-{n}", type="libro", title=b["title"], subtitle="", gloss="",
                url=b["url"], external=True, img=b["img"], topics=tp, priority=1, lang_note="",
                why="It is a book you can read at your own pace, with no need for a prior conversation.",
                cta="View book →", keywords=["book", "read", "libro", "leer"] + b["title"].lower().replace(":", " ").split()))
    else:
      for n, link, t_es, s_es, t_en, s_en, topics in books:
        R.append(dict(
            id=f"libro-{n}", type="libro", title=t_es, subtitle=s_es, gloss="",
            url=link, external=True, img=f"/assets/img/libro-{n}.webp", topics=topics, priority=1,
            lang_note="",
            why="Es un libro para leer a su propio ritmo, sin depender de una conversación previa.",
            cta="Ver libro →",
            keywords=["libro", "leer", "book", "read"] + t_es.lower().split()))
    # ---- Curso ----  (ES: «Cuando tu cabeza no para» en Payhip · EN: bundle Magickal Kabbalah for Self Transformation)
    if lang == "es":
        R.append(dict(
            id="curso", type="curso", title="Cuando tu cabeza no para",
            subtitle="Curso online sobre rumiación y pensamiento repetitivo", gloss="",
            url=LINKS["payhip_course"], external=True, img=None,
            topics={"mente": 3, "estres": 1, "personal": 1}, priority=3,
            why="Es un curso práctico pensado justamente para observar el pensamiento repetitivo y recuperar espacio mental.",
            cta="Ver el curso →",
            keywords=["curso", "rumiacion", "rumiación", "pensamiento", "vueltas"]))
    else:
        R.append(dict(
            id="curso", type="curso", title="Magickal Kabbalah for Self Transformation Bundle",
            subtitle="Digital bundle: book, workbook and two HD videos · USD 33.77", gloss="",
            url=LINKS["kabbalah_bundle_en"], external=True, img="/assets/img/curso-kabbalah-en.webp", price="USD 33.77",
            topics={"personal": 3, "explorar": 1}, priority=3,
            why="It is a self-transformation bundle: a book on the theory and Kabbalah behind the practice, a full-color workbook, and two videos that guide a daily 21-minute practice and ritual technique.",
            cta="View the bundle →",
            keywords=["course", "bundle", "kabbalah", "magickal", "ritual", "sigil", "practice", "workbook"]))
    # ---- Informe ----
    R.append(dict(
        id="informe", type="informe", title=L("Informe personalizado de alimentación", "Personalized eating report"),
        subtitle=L("Cuestionario previo + análisis personalizado · USD 25", "Prior questionnaire + personalized analysis · USD 25"),
        url=url(lang, "report"), external=False, img=None, price="USD 25",
        topics={"alimentacion": 3, "habitos": 1, "personal": 2}, priority=3,
        why=L("Le da una mirada personalizada sobre sus hábitos de alimentación a partir de un cuestionario, sin tener que agendar una sesión.",
              "It gives you a personalized look at your eating habits based on a questionnaire, without booking a session."),
        cta=L("Quiero mi informe →", "I want my report →"),
        keywords=["informe", "reporte", "cuestionario", "report", "questionnaire", "peso", "weight", "alimentacion", "alimentación", "comer", "eating"]))
    # ---- Tu mapa de hábitos (USD 9.99, cuestionario + PDF) ----
    R.append(dict(
        id="mapa-habitos", type="mapa", title=L("Tu mapa de hábitos", "Your Habit Map"),
        subtitle=L("Cuestionario breve + PDF personalizado · USD 9.99", "Short questionnaire + personalized PDF · USD 9.99"),
        url=url(lang, "map"), external=False, img=None, price="USD 9.99",
        topics={"habitos": 3, "personal": 2, "explorar": 1}, priority=3,
        why=L("Es un cuestionario breve del que sale un PDF personalizado para entender qué le ayuda y qué le frena en sus hábitos, con tres recomendaciones prácticas.",
              "It is a short questionnaire that produces a personalized PDF to understand what helps and what holds back your habits, with three practical recommendations."),
        cta=L("Conocer Tu mapa de hábitos →", "See Your Habit Map →"),
        keywords=["mapa", "habitos", "hábitos", "cuestionario", "pdf", "map", "habit", "questionnaire"]))
    # ---- Mi mapa de equilibrio (antes «bajar de peso»; USD 12.99, botón PayPal VA4SE3UYS3BBS) ----
    R.append(dict(
        id="equilibrio", type="equilibrio", title=L("Mi mapa de equilibrio", "My Balance Map"),
        subtitle=L("Mapa interactivo de 6 áreas + cuaderno en PDF · USD 12.99", "Interactive 6-area map + PDF workbook · USD 12.99"),
        url=url(lang, "weight"), external=False, img=None, price="USD 12.99",
        topics={"personal": 3, "habitos": 2, "estres": 2, "mente": 1}, priority=3,
        why=L("Es una experiencia interactiva para mirar su bienestar en seis áreas (calma, descanso, cuerpo, límites, naturaleza y disfrute): elige las tarjetas que le hablan, arma su mapa y lo lleva a un cuaderno en PDF para escribir a mano.",
              "It is an interactive experience to look at your wellbeing in six areas (calm, rest, body, boundaries, nature and enjoyment): you choose the cards that speak to you, build your map and turn it into a PDF workbook to write in by hand."),
        cta=L("Conocer Mi mapa de equilibrio →", "See My Balance Map →"),
        keywords=["equilibrio", "mapa", "balance", "bienestar", "peso", "bajar de peso", "cuaderno", "calma", "descanso", "limites", "límites", "tarjetas", "balance map", "workbook", "weight", "lose weight"]))
    # ---- Mi Jardín Digestivo (producto interactivo + PDF; reemplaza a Salud digestiva) ----
    R.append(dict(
        id="jardin", type="jardin", title=L("Mi Jardín Digestivo", "My Digestive Garden"),
        subtitle=L("Juego interactivo de 5 estaciones + PDF personalizado · USD 25", "Interactive 5-station game + personalized PDF · USD 25"),
        url=url(lang, "garden"), external=False, img=None, price="USD 25",
        topics={"alimentacion": 3, "habitos": 2, "personal": 1}, priority=3,
        why=L("Es una experiencia interactiva para entender mejor su digestión: recorre un jardín ilustrado con cinco estaciones (hábitos, cocina, fermentos, microbiota y plan) y al final descarga un PDF con lo que eligió.",
              "It is an interactive experience to better understand your digestion: you walk through an illustrated garden with five stations (habits, kitchen, ferments, microbiome and plan) and download a PDF of what you chose at the end."),
        cta=L("Conocer Mi Jardín Digestivo →", "See My Digestive Garden →"),
        keywords=["jardin", "jardín", "juego", "digestivo", "digestion", "digestión", "fermentos", "kefir", "kéfir", "chucrut", "microbiota",
                  "garden", "game", "digestive", "ferments", "sauerkraut", "microbiome", "station"]))
    # ---- Sesión ----
    R.append(dict(
        id="sesion", type="sesion", title=L("Acompañamiento individual", "One-on-one session"),
        subtitle=L("Sesión online · 45 minutos · USD 50", "Online session · 45 minutes · USD 50"),
        url=url(lang, "session"), external=False, img=None, price="USD 50",
        topics={"personal": 2, "explorar": 1, "mente": 1, "alimentacion": 1, "habitos": 1}, priority=0,
        why=L("Es una opción para quien prefiere conversar de forma individual y ordenar lo que está buscando.",
              "It is an option for those who prefer a one-on-one conversation to sort out what they are looking for."),
        cta=L("Conocer el acompañamiento →", "Learn about the session →"),
        keywords=["sesion", "sesión", "cita", "consulta", "acompanamiento", "acompañamiento", "session", "appointment", "one-on-one"]))
    # ---- Áreas (páginas) ----
    R.append(dict(
        id="area-alimentacion", type="area", title=L("Alimentación consciente", "Mindful eating"),
        subtitle=L("Recursos y herramientas para observar sus hábitos de alimentación", "Resources and tools to observe your eating habits"),
        url=url(lang, "food"), external=False, img=None,
        topics={"alimentacion": 3, "habitos": 1, "explorar": 1}, priority=2,
        why=L("Reúne artículos, recursos y opciones sobre alimentación y bienestar digestivo en un solo lugar.",
              "It brings together articles, resources and options about eating and digestive wellbeing in one place."),
        cta=L("Explorar alimentación →", "Explore food →"), keywords=["alimentacion", "alimentación", "comida", "comer", "food", "eating"]))
    R.append(dict(
        id="area-habitos", type="area", title=L("Hábitos y bienestar", "Habits & wellbeing"),
        subtitle=L("Rutinas y cambios sostenibles para la vida cotidiana", "Routines and sustainable changes for everyday life"),
        url=url(lang, "habits"), external=False, img=None,
        topics={"habitos": 3, "estres": 1, "explorar": 1}, priority=2,
        why=L("Es una puerta de entrada para observar sus rutinas y encontrar cambios que puedan sostenerse.",
              "It is a starting point to observe your routines and find changes you can sustain."),
        cta=L("Explorar hábitos →", "Explore habits →"), keywords=["habito", "hábito", "rutina", "constancia", "habit", "routine"]))
    R.append(dict(
        id="area-mente", type="area", title=L("Mente tranquila", "Calm mind"),
        subtitle=L("Herramientas para el pensamiento repetitivo", "Tools for repetitive thinking"),
        url=url(lang, "mind"), external=False, img=None,
        topics={"mente": 2, "estres": 2, "explorar": 1}, priority=2,
        why=L("Reúne herramientas de respiración, movimiento y observación para hacer pausas y recuperar espacio mental.",
              "It gathers breathing, movement and observation tools to pause and regain mental space."),
        cta=L("Explorar mente tranquila →", "Explore calm mind →"), keywords=["mente", "calma", "estres", "estrés", "mind", "calm", "stress"]))
    # ---- Artículo destacado de Romero ----
    # ES: artículo de la mente activa por la noche (documento Mente tranquila). EN: ese artículo no existe en inglés; Tatiana indicó usar
    # "Understanding the Enteric Nervous System" (flowsomatic.blogspot.com).
    if lang == "es":
        R.append(dict(
            id="art-2am", type="articulo",
            title="Tu cuerpo está cansado, pero tu cabeza decide hacer una reunión a las 2 de la mañana",
            gloss="", subtitle="Artículo del blog",
            url=art("/2026/09/tu-cuerpo-esta-cansado-pero-tu-cabeza.html"), external=True, img="/assets/img/articulo-1.webp",
            topics={"mente": 2, "estres": 1}, priority=1,
            why="Es un artículo sobre la mente activa por la noche, con ideas de descarga mental y anclaje corporal.",
            cta="Leer artículo →",
            keywords=["dormir", "noche", "insomnio", "madrugada", "sleep", "night", "awake"]))
    else:
        from articles import EN_BLOG
        R.append(dict(
            id="art-2am", type="articulo",
            title="Understanding the Enteric Nervous System: The Science of the Brain-Gut Axis",
            gloss="", subtitle="Blog article",
            url=EN_BLOG + "/2026/05/understanding-enteric-nervous-system.html", external=True, img=None,
            topics={"alimentacion": 2, "mente": 1}, priority=1,
            why="It is an article about the brain-gut axis: how the nervous system of the gut and the brain communicate, with ideas on nutrition, breathing and regular meals.",
            cta="Read article →",
            keywords=["gut", "brain", "digestion", "digestive", "enteric", "microbiome", "mood", "vagus"]))
    return R

def public(lang):
    return build(lang)
