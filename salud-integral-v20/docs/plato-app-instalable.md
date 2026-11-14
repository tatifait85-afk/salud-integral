# Mi Plato Inteligente: aplicación instalable (PWA)

Fecha: 2026-11-11; rehecho el 2026-11-13 con los íconos icon-app-v2. Complementa `plato-condiciones-salud-medicamentos.md` y `plato-investigacion-reglas-pendientes.md`.

Convierte la página de prueba (`dist/plato-prueba/`, vista previa en https://saludintegral.site/plato-prueba/) en una aplicación que se instala en el teléfono (Android y iPhone), la computadora y la tableta, y que funciona sin internet. No se integra a saludintegral.site: la vista previa sigue siendo la única dirección.

**Estado al 13/11/2026:** publicado. Los archivos están en `main` (commit `871879b`) y desplegados en https://saludintegral.site/plato-prueba/ con la versión `4103bd69-422d-4aed-b5d1-3b2cb80bddb7` del Worker `saludintegral`. Este documento describe lo publicado.

**Cambios previstos en la fase 2 (pago y acceso):** la aplicación pasará a `/privado/plato/`, `/plato-prueba/` quedará protegida (podrá entrar cualquier comprador) y el service worker se adaptará para no guardar respuestas «No autorizado», revisar el acceso cuando haya conexión y borrar las copias sin conexión ya guardadas. Al hacerlo habrá que revisar `start_url` y `scope` de los manifiestos y actualizar este documento.

## Fase 2: acceso solo para compradores (preparada el 14/11/2026, sin publicar)

En la rama `ficha-mi-plato`. Probada con el Worker en local y avisos de PayPal simulados (91 pruebas) y en Chrome (24 pruebas).

- **Dos copias de la aplicación**, iguales salvo el manifiesto: `/privado/plato/` (la de venta; `id` y `start_url` `/privado/plato/`) y `/plato-prueba/` (para probar cambios antes de pasarlos a la de venta). Las dos piden la cookie de comprador `si_plato`. Al cambiar algo, se hace en `/plato-prueba/` y luego se copia la carpeta a `/privado/plato/` sin tocar sus manifiestos.
- **`scope` de los manifiestos: `/`**, para que la página de acceso se abra dentro de la aplicación instalada (iPhone y iPad no comparten la cookie entre Safari y la aplicación).
- **Archivos públicos** en las dos carpetas (el navegador los pide sin cookie): `sw.js`, los manifiestos y los íconos `icon-app-v2-*` y `favicon-app-v2-*`. Todo lo demás pide la cookie; quien abre la página sin acceso va a `/mi-plato-inteligente/acceso/` (o a `/en/my-smart-plate/access/` si el navegador está en inglés).
- **Service worker (`VERSION` 2026-11-14.1):**
  - Solo guarda la copia sin conexión si el Worker confirma el acceso (`/api/plato/estado`), y nunca guarda respuestas que no sean 200.
  - Al abrir la aplicación con conexión, pide la página al servidor (que revisa la cookie y la renueva); si tarda más de 4 segundos o no hay conexión, usa la copia guardada.
  - Si el servidor dice que no hay acceso (sin cookie o reembolso), borra todas las copias, se da de baja y lleva a la página de acceso.
  - Se activa de inmediato (`skipWaiting`), para que las copias viejas de `/plato-prueba/` guardadas desde la fase 1 se borren en cuanto el navegador vea el `sw.js` nuevo.
- **Página de bienvenida después de la compra:** `bienvenida/` (español) y `welcome/` (inglés), dentro de cada copia de la aplicación y protegidas. Al confirmar el pago, la página de acceso lleva ahí. Muestra el botón «Instalar la aplicación» (o las instrucciones de iPhone, iPad, Safari de Mac y Firefox), el ID de transacción con el botón «Copiar» (solo si se escribió en esa pestaña; no se guarda en ningún servidor), cómo activar otros dispositivos y el botón para abrir la aplicación. Abierta desde la aplicación instalada, pasa directo a la aplicación. Imágenes: `bienvenida-instalar.webp`, `icono-instalar-app.webp`, `icono-guardar-id.webp` e `icono-otros-dispositivos.webp` (hechas por Codex). El service worker (`VERSION` 2026-11-14.2) no sirve estas páginas desde la copia guardada: siempre las pide al servidor.
- **Receta con IA:** la página llama a `/api/plato/receta` del Worker `saludintegral` con datos estructurados (plato, alergias, alimentos que evitar, tipo de alimentación, etc.), no con un texto libre. El Worker exige la cookie de comprador, permite 20 recetas por hora y por compra, arma el texto para Gemini con una plantilla fija y lo envía al Worker `mi-plato-inteligente-api` por un enlace interno (`GEMINI`).

## Archivos (todos en `dist/plato-prueba/`)

| Archivo | Para qué sirve |
| --- | --- |
| `manifest.webmanifest` | Datos de la aplicación en español: nombre «Mi Plato Inteligente», nombre corto «Mi Plato», `start_url` y `scope` `/plato-prueba/`, modo `standalone`, colores e íconos. |
| `manifest-en.webmanifest` | Lo mismo en inglés: «My Smart Plate» y «My Plate». Misma identidad de aplicación (`id`, `scope`, `start_url`). |
| `sw.js` | Service worker: guarda la página y todos sus archivos para usarla sin conexión y se actualiza con cada versión. |
| `img/icon-app-v2-192.png`, `img/icon-app-v2-512.png` | Íconos de la aplicación (ya estaban en la carpeta). Fondo verde bosque sin transparencia; sirven también como «maskable» porque el dibujo queda dentro de la zona segura. |
| `img/icon-app-v2-180.png` | Ícono para iPhone y iPad (`apple-touch-icon`), sin transparencia. |
| `img/favicon-app-v2-48.png` | Ícono de la pestaña. |
| `index.html` | Se agregaron: enlaces al manifiesto y a los íconos, el botón «Instalar la aplicación», el registro del service worker y el aviso de Gemini sin conexión. |

## Cómo funciona

- **Idioma:** al elegir ES o EN, la página cambia el manifiesto (`manifest.webmanifest` o `manifest-en.webmanifest`) y el título que usa el iPhone («Mi Plato» o «My Plate»). La aplicación instalada lleva el nombre del idioma activo al momento de instalarla.
- **Botón «Instalar la aplicación» / «Install the app»:** aparece solo en la pantalla de inicio.
  - Android y computadora: usa el evento `beforeinstallprompt`. Si la persona rechaza el cuadro, el botón se oculta y aparece la nota «Puede instalarla más tarde desde el menú de su navegador».
  - iPhone y iPad: al pulsar el botón muestra «Para instalarla, toque Compartir y luego «Añadir a pantalla de inicio»». Si el navegador no es Safari, agrega «Si no ve esa opción, abra esta página en Safari».
  - Safari en Mac: al pulsar el botón muestra «Para instalarla en Safari, abra el menú Archivo y elija «Añadir al Dock»».
  - Desaparece cuando la aplicación ya está instalada (modo `standalone` o `navigator.standalone`) o al recibir el evento `appinstalled`.
  - Si el navegador no ofrece instalación (por ejemplo Firefox en computadora), no se muestra nada.
- **Sin conexión:** `sw.js` guarda en una caché `mpi-plato-<VERSION>` los 132 archivos esenciales (página, 5 archivos js, manifiestos, íconos, imágenes de la interfaz; unos 4 MB) y las 399 imágenes de platos e ingredientes (unos 11 MB); en total unos 15 MB en la primera instalación. Si un archivo esencial falla, la instalación se descarta y se conserva la versión anterior; si falla una imagen, se guarda cuando se use. Las tipografías de Google Fonts se guardan en `mpi-plato-fuentes` la primera vez que se ven con internet.
- **Gemini sin conexión:** la llamada a `api.saludintegral.site/api/generate` (POST) nunca pasa por la caché. Sin internet, el botón «Receta más personalizada (con IA)» ya avisa «Esta función necesita conexión a internet…», y al pulsarlo muestra el mismo mensaje; la receta propia y el resto de la aplicación siguen funcionando. El aviso se actualiza solo al perder o recuperar la conexión.

## Publicar una versión nueva

Las aplicaciones instaladas solo se actualizan si `sw.js` cambia. Cada vez que se publique algo en `dist/plato-prueba/` (código, imágenes, textos):

1. Cambiar `VERSION` en `sw.js` (por ejemplo `2026-11-12.1`). Es obligatorio incluso si solo se reemplazó una imagen con el mismo nombre.
2. Si se agregaron o quitaron archivos, actualizar las listas `NUCLEO` e `IMAGENES` de `sw.js`: todos los archivos de la carpeta menos `sw.js`; los de `img/platos/` e `img/ingredientes/` van en `IMAGENES`, el resto en `NUCLEO`, y `index.html` se escribe `"./"`.
3. Desplegar y comprobar que https://saludintegral.site/plato-prueba/manifest.webmanifest se entrega como `application/manifest+json`.

Al abrir la aplicación con internet, el navegador detecta el cambio y descarga la caché nueva; la versión nueva queda en espera y, cuando se cierran todas las ventanas de la aplicación, borra las anteriores y se usa desde la siguiente apertura (no recarga la página en medio de una respuesta).

Ayuda para regenerar las listas (Python 3, ejecutar desde `dist/plato-prueba/` y pegar el resultado entre las marcas `/*NUCLEO*/ … /*FIN-NUCLEO*/` y `/*IMAGENES*/ … /*FIN-IMAGENES*/`):

```python
import os, json
files = sorted(os.path.relpath(os.path.join(r, f), ".").replace(os.sep, "/") for r, _, fs in os.walk(".") for f in fs if f != "sw.js")
bulk = [f for f in files if f.startswith(("img/platos/", "img/ingredientes/"))]
core = ["./" if f == "index.html" else f for f in files if f not in bulk]
print("NUCLEO =", json.dumps(sorted(core, key=lambda f: (f != "./", f)), indent=2))
print("IMAGENES =", json.dumps(bulk, indent=2))
```

## Pruebas realizadas (13/11/2026)

Playwright con Google Chrome y emulación de dispositivos, contra un servidor local con la misma ruta `/plato-prueba/`: **115 pruebas; 113 correctas y 2 que solo registran el bloqueo de Google Fonts en el entorno de pruebas.**

- Escritorio 1440, Android 412, tableta Android 800 y teléfono 360 (evento de instalación simulado): botón, cuadro del navegador, nota al rechazar, desaparición al aceptar, español e inglés, sin desborde horizontal ni errores de JavaScript.
- iPhone (Safari y otro navegador), iPad (dos identificaciones) y Safari en Mac: instrucciones, nota de Safari, ocultar si ya está instalada.
- Firefox en computadora: no se muestra nada.
- Chrome (`Page.getAppManifest` y `Page.getInstallabilityErrors`): manifiesto sin errores y aplicación instalable, en español y en inglés.
- Sin conexión (escritorio y móvil): 531 archivos guardados, la página abre, las imágenes se ven, se llega a las propuestas, se abre una receta completa, el botón de IA avisa que necesita internet y no intenta la llamada, el cambio a inglés funciona, el aviso vuelve al normal al recuperar la conexión.
- Actualización: la versión nueva queda en espera, en la siguiente apertura queda una sola caché con los 531 archivos y funciona sin internet.

## Lo que no se pudo verificar

- Instalación en un iPhone, un Android y una tableta reales (solo hubo emulación). En iPhone y iPad hay que comprobar el ícono y el nombre al añadirla a la pantalla de inicio.
- El evento real `beforeinstallprompt`: Chromium sin pantalla no lo dispara, así que el botón se probó con un evento simulado.
- Las tipografías de Google Fonts sin conexión: el entorno de pruebas las bloquea; si no se guardaron, se usa la letra de respaldo.
- El tipo de archivo con que Cloudflare entrega `manifest.webmanifest` en producción (se verifica al desplegar).
- Lighthouse no se volvió a ejecutar el 13/11/2026.

## Decisiones tomadas (se pueden cambiar)

- Nombre corto «Mi Plato» / «My Plate»; nombre en inglés «My Smart Plate», el que ya usa la página.
- Color del tema `#DCE8D2` (verde salvia claro de la página) y color de fondo `#F7F3E8` (crema).
- El botón de instalar aparece solo en la pantalla de inicio.
