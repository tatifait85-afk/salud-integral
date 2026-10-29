# Estado de v20 — qué es, de dónde sale cada pieza y qué es código nuevo

**Esto NO es el «v19 original».** El v19 completo (generador + Worker de tres productos + 36 pruebas del Worker) no existe en el repositorio ni en su historial (cinco ZIP, todos revisados). v20 se armó con lo que sí existe y se declara pieza por pieza:

| Pieza | Origen | Estado |
|---|---|---|
| Generador del sitio (`src/`, `static/`, `tools/`, `docs/`) | Generador v17 (entregado antes) | Existente |
| Worker (`worker/src/index.js`, `wrangler.jsonc`, `package.json`, lock) | `saludintegral-deploy.zip` del repositorio | **Recuperado sin cambios** salvo lo de abajo |
| Producto Jardín en el Worker (`id: "jardin"`, `PRICE_JARDIN`) | — | **Código nuevo** (2 líneas, mismo patrón que equilibrio); probado en local |
| Acceso y juego del Jardín bajo `/privado/jardin/` | — | **Código nuevo** (el juego antes era público) |
| App de equilibrio (`equilibrio/`, `app_equilibrio/`, `static_privado/equilibrio/pdf.js`) | `equilibrio-para-v19-01.zip` | **Recuperado**; `pdf.js` idéntico byte a byte al original; solo cambia `"api":"/api/equilibrio"` en la configuración del cliente para coincidir con el Worker del repositorio |
| Pruebas del Worker (`tests/worker.js`) | Las 19 de `saludintegral-deploy.zip` + casos nuevos del Jardín | 19 recuperadas + **código nuevo** |
| Pruebas e2e de pago (`tests/e2e/pago-*.js`) | `e2e-pago.js` del paquete de equilibrio (adaptado) + Jardín nuevo | Adaptado / nuevo |
| Las «36 pruebas del Worker» del v19 | — | **No recuperables**; no se inventaron |

## Cómo reconstruir y probar
```
python3 src/build.py                # crea dist/ (con dist/privado/)
cd worker && npm ci                 # una vez
bash tests/run_all.sh               # build x2, auditoría, ZIP público, e2e, Worker local
python3 tools/package.py sitio-publico.zip   # ZIP público (sin privado/)
```
`worker/.dev.vars` (clave de PRUEBA local) lo crea y borra `run_all.sh`; **no se incluye en ningún ZIP**. La clave real (`TOKEN_SECRET`) nunca está en el proyecto.

## Lo que solo Tatiana puede hacer (no hay acceso desde aquí)
1. `cd worker && npx wrangler login` y `npx wrangler secret put TOKEN_SECRET` (cadena larga aleatoria).
2. Confirmar que el KV `PAGOS` (`4a6d28ce6fb14b6aacc661fb2bec7d86`, en `wrangler.jsonc`) existe en su cuenta; si no, `npx wrangler kv namespace create PAGOS` y poner el nuevo id.
3. `npx wrangler deploy` (cuando decida desplegar).
4. PayPal → aviso de pago instantáneo (IPN) a `https://www.saludintegral.site/api/ipn`; y retorno automático por botón: hábitos → `/tu-mapa-de-habitos/acceso/`, equilibrio → `/equilibrio/`, jardín → `/mi-jardin-digestivo/jardin/`.
5. Verificar con un pago real de cada producto (no se hizo ninguno) y probar correos reales (no se hizo).
