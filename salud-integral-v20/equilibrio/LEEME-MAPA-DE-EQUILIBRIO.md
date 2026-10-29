# Mi mapa de equilibrio / My Balance Map — Salud Integral

Producto nuevo y separado de "Tu mapa de hábitos". Aplicación bilingüe (ES/EN) + cuaderno PDF A4 de 13 a 16 páginas con campos editables.
Precio: USD 12.99 (enlace de PayPal ya creado: https://www.paypal.com/ncp/payment/VA4SE3UYS3BBS).

## Módulos (src/)
| Archivo | Qué hace |
|---|---|
| equilibrio-datos.js | Áreas, 25 tarjetas, textos ES/EN de la interfaz y del PDF |
| equilibrio-iconos.js | Iconos vectoriales (compartidos por pantalla y PDF) |
| equilibrio-mapa.js | Geometría del mapa circular (SVG y PDF) |
| equilibrio-motor.js | Reglas deterministas: agrupar, preguntas, acciones, seguimiento (sin IA) |
| equilibrio-pdf.js | Generador del PDF (jsPDF + pdf-lib para los campos editables) |
| equilibrio-pago.js | Pago: pregunta al Worker si hay acceso; en modo "prueba" deja descargar |
| equilibrio-ui.js / equilibrio.css | Pantallas y estilos |

## Salidas (python3 build/make_assets.py && python3 build/build.py)
- `dist/preview.html`, `dist/index.html`: todo en un archivo, descarga abierta (modo prueba, para revisar).
- `dist/sitio/equilibrio/index.html`: parte pública (exploración, mapa, vista previa). **No contiene el generador de PDF.**
- `dist/sitio/privado/equilibrio/pdf.js`: generador de PDF, fuentes y librerías. Solo lo entrega el Worker con cookie válida.

## Worker (worker/)
Un solo Worker recibe el único aviso IPN de la cuenta de PayPal y el MONTO decide el producto:
- US$ 9.99 → hábitos (rutas /api/acceso, /api/estado, /privado/*, cookie si_mapa, KV p:)
- US$ 12.99 → equilibrio (rutas /api/equilibrio/*, /privado/equilibrio/*, cookie si_equilibrio, KV e:)
Verifica con ipnpb.paypal.com, exige VERIFIED + Completed + receptor lolaita42@gmail.com + USD + monto exacto, ignora el resto,
maneja reembolsos, límite de 5 dispositivos y vencimiento de 30 días. Solo guarda la huella SHA-256 del número de transacción.

## Pruebas (todas pasan)
- `node tests/stress.js` (90 combinaciones de PDF), `node tests/e2e.js` (recorrido de la interfaz)
- Con `wrangler dev` (copiar `.dev.vars.ejemplo` a `.dev.vars`): `node tests/worker.js` y `node tests/e2e-pago.js`

## Pendiente para publicar (nada de esto se ha hecho)
1. KV `saludintegral-pagos` ya creado (id en worker/wrangler.jsonc). Falta definir el secreto `TOKEN_SECRET` (wrangler secret put TOKEN_SECRET).
2. Unir esta versión del Worker con la de hábitos (misma dirección de IPN) y desplegar.
3. En el enlace de PayPal de equilibrio: Auto-return URL = https://<dominio>/equilibrio/ (si PayPal envía ?tx=, la página verifica sola; si no, la persona escribe el número de su recibo).
4. Una compra real de prueba (US$ 12.99) antes de abrir al público.
