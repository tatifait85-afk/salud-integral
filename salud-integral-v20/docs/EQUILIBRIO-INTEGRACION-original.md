# Mi mapa de equilibrio → integración en Salud Integral v19

Estado: **recuperado, verificado en local con PayPal simulado. NO desplegado. No se tocó el Worker, Cloudflare ni PayPal.**

## 1. Qué es
App web interactiva ES/EN (25 tarjetas, 6 áreas, mapa circular SVG, estado compartido, sin puntuaciones ni evaluación clínica) y generador de cuaderno PDF A4 (13–16 páginas, campos editables). Sin IA; motor de reglas determinista.
Diseño de acceso (el original, conservado): la **página de la app es pública** (elegir tarjetas y ver el mapa es gratis); **el generador del PDF es lo que se paga** y vive en `/privado/equilibrio/pdf.js`, que el Worker v19 solo entrega con la cookie `si_equilibrio`.

## 2. Archivos listos para copiar a v19 (carpeta `listo-para-copiar/`)
| Origen | Destino en v19 | Resultado en `dist/` |
|---|---|---|
| `static_privado/equilibrio/pdf.js` | `static_privado/equilibrio/pdf.js` (carpeta nueva) | `/privado/equilibrio/pdf.js` (protegido por el Worker, producto `equilibrio`) |
| `app_equilibrio/index.html` | `app_equilibrio/index.html` (carpeta nueva) | `/equilibrio/index.html` (pública, `noindex`) |

`src/build.py` ya copia cada subcarpeta de `static_privado/` a `dist/privado/`, así que `pdf.js` no necesita código nuevo. La página pública sí necesita un parche pequeño del generador:

## 3. Parches al generador (no al Worker) — `parches/`
1. `build.py.diff` → `src/build.py`: tras copiar `static_privado`, copia `app_equilibrio/index.html` a `dist/equilibrio/index.html` si existe (`patch -p1 < parches/build.py.diff`).
2. `audit_static.py.diff` → `tests/audit_static.py`: `/equilibrio/` se trata como página de aplicación noindex (igual que `/privado/jardin/`); sin esto la auditoría marca 7 errores de metadatos.

## 4. Contrato con el Worker v19 (sin cambios en el Worker)
El cliente (`src/equilibrio-pago.js`, ya adaptado) usa exactamente lo que el Worker ya expone:
- `POST /api/acceso` con `{tx, p:"equilibrio"}` → cookie `si_equilibrio`
- `GET /api/estado?p=equilibrio`
- `GET /privado/equilibrio/pdf.js` (401 sin cookie)
- Producto reconocido por monto **12.99** (`PRICE_EQUILIBRIO`), ya en `worker/wrangler.jsonc`.
**No usar** la carpeta `worker/` del proyecto original (era un Worker separado antiguo): se excluyó de esta entrega.
La página comercial de v19 (`/bajar-de-peso/`, EN `/en/weight-management/`) no se modificó; el botón PayPal `VA4SE3UYS3BBS` no se modificó. La app solo lo abre (`https://www.paypal.com/ncp/payment/VA4SE3UYS3BBS`, tomado del botón existente).

## 5. Reconstruir desde la fuente (`fuente/`)
`python3 build/make_assets.py && python3 build/build.py` → `dist/sitio/equilibrio/index.html` y `dist/sitio/privado/equilibrio/pdf.js` (idénticos byte a byte a `listo-para-copiar/`). Contiene `vendor/` (jsPDF, pdf-lib, fuentes con licencia libre) y `assets/` (portada, logo).
La portada del cuaderno usa la ilustración sin texto y escribe «MI MAPA DE EQUILIBRIO» (ES) / «MY BALANCE MAP» (EN) en vector; **el nombre de la persona va donde la portada de ejemplo mostraba «Maria Rodriguez»** (ese nombre era un ejemplo). Si la persona no escribe nombre, la línea queda vacía.

## 6. Pruebas (en `fuente/tests/`, con Playwright; `NODE_PATH=$(npm root -g)`)
- `node tests/stress.js` — 90 PDFs (ES/EN) sin desbordes: **0 problemas**.
- `node tests/e2e.js` — mapa, tarjetas, ES↔EN, persistencia, descarga, móvil sin scroll horizontal, sin errores JS: **TODO OK (26)**.
- `node tests/pdf-contenido.js` — selección ↔ PDF (A4, tarjetas elegidas sí / no elegidas no, nombre): **TODO OK (12)**.
- `BASE=http://localhost:8788 node tests/e2e-pago.js` — con `wrangler dev --local` de v19 (`.dev.vars`: `TOKEN_SECRET`, `PRUEBA_LOCAL=1`): sin pago no hay generador; IPN simulado 12.99 → acceso → PDF válido; pago de hábitos NO abre equilibrio; solo cookie `si_equilibrio`: **TODO OK (18)**.
- `tests/run_all.sh` de v19 con todo integrado: **RESULTADO: TODO OK** (build reproducible, auditoría 0 errores, ZIP público sin `privado/`, 36 pruebas del Worker, e2e).

## 7. PENDIENTE de prueba en vivo (no verificado)
- Pago real en PayPal del botón `VA4SE3UYS3BBS` y que el IPN real llegue con 12.99 a `/api/ipn`.
- Auto-return de PayPal hacia `https://www.saludintegral.site/equilibrio/` (si PayPal añade `?tx=`, la app lo verifica sola; si no, la persona escribe su número de transacción).
- `/privado/equilibrio/pdf.js` → 401 en el dominio real sin cookie.
- Navegadores y móviles reales (Safari, Firefox).

## 8. Decisiones abiertas (de Tatiana)
1. URL de la app: `/equilibrio/` (la del proyecto original). ¿Se prefiere otra?
2. La página es autónoma (sin menú del sitio); idioma ES/EN con botón interno. ¿Se quiere una versión `/en/…` y un enlace «Volver al sitio»?
3. ¿El nombre en la portada es el de la persona compradora (como está) o quiere un crédito fijo?
