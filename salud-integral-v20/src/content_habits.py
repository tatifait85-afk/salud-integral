# -*- coding: utf-8 -*-
"""Página Hábitos y bienestar. Hero tomado del Documento de producción (registro «usted» del sitio; EN = traducción).
Productos: «Tu mapa de hábitos / Your Habit Map» (datos de mapa.py y del enlace de PayPal ya creado) + la sesión en línea de 45 min
(idéntica a la de Alimentación y Espiritual)."""
from content_spiritual import _SES_ES, _SES_EN

HABITS = {
"es": dict(
  title="Hábitos y bienestar | Salud Integral",
  desc="Herramientas y recursos para observar sus hábitos, hacer cambios sostenibles y construir una forma de bienestar que tenga sentido en su vida cotidiana.",
  eyebrow="HÁBITOS Y BIENESTAR", h1="Hábitos que puedan caber en su vida",
  lead="Explore herramientas y recursos para observar sus hábitos, hacer cambios sostenibles y construir una forma de bienestar que tenga sentido para su vida cotidiana.",
  cta="Explorar recursos", hero_alt="Mujer atándose los cordones de las zapatillas en un sendero al aire libre",
  supports=[("leaf","Hábitos reales"),("repeat","Cambios sostenibles"),("compass","Herramientas prácticas"),("sprout","A su propio ritmo")],
),
"en": dict(
  title="Habits & wellbeing | Salud Integral",
  desc="Tools and resources to observe your habits, make sustainable changes and build a form of wellbeing that makes sense for your everyday life.",
  eyebrow="HABITS & WELLBEING", h1="Habits that can fit into your life",
  lead="Explore tools and resources to observe your habits, make sustainable changes and build a form of wellbeing that makes sense for your everyday life.",
  cta="Explore resources", hero_alt="Woman tying her sneakers on an outdoor trail",
  supports=[("leaf","Real habits"),("repeat","Sustainable changes"),("compass","Practical tools"),("sprout","At your own pace")],
),
}

PRODUCTS_HABITS = {
"es": dict(
  h2="Encuentre el apoyo que mejor se adapta a usted",
  p="Cada persona tiene necesidades diferentes. Descubra recursos y opciones de acompañamiento para cuidar su bienestar, comprender mejor sus hábitos y avanzar a su propio ritmo.",
  incl="Qué incluye", deliv="Plazo",
  note="Herramienta educativa y orientativa. No es un test psicológico, no hace diagnósticos y no sustituye la atención médica ni psicológica profesional. Sus respuestas al cuestionario se procesan únicamente en su dispositivo: no se envían ni se guardan en ningún servidor.",
  items=[
    dict(img="producto-mapa-es", contain="tall", alt="Portada de Tu mapa de hábitos, de Salud Integral",
         name="Tu mapa de hábitos",
         desc="Responda un cuestionario breve y reciba, en el momento, un documento en PDF hecho a partir de sus respuestas: para entender qué le ayuda, qué le frena y por dónde empezar.",
         inc=["Su perfil orientativo de hábitos","Sus principales obstáculos, explicados con claridad","Tres recomendaciones prácticas y personalizadas","Un plan de acción de 7 días","Una hoja de seguimiento para imprimir","Un compromiso personal con su nombre"],
         price="USD 9.99 · pago único, sin suscripción",
         delivery="Inmediato: unas 13 preguntas breves (unos 4 minutos) y su PDF se crea y se descarga al instante en su dispositivo",
         kind="link", href="PAYPAL_MAPA", cta="Comprar con PayPal",
         extra_key="map_access", extra_text="¿Ya pagó? Continúe con su cuestionario"),
    _SES_ES],
  pay_h2="Cómo pagar", pay_p="Elija la opción según su ubicación. El proceso es directo y seguro.",
  pay_cr="Pagos de la sesión en Costa Rica", pay_cr_l=["SINPE Móvil: +506 7221-2372","Tarjeta de débito o crédito","PayPal"],
  pay_int="Pagos internacionales de la sesión", pay_int_l=["Tarjeta de débito o crédito","PayPal"],
  pay_steps=[
    "Tu mapa de hábitos: pague con el botón de PayPal. El pago se hace en la página segura de PayPal; usted no escribe datos de pago en este sitio. Al terminar, vuelva y responda el cuestionario.",
    "Sesión en línea: escriba por WhatsApp al +506 7221-2372 para coordinar su pago (SINPE Móvil, tarjeta o PayPal) y agendar su cita.",
    "Una vez confirmado el pago de la sesión, coordinamos el día y la hora.",
  ],
  pay_wa="Escribir por WhatsApp", pay_wa_msg="Hola Tatiana, tengo una consulta sobre cómo pagar",
),
"en": dict(
  h2="Find the support that best suits you",
  p="Every person has different needs. Discover resources and support options to care for your wellbeing, better understand your habits and move forward at your own pace.",
  incl="What's included", deliv="Timing",
  note="Educational and orientation tool. It is not a psychological test, does not provide diagnoses and does not replace professional medical or psychological care. Your questionnaire answers are processed only on your device: they are not sent to or stored on any server.",
  items=[
    dict(img="producto-mapa-en", contain="tall", alt="Cover of Your Habit Map, by Salud Integral",
         name="Your Habit Map",
         desc="Answer a short questionnaire and get, right away, a PDF built from your answers: to understand what helps you, what holds you back and where to start.",
         inc=["Your orientation profile for habits","Your main obstacles, clearly explained","Three practical, personalized recommendations","A 7-day action plan","A printable tracking sheet","A personal commitment with your name"],
         price="USD 9.99 · one-time payment, no subscription",
         delivery="Immediate: about 13 short questions (around 4 minutes) and your PDF is created and downloads right away on your device",
         kind="link", href="PAYPAL_MAPA", cta="Buy with PayPal",
         extra_key="map_access", extra_text="Already paid? Continue to your questionnaire"),
    _SES_EN],
  pay_h2="How to pay", pay_p="Choose the option for what you want to get.",
  pay_cr="Session payments", pay_cr_l=["Debit or credit card","PayPal"],
  pay_int=None, pay_int_l=[],
  pay_steps=[
    "Your Habit Map: pay with the PayPal button. Payment happens on PayPal's secure page; you never enter payment details on this site. When you finish, come back and answer the questionnaire.",
    "Online session: write to us on WhatsApp at +506 7221-2372 to arrange your payment and book your appointment.",
    "Once the session payment is confirmed, we agree on the day and time.",
  ],
  pay_wa="Write on WhatsApp", pay_wa_msg="Hello Tatiana, I have a question about how to pay",
),
}
