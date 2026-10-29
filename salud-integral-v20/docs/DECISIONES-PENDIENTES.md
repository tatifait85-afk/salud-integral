# Decisiones que le corresponden a Tatiana

## A. Términos de uso — políticas comerciales sin definir
La página (`/terminos-de-uso/`, `/en/terms-of-use/`) solo afirma lo que el sitio ya establece: sesión de 45 min por Google Meet, enlace 30 min antes, pago por adelantado, medios de pago, PayPal para los productos, que volver de PayPal no prueba el pago, que el PDF se crea en el dispositivo y no se guarda copia. Donde no hay política formal, el texto es **neutro** («se revisa y se responde por escrito»). Decida y avíseme para ajustar:

| # | Tema | Texto actual | Decisión requerida |
|---|---|---|---|
| A1 | Cancelar o reprogramar una sesión | «Escriba lo antes posible; cada solicitud se revisa» | ¿Plazo mínimo (p. ej. horas antes)? ¿Se pierde el pago si no avisa? ¿Cuántas reprogramaciones? |
| A2 | Reembolso de sesiones | Se revisa caso por caso | ¿Se reembolsa? ¿En qué casos y en qué plazo? |
| A3 | Reembolso de productos digitales (mapa de hábitos, jardín, equilibrio) | Se revisa caso por caso; si PayPal reembolsa, el acceso se desactiva | ¿Se aceptan reembolsos? ¿Plazo? ¿Se excluyen una vez entregado el PDF? |
| A4 | Límites de acceso a «Tu mapa de hábitos» | «Puede tener un período y un número de ingresos limitados» (sin cifras) | El Worker hoy trae 30 días (`REDEEM_DAYS`) y 5 emisiones (`MAX_REDEEMS`): ¿confirma esas cifras y las publicamos? |
| A5 | Acceso a Mi Jardín Digestivo y Mi mapa de equilibrio | No se especifican límites | ¿Habrá límite de tiempo/usos como en el mapa de hábitos? |
| A6 | Licencia de uso | «Uso personal; no copiar, revender ni compartir el acceso» | ¿Está de acuerdo con esa restricción? |
| A7 | Ley aplicable | «Se rigen por las leyes de Costa Rica» | Confirmar; ¿se agrega jurisdicción/foro? |
| A8 | Garantía de resultados | Sin garantía; enfoque educativo | Coherente con el resto del sitio; confirmar |

## B. Precios, botones y Worker (RESUELTO en v20)
Decisión de Tatiana: **Mi mapa de equilibrio = USD 12.99, botón PayPal `VA4SE3UYS3BBS`** (definitivo; el sitio ya no muestra USD 15 ni ₡6.600 ni `7R9CAZTHECMDQ`).

El Worker del repositorio (`saludintegral-deploy.zip`) ya distingue productos por **monto exacto** y por ruta/cookie/prefijo de KV propios. En v20 se le añadió el tercer producto (Jardín) con el mismo patrón:

| Producto | Precio | Botón PayPal | Rutas del Worker | Cookie | KV |
|---|---|---|---|---|---|
| Tu mapa de hábitos | USD 9.99 | `QR4TYYLX4AYHC` | `/api/acceso`, `/api/estado`, `/privado/*` | `si_mapa` | `p:` |
| Mi mapa de equilibrio | USD 12.99 | `VA4SE3UYS3BBS` | `/api/equilibrio/*`, `/privado/equilibrio/*` | `si_equilibrio` | `e:` |
| Mi Jardín Digestivo | USD 25 | `CJMKXJ3MD2RWJ` (heredado de «Salud digestiva») | `/api/jardin/*`, `/privado/jardin/*` | `si_jardin` | `j:` |

Puntos que siguen abiertos (requieren a Tatiana):
1. **Jardín:** el botón `CJMKXJ3MD2RWJ` era del producto anterior. Confirmar en PayPal que cobra exactamente USD 25 a `lolaita42@gmail.com`; si no, el Worker ignorará los pagos.
2. **Distinción por monto:** si algún día dos productos tuvieran el mismo precio, no se distinguirían. Hoy son 9.99 / 12.99 / 25.
3. **Riesgo de 9.99/12.99/25:** cualquier otro cobro exacto de esos montos a la misma cuenta (pago manual) concedería acceso a ese producto.
4. **SINPE / colones:** el Worker no puede verificar pagos fuera de PayPal. En v20 se quitó del sitio el precio en colones y el pago por SINPE de Equilibrio; si se quiere aceptarlo, hay que decidir cómo se entrega el acceso.
5. **Receptor:** confirmar que `lolaita42@gmail.com` es la cuenta de los tres botones.
