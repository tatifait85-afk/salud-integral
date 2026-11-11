# Mi Plato Inteligente: investigación de las reglas que estaban en duda

Fecha: 2026-11-11. Complementa `plato-condiciones-salud-medicamentos.md`.

Se buscó en las fuentes si se podía convertir en regla automática (bloqueo de platos) cinco puntos que el documento principal no resolvía. La página bloquea un alimento solo cuando la fuente dice «no coma» o «evite» y el alimento se reconoce como ingrediente; cuando la fuente dice «limite», «con moderación» o «según cada persona», la página no bloquea.

| Punto | Lo que dice la fuente | Decisión en la página |
| --- | --- | --- |
| Gastroenterología: reflujo | NIDDK: algunas personas con reflujo notan que cítricos, tomate, alcohol, chocolate, café, grasas, menta y picantes empeoran los síntomas; los desencadenantes varían y no se recomienda evitarlos para todos. Su médico puede sugerir reducir los que le afectan. | Sin bloqueo. Queda la preferencia en el pedido a Gemini y el aviso de orientación. |
| Gastroenterología: colon irritable | NIDDK: «Diferentes cambios pueden ayudar a diferentes personas». El médico puede sugerir una dieta baja en FODMAP unas semanas y reintroducir los alimentos, o evitar el gluten para probar. | Sin bloqueo. Quien tenga celiaquía o sensibilidad al gluten ya lo marca en «Prefiere evitar». |
| Gota (Reumatología) | Clínica Mayo: «no coma» vísceras (hígado, riñón, mollejas); no beba alcohol durante los ataques y limítelo entre ataques; limite carnes rojas, la mayoría de mariscos, el azúcar, el jarabe de maíz alto en fructosa y los jugos de fruta. | Se bloquean las vísceras (hígado, riñón, mollejas) para quien marque Reumatología. Lo demás es «limite»: sin bloqueo. |
| Frituras en Cardiología | Harvard Health (revisión de 17 estudios, 2021): más frituras se asocian a más problemas del corazón; recomienda comerlas «con moderación» y fritas en aceite vegetal, no en grasa animal. | Sin bloqueo. El texto de la página pasó de «sin frituras» a «pocas frituras». |
| Anemia por falta de hierro | Cornell Health: el café y el té reducen la absorción del hierro, tomarlos aparte de las comidas; incluir vitamina C en cada comida con hierro. | Sin bloqueo. Ya hay aviso de separar café y té y de combinar con vitamina C. |
| Sodio y grasas saturadas | No se pueden medir en un ingrediente escrito. | Sin bloqueo; quedan como preferencia y aviso. |

## Lo que la página bloquea hoy por condición

- Endocrinología y metabolismo: bebidas azucaradas y jugos, dulces, harinas refinadas, frituras.
- Cardiología: bebidas azucaradas, dulces, alcohol.
- Hepatología: bebidas azucaradas, alcohol.
- Nefrología: sal sustituta con potasio, embutidos, frituras.
- Reumatología: vísceras.
- Embarazo: crudo, sin pasteurizar, pescado con alto mercurio.
- Estatinas: toronja.

## Lo que no se pudo verificar

- La gota no tiene su propia casilla: la página la agrupa en Reumatología junto con artritis reumatoide, lupus y fibromialgia, para los que no se encontró una regla alimentaria general; por eso solo se bloquean las vísceras, que la Clínica Mayo prohíbe de forma explícita.
- La página no pregunta si la persona tiene reflujo o colon irritable. Si se quisiera aplicar una de esas reglas, habría que agregar la pregunta; hoy se decidió no hacerlo.
- Las fuentes de esta búsqueda son páginas de salud pública y de hospitales; no se consultaron guías clínicas completas.

## Fuentes

- [NIDDK: reflujo (GER y GERD)](https://niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults/eating-diet-nutrition)
- [NIDDK: colon irritable](https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/eating-diet-nutrition)
- [Clínica Mayo: dieta para la gota](https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/gout-diet/art-20048524)
- [Harvard Health: frituras y corazón](https://www.health.harvard.edu/heart-health/how-much-will-fried-foods-harm-your-heart)
- [Cornell Health: anemia por falta de hierro](https://health.cornell.edu/sites/health/files/pdf-library/Iron-Deficiency-Anemia.pdf)
