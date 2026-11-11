# Mi Plato Inteligente: aplicación instalable (PWA)

Fecha: 2026-11-11. Complementa `plato-condiciones-salud-medicamentos.md` y `plato-investigacion-reglas-pendientes.md`.

Convierte la página de prueba (`dist/plato-prueba/`, vista previa en https://saludintegral.site/plato-prueba/) en una aplicación que se instala en el teléfono (Android y iPhone), la computadora y la tableta, y que funciona sin internet. No se integra a saludintegral.site: la vista previa sigue siendo la única dirección.

**Estado al 11/11/2026:** el trabajo está hecho y probado en una copia de trabajo, pero los archivos de la aplicación todavía no están en este repositorio ni desplegados; falta la orden de publicar. Este documento describe lo que se publicará.

## Archivos (todos en `dist/plato-prueba/`)

| Archivo | Para qué sirve |
| --- | --- |
| `manifest.webmanifest` | Datos de la aplicación en español: nombre «Mi Plato Inteligente», nombre corto «Mi Plato», `start_url` y `scope` `/plato-prueba/`, modo `standalone`, colores e íconos. |
| `manifest-en.webmanifest` | Lo mismo en inglés: «My Smart Plate» y «My Plate». Misma identidad de aplicación (`id`, `scope`, `start_url`). |
| `sw.js` | Service worker: guarda la página y todos sus archivos para usarla sin conexión y se actualiza con cada versión. |
| `img/icon-192.png`, `img/icon-512.png` | Íconos de marca (copiados de `C:\Codex\Mi_Plato_Inteligente\assets\branding\`). Sirven también como «maskable»: el dibujo llega a 195 px del centro y la zona segura es de 205 px. |
| `img/apple-touch-icon.png` | 180×180, derivado de `icon-512.png` (iPhone y iPad no aceptan transparencia). |
| `img/favicon.png` | Ícono de la pestaña (copiado de la carpeta de marca). |
| `index.html` | Se agregaron: enlaces al manifiesto y a los íconos, el botón «Instalar la aplicación», el registro del service worker y el aviso de Gemini sin conexión. |

## Cómo funciona

- **Idioma:** al elegir ES o EN, la página cambia el manifiesto (`manifest.webmanifest` o `manifest-en.webmanifest`) y el título que usa el iPhone («Mi Plato» o «My Plate»). La aplicación instalada lleva el nombre del idioma activo al momento de instalarla.
- **Botón «Instalar la aplicación» / «Install the app»:** aparece solo en la pantalla de inicio.
  - Android y computadora: usa el evento `beforeinstallprompt`. Si la persona rechaza el cuadro, el botón se oculta y aparece la nota «Puede instalarla más tarde desde el menú de su navegador».
  - iPhone y iPad: muestra el mensaje «toque Compartir … y luego «Añadir a pantalla de inicio»». Si el navegador no es Safari, agrega «Si no ve esa opción, abra esta página en Safari».
  - Desaparece cuando la aplicación ya está instalada (modo `standalone` o `navigator.standalone`) o al recibir el evento `appinstalled`.
  - Si el navegador no ofrece instalación (por ejemplo Firefox en computadora), no se muestra nada.
- **Sin conexión:** `sw.js` guarda en una caché `mpi-plato-<VERSION>` los 74 archivos esenciales (página, 5 archivos js, manifiestos, íconos, imágenes de la interfaz) y las 399 imágenes de platos e ingredientes (unos 14 MB en la primera instalación). Si un archivo esencial falla, la instalación se descarta y se conserva la versión anterior; si falla una imagen, se guarda cuando se use. Las tipografías de Google Fonts se guardan en `mpi-plato-fuentes` la primera vez que se ven con internet.
- **Gemini sin conexión:** la llamada a `api.saludintegral.site/api/generate` (POST) nunca pasa por la caché. Sin internet, el botón «Receta más personalizada (con IA)» ya avisa «Esta función necesita conexión a internet…», y al pulsarlo muestra el mismo mensaje; la receta propia y el resto de la aplicación siguen funcionando. El aviso se actualiza solo al perder o recuperar la conexión.

## Publicar una versión nueva

Las aplicaciones instaladas solo se actualizan si `sw.js` cambia. Cada vez que se publique algo en `dist/plato-prueba/` (código, imágenes, textos):

1. Cambiar `VERSION` en `sw.js` (por ejemplo `2026-11-12.1`). Es obligatorio incluso si solo se reemplazó una imagen con el mismo nombre.
2. Si se agregaron o quitaron archivos, actualizar las listas `NUCLEO` e `IMAGENES` de `sw.js`: todos los archivos de la carpeta menos `sw.js`; los de `img/platos/` e `img/ingredientes/` van en `IMAGENES`, el resto en `NUCLEO`, y `index.html` se escribe `"./"`.
3. Desplegar y comprobar que https://saludintegral.site/plato-prueba/manifest.webmanifest se entrega como `application/manifest+json`.

Al abrir la aplicación con internet, el navegador detecta el cambio, descarga la caché nueva, borra las anteriores y la usa desde la siguiente apertura (no recarga la página en medio de una respuesta).

Ayuda para regenerar las listas (Python 3, ejecutar desde `dist/plato-prueba/` y pegar el resultado entre las marcas `/*NUCLEO*/ … /*FIN-NUCLEO*/` y `/*IMAGENES*/ … /*FIN-IMAGENES*/`):

```python
import os, json
files = sorted(os.path.relpath(os.path.join(r, f), ".").replace(os.sep, "/") for r, _, fs in os.walk(".") for f in fs if f != "sw.js")
bulk = [f for f in files if f.startswith(("img/platos/", "img/ingredientes/"))]
core = ["./" if f == "index.html" else f for f in files if f not in bulk]
print("NUCLEO =", json.dumps(sorted(core, key=lambda f: (f != "./", f)), indent=2))
print("IMAGENES =", json.dumps(bulk, indent=2))
```

## Pruebas realizadas (11/11/2026)

Playwright con Chromium y emulación de dispositivos, contra un servidor local con la misma ruta `/plato-prueba/`: **72 pruebas, todas correctas.**

- Escritorio 1440×900, Android (Pixel 7), iPhone (Safari y otro navegador), iPad y tableta Android: botón de instalar, pasos de iPhone/iPad, nota de Safari, ocultar si ya está instalada, sin desborde horizontal ni errores de JavaScript.
- Chrome (`Page.getAppManifest` y `Page.getInstallabilityErrors`): manifiesto sin errores ni advertencias y aplicación instalable, en español y en inglés.
- Sin conexión (escritorio y móvil): la página abre, las imágenes se ven, el armador propone platos, se abre una receta completa, el botón de IA avisa que necesita internet, el cambio a inglés funciona.
- Actualización: con una versión nueva se instaló sola, se borró la anterior (queda una sola caché de la aplicación), guardó los 473 archivos y funcionó sin internet.
- Lighthouse 11.7.1: PWA 100 (móvil y escritorio), accesibilidad 95, buenas prácticas 96.

## Lo que no se pudo verificar

- Instalación en un iPhone, un Android y una tableta reales (solo hubo emulación). En iPhone y iPad hay que comprobar el ícono y el nombre al añadirla a la pantalla de inicio.
- El evento real `beforeinstallprompt`: Chromium sin pantalla no lo dispara, así que el botón se probó con un evento simulado.
- Las tipografías de Google Fonts sin conexión: el entorno de pruebas las bloquea; si no se guardaron, se usa la letra de respaldo.
- El tipo de archivo con que Cloudflare entrega `manifest.webmanifest` en producción (se verifica al desplegar).
- Lighthouse señaló un enlace sin nombre accesible (`#privimg`, el ícono de privacidad); ya existía antes de este trabajo y no se modificó.

## Decisiones tomadas (se pueden cambiar)

- Nombre corto «Mi Plato» / «My Plate»; nombre en inglés «My Smart Plate», el que ya usa la página.
- Color del tema `#DCE8D2` (verde salvia claro de la página) y color de fondo `#F7F3E8` (crema).
- El botón de instalar aparece solo en la pantalla de inicio.
