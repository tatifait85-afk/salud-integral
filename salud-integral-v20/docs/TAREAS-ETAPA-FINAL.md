# Tareas de la etapa final (NO realizadas; no se declaran completadas)

El código del sitio ya está preparado, pero lo siguiente requiere servicios reales y **no ha sido ejecutado ni verificado**:

1. **Configuración del Worker:** crear el KV (`PAGOS`), `wrangler secret put TOKEN_SECRET`, dominio/ruta, variables (`PRICE`, `PAYPAL_RECEIVER`, `REDEEM_DAYS`, `MAX_REDEEMS`, `TOKEN_HOURS`) según las decisiones de `DECISIONES-PENDIENTES.md` (B), y soportar los demás productos. Desplegar `dist/` completo (con `privado/`) a través del Worker.
2. **Verificación de PayPal en producción:** pago real → IPN a `/api/ipn` (verificación con PayPal) → `/api/acceso` → cookie → `/api/estado` → cuestionario → PDF. Probar también reembolso (acceso desactivado), pago pendiente, número de transacción inválido y límite de usos. Configurar Auto-return hacia la página de acceso. Una devolución a la página de agradecimiento nunca debe contar como pago.
3. **Protección de recursos de pago:** confirmar que `/privado/*` devuelve 401/403 sin cookie y 200 con cookie. Desde v20 el juego de Mi Jardín Digestivo vive en `/privado/jardin/{es,en}/` (scripts en `/privado/jardin/*.js`), protegido por la cookie `si_jardin`; confirmarlo también en el dominio real. Siguen públicos a propósito `/assets/jardin/` (imágenes, fuentes y librerías del juego, sin la lógica) y la página de acceso `/mi-jardin-digestivo/jardin/`. Probado solo en local.
4. **Pruebas con correo real:** (a) MailerLite: suscribirse desde el programa gratuito y ver la lista y el correo de confirmación; (b) follow.it desde el jardín: recibir el correo de confirmación; (c) formulario de contacto: crear el endpoint (contrato en `DEPLOY.md`), construir con `CONTACT_ENDPOINT` y probar un envío real.
5. **Dispositivos reales:** móvil real, Safari y Firefox.
6. **Enlace de Amazon** `link.amazon/B04dLpuvb`: abrirlo y confirmarlo.
