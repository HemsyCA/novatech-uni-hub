## ¡Bienvenido/a a Nova Tech Team!

Si estás leyendo esto, ya diste el primer paso para formar parte del equipo. Antes de empezar, es importante que sepas cómo funciona esta etapa:

**Aquí nadie te va a dictar clases.** Este nivel es 100% autónomo: aprendes a tu ritmo, en el horario que puedas, siguiendo las lecciones de la Academia. Cada lección tiene una explicación escrita paso a paso.

Al terminar, entregas una **tarea final**. Si la apruebas, obtienes acceso al grupo del equipo, donde ya puedes hacer preguntas, trabajar con hardware real y prepararte para competir.

No esperamos que sepas nada de robótica antes de empezar. Lo que sí buscamos es gente que **intente, se equivoque, investigue y encuentre soluciones por su cuenta**. Esa actitud es justamente lo que evalúa esta etapa.

## Aprender investigando

En Nova no se dictan clases: se aprende investigando. Estas lecciones son una guía para que avances por tu cuenta, y el ciclo es siempre el mismo:

1. **Lee.** Todo lo que sabe el equipo se publica en la web de Nova: las lecciones de esta Academia, nuestros robots y su documentación. Es tu punto de partida.
2. **Investiga.** Cuando algo no está explicado, búscalo: hojas de datos, documentación oficial, foros. Usar inteligencia artificial para que te expliquen está permitido; copiar sin entender, no.
3. **Prueba.** Lleva lo que aprendiste a los simuladores y, más adelante, al hardware real. Equivocarte es parte del proceso.
4. **Documenta.** Llena una [ficha de bitácora](/academia/bitacora) de cuatro preguntas: Quería, Hice, Pasó y Aprendí. Es obligatoria al cerrar cada módulo y opcional al final de cualquier lección. Es la forma en que el equipo comparte lo que aprende.

Acostúmbrate a leer la web de Nova: ahí vamos publicando todo lo que el equipo aprende.

## ¿Cómo funciona?

1. Avanza por las 3 partes: **Electrónica**, **Mecánica** y **Programación**.
2. En cada lección: lee la explicación → haz el paso a paso → resuelve la mini práctica → revisa el checklist.
3. Al final de cada parte encontrarás **su pieza de la tarea final**.
4. Cuando tengas las 3 piezas, grabas un video corto, ordenas tu bitácora y lo entregas todo.
5. La directiva revisa tu entrega. Si la aprueba, se abre la **Parte 2: soldadura**.

**Tiempo estimado:** entre 16 y 20 horas en total.

**Plazo sugerido:** 3 semanas desde tu inscripción (unas 6 horas por semana).

## Lo que necesitas

- Una computadora con internet (Windows, Mac o Linux) y un navegador actualizado (Chrome o Firefox).
- Un mouse con rueda (para el diseño 3D es casi obligatorio).
- Cuentas gratuitas en: **Wokwi** (simulador), **EasyEDA** (diseño electrónico) y **Onshape** (diseño 3D). En cada parte te explicamos cómo crearlas.
- Un cuaderno para cálculos, dibujos y tu bitácora.

**No necesitas comprar ningún componente.** Toda la Parte 1 se hace en programas y simuladores online. El hardware real llega con la práctica presencial de la Parte 2.

## ¿Por qué aprendemos estas cosas?

En Nova se construyen robots muy distintos: minisumos autónomos y por Bluetooth, seguidores de línea, robots soccer, OTTOs y minihumanoides con servos, entre otros. Parecen mundos diferentes, pero **todos están hechos de las mismas piezas básicas**. Si dominas estas 6, puedes entrar a cualquier categoría:

| Concepto | Cómo lo aprendes aquí | Dónde lo usarás después |
| --- | --- | --- |
| **Salida digital** (encender / apagar) | Un LED | En todas las categorías: indicadores, activar drivers de motores |
| **Entrada digital** (sí / no) | Un botón | Botón de inicio (obligatorio en minisumo), finales de carrera, sensores de contacto |
| **Entrada analógica** (un valor que varía) | Un potenciómetro | Sensores de línea del seguidor, medir la batería, casi cualquier sensor |
| **Salida PWM** (cuánto, no solo sí / no) | El brillo de un LED | La velocidad de los motores en minisumo, soccer y seguidor de línea |
| **Servomotor** (ir a un ángulo exacto) | Un servo SG90 | Las articulaciones del OTTO y del minihumanoide, brazos, pateadores |
| **Recibir comandos** | Enviar letras al ESP32 desde la computadora | Control por Bluetooth del minisumo y del soccer |

### El ciclo de todo robot

Todo robot, por complejo que sea, repite sin parar el mismo ciclo:

**PERCIBIR → DECIDIR → ACTUAR**

- **Percibir:** leer lo que pasa afuera (botones, sensores, comandos).
- **Decidir:** el programa analiza lo que leyó y elige qué hacer.
- **Actuar:** mover motores, servos, encender luces.

Un seguidor de línea *percibe* la línea, *decide* hacia dónde corregir y *actúa* sobre los motores. Un OTTO *percibe* un comando, *decide* qué paso dar y *actúa* sobre sus servos. En este nivel vas a construir ese ciclo completo con componentes simples.

## Mapa de pines Nova

Para que todo encaje, **en todas las lecciones y en la tarea final usamos siempre las mismas conexiones**. Así lo que conectas en el simulador, lo que dibujas en el esquemático y lo que escribes en el código coinciden.

| Componente | Pin del ESP32 | Notas |
| --- | --- | --- |
| LED verde | GPIO 18 | Con resistencia de 220 Ω |
| LED amarillo | GPIO 19 | Con resistencia de 220 Ω |
| LED rojo | GPIO 23 | Con resistencia de 220 Ω |
| Botón | GPIO 21 | Con resistencia pull-down de 10 kΩ |
| Potenciómetro (pin central) | GPIO 34 | Extremos a 3V3 y GND |
| Servo SG90 (señal) | GPIO 25 | Alimentación a 5 V (VIN) y GND |

## Cómo está organizada cada lección

Todas las lecciones siguen la misma estructura, para que siempre sepas dónde estás:

- **Objetivo:** lo que podrás hacer al terminar.
- **¿Para qué me sirve?:** en qué categorías de robots se usa.
- **Explicación:** la teoría, explicada desde cero.
- **Paso a paso:** la práctica guiada.
- **Errores comunes:** los problemas típicos y cómo resolverlos.
- **Mini práctica:** un ejercicio para hacer por tu cuenta.
- **Puedo continuar si…:** una autoevaluación rápida.

## Tu camino en Nova

| Etapa | Qué es | Cómo se accede |
| --- | --- | --- |
| **Parte 1 – Bienvenida** | Este contenido: Electrónica, Mecánica y Programación. Autónomo, en texto y simuladores. | Inscribiéndote en la convocatoria |
| **Parte 2 – Soldadura** | Soldadura THT y SMD, en texto y videos, para prepararte antes de tocar el hardware. | Cuando la directiva aprueba tu tarea final |
| **Práctica presencial** | Recibes un kit de placa y la sueldas con guía del equipo. | El encargado de la convocatoria te asigna una fecha |
| **Miembro de Nova** | Material interno, foro y bitácora del equipo; luego, competencias o investigación. | La directiva decide tu ingreso |

## Consejos para aprender por tu cuenta

- **Lee los errores.** Cuando algo falla, el programa casi siempre te dice por qué. Copia el mensaje de error y búscalo en internet: alguien ya tuvo el mismo problema.
- **Avanza en pasos pequeños.** Prueba cada parte por separado antes de juntarlas.
- **Escribe tu bitácora desde el día 1.** Llena una [ficha](/academia/bitacora) cada vez que resuelvas algo; al final solo tendrás que elegir tus mejores fichas.
- **No te quedes trabado días en lo mismo.** Si algo no sale, busca otra explicación o avanza con otra lección y vuelve después.
