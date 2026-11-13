# Mi Plato Inteligente — Plan de implementación comercial

Fecha: 13 de noviembre de 2026. Actualizado el mismo día por la tarde, después de publicar la fase 1 y de la auditoría de acceso y pagos (`claude/auditoria-acceso-pagos-mi-plato.md`).

Fuentes revisadas: repositorio `tatifait85-afk/salud-integral` (rama `main`), Worker `saludintegral` (`salud-integral-v20/worker/src/index.js`), Worker `mi-plato-inteligente-api`, recursos de Cloudflare de la cuenta, página de prueba `/plato-prueba/` y documento `docs/plato-app-instalable.md`.

---

## 0. Estado actualizado (13/11/2026, tarde)

- **Fase 1 (PWA): hecha y publicada** en `/plato-prueba/` (commit `871879b`, versión `4103bd69` del Worker `saludintegral`).
- **Texto comercial: aprobado** (`claude/texto-producto-mi-plato.md`, versión 3).
- **Todas las decisiones de la sección 11 están tomadas** (sección 13).
- **Sigue la fase 2** (pago, acceso, protección de Gemini y ficha, publicados juntos). El orden vigente de las fases está en la sección 9.
- **El sitio no se puede regenerar con `build.py`:** las fuentes (`src/` en `main` y en la rama `v20-jardin-navegacion`) no coinciden con lo publicado, y `build.py` borra `dist/` entero. Los cambios se hacen directamente en los archivos publicados de `dist/` en `main`.
- **Ficha del producto:** se preparó en una copia de trabajo, pero no está en ninguna rama del repositorio. Hay que rehacerla.

---

## 1. Resumen ejecutivo

**La conclusión principal:** no hay que construir el sistema de pago y acceso desde cero. El sitio ya vende tres productos digitales (Mi Jardín Digestivo, Mi mapa de equilibrio y Tu mapa de hábitos) con un sistema propio que confirma el pago con PayPal, entrega el acceso y lo retira si hay reembolso. Mi Plato Inteligente puede entrar como cuarto producto de ese mismo sistema, con algunos ajustes porque es una aplicación de uso diario y no un producto que se usa una vez.

**Qué falta:**
1. Agregar Mi Plato al sistema de pago existente, con acceso de larga duración.
2. Proteger la aplicación y el servicio de Gemini para que solo los usen compradores.
3. La ficha comercial en la sección Alimentación (español e inglés).
4. Una copia de seguridad sencilla de los perfiles (archivo para guardar y recuperar).
5. Apartados de privacidad y términos, pruebas finales y lanzamiento.

**Ya hecho:** la parte instalable (PWA), publicada el 13 de noviembre de 2026.

**Complejidad:** media. Sin costos fijos nuevos.

---

## 2. Estado actual (auditoría)

### 2.1 Cómo está construida la aplicación

| Aspecto | Estado |
|---|---|
| Tecnología | HTML y JavaScript propios, sin librerías. Un solo `index.html` más `platos.js`, `recetas.js`, `reglas.js`, `ingredientes.js` y `armador.js`. |
| Alojamiento | Archivos estáticos dentro del Worker `saludintegral` de Cloudflare (carpeta `dist/plato-prueba/`). |
| Motor de recetas | Propio y local (215 recetas, reglas en el dispositivo). Funciona sin internet. |
| Gemini | Opcional («Receta más personalizada (con IA)»), a través del Worker `mi-plato-inteligente-api` en `api.saludintegral.site`. |
| Diseño responsive | Revisado en 7 resoluciones (1920 a 360 px), sin desbordes. |
| Idiomas | Español e inglés completos (botones ES / EN). |

### 2.2 Instalación (PWA)

| Requisito | Estado |
|---|---|
| Manifiestos (`manifest.webmanifest` y `manifest-en.webmanifest`) | Publicados. |
| Service worker (`sw.js`) | Publicado. Guarda 531 archivos para uso sin conexión. |
| Íconos de app | `icon-app-v2-192.png`, `icon-app-v2-512.png`, `icon-app-v2-180.png` (Apple) y `favicon-app-v2-48.png`. |
| Botón «Instalar la aplicación» | Publicado (Android y computadora con el aviso del navegador; iPhone, iPad y Safari de Mac con instrucciones). |
| Funcionamiento sin conexión | Publicado. La receta con IA avisa que necesita conexión. |
| Pruebas | 115 automáticas con emulación. Falta la instalación en un iPhone, un Android y una tableta reales. |

### 2.3 Almacenamiento

