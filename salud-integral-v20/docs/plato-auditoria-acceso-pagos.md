# Mi Plato Inteligente — Auditoría de acceso y pagos

Fecha: 13 de noviembre de 2026, 13:50. Solo revisión: no se modificó nada.

**Qué se revisó**
- El código del Worker `saludintegral` desplegado (versión `4103bd69`, el mismo que `worker/src/index.js` en `main`).
- Sus variables y secretos (solo los nombres) y el registro de pagos en KV `saludintegral-pagos`.
- El Worker `mi-plato-inteligente-api` (Gemini, en `api.saludintegral.site`).
- La aplicación publicada en `/plato-prueba/`.
- Pruebas de solo lectura contra producción, hechas desde el navegador.

**Lo que no pude revisar:** la cuenta de PayPal (la configuración del botón `SNT9G9HCGJ5XU` y la de los avisos IPN). Para eso necesito que usted me diga lo que ve allí.

---

## Conclusión

**Hoy Mi Plato Inteligente no está protegido.** Cualquier persona con la dirección `/plato-prueba/` puede usar toda la aplicación, incluida la receta con IA, sin pagar. Además, el Worker de pagos no reconoce Mi Plato: si alguien paga US$39,99, el pago se ignora y no se le entrega ningún acceso.

El sistema de pago y acceso de los otros tres productos está bien diseñado y sirve de base. Pero **nunca se ha comprobado con una compra real**: el registro de pagos está vacío (0 registros).

Una aclaración: la ficha del producto (`/mi-plato-inteligente/`) **todavía no está publicada**. La preparé solo en la copia de trabajo, y en el sitio da 404.

---

## Estado por punto

### 1. ¿El Worker gestiona y verifica los pagos de PayPal?
- **Implementado, para los otros 3 productos:**
  - Ruta `POST /api/ipn`.
  - Cada aviso se verifica con PayPal (`ipnpb.paypal.com` debe responder `VERIFIED`).
  - Se comprueba que el receptor sea `lolaita42@gmail.com` y que la moneda sea USD.
  - El monto decide el producto: US$25, US$12,99 o US$9,99.
- **Mi Plato no está implementado:**
  - No existe el producto «plato» ni la variable de precio 39.99.
  - Un aviso de US$39,99 cae en «cualquier otro monto se ignora».
- **Probado en producción hoy:** la ruta `/api/ipn` está activa (responde 405 a una consulta GET, como debe). Las rutas `/api/plato/acceso` y `/api/plato/estado` no existen (404).

### 2. ¿PayPal envía una confirmación verificable al Worker?
- **Mecanismo implementado:** IPN, con verificación de vuelta en PayPal. No se usan webhooks.
- **Configurado pero no verificado:**
  - Si en su cuenta de PayPal la dirección de avisos IPN es `https://saludintegral.site/api/ipn` y está activada.
  - Si los pagos hechos con enlaces `paypal.com/ncp/payment/...` generan avisos IPN.
- **Señal de alerta:** el registro de pagos tiene **0 registros**. Puede ser que nunca se haya vendido ninguno de los tres productos, o que los avisos no estén llegando.

### 3. ¿Se registra al comprador y se da acceso solo después de confirmar el pago?
- **Implementado (3 productos):**
  - Solo se registra un pago con estado `Completed`, verificado por PayPal y con el receptor, la moneda y el monto correctos.
  - Un pago pendiente (eCheck) no da acceso.
  - Se guarda solo una huella del número de transacción, sin nombre ni correo.
  - El acceso se entrega cuando la persona escribe su ID de transacción y ese pago está registrado.
  - Verifiqué en producción que un ID inventado recibe «pendiente» y ningún acceso.
- **Mi Plato:** no implementado.
- **No probado:** nunca se ha registrado un pago real.

### 4. ¿La aplicación está protegida contra quien conozca la URL?
- **No.** `/plato-prueba/` responde 200 a cualquiera, con la página, las recetas (`recetas.js`) y todas las imágenes.
- **Riesgo nuevo desde la publicación de hoy (fase 1):** quien abra la página guarda en su navegador una copia completa para usar sin conexión (531 archivos). Hay dos consecuencias:
  - Cuando se proteja la dirección, esas copias seguirán funcionando.
  - El service worker actual sirve primero lo guardado. Si el servidor empieza a negar archivos, su actualización fallaría y la copia vieja se quedaría.

  Esto hay que resolverlo en la fase 2 (ver paso 4).

### 5. ¿La autorización se comprueba en el servidor?
- **Sí, para los otros 3 productos:**
  - El Worker revisa una cookie firmada (HMAC con el secreto `TOKEN_SECRET`, `HttpOnly`, `Secure`).
  - Antes de entregar cualquier archivo de `/privado/...`, revisa también el estado del pago en KV.
  - Probado hoy: `/privado/jardin/` sin cookie responde 401.
- **Mi Plato:** no hay ningún control, ni en el servidor ni en JavaScript.

### 6. ¿Se impide el acceso directo a funciones y API protegidas?
- **No, en el caso de Gemini (`api.saludintegral.site/api/generate`):**
  - No exige ser comprador.
  - El control de origen solo actúa si la solicitud trae el encabezado `Origin`. Un programa o script que no lo envíe pasa.
  - Acepta cualquier texto libre de hasta 4.000 caracteres, así que podría usarse como un servicio de IA gratuito a costa de su cuenta de Google.
  - Lo único que lo frena es un límite de solicitudes por dirección IP.

  (Esto lo encontré leyendo el código desplegado; no lo probé.)
