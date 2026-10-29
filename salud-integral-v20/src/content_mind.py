# -*- coding: utf-8 -*-
"""Página Mente tranquila / Calm mind. Fuente: Salud_Integral_Mente_Tranquila_Documento_Completo.docx (registro «usted»; EN = traducción).
Producto ES: curso «Cuando tu cabeza no para» (Payhip KpXIH; datos leídos de la página de Payhip). Producto EN: libro «Overcome Depression» (Amazon link.amazon/B04dLpuvb, no probado).
Más la sesión en línea de 45 min (idéntica a las otras páginas). El precio se muestra como «Ver precio en…» porque no está confirmado por la propietaria."""
from content_spiritual import _SES_ES, _SES_EN

MIND = {
"es": dict(
  title="Mente tranquila | Salud Integral",
  desc="Herramientas y recursos para observar el pensamiento repetitivo, recuperar espacio mental y relacionarse de otra manera con lo que pasa en su cabeza.",
  eyebrow="MENTE TRANQUILA", h1="Cuando tu cabeza no para",
  lead="Hay momentos en los que pensar más no ayuda a encontrar una respuesta. Aquí encontrará herramientas y recursos para observar esos patrones de pensamiento, recuperar espacio mental y relacionarse de otra manera con lo que pasa en su cabeza.",
  cta="Explorar herramientas", hero_alt="Mujer sentada en una terraza mirando el atardecer sobre el mar, con una taza y plantas a su alrededor",
  supports=[("repeat","Pensamiento repetitivo"),("wind","Regulación"),("compass","Claridad"),("leaf","Herramientas prácticas")],
),
"en": dict(
  title="Calm mind | Salud Integral",
  desc="Tools and resources to observe repetitive thinking, recover mental space and relate differently to what happens in your head.",
  eyebrow="CALM MIND", h1="When your mind won't stop",
  lead="There are moments when thinking more does not help you find an answer. Here you will find tools and resources to observe those thought patterns, recover mental space and relate differently to what happens in your head.",
  cta="Explore tools", hero_alt="Woman sitting on a terrace watching the sunset over the sea, with a cup and plants around her",
  supports=[("repeat","Repetitive thinking"),("wind","Regulation"),("compass","Clarity"),("leaf","Practical tools")],
),
}

PRODUCTS_MIND = {
"es": dict(
  h2="Encuentre el apoyo que mejor se adapta a usted",
  p="No necesita dejar de pensar: necesita recuperar espacio. Descubra un curso y una opción de acompañamiento para avanzar a su propio ritmo.",
  incl="Qué incluye", deliv="Plazo",
  note="Finalidad educativa y de acompañamiento personal. No sustituye la valoración ni el tratamiento de profesionales sanitarios.",
  items=[
    dict(img="producto-cabeza", contain=True, alt="Portada del curso Mi cabeza no para: una mujer atrapada entre pensamientos y la misma mujer en calma frente a un paisaje",
         name="Cuando tu cabeza no para",
         desc="Un curso práctico para comprender y manejar la rumiación mental: ese estado en el que la mente repite una y otra vez las mismas preocupaciones, dudas, errores o escenarios sin llegar a una solución.",
         inc=["Observar lo que ocurre en la mente sin juzgarlo","Comprender el ciclo de la rumiación y sus activadores","Respiración y atención corporal para volver al presente","Reencuadrar interpretaciones automáticas desde una perspectiva más equilibrada y realista","Cuestionario, cómics de aprendizaje y una caja de herramientas"],
         price="USD 9.99", delivery="Curso en línea en Payhip, a su propio ritmo",
         kind="link", href="https://payhip.com/b/KpXIH", cta="Entrar al curso"),
    _SES_ES],
  pay_h2="Cómo pagar", pay_p="Elija la opción según lo que quiera adquirir. El proceso es directo y seguro.",
  pay_cr="Pagos de la sesión en Costa Rica", pay_cr_l=["SINPE Móvil: +506 7221-2372","Tarjeta de débito o crédito","PayPal"],
  pay_int="Pagos internacionales de la sesión", pay_int_l=["Tarjeta de débito o crédito","PayPal"],
  pay_steps=[
    "Curso «Cuando tu cabeza no para»: se adquiere directamente en Payhip, desde el botón del curso.",
    "Sesión en línea: escriba por WhatsApp al +506 7221-2372 para coordinar su pago (SINPE Móvil, tarjeta o PayPal) y agendar su cita.",
    "Una vez confirmado el pago de la sesión, coordinamos el día y la hora de su cita.",
  ],
  pay_wa="Escribir por WhatsApp", pay_wa_msg="Hola Tatiana, tengo una consulta sobre cómo pagar",
),
"en": dict(
  h2="Find the support that best suits you",
  p="You don't need to stop thinking: you need to recover space. Discover a book and a support option to move forward at your own pace.",
  incl="What's included", deliv="Timing",
  note="Educational and personal-support purpose. It does not replace assessment or treatment by health professionals.",
  items=[
    dict(img="libro-en-overcome-depression", contain="tall", alt="Cover of Overcome Depression: Your Practical Guide to Regaining Joy, by M.S. Tatiana Fait Shaw",
         name="Overcome Depression: Your Practical Guide to Regaining Joy",
         desc="A practical guide to regaining joy, by Tatiana Fait Shaw, available on Amazon.",
         inc=[], price="Kindle USD 5.99 · Paperback USD 9.99", delivery="",
         kind="link", href="https://link.amazon/B04dLpuvb", cta="See it on Amazon"),
    _SES_EN],
  pay_h2="How to pay", pay_p="Choose the option for what you want to get.",
  pay_cr="Session payments", pay_cr_l=["Debit or credit card","PayPal"],
  pay_int=None, pay_int_l=[],
  pay_steps=[
    "Overcome Depression: purchased directly on Amazon, from the book's button.",
    "Online session: write to us on WhatsApp at +506 7221-2372 to arrange your payment and book your appointment.",
    "Once the session payment is confirmed, we agree on the day and time.",
  ],
  pay_wa="Write on WhatsApp", pay_wa_msg="Hello Tatiana, I have a question about how to pay",
),
}
