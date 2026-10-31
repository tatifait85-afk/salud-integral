# -*- coding: utf-8 -*-
"""Página «Bajar de peso / Weight management». Productos: «Mi mapa de equilibrio / My Balance Map»
(USD 12.99, botón PayPal VA4SE3UYS3BBS) + la sesión en línea de 45 min (idéntica a la de las otras páginas).
Textos del mapa tomados de los ya confirmados en Alimentación; registro «usted» (EN = traducción)."""
from content_spiritual import _SES_ES, _SES_EN

WEIGHT = {
"es": dict(
  title="Bajar de peso | Salud Integral",
  desc="Un programa para trabajar sus hábitos de alimentación y su relación con el peso: Mi mapa de equilibrio y una sesión individual en línea.",
  eyebrow="BAJAR DE PESO", h1="Programa integral para bajar de peso",
  lead="Un programa para trabajar sus hábitos de alimentación y su relación con el peso, sin restricciones extremas y a su propio ritmo: una experiencia interactiva con cuaderno en PDF, o una sesión individual en línea.",
  cta="Ver las opciones", hero_alt="Plato con ensalada, cuaderno de hábitos y agua con limón sobre una mesa de madera",
  hero_img="bajar-peso", hero_img_m="bajar-peso-m",
  supports=[("leaf","Hábitos reales"),("bowl","Ideas prácticas"),("heart","Más bienestar"),("sprout","A su propio ritmo")],
),
"en": dict(
  title="Weight management | Salud Integral",
  desc="A program to work on your eating habits and your relationship with weight: My Balance Map and a one-on-one online session.",
  eyebrow="WEIGHT MANAGEMENT", h1="Comprehensive program for weight management",
  lead="A program to work on your eating habits and your relationship with weight, without extreme restrictions and at your own pace: an interactive experience with a PDF workbook, or a one-on-one online session.",
  cta="See the options", hero_alt="Salad bowl, habits notebook and lemon water on a wooden table",
  hero_img="lose-weight", hero_img_m="lose-weight-m",
  supports=[("leaf","Real habits"),("bowl","Practical ideas"),("heart","More wellbeing"),("sprout","At your own pace")],
),
}

