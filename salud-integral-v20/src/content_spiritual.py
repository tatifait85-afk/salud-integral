# -*- coding: utf-8 -*-
"""Página Transpersonal / Espiritual. No existe especificación en el Documento Maestro: el texto es nuevo y se limita a lo que
muestran las fichas reales (cursos, libros, artículos) y a los criterios de lenguaje (sin promesas clínicas)."""
SPIRIT = {
"es": dict(
  title="Transpersonal y espiritual | Salud Integral",
  desc="Meditación, Cábala práctica, Ho'oponopono y psicología transpersonal: lecturas, libros y un curso para explorar la dimensión espiritual del bienestar.",
  eyebrow="TRANSPERSONAL · ESPIRITUAL", h1="Transpersonal y espiritual",
  lead="Un espacio para explorar la dimensión espiritual del bienestar: meditación, Cábala práctica, Ho'oponopono y psicología transpersonal. Lecturas, libros y un curso para recorrerlo a su propio ritmo.",
  cta="Explorar recursos", hero_alt="Mujer sonriente meditando al amanecer frente al mar, con un diseño de luz geométrico detrás",
  course_eyebrow="CURSO", course_h2="Cábala práctica",
  course_p="Curso en línea que aplica la Cábala a la prosperidad: meditación, visualización, oración con nombres divinos y trabajo con las creencias limitantes sobre el dinero. Incluye estrategias prácticas para manejar las finanzas personales, un libro de Salmos en hebreo con pronunciación y traducción al español, un ritual en video y un sigilo con nombres divinos.",
  course_cta="Ver el curso", course_img="curso-kabbalah-es", course_alt="Portada del curso Despierta tu potencial de abundancia con la Cábala Hermética Práctica",
  books_h2="Libros para leer a su ritmo", books_p="Lecturas de Tatiana Fait Shaw sobre Ho'oponopono, neurociencia y psicología transpersonal.",
  art_h2="Artículos para profundizar", art_p="Lecturas del blog para recorrer a su propio ritmo.", art_all="Ver todos los artículos", art_read="Leer artículo",
  note="Estos recursos tienen finalidad educativa y de desarrollo personal. No sustituyen la atención de profesionales de la salud.",
  books_ids=["libro-3","libro-4","libro-5"], amazon_badge="Ver en Amazon", cover_of="Portada de ",
),
"en": dict(
  title="Transpersonal and spiritual | Salud Integral",
  desc="Meditation, practical Kabbalah, Ho'oponopono and transpersonal psychology: readings, books and a course to explore the spiritual dimension of wellbeing.",
  eyebrow="TRANSPERSONAL · SPIRITUAL", h1="Transpersonal and spiritual",
  lead="A space to explore the spiritual dimension of wellbeing: meditation, practical Kabbalah, Ho'oponopono and transpersonal psychology. Readings, books and a course to move through at your own pace.",
  cta="Explore resources", hero_alt="Smiling woman meditating at sunrise by the sea, with a geometric light design behind her",
  course_eyebrow="COURSE", course_h2="Practical Kabbalah",
  course_p="A digital bundle for self-transformation through Magickal Kabbalah: a main book (print or PDF) on the theory and Kabbalah behind the practice, a full-color workbook for tracking personal data and drafting sigils, and two HD videos, one that guides a daily 21-minute practice and one that teaches ritual technique.",
  course_cta="View the bundle", course_img="curso-kabbalah-en", course_alt="Cover of the Magickal Kabbalah for Self Transformation Bundle",
  books_h2="Books to read at your own pace", books_p="Readings by Tatiana Fait Shaw on Ho'oponopono, neuroscience and Magickal Kabbalah.",
  art_h2="Articles to go deeper", art_p="Blog readings to explore at your own pace.", art_all="See all articles", art_read="Read article",
  note="These resources are for educational and personal-development purposes. They do not replace care from health professionals.",
  books_ids=["libro-1","libro-4","libro-5"], amazon_badge="View on Amazon", cover_of="Cover of ",
),
}

# ---------------------------------------------------------------------------------------------
# PRODUCTOS Transpersonal/Espiritual (2 por idioma): sesión + producto de Fourthwall (enlace externo, excepción autorizada).
# Datos tomados de las fichas reales de Fourthwall (23/10/2026) y confirmados por la propietaria:
# precio visible, entrega inmediata, sesión idéntica a la de Alimentación.
# ---------------------------------------------------------------------------------------------
_SES_ES = dict(img="producto-sesion", alt="Dos mujeres conversando en línea, conectadas por una luz dorada",
    name="Sesión en línea · 45 minutos",
    desc="Una conversación individual en vivo, ideal si prefiere hablar antes de decidir.",
    inc=["Preguntas puntuales resueltas en vivo","Ideal si prefiere hablar antes de decidir","Coordinamos el horario que le acomode"],
    price="USD 50 · ₡25.000", delivery="Se agenda por WhatsApp; el pago se confirma antes de la sesión",
    kind="wa", msg="Hola Tatiana, quiero agendar una sesión en línea de 45 minutos", cta="Agendar por WhatsApp")