- La ruta `/api/health` es pública, pero solo dice si la clave existe, nunca su valor.
- `/privado/plato/` responde 401 solo porque la regla de Tu mapa de hábitos protege todo `/privado/`. No hay ningún contenido de Mi Plato allí.

### 7. ¿Acceso de por vida, 5 dispositivos y 5 perfiles?
Lo que está configurado hoy no corresponde a lo decidido:

| Valor | Hoy (los 3 productos) | Decidido para Mi Plato |
|---|---|---|
| Duración de la cookie (`TOKEN_HOURS`) | 24 horas | Larga y renovada con el uso |
| Plazo para activar (`REDEEM_DAYS`) | 30 días | 3 meses |
| Vida del registro del pago en KV | 400 días (después se borra) | Permanente |
| Dispositivos (`MAX_REDEEMS`) | 5 | 5 |

- **Problema de los dispositivos:** con la cookie de 24 horas, quien vuelva al día siguiente tiene que escribir otra vez su ID de transacción, y eso **gasta otra de las 5 activaciones**. En pocos días se agotarían.
- **Perfiles:** el límite de 5 existe solo dentro de la aplicación (en el dispositivo). No es una barrera de seguridad, y es aceptable así porque los datos de los perfiles nunca salen del dispositivo.

### 8. Qué pasa en cada caso hoy

| Caso | Mi Plato hoy | Otros productos (como están diseñados) |
|---|---|---|
| Entra sin pagar | Usa todo, incluida la IA | 401 «No autorizado» |
| Pago pendiente o fallido | Da igual: la aplicación está abierta | No hay acceso hasta que PayPal confirme |
| Paga US$39,99 | El aviso se ignora y no recibe acceso; además no existe página de acceso | — |
| Reembolso | No aplica | El acceso se retira en la siguiente revisión |
| Comparte el acceso | Basta con pasar la dirección | Quien tenga el ID de transacción puede activar hasta 5 dispositivos dentro del plazo |

---

## Resumen por categoría

**Implementado y funcionando en producción (comprobado hoy, solo lectura)**
- La ruta de avisos de PayPal está activa.
- Un ID de transacción inventado no da acceso.
- `/privado/jardin/` niega la entrada sin cookie.
- El servicio de Gemini funciona y tiene la clave configurada.

**Implementado pero nunca probado con dinero real**
- Toda la cadena de pago de los 3 productos: aviso de PayPal, registro, activación, cookie y reembolso.

**Configurado pero no verificado (depende de PayPal)**
- La dirección de avisos IPN en su cuenta.
- Si los enlaces de pago generan IPN.
- El precio y la dirección de retorno del botón `SNT9G9HCGJ5XU`.

**Falta (para Mi Plato)**
- El producto en el Worker y la página de acceso.
- Proteger la aplicación.
- Proteger Gemini.
- Las duraciones correctas.
- Manejar las copias sin conexión.
- Publicar la ficha.
- Las pruebas reales.

---

## Pasos concretos que faltan

1. **PayPal (usted, ahora):** revise en su cuenta, en «Notificaciones de pago instantáneas (IPN)»:
   - Que estén activadas y que la dirección sea `https://saludintegral.site/api/ipn`.
   - El «Historial de IPN»: ¿hay avisos enviados y con qué resultado?

   Díganos también si ha habido ventas reales de Mi Jardín Digestivo, Mi mapa de equilibrio o Tu mapa de hábitos. Si las hubo, los avisos no están llegando, y eso afecta también a esos productos.
2. **Worker de pagos (fase 2):**
   - Agregar el producto «plato»: precio 39.99, prefijo `l:`, cookie `si_plato`, rutas `/api/plato/acceso`, `/api/plato/estado` y `/privado/plato/`.
   - Su ruta privada se debe revisar antes que la regla general `/privado/` de Tu mapa de hábitos.
   - Duraciones propias de Mi Plato: cookie larga renovada en cada uso, 3 meses para activar y registro del pago sin vencimiento.
3. **Proteger la aplicación:** servir Mi Plato solo desde `/privado/plato/` y proteger también `/plato-prueba/`. Para eso hace falta su decisión: ¿solo usted, o cualquier comprador?
4. **Copias sin conexión:**
   - Adaptar el service worker para que nunca guarde respuestas «No autorizado» y para que revise el acceso cuando haya conexión.
   - Publicar en `/plato-prueba/` una versión final del service worker que borre las copias guardadas.
   - `sw.js` debe seguir accesible para que los navegadores reciban esa actualización.
5. **Gemini:**
   - Que la página llame a una ruta del Worker `saludintegral` que exija la cookie de comprador.
   - Cerrar el acceso directo a `api.saludintegral.site/api/generate`, para que solo responda a ese Worker.
   - Aceptar datos estructurados en lugar de texto libre.
6. **Página de acceso:**
   - Crearla, reutilizando el modelo de los otros productos.
   - Poner su dirección como retorno del botón de PayPal.
   - Agregar el enlace «¿Ya pagó?» en la ficha.
7. **Pruebas:**
   - Con avisos simulados en local: pago correcto, pendiente, monto distinto, reembolso y límite de dispositivos.
   - Después, una compra real de US$39,99 hecha por usted, con estos pasos:
     - comprobar que aparece el registro en KV;
     - activar 2 dispositivos, entre ellos un iPhone (Safari y la aplicación instalada);
     - reembolsar;
     - comprobar que el acceso se retira.
8. **Publicar la ficha** junto con todo lo anterior, no antes.
