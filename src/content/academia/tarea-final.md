La tarea final reúne todo lo que aprendiste en un solo proyecto: un **panel de control** con un servo, un potenciómetro, un botón y tres LEDs. No pertenece a ninguna categoría en particular, pero usa las 6 piezas básicas que aparecen en todas.

## ¿Qué hace el panel?

El panel tiene **dos modos de funcionamiento**, y el botón cambia de uno a otro:

- **Modo MANUAL** (LED verde encendido): al girar el potenciómetro, el servo se mueve de 0° a 180° siguiendo la perilla.
- **Modo COMANDOS** (LED amarillo encendido): el servo obedece letras enviadas desde la computadora. Tú eliges 3 letras propias que lleven el servo a 0°, 90° y 180°.
- **Alerta de límite** (LED rojo): se enciende cuando el servo está cerca de un extremo (menos de 10° o más de 170°), en cualquiera de los dos modos.
- **Reporte:** cada vez que cambia el modo o el ángulo, el ESP32 imprime una línea con tu nombre, el modo actual y el ángulo.

## El video (2 a 3 minutos)

Graba tu pantalla (y tu voz) mostrando:

1. El simulador funcionando: cambia de modo con el botón, mueve el potenciómetro y envía tus comandos.
2. Una parte de tu código que te haya costado, explicada con tus palabras.
3. Tu esquemático y tu caja en 3D, en pocos segundos.

No necesita ser profesional. Lo importante es que se note que **entiendes lo que hiciste**. Puedes subirlo a YouTube como "no listado" o a Google Drive con permiso de lectura para cualquiera con el enlace.

> **Sobre la inteligencia artificial:** usar internet o inteligencia artificial para que te expliquen algo está permitido y hasta recomendado. Lo que no sirve es copiar sin entender: en el video tendrás que explicar tu trabajo.

## La bitácora

Tu bitácora se arma dentro de la Academia con la [ficha de bitácora Nova](/academia/bitacora) (Quería, Hice, Pasó, Aprendí):

1. **Las tres fichas de módulo**, que llenas al cerrar Electrónica, Mecánica y Programación. Quedan guardadas en tu cuenta: no tienes que volver a enviarlas.
2. **Una reflexión final** de media página, respondiendo:
   - ¿Qué fue lo más difícil y cómo lo resolviste?
   - ¿Qué tuviste que investigar por tu cuenta (fuera de estas lecciones)?
   - ¿Qué error te tomó más tiempo encontrar?
   - ¿Qué categoría de robots te llama más la atención y por qué?

## Cómo entregar

Envía todo desde la sección **Entregar tarea final**, al inicio de esta página. Se habilita cuando completas las tres partes con sus fichas de módulo.

Antes de enviar, abre cada enlace en una **ventana de incógnito** para comprobar que se puede ver sin iniciar sesión.

## Qué pasa después

1. **La directiva revisa tu entrega.** Puede aprobarla o devolverla con observaciones; si te deja observaciones, corriges y vuelves a enviar.
2. **Si la aprueban, se abre la Parte 2 de Academia Nova:** soldadura THT y SMD, explicada con texto y videos.
3. **Práctica presencial:** el encargado de la convocatoria te asignará una fecha para recibir tu kit de placa y soldarla con guía del equipo.
4. **Decisión final:** con todo lo anterior, la directiva decide tu ingreso a Nova como miembro.

## Criterios de aprobación

**Obligatorio para aprobar:**

- [ ] La simulación funciona: cambia de modo con el botón, el potenciómetro mueve el servo en modo manual y tus 3 comandos funcionan en modo comandos.
- [ ] El LED rojo avisa correctamente cuando el servo está cerca de los extremos.
- [ ] Tu nombre aparece en el reporte del Monitor Serial.
- [ ] El esquemático usa los mismos pines que el código (Mapa de pines Nova).
- [ ] La caja tiene medidas coherentes con los componentes reales, y explicas de dónde las sacaste.
- [ ] El video demuestra que entiendes tu trabajo.
- [ ] Entregaste la bitácora: tres fichas con su fuente y su evidencia, más la reflexión final.

**Suma puntos (opcional):**

- Cualquiera de los retos extra que aparecen al final de cada parte.
- Mejoras que se te ocurran a ti y que expliques en la bitácora.
