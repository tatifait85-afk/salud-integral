# Auditoría previa a producción — cambios realizados

Diseño, contenido y estructura aprobados: sin cambios. Worker, pagos y `static_privado/`: sin tocar.

| Archivo | Cambio | Motivo |
|---|---|---|
| `static/jardin/pdf.js` | Mensaje tras suscribirse con follow.it ya no afirma «te enviamos un mensaje»; dice «Solicitud enviada… follow.it enviará un mensaje…». | La petición es `no-cors` (respuesta opaca): no se puede confirmar. |
| `static/js/site.js` – contacto | Reescrito: validación por campo con `aria-invalid`, bloqueo de doble envío, estado «Enviando…», trampa anti-bots, y **punto de integración** `data-endpoint` (POST JSON; éxito solo con HTTP 2xx + `{"ok":true}`; error de red/timeout/HTTP/JSON inválido → error, conserva el mensaje). Sin endpoint: respaldo `mailto:` con mensaje honesto («el mensaje solo se envía cuando pulse Enviar allí»). | Antes decía «Gracias» al abrir el correo sin saber si se enviaba. |
| `src/config.py`, `src/build.py`, `src/content_contact.py` | `CONTACT_ENDPOINT` (variable de entorno, vacía por defecto); atributos/textos ES+EN del formulario; nota de privacidad bajo el formulario. | Configuración separada del código. |
| `static/js/site.js` – MailerLite | Verifica `r.ok`, bloqueo de duplicados, `aria-busy`. Integración y URL intactas. | Un HTTP 500 con JSON no debe contar como éxito. |
| `src/build.py` | Aviso de consentimiento + enlace a privacidad bajo el formulario del programa gratuito. | Consentimiento informado. |
| `static/js/mapa-cuestionario.js` | Si `/api/estado` falla o no devuelve JSON: mensaje de error + enlace a confirmar pago (antes solo texto suelto). Nunca da acceso. | Estado de error utilizable. |
| `static/css/site.css` | `[hidden]{display:none!important}`: el botón «Ir al cuestionario» de la página de acceso se veía aunque no hubiera acceso. Estilos de error/trampa/notas. | **Defecto real** detectado por las pruebas. |
| `src/mapa.py` | `site.js` cargado en acceso y cuestionario. | En esas páginas el menú móvil y la lupa no funcionaban. |
| `src/jardin.py` | Título EN acortado (77 → ≤75 car.). | SEO. |
| `src/build.py` – robots/_headers | `robots.txt` excluye `/privado/` y `/api/`. `_headers`: css/js/img/jardin se revalidan cada hora (antes `immutable` 1 año sin huella en el nombre: una corrección no habría llegado a los visitantes); fuentes siguen inmutables; `/privado/*` `no-store` + `noindex`. | Cachés y rastreo. |
| `src/content_privacy.py` | Sección «Cookies y almacenamiento técnico» (ES/EN): cookie técnica de sesión de «Tu mapa de hábitos», no guarda respuestas en el navegador, cookies/registros de Cloudflare y terceros; formulario de contacto con mailto. | Exactitud frente al comportamiento real. |
| `tests/` (nuevo) | `audit_static.py`, `run_all.sh`, `e2e/{site,contact,newsletter,acceso,jardin,a11y}.js`. | Pruebas repetibles. |
| `docs/` (nuevo) | `DEPLOY.md`, `CHECKLIST-PUBLICACION.md`, este archivo. | Entregables. |

