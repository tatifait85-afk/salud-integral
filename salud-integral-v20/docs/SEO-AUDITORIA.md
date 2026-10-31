# Auditoría y optimización SEO — Salud Integral

Rama de trabajo: `seo-optimizacion` (parte de `v20-jardin-navegacion`, idéntica a producción al iniciar). **No se ha desplegado ni subido nada.**

## Cambios realizados
- Título y meta description únicos por página (ES/EN), definidos en `src/seo.py` (títulos ≤ 65, descripciones 70–160 caracteres).
- Meta robots (index, vista previa grande) solo en páginas indexables; las páginas de acceso/cuestionario siguen en noindex y fuera del sitemap.
- Datos estructurados JSON-LD (Organization, WebSite, WebPage y subtipos, BreadcrumbList, Product/Course/Service/Book, listas en páginas temáticas). Solo nombres y precios ya publicados en cada página; sin reseñas ni valoraciones.
- Open Graph completo (locale, dimensiones, alt) y Twitter Cards; imágenes sociales JPG 1200×630 generadas con `tools/make_og_images.py` (originales intactas).
- hreflang es / en / x-default (x-default y es para la página solo en español); sitemap con alternativas de idioma.
- Bloque «Siga explorando / Keep exploring» en páginas de producto (enlaces internos); estilo mínimo en `site.css`.
- `tests/audit_static.py` ampliado con controles SEO.

## Pruebas
- Auditoría estática: 0 errores, 0 avisos (42 páginas).
- `tests/run_all.sh`: todo pasa salvo `e2e Worker: pago-equilibrio`, fallo que ya existía antes de los cambios (el texto esperado por la prueba está en registro informal, y la página usa registro formal).

## Pendientes / decisiones suyas
1. Dominio canónico: www o sin www, con redirección 301 desde el otro.
2. H1 duplicado entre /mente-tranquila/ y /cuando-tu-cabeza-no-para/.
3. Páginas de producto con poco texto (≈150–260 palabras).
4. Título H1 de la página de Cábala en español usa «tú»; contenido suyo, no modificado.
5. Imágenes pesadas (varias >150 KB); no se recomprimieron sin su aprobación.
6. `/equilibrio/` (aplicación, noindex) sin metadatos; no existe página 404 propia.
7. Sin `lastmod` en el sitemap.
8. Palabras clave: no hay datos de volumen de búsqueda; no se afirma demanda.