| Dato | Dónde se guarda |
|---|---|
| Perfiles (hasta 5), respuestas, preferencias, ingredientes, comida elegida | `localStorage`, clave `mpi-v1`, solo en el dispositivo |
| Fotografía de perfil | `IndexedDB`, base `mpi-fotos`, solo en el dispositivo (320 px) |
| Resultados y menú de 7 días | Se recalculan a partir de las respuestas; no hace falta guardarlos |
| Recetas de Gemini | No se guardan |

Al cerrar y volver a abrir, todo se conserva en ese navegador. **Riesgo:** si la persona borra los datos del navegador, cambia de teléfono o desinstala la aplicación, pierde sus perfiles. Hoy no hay copia de seguridad.

### 2.4 Qué necesita internet

- La primera vez que se abre (y para recibir actualizaciones).
- La confirmación del pago.
- La receta personalizada con Gemini.
- Los artículos del blog en «Consejos y recursos».

Todo lo demás (cuestionario, recetas propias, menú de 7 días, lista de compras) funciona sin conexión.

### 2.5 PayPal y el sistema de pago que ya existe

El Worker `saludintegral` ya tiene:

- **Aviso de PayPal (IPN) en `/api/ipn`:** cada aviso se verifica con PayPal (`VERIFIED`), se comprueba que el receptor sea su cuenta y que la moneda sea USD. **El monto decide a qué producto pertenece el pago.**
- **Registro en KV `saludintegral-pagos` (enlace `PAGOS`):** solo una huella del número de transacción, sin datos personales.
- **Reembolsos y reversiones:** el acceso se retira automáticamente.
- **Página de acceso:** la persona escribe el «ID de transacción» de su recibo de PayPal (o PayPal la devuelve con `?tx=`), y el Worker entrega una cookie firmada (`HttpOnly`, `Secure`) que abre las páginas privadas (`/privado/...`).
- **Límites actuales:** hasta 5 dispositivos por compra (`MAX_REDEEMS=5`), plazo de 30 días para canjear (`REDEEM_DAYS=30`) y cookie de 24 horas (`TOKEN_HOURS=24`).

Botones de PayPal (enlaces `paypal.com/ncp/payment/...`):

| Producto | Precio | Enlace |
|---|---|---|
| Mi Jardín Digestivo | US$25 | `CJMKXJ3MD2RWJ` |
| Mi mapa de equilibrio | US$12,99 | `VA4SE3UYS3BBS` |
| Tu mapa de hábitos | US$9,99 | `QR4TYYLX4AYHC` |
| **Mi Plato Inteligente** | US$39,99 | `SNT9G9HCGJ5XU` (el Worker todavía no reconoce este monto) |

### 2.6 Protección de acceso actual de Mi Plato

**Ninguna.** `/plato-prueba/` es pública: cualquiera con el enlace la usa completa, incluida la receta con IA. El detalle está en la auditoría.

### 2.7 Infraestructura de Cloudflare disponible

| Recurso | Uso |
|---|---|
| Worker `saludintegral` | Sitio, pagos, acceso, contacto. **Se reutiliza.** |
| Worker `mi-plato-inteligente-api` | Gemini (clave secreta `GEMINI_API_KEY`, control de origen y límite de solicitudes). |
| Worker `saludintegral-ipn-temporal` | Diagnóstico antiguo de PayPal. No se usa para esto. |
| KV `saludintegral-pagos` | Registros de pago. **Se reutiliza.** |
| Envío de correo (`EMAIL`) | Solo puede escribir a su propio correo verificado, **no a los compradores**. |
| Builds de Cloudflare | Disparador `35de09dc…` usado para desplegar. |
| D1 (base de datos) | No hay ninguna. **No hace falta.** |

---

## 3. Instalación por dispositivo

| Dispositivo | Cómo se instala |
|---|---|
| **Android (Chrome)** | Botón «Instalar la aplicación» o menú ⋮ → «Instalar app». Ícono en la pantalla de inicio, abre sin barra del navegador. |
| **iPhone y iPad (Safari)** | Compartir → «Añadir a pantalla de inicio». En iPhone no existe un botón automático; el botón muestra las instrucciones. |
| **Windows (Chrome y Edge)** | Ícono de instalar en la barra de direcciones o botón «Instalar la aplicación». Queda en el menú Inicio y el escritorio, en ventana propia. |
| **Mac** | Chrome/Edge: igual que Windows. Safari 17 o posterior: Archivo → «Añadir al Dock». |
| **Tabletas** | Igual que su sistema (Android o iPad). |