PRODUCTS_WEIGHT = {
"es": dict(
  h2="Elija cómo quiere empezar",
  p="Dos opciones para trabajar sus hábitos y su relación con el peso: una experiencia interactiva para hacer a su ritmo, o una conversación individual en vivo.",
  incl="Qué incluye", deliv="Qué recibes",
  note="Finalidad educativa y de acompañamiento personal. No sustituye la valoración ni el tratamiento de profesionales sanitarios.",
  items=[
    dict(img="producto-equilibrio", alt="Portada de Mi mapa de equilibrio: título entre hojas acuareladas",
         name="Mi mapa de equilibrio",
         short="Un cuaderno interactivo para comprender cómo estás y diseñar tu propio camino hacia el bienestar.",
         desc="¿Sientes que necesitas hacer cambios en tu vida, pero no sabes por dónde empezar? Mi Mapa de Equilibrio es una herramienta digital interactiva, disponible en español e inglés, que te permite explorar seis áreas fundamentales de tu bienestar, identificar cuáles necesitan más atención y organizar tus propias prioridades. A través de tarjetas de reflexión y ejercicios guiados, podrás reconocer qué aspectos de tu vida quieres fortalecer, qué cambios te gustaría realizar y qué pequeños pasos puedes comenzar a dar.",
         inc=["Acceso a una experiencia digital interactiva en español o inglés.", "Exploración de seis áreas de bienestar mediante tarjetas y preguntas de reflexión.", "Herramientas para identificar tus prioridades y visualizar los aspectos de tu vida que deseas mejorar.", "Creación de tu propio Mapa de Equilibrio.", "Un cuaderno personalizado en PDF, listo para descargar, imprimir y completar a mano."],
         price="USD 12.99", delivery="Tu propio cuaderno de trabajo, construido a partir de tus elecciones y reflexiones, para que puedas escribir tus objetivos, registrar tus ideas y trabajar a tu ritmo en los cambios que deseas incorporar a tu vida. No es un test ni una evaluación de tu personalidad. Es una herramienta práctica de autoconocimiento y planificación personal.",
         kind="link", href="https://www.paypal.com/ncp/payment/VA4SE3UYS3BBS", cta="Quiero mi mapa"),
    _SES_ES],
  pay_h2="Cómo pagar", pay_p="Elija la opción según su ubicación. El proceso es directo y seguro.",
  pay_cr="Pagos en Costa Rica", pay_cr_l=["SINPE Móvil: +506 7221-2372","Tarjeta de débito o crédito","PayPal"],
  pay_int="Pagos internacionales", pay_int_l=["Tarjeta de débito o crédito","PayPal"],
  pay_steps=[
    "Mi mapa de equilibrio: pague con el botón de PayPal del producto. Al volver, entre a su mapa en saludintegral.site/equilibrio y, si hace falta, escriba el número de transacción de su recibo.",
    "Sesión en línea: escriba por WhatsApp al +506 7221-2372 para coordinar su pago (SINPE Móvil, tarjeta o PayPal) y agendar su cita.",
    "Una vez confirmado el pago de la sesión, coordinamos el día y la hora de su cita.",
  ],
  pay_wa="Escribir por WhatsApp", pay_wa_msg="Hola Tatiana, tengo una consulta sobre cómo pagar",
),
"en": dict(
  h2="Choose how you want to start",
  p="Two options to work on your habits and your relationship with weight: an interactive experience to do at your own pace, or a live one-on-one conversation.",
  incl="What's included", deliv="What you get",
  note="Educational and personal-support purpose. It does not replace assessment or treatment by health professionals.",
  items=[
    dict(img="producto-equilibrio-en", alt="Cover of My Balance Map: title among watercolor leaves",
         name="My Balance Map",
         short="An interactive notebook to understand how you are and design your own path to well-being.",
         desc="Do you feel you need to make changes in your life, but don't know where to start? My Balance Map is an interactive digital tool, available in Spanish and English, that lets you explore six fundamental areas of your well-being, identify which ones need more attention and organize your own priorities. Through reflection cards and guided exercises, you can recognize which aspects of your life you want to strengthen, which changes you would like to make and which small steps you can start taking.",
         inc=["Access to an interactive digital experience in Spanish or English.", "Exploration of six well-being areas through cards and reflection questions.", "Tools to identify your priorities and visualize the aspects of your life you want to improve.", "Creation of your own Balance Map.", "A personalized PDF notebook, ready to download, print and complete by hand."],
         price="USD 12.99", delivery="Your own workbook, built from your choices and reflections, so you can write down your goals, record your ideas and work at your own pace on the changes you want to bring into your life. It is not a test or an assessment of your personality. It is a practical tool for self-knowledge and personal planning.",
         kind="link", href="https://www.paypal.com/ncp/payment/VA4SE3UYS3BBS", cta="I want my map"),
    _SES_EN],
  pay_h2="How to pay", pay_p="Choose the option for what you want to get.",
  pay_cr="Payments", pay_cr_l=["Debit or credit card","PayPal"],
  pay_int=None, pay_int_l=[],
  pay_steps=[
    "My Balance Map: pay with the product's PayPal button. When you return, enter your map at saludintegral.site/equilibrio and, if needed, type the transaction number from your receipt.",
    "Online session: write to us on WhatsApp at +506 7221-2372 to arrange your payment and book your appointment.",
    "Once the session payment is confirmed, we agree on the day and time.",
  ],
  pay_wa="Write on WhatsApp", pay_wa_msg="Hello Tatiana, I have a question about how to pay",
),
}
