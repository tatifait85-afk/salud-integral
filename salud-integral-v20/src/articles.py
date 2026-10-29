# -*- coding: utf-8 -*-
"""Artículos del blog por página (3 por tema, elegidos por Tatiana). Títulos leídos de cada URL real.
ES = blog.saludintegral.site · EN = flowsomatic.blogspot.com.
  en=None  -> todavía no hay URL del artículo en inglés.
  img      -> imagen para ES; img_en -> imagen para EN (None = falta imagen en inglés o la misma sirve)."""
from config import BLOG_BASE

EN_BLOG = "https://flowsomatic.blogspot.com"

def _a(path, title, slug, en=None, img_en_ok=True, es_text=False):
    return dict(
        url=BLOG_BASE + path, title=title, slug=slug,
        img=f"/assets/img/articulos/{slug}.webp",
        img_en=(f"/assets/img/articulos/{slug}-en.webp" if slug in ['agobio-accion', 'intestino-pancreas', 'meditar-manana', 'microbiota'] else (None if es_text else f"/assets/img/articulos/{slug}.webp")),
        en=(dict(url=EN_BLOG + en[0], title=en[1]) if en else None),
    )

ARTICLES = {
    "food": [
        _a('/2026/08/el-nectar-de-tenenet-el-elixir.html', 'El Néctar de Tenenet: El Elixir Fermentado para Nutrir la Madurez Femenina', 'tenenet', en=('/2026/10/the-nectar-of-tenenet-fermented-elixir.html', 'The Nectar of Tenenet: The Fermented Elixir to Nourish Feminine Maturity'), es_text=False),
        _a('/2026/07/el-eje-intestino-pancreas-el-poder-de.html', 'El eje intestino-páncreas: El poder de la microbiota', 'intestino-pancreas', en=('/2026/10/the-gutpancreas-axis-power-of-microbiota.html', 'The Gut–Pancreas Axis: The Power of the Microbiota'), es_text=True),
        _a('/2025/09/nutre-tu-mente-alimentos-que-pueden.html', 'Nutre tu mente: Alimentos que pueden ayudar a combatir la depresión', 'nutre-tu-mente', en=('/2026/10/nourish-your-mind-foods-that-can-help.html', 'Nourish Your Mind: Foods That Can Help Fight Depression'), es_text=False),
    ],
    "habits": [
        _a('/2026/08/el-arte-de-empezar-bien-la-forma-en-que.html', 'El arte de empezar bien', 'empezar-bien', en=('/2026/10/the-art-of-starting-well.html', 'The Art of Starting Well'), es_text=False),
        _a('/2026/06/el-arte-de-apagar-el-cerebro-por-que.html', 'El arte de apagar el cerebro: Por qué dormir bien es el superpoder que estás ignorando', 'apagar-cerebro', en=('/2026/06/the-art-of-switching-off-your-brain-why.html', "The art of switching off your brain: Why getting a good night's sleep is the superpower you're ignoring"), es_text=False),
        _a('/2026/02/del-agobio-la-accion-domina-el-estres.html', 'Del Agobio a la Acción: Domina el Estrés con Psicología Positiva', 'agobio-accion', en=('/2026/10/from-overwhelm-to-action-master-stress.html', 'From Overwhelm to Action: Master Stress with Positive Psychology'), es_text=False),
    ],
    "mind": [
        _a('/2025/12/la-calma-en-el-caos-tecnicas-esenciales.html', 'La Calma en el Caos: Técnicas Esenciales para la Gestión del Estrés y la Ansiedad', 'calma-caos', en=('/2026/10/calm-in-chaos-essential-techniques-for.html', 'Calm in the Chaos: Essential Techniques for Managing Stress and Anxiety'), es_text=False),
        _a('/2025/11/el-mito-de-la-perfeccion-por-que-la.html', 'El Mito de la Perfección: Por Qué la Autocompasión Es Más Efectiva que el Autocontrol', 'mito-perfeccion', en=('/2026/10/the-myth-of-perfection-why-self.html', 'The Myth of Perfection: Why Self-Compassion Is More Effective Than Self-Control'), es_text=False),
        _a('/2025/10/como-aminorar-el-estres-laboral-con.html', 'Cómo Aminorar el Estrés Laboral con Prácticas Holísticas', 'estres-laboral', en=('/2026/10/how-to-reduce-work-stress-with-holistic.html', 'How to Reduce Work Stress with Holistic Practices'), es_text=False),
    ],
    "weight": [
        _a('/2026/07/por-que-tu-dieta-restrictiva-te.html', '¿Por qué tu dieta restrictiva te mantiene inflamada? El camino de vuelta a la calma digestiva', 'dieta-restrictiva', en=('/2026/10/why-is-your-restrictive-diet-keeping.html', 'Why Is Your Restrictive Diet Keeping You Inflamed? The Way Back to Digestive Calm'), es_text=False),
        _a('/2025/10/panza-de-cortisol.html', 'Panza de Cortisol', 'panza-cortisol', en=('/2026/10/cortisol-belly.html', 'Cortisol Belly'), es_text=False),
        _a('/2025/06/el-peso-de-las-emociones-factores.html', 'El peso de las emociones: Factores emocionales que influyen en el aumento de peso', 'peso-emociones', en=('/2026/10/the-weight-of-emotions-emotional.html', 'The Weight of Emotions: Emotional Factors That Influence Weight Gain'), es_text=False),
    ],
    "spiritual": [
        _a('/2025/03/los-beneficios-neurologicos-de-meditar.html', 'Los beneficios neurológicos de meditar por las mañanas', 'meditar-manana', en=('/2026/10/the-neurological-benefits-of-meditating.html', 'The Neurological Benefits of Meditating in the Morning'), es_text=True),
        _a('/2025/03/el-deseo-toxico-de-ser-especial.html', 'El deseo tóxico de ser especial', 'deseo-toxico', en=('/2026/10/the-toxic-desire-to-be-special.html', 'The Toxic Desire to Be Special'), es_text=False),
        _a('/2026/07/el-cuerpo-no-olvida-y-si-lo-que-llamas.html', 'El cuerpo no olvida: ¿Y si lo que llamas "ansiedad" o "adicción" es en realidad tu infancia pidiendo ayuda?', 'cuerpo-no-olvida', en=('/2026/10/the-body-doesnt-forget-what-if-what-you.html', 'The Body Doesn\'t Forget: What If What You Call "Anxiety" or "Addiction" Is Really Your Childhood Asking for Help?'), es_text=False),
    ],
    "digestive": [
        _a('/2025/06/la-conexion-inesperada-como-influye-tu.html', 'La Conexión Inesperada: ¿Cómo Influye tu Alimentación en tu Estado de Ánimo?', 'conexion-inesperada', en=('/2026/10/the-unexpected-connection-how-does-your.html', 'The Unexpected Connection: How Does Your Diet Influence Your Mood?'), es_text=False),
        _a('/2026/07/el-eje-intestino-pancreas-el-poder-de.html', 'El eje intestino-páncreas: El poder de la microbiota', 'intestino-pancreas', en=('/2026/10/the-gutpancreas-axis-power-of-microbiota.html', 'The Gut–Pancreas Axis: The Power of the Microbiota'), es_text=True),
        _a('/2026/06/y-si-el-problema-esta-en-tu-microbiota.html', '¿Y si el problema está en tu microbiota?', 'microbiota', en=('/2026/10/what-if-problem-is-in-your-microbiota.html', 'What If the Problem Is in Your Microbiota?'), es_text=False),
    ],
}

# Cursos de la sección transpersonal/espiritual (tienda Fourthwall de Magickal Kabbalah). Datos leídos de cada ficha.
SPIRITUAL_COURSES = {
    "es": dict(
        url="https://magickal-kabbalah-shop.fourthwall.com/products/despierta-tu-potencial-de-abundancia-con-la-cabala-hermetica-practica",
        title="¡Despierta tu potencial de abundancia con la Cábala Hermética Práctica!", price="USD 29.99"),
    "en": dict(
        url="https://magickal-kabbalah-shop.fourthwall.com/products/magickal-kabbalah-for-self-transformation-bundle",
        title="Magickal Kabbalah for Self Transformation Bundle", price="USD 33.77"),
}