Todo esto está publicado desde la fase 1. Falta comprobarlo en dispositivos reales.

---

## 4. Instalar no es lo mismo que tener permiso

- **Instalar** solo pone un ícono que abre la aplicación. Cualquiera puede instalar una página web.
- **Tener permiso (autorización)** es lo que impide usar el producto sin comprarlo. Lo da el Worker después de confirmar el pago.

Por eso la aplicación comprada debe vivir en una dirección protegida (como `/privado/jardin/` hoy) y el Worker debe negar los archivos a quien no tenga una cookie válida.

---

## 5. Compra y entrega recomendadas

1. La persona entra a Salud Integral → Alimentación → ficha de **Mi Plato Inteligente**.
2. Pulsa el botón de PayPal (US$39,99, precio único que no coincide con 25, 12,99 ni 9,99, porque el monto identifica el producto).
3. Paga en la página de PayPal. PayPal la devuelve a la **página de acceso de Mi Plato** con `?tx=…`. Si no la devuelve, la persona escribe el «ID de transacción» de su recibo.
4. El Worker confirma el pago (aviso IPN verificado) y entrega el acceso en ese dispositivo.
5. La página de acceso muestra «Instale la aplicación» con las instrucciones de su dispositivo.
6. En los demás dispositivos (hasta 5), la persona abre la página de acceso y escribe el mismo ID de transacción.

**Correo al comprador:** el envío de correo de Cloudflare no puede escribir a los clientes. La alternativa gratuita es poner en la descripción del botón de PayPal (que va en el recibo de PayPal) el enlace de la página de acceso y la instrucción de guardar el ID de transacción. No hace falta un servicio de correo.

### Ajustes necesarios al sistema actual para una aplicación de uso diario

| Ajuste | Por qué |
|---|---|
| Cookie de larga duración para Mi Plato, renovada en cada uso, en vez de 24 horas | Con 24 horas, la persona tendría que volver a escribir el ID de transacción cada día, y cada vez gastaría una de las 5 activaciones. |
| Plazo de 3 meses para activar dispositivos, en vez de 30 días | Decisión tomada. |
| Registro del pago sin vencimiento, en vez de 400 días | El acceso es de por vida. |
| Ruta privada propia: `/privado/plato/` con prefijo `l:` en KV y cookie `si_plato` | Mismo patrón que el jardín; los productos no se mezclan. Su ruta se revisa antes que la regla general `/privado/` de Tu mapa de hábitos. |
| Acceso válido sin conexión | El service worker deja usar la versión guardada; al volver la conexión, el Worker revisa si hubo reembolso. |

### Recuperar el acceso

- **Cambio de dispositivo:** escribir otra vez el ID de transacción en la página de acceso (cuenta como un dispositivo más, hasta 5, dentro del plazo de 3 meses).
- **Si pierde el ID:** está en el correo de recibo de PayPal.
- **Después de los 3 meses:** pendiente de su decisión (ver sección 13).

### Problemas de pago y reembolsos

- Pago «pendiente» (eCheck): no da acceso hasta que PayPal lo complete; la página espera y lo explica.
- Reembolso o reversión: el acceso se retira solo, en la siguiente conexión.
- Reversión cancelada: el acceso vuelve.

---

## 6. Almacenamiento: decisión

| Opción | Ventajas | Desventajas | Costo |
|---|---|---|---|
| **A. Solo en el dispositivo + copia de seguridad en archivo (aprobada)** | Sencillo, sin cuentas ni contraseñas, los datos de salud nunca salen del dispositivo, ya está hecho en su mayor parte | La persona debe guardar el archivo para pasar sus perfiles a otro dispositivo | US$0 |
| B. Sincronización en la nube (KV o D1) | Los perfiles aparecen solos en todos los dispositivos | Requiere cuentas o códigos, guarda datos de salud en un servidor (más obligaciones de privacidad), más trabajo y mantenimiento | Gratis dentro del plan de Cloudflare, pero mucho más complejo |

**Aprobada la opción A**, con la fotografía de perfil incluida en la copia. Se agregan en «Mis datos guardados» dos botones: «Guardar copia de mis perfiles» (descarga un archivo) y «Recuperar desde una copia» (lo carga en el nuevo dispositivo).

También conviene pedir al navegador «almacenamiento persistente» (`navigator.storage.persist()`) para que no borre los datos por falta de espacio.

---

## 7. Seguridad y privacidad

