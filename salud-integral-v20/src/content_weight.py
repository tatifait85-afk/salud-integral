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
  incl="Qué incluye", deliv="Plazo",
  note="Finalidad educativa y de acompañamiento personal. No sustituye la valoración ni el tratamiento de profesionales sanitarios.",
  items=[
    dict(img="producto-equilibrio", alt="Portada de Mi mapa de equilibrio: título entre hojas acuareladas",
         name="Mi mapa de equilibrio",
         desc="Una experiencia interactiva en español e inglés: explore seis áreas de su bienestar, elija las tarjetas que le hablan y arme su propio mapa. Al final se convierte en un cuaderno en PDF para escribir a mano.",
         inc=["Seis áreas: calma, descanso, cuerpo, límites, naturaleza y disfrute","25 tarjetas con preguntas y pequeñas acciones para elegir a su ritmo","Un cuaderno en PDF (A4) con su mapa y espacios para escribir"],
         price="USD 12.99", delivery="Cuaderno en PDF para descargar en su dispositivo",
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
  incl="What's included", deliv="Timing",
  note="Educational and personal-support purpose. It does not replace assessment or treatment by health professionals.",
  items=[
    dict(img="producto-equilibrio-en", alt="Cover of My Balance Map: title among watercolor leaves",
         name="My Balance Map",
         desc="An interactive experience in Spanish and English: explore six areas of your wellbeing, choose the cards that speak to you and build your own map. At the end it becomes a PDF workbook to write in by hand.",
         inc=["Six areas: calm, rest, body, boundaries, nature and enjoyment","25 cards with questions and small actions to choose at your own pace","A PDF workbook (A4) with your map and space to write"],
         price="USD 12.99", delivery="PDF workbook to download on your device",
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
