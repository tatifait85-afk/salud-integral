# Desplegar el Worker `saludintegral` (hábitos + equilibrio)

En una terminal, dentro de la carpeta `worker/` (requiere Node.js):

```
npm i -g wrangler          # una sola vez
wrangler login             # abre el navegador; elija la cuenta 506webartesanal
wrangler secret put TOKEN_SECRET    # pegue un texto largo y aleatorio (distinto al de pruebas)
wrangler deploy
```

- El KV `saludintegral-pagos` ya está enlazado como `PAGOS` en `wrangler.jsonc`.
- `dist/` (el sitio ya construido) está en la carpeta de arriba; no hace falta Python.
- Esto publica en `https://saludintegral.506webartesanal.workers.dev`. No toca el dominio ni el Worker temporal.
- NO cambie todavía la URL de IPN en PayPal.
