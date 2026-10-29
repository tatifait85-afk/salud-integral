# Tu mapa de hábitos — guía de la implementación (versión local, sin desplegar)

## Qué se agregó
- `src/mapa.py` — páginas: venta (`/tu-mapa-de-habitos/`, `/en/your-habit-map/`), acceso (`.../acceso/`) y cuestionario (`.../cuestionario/`, `.../questionnaire/`). Acceso y cuestionario llevan `noindex`.
- `static_privado/` — datos y reglas (`mapa-datos.js`, `mapa-motor.js`), generador del PDF (`mapa-pdf.js`) y jsPDF 2.5.2 (MIT). `build.py` los publica en `dist/privado/` junto con las fuentes y el logo (`pdf_assets/`) incrustados.
- `static/js/mapa-acceso.js`, `static/js/mapa-cuestionario.js`, `static/css/mapa.css`.
- `worker/` — Cloudflare Worker (`src/index.js`) + `wrangler.jsonc`: recibe el IPN de PayPal, lo verifica con PayPal, guarda solo un código del pago y entrega `/privado/*` solo con cookie firmada.
- El botón de PayPal es el ya existente (`LINKS["paypal_mapa"]` en `src/config.py`).

## Probar en local
```
cd src && python3 build.py                 # genera dist/
cd ../worker && npm i wrangler && npx wrangler dev --local --port 8788
```
Cree `worker/.dev.vars` (solo local, no se sube) con:
```
TOKEN_SECRET=<generado-en-tiempo-de-prueba>
PRUEBA_LOCAL=1
```
`PRUEBA_LOCAL=1` permite simular un pago sin PayPal únicamente en localhost:
```
curl -X POST localhost:8788/api/ipn -d 'txn_id=ABC123DEF4567890&payment_status=Completed&mc_currency=USD&mc_gross=9.99&receiver_email=lolaita42%40gmail.com'
```
Luego abra `http://localhost:8788/tu-mapa-de-habitos/acceso/` e ingrese `ABC123DEF4567890`.

## Reglas de acceso (ajustables en `wrangler.jsonc`)
Pago USD 9.99 a lolaita42@gmail.com, estado Completed, verificado por PayPal (VERIFIED). Canje hasta 30 días (`REDEEM_DAYS`), máx. 5 emisiones (`MAX_REDEEMS`), sesión de 24 h (`TOKEN_HOURS`). Reembolso o reversión revocan el acceso.

## Pendiente para producción (no hecho a propósito)
Crear KV y Worker en la cuenta definitiva, `wrangler secret put TOKEN_SECRET`, conectar el dominio, apuntar el IPN de PayPal a `/api/ipn` y cambiar el Auto-return a la página de acceso. Quitar el Worker temporal `saludintegral-ipn-temporal`.