## Ajustes finales (27/10/2026, 2.ª entrega)
| Archivo | Cambio | Motivo |
|---|---|---|
| `src/content_terms.py`, `src/build.py`, `src/config.py`, `src/content.py` | Nueva página bilingüe **Términos de uso** (`/terminos-de-uso/`, `/en/terms-of-use/`), mismo diseño que Privacidad, enlazada en el pie, sitemap y buscador. | Solicitud. Solo afirma lo ya establecido; lo no decidido va neutro y listado en `docs/DECISIONES-PENDIENTES.md`. |
| `src/assistant.py` | Romero responde sobre términos, reembolsos y cancelaciones y enlaza la página. | Todas las páginas en Romero. |
| `tools/relativize.py` | Reconoce `terminos-de-uso` en la vista previa. | Vista previa. |
| `tools/package.py` (nuevo) | Crea el ZIP público sin `privado/`; falla si un recurso protegido aparece fuera (por nombre o por contenido idéntico) y reverifica el ZIP. | Evitar publicar archivos de pago por accidente. |
| `docs/` | `CHECKLIST-PUBLICACION.md` (solo técnico), `DECISIONES-PENDIENTES.md`, `TAREAS-ETAPA-FINAL.md`, `REVISION-LEGAL-OPCIONAL.md` (separada). Se retiró de la lista técnica la revisión legal. Se corrigió la nota de precios: el 12.99/`VA4SE3UYS3BBS` proviene del plan previo de Equilibrio, no del README ni del Worker. | Solicitud. |

## Resultados de pruebas (ejecutadas en este entorno, Chromium, 2026-10-27)
**Pasaron:** build reproducible (2 builds, 207 archivos idénticos) · 32 páginas ES/EN: enlaces internos, assets, anclas, `lang`, título, descripción, canonical, hreflang, Open Graph, `noindex` solo en acceso/cuestionario/jardín-app, sitemap sin páginas noindex, robots · 64 cargas (escritorio 1440 y móvil 390) sin errores JS/consola, sin imágenes rotas ni desbordamiento horizontal, menú móvil y Esc · buscador ES/EN · axe-core WCAG 2 A/AA en todas las páginas: 0 infracciones · contacto (27 comprobaciones) · MailerLite (9) · acceso/cuestionario (20) · jardín: PDF real generado (≈348 KB, cabecera `%PDF-`) en ES y EN, validación, follow.it (16).
**Requieren servicio real (NO verificados):** PayPal (pago, IPN, Auto-return), Worker (`/api/*`, cookie firmada, protección de `/privado/*`), entrega real de MailerLite/follow.it, envío de correo del contacto (no hay endpoint). Las respuestas de red usadas en las pruebas son simulaciones del navegador para probar la lógica del cliente.

## Pendientes
**Defectos de código:** ninguno conocido.
**Decisiones suyas:** `docs/DECISIONES-PENDIENTES.md` (políticas de cancelación/reembolso/acceso y precios/botones vs. Worker).
**Etapa final (no realizada):** `docs/TAREAS-ETAPA-FINAL.md` (Worker, PayPal real, correo real, dispositivos reales, enlace de Amazon).
**Aparte, opcional:** `docs/REVISION-LEGAL-OPCIONAL.md`.

## v20 (ensamblado desde el repositorio)
| Cambio | Detalle |
|---|---|
| Worker | Se incorporó el Worker de `saludintegral-deploy.zip` (hábitos 9.99 + equilibrio 12.99). **Nuevo:** producto `jardin` (USD 25) con `/api/jardin/*`, `/privado/jardin/*`, cookie `si_jardin`, KV `j:`; `PRICE_JARDIN` en `wrangler.jsonc`. |
| Jardín | Los 7 scripts del juego pasaron de `static/jardin/` a `static_privado/jardin/`; el juego se genera en `dist/privado/jardin/{es,en}/`. La URL pública `/mi-jardin-digestivo/jardin/` es ahora la página de acceso (misma ruta). `static/js/mapa-acceso.js` acepta `cfg.api`. |
| Equilibrio | Se integró la app (`app_equilibrio/`, `static_privado/equilibrio/pdf.js`, fuente en `equilibrio/`). Cliente recompilado con `api:"/api/equilibrio"`. Precio/botón en todo el sitio: USD 12.99 / `VA4SE3UYS3BBS`; se quitó ₡6.600/SINPE de este producto. |
| Pruebas | `tests/worker.js` (las 19 recuperadas + casos nuevos del Jardín), `tests/e2e/pago-jardin.js`, `tests/e2e/pago-equilibrio.js`; `run_all.sh` levanta `wrangler dev --local`. `tools/package.py` revisa subcarpetas de `static_privado/`. |
