# Generador del sitio Salud Integral

Las páginas se generan con Python; no se editan a mano.

- Construir: `cd generador-sitio && python3 src/build.py` → crea la carpeta `dist/` con el sitio completo.
- Contenido: `src/content*.py` (textos), `src/config.py` (rutas, enlaces de PayPal), `src/catalog.py` y `src/assistant.py` (Romero), `src/jardin.py` y `src/mapa.py` (productos).
- Estáticos (CSS, JS, imágenes, juego): `static/`, `jardin_app/`.
- Vista previa navegable: `tools/relativize.py dist preview` (convierte enlaces a relativos). `tools/sync_preview.py` es el script usado en la sesión y tiene rutas fijas de esa sesión: ajústalas.
- `worker/` (Worker de Cloudflare con los tres productos) y `static_privado/` (lo que solo se entrega con pago) están incluidos; `equilibrio/` es la fuente de «Mi mapa de equilibrio». Lea `docs/ESTADO-V20.md` primero: dice qué se recuperó y qué es código nuevo.
- Requiere Python 3 y Pillow. Pruebas: `bash tests/run_all.sh` (necesita node, playwright y `cd worker && npm ci`).