| Tema | Situación | Recomendación |
|---|---|---|
| Acceso al producto | Hoy es público | Mover la aplicación de venta a `/privado/plato/`, protegida por el Worker, y proteger también `/plato-prueba/` |
| Integración con PayPal | Segura en su diseño: IPN verificado con PayPal, receptor y moneda comprobados, sin datos de pago en el sitio. Nunca se ha comprobado con una compra real registrada | Reutilizar; agregar el precio de Mi Plato y probar con una compra real |
| Clave de Gemini | Bien protegida: secreto del Worker, en encabezado, nunca en el navegador | Mantener |
| Uso de Gemini por terceros | El control de origen se puede saltar desde fuera del navegador; solo lo frena el límite de solicitudes | Que la página llame a una ruta del Worker `saludintegral` que exija la cookie de comprador; cerrar el acceso directo a `api.saludintegral.site/api/generate`; aceptar datos estructurados en lugar de texto libre |
| Datos de salud y medicamentos | Se quedan en el dispositivo. Solo salen si la persona pulsa la receta con IA | Mantener; revisar que lo enviado a Gemini no incluya nombres de perfil |
| Servidor | KV guarda solo una huella del número de transacción, sin nombre, correo ni datos de salud | Mantener |
| Copias sin conexión ya guardadas | Quien abrió `/plato-prueba/` desde la fase 1 tiene una copia completa en su navegador | Publicar un service worker que borre esas copias y que nunca guarde respuestas «No autorizado» |
| Política de privacidad | Existe en el sitio | Agregar un apartado de Mi Plato Inteligente (datos en el dispositivo, uso de Gemini, copia de seguridad) |

---

## 8. Ficha comercial en Salud Integral

- **Dónde:** páginas propias `/mi-plato-inteligente/` y `/en/my-smart-plate/`, con tarjeta en Alimentación (`/alimentacion/` y `/en/mindful-eating/`) y en Recursos, en ambos idiomas, más el menú, el buscador y el sitemap.
- **Cómo se construye:** directamente en los archivos publicados de `dist/` en `main`. No se usa `build.py` (ver sección 0).
- **Marca:** «Salud Integral» en español y «Holistic Wellness» en inglés.
- **Contenido:**
  - Imagen de presentación (`producto-plato.webp` y `producto-plato-en.webp`, a partir de «Mi Plato Inteligente Logo(1).png» e «icono eng.png» del repositorio `plato`).
  - Descripción y beneficios.
  - Qué recibe exactamente.
  - Precio y botón de PayPal.
  - Instrucciones de activación e instalación.
  - Enlace «¿Ya pagó?» hacia la página de acceso.
- **Textos:** los aprobados en `claude/texto-producto-mi-plato.md`.
- **Publicación:** junto con la fase 2, nunca antes.

---

## 9. Plan de trabajo por fases (orden vigente)

### Fase 1 — Aplicación instalable (PWA) — HECHA
Publicada el 13 de noviembre de 2026. Detalle en `plato-app-instalable.md`. Pendiente: instalación en un iPhone, un Android y una tableta reales.

### Fase 2 — Pago, acceso, Gemini y ficha (se publican juntos)
1. **Worker de pagos:** agregar el producto «plato» (precio 39.99, prefijo `l:`, cookie `si_plato`, rutas `/api/plato/acceso`, `/api/plato/estado` y `/privado/plato/`). Cookie larga renovada con el uso, 3 meses para activar y registro sin vencimiento.
2. **Mover la aplicación** a `/privado/plato/` y proteger `/plato-prueba/` (podrá entrar cualquier comprador).
3. **Service worker:** no guardar respuestas «No autorizado», revisar el acceso con conexión y publicar en `/plato-prueba/` una versión que borre las copias sin conexión ya guardadas. `sw.js` debe seguir accesible para que los navegadores reciban esa actualización.
4. **Gemini:** llamarlo a través del Worker `saludintegral` exigiendo la cookie de comprador; cerrar el acceso directo a `api.saludintegral.site/api/generate`; aceptar datos estructurados en lugar de texto libre.
5. **Página de acceso** (reutilizando `mapa-acceso.js`), dirección de retorno en el botón de PayPal y enlace «¿Ya pagó?» en la ficha.
6. **Pruebas:** con avisos simulados (pago correcto, pendiente, monto distinto, reembolso, límite de dispositivos); después, una compra real de US$39,99, activación en 2 dispositivos (incluido un iPhone, en Safari y en la aplicación instalada), reembolso y comprobación de que el acceso se retira.
7. **Publicar todo junto** (ficha y fase 2).