_SES_EN = dict(img="producto-sesion", alt="Two women talking online, connected by a golden light",
    name="Online session · 45 minutes",
    desc="A live one-on-one conversation, ideal if you prefer to talk before deciding.",
    inc=["Specific questions answered live","Ideal if you prefer to talk before deciding","We coordinate a time that suits you"],
    price="USD 50", delivery="Booked via WhatsApp; payment is confirmed before the session",
    kind="wa", msg="Hello Tatiana, I would like to book a 45-minute online session", cta="Book via WhatsApp")
PRODUCTS_SPIRIT = {
"es": dict(
  h2="Encuentre el apoyo que mejor se adapta a usted",
  p="Cada persona tiene necesidades diferentes. Descubra recursos y opciones de acompañamiento para cuidar su bienestar, comprender mejor sus hábitos y avanzar a su propio ritmo.",
  incl="Qué incluye", deliv="Plazo",
  note="Estos recursos tienen finalidad educativa y de desarrollo personal. No sustituyen la atención de profesionales de la salud.",
  items=[_SES_ES,
    dict(img="curso-kabbalah-es", contain=True, alt="Portada del curso Despierta tu potencial de abundancia con la Cábala Hermética Práctica",
         name="¡Despierta tu potencial de abundancia con la Cábala Hermética Práctica!",
         desc="Curso en línea que aplica la Cábala a la prosperidad: sus principios fundamentales, técnicas de meditación y visualización, la oración con nombres divinos, el trabajo con las creencias limitantes sobre el dinero y estrategias prácticas para administrar sus finanzas.",
         inc=["Libro completo: La Cábala Hermética: Un Viaje a la Sabiduría Oculta. Cábala Práctica para la Prosperidad - Salmos",
              "Libro completo de Los Salmos en hebreo, con pronunciación y español",
              "Ritual cabalístico hermético en video","Sigil con nombres de Dios"],
         price="USD 29.99", delivery="Entrega inmediata",
         kind="link", href="https://magickal-kabbalah-shop.fourthwall.com/products/despierta-tu-potencial-de-abundancia-con-la-cabala-hermetica-practica", cta="Comprar en la tienda")],
  pay_h2="Cómo pagar", pay_p="Elija la opción según su ubicación. El proceso es directo y seguro.",
  pay_cr="Pagos de la sesión en Costa Rica", pay_cr_l=["SINPE Móvil: +506 7221-2372","Tarjeta de débito o crédito","PayPal"],
  pay_int="Pagos internacionales de la sesión", pay_int_l=["Tarjeta de débito o crédito","PayPal"],
  pay_steps=[
    "Curso de Cábala Hermética Práctica: el botón lo lleva a la tienda de Fourthwall, donde completa su compra. La entrega es inmediata.",
    "Sesión en línea: escriba por WhatsApp al +506 7221-2372 para coordinar su pago (SINPE Móvil, tarjeta o PayPal) y agendar su cita.",
    "Una vez confirmado el pago de la sesión, coordinamos el día y la hora.",
  ],
  pay_wa="Escribir por WhatsApp", pay_wa_msg="Hola Tatiana, tengo una consulta sobre cómo pagar",
),
"en": dict(
  h2="Find the support that best suits you",
  p="Every person has different needs. Discover resources and support options to care for your wellbeing, better understand your habits and move forward at your own pace.",
  incl="What's included", deliv="Timing",
  note="These resources are for educational and personal-development purposes. They do not replace care from health professionals.",
  items=[_SES_EN,
    dict(img="curso-kabbalah-en", contain=True, alt="Cover of the Magickal Kabbalah for Self Transformation Bundle",
         name="Magickal Kabbalah for Self Transformation Bundle",
         desc="A bundle for self-transformation through Magickal Kabbalah: a main book, a full-color workbook and two HD videos for a daily 21-minute practice.",
         inc=["Main book (full color print / PDF): the theoretical, neurological and Kabbalistic framework, with the complete 72 Key directory",
              "Student manual (full-color workbook): biometric data gathering, AI pattern-recognition integration and sigil drafting templates",
              "Ritual video (Full HD): a real-time visual and acoustic pacing guide for the daily 21-minute practice",
              "Tutorial video (Full HD): step-by-step ritual instruction (finger tapping, Ehye breathing, water placement)"],
         price="USD 33.77", delivery="Immediate delivery",
         kind="link", href="https://magickal-kabbalah-shop.fourthwall.com/products/magickal-kabbalah-for-self-transformation-bundle", cta="Buy in the shop")],
  pay_h2="How to pay", pay_p="Choose the option for what you want to get.",
  pay_cr="Session payments", pay_cr_l=["Debit or credit card","PayPal"],
  pay_int=None, pay_int_l=[],
  pay_steps=[
    "Magickal Kabbalah bundle: the button takes you to the Fourthwall shop, where you complete your purchase. Delivery is immediate.",
    "Online session: write to us on WhatsApp at +506 7221-2372 to arrange your payment and book your appointment.",
    "Once the session payment is confirmed, we agree on the day and time.",
  ],
  pay_wa="Write on WhatsApp", pay_wa_msg="Hello Tatiana, I have a question about how to pay",
),
}
