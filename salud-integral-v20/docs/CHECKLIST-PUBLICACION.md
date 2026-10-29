# Lista de publicación (técnica)

Estado al 27/10/2026. «Hecho» = verificado en este entorno con las pruebas de `tests/`. «Etapa final» = depende del Worker, de PayPal real o de correo real; **no está hecho ni verificado**.

## Hecho en el código (ver CAMBIOS-AUDITORIA.md)
- [x] Build limpio y reproducible; auditoría estática de 34 páginas ES/EN; recorrido escritorio/móvil; accesibilidad (axe); formularios; caché; robots; página de Términos de uso (borrador, ver DECISIONES-PENDIENTES.md).
- [x] ZIP público sin `privado/` ni recursos protegidos (`tools/package.py`, verificado por nombre y por contenido).

## Decisiones tuyas antes de publicar (no son técnicas)
- [ ] Políticas comerciales de los Términos de uso → `docs/DECISIONES-PENDIENTES.md` (sección A).
- [ ] Precios/botones de PayPal para el Worker → `docs/DECISIONES-PENDIENTES.md` (sección B).

## Etapa final (tareas específicas; NO realizadas)
Detalle en `docs/TAREAS-ETAPA-FINAL.md`:
- [ ] Configuración y despliegue del Worker (KV, `TOKEN_SECRET`, dominio, IPN, Auto-return).
- [ ] Verificación de PayPal en producción (pago real → IPN → acceso → cuestionario → PDF; reembolso; límites).
- [ ] Prueba con servicio de correo real: MailerLite, follow.it y el endpoint del formulario de contacto.
- [ ] Comprobar que `/privado/*` responde 401/403 sin cookie.
- [ ] Probar en móvil real y en Safari/Firefox (las pruebas automáticas fueron en Chromium).
- [ ] Verificar el enlace de Amazon `link.amazon/B04dLpuvb` (no se pudo abrir desde aquí).

## Aparte (opcional, no bloquea el lanzamiento)
- Revisión legal de textos: `docs/REVISION-LEGAL-OPCIONAL.md`.
