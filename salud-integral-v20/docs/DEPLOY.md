# Despliegue — saludintegral.site

## Qué se publica
Todo lo que genera `python3 src/build.py` está en `dist/`. **No se sube a mano `dist/privado/`** sin el Worker: contiene el motor, los datos y el generador de PDF de «Tu mapa de hábitos» (los archivos de pago). Solo el Worker (`worker/`) los entrega, y únicamente con una cookie firmada.

> ⚠️ Dependencia de despliegue: si `dist/` se sube a un hosting estático simple (sin el Worker), `/privado/*` queda **público**. Hoy el Worker lee esos archivos desde `dist/` (`worker/wrangler.jsonc` → `assets.directory: ../dist`, `run_worker_first: ["/api/*","/privado/*"]`), por eso el build los deja ahí. No se modificó el Worker en esta auditoría.

## Qué contiene cada ZIP
- `saludintegral-sitio-completo32.zip`: el sitio **público** (sin `privado/`). Sirve para revisar o para un hosting estático, pero **no** incluye los archivos de pago: con él solo, «Tu mapa de hábitos» no funcionará (el cuestionario queda en «no se pudo cargar», sin dar acceso).
- `generador-sitio-salud-integral-v16.zip`: el generador (fuente de verdad). Al ejecutar el build crea `dist/` **con** `dist/privado/`, que es lo que debe desplegar el Worker.

## Pasos
1. `python3 src/build.py` → crea `dist/` (reproducible: dos builds dan archivos idénticos).
   - Correo del formulario de contacto desde el servidor (opcional, cuando exista el endpoint): `CONTACT_ENDPOINT=/api/contacto python3 src/build.py`. Sin la variable, el formulario usa el respaldo `mailto:`.
2. ZIP público (sin archivos de pago): `python3 tools/package.py sitio-publico.zip` — es la única vía prevista; falla y no crea el ZIP si algún recurso protegido aparece fuera de `privado/`.
3. Comprobar: `cd worker && npm ci` (una vez) y `tests/run_all.sh` (node + playwright; `AXE=/ruta/axe.min.js` para accesibilidad). Ver `docs/ESTADO-V20.md`.
4. Desplegar **con el Worker** (Cloudflare): desde `worker/`, `npx wrangler deploy` (sube `dist/` como assets + el Worker). Antes, la etapa final del Worker (`docs/TAREAS-ETAPA-FINAL.md`; no realizada): KV, `TOKEN_SECRET` (`wrangler secret put TOKEN_SECRET`), dominio, IPN de PayPal hacia `/api/ipn`, Auto-return hacia la página de acceso.
5. Tras desplegar, probar en producción (`docs/TAREAS-ETAPA-FINAL.md`).

## Contrato del formulario de contacto (punto de integración listo)
`POST {CONTACT_ENDPOINT}` · `Content-Type: application/json` · cuerpo `{ "name", "email", "message", "lang": "es|en", "page": "/ruta/" }`.
Respuesta de éxito: HTTP 2xx con JSON `{ "ok": true }`. Cualquier otra cosa (HTTP ≥ 400, `ok` distinto de `true`, cuerpo no JSON, timeout de 15 s, red caída) muestra un error al visitante y conserva el mensaje. El servidor debe validar de nuevo, limitar la frecuencia y enviar el correo (la clave del servicio de correo va solo en el Worker, nunca en el cliente). El campo trampa `website` lo descarta el cliente; el servidor puede descartarlo también.

## Contratos del Worker que el sitio ya usa (sin cambios)
- Hábitos: `POST /api/acceso` `{tx}`, `GET /api/estado`, `/privado/*`. Equilibrio: `/api/equilibrio/{acceso,estado}`, `/privado/equilibrio/*`. Jardín: `/api/jardin/{acceso,estado}`, `/privado/jardin/*`. Respuesta: `{ok:true}` o `{ok:false, estado:"pendiente|reembolsado|limite|expirado|formato"}`.
- `POST /api/ipn` lo llama PayPal (no el sitio).

## Caché (`dist/_headers`)
`/assets/fonts/*` inmutable; css/js/img/jardin se revalidan cada hora (los archivos no llevan huella en el nombre); `/privado/*` `no-store` + `noindex`. `_headers` lo aplica Cloudflare para assets estáticos; las respuestas generadas por el Worker llevan los encabezados que el Worker ponga.