- **Archivos:** `worker/src/index.js`, `worker/wrangler.jsonc`, `dist/` (aplicación, página de acceso y ficha).
- **Servicios externos:** PayPal. **Costo:** US$0 fijo; PayPal cobra su comisión por venta.

### Fase 3 — Copia de seguridad de perfiles
- Botones «Guardar copia de mis perfiles» y «Recuperar desde una copia» en «Mis datos guardados», con la fotografía de perfil; pedir almacenamiento persistente.
- **Pruebas:** guardar en un dispositivo y recuperar en otro (Android → iPhone, computadora → teléfono); archivo dañado o de otra versión.

### Después
- Apartados de Mi Plato Inteligente en la política de privacidad y en los términos.
- Pruebas finales de punta a punta en dispositivos reales: descubrir, comprar, acceder, instalar, usar sin conexión, segundo dispositivo, reembolso.
- Lanzamiento, con el procedimiento de Cloudflare Builds.

---

## 10. Costos estimados

| Concepto | Costo |
|---|---|
| Cloudflare (Workers, KV, alojamiento): el uso esperado cabe en el plan actual | US$0 adicional |
| PayPal | Comisión por cada venta (la de su cuenta); sin costo fijo |
| Gemini | Depende de su plan con Google. El nivel gratuito tiene límites y fallas por saturación (ya vistas). Como se vende con IA incluida, puede convertirse en un costo por uso. |
| Correo a compradores | US$0 (se usa el recibo de PayPal) |
| Base de datos o cuentas de usuario | No se necesitan |

---

## 11. Decisiones solicitadas

Las ocho decisiones que se pidieron en la primera versión de este plan (botón y precio, duración del acceso, dispositivos, plazo de activación, receta con IA, copia de seguridad, `/plato-prueba/` y direcciones de la ficha) están tomadas. Ver la sección 13.

---

## 12. Riesgos

| Riesgo | Cómo se maneja |
|---|---|
| **iPhone y iPad:** la aplicación añadida a la pantalla de inicio puede no compartir cookies ni datos con Safari | La página de acceso también estará dentro de la aplicación instalada, para escribir el ID de transacción allí. Se confirma en un iPhone real en las pruebas de la fase 2. |
| Datos que la persona escribió en Safari antes de instalar pueden no aparecer en la app instalada (iPhone) | Recomendar instalar primero; la copia de seguridad (fase 3) lo resuelve. |
| El aviso de PayPal puede tardar minutos | La página ya espera y reintenta (hasta 90 segundos) y explica la demora. |
| Los avisos de PayPal pueden no estar llegando al Worker | El registro de pagos tiene 0 registros. Hay que revisar la configuración de IPN en PayPal antes de la compra de prueba. |
| Otro enlace de pago de su cuenta con el mismo precio activaría Mi Plato | Precio único para Mi Plato (US$39,99). |
| Gemini saturado o con costo | El motor propio funciona sin Gemini; la IA queda como extra. |
| Pérdida de datos por borrar el navegador | Copia de seguridad y almacenamiento persistente. |
| Copias sin conexión guardadas antes de proteger la aplicación | Service worker que las borra (fase 2, paso 3). |

---

## 13. Decisiones tomadas (13/11/2026)

- **Botón de PayPal de Mi Plato:** https://www.paypal.com/ncp/payment/SNT9G9HCGJ5XU
- **Precio:** US$39,99.
- **Acceso:** pago único (de por vida), válido para 5 dispositivos por compra.
- **Perfiles:** solo 5 perfiles por compra (ya implementado).
- **Lanzamiento:** de pago. No habrá versión gratuita abierta.
- **Receta con IA (Gemini):** incluida, solo para compradores.
- **Copia de seguridad:** aprobada (opción A: archivo para guardar y recuperar, sin cuentas), con la fotografía de perfil.
- **Plazo para activar dispositivos nuevos:** 3 meses.
- **`/plato-prueba/`:** se protege, no se retira. Puede entrar cualquier comprador.
- **Direcciones de la ficha:** `/mi-plato-inteligente/` y `/en/my-smart-plate/`.
- **Publicación de la ficha:** junto con la fase 2, nunca antes.
- **Tarjeta de Mi Plato Inteligente / My Smart Plate:** en Alimentación, en las dos versiones del sitio (español e inglés).
- **Marca en la ficha en inglés:** «Holistic Wellness».
- **«¿Hay algo que prefiera evitar?»:** no se pide ícono.

**Aún por decidir:**
- Si un comprador pierde el acceso de un dispositivo después de los 3 meses (borró el navegador o cambió de teléfono), ¿se le reactiva a mano o no?
