En esta parte vas a entender cómo funciona la electricidad en un circuito, a conocer el cerebro de nuestros robots (el ESP32) y a dibujar tus propios circuitos y placas en la computadora.

> **Nota:** los nombres de los menús de EasyEDA pueden cambiar un poco según la versión. Si no encuentras una opción exactamente con el nombre que aparece aquí, busca una parecida.

## E1 · Voltaje, corriente y resistencia

### Objetivo

Entender las tres magnitudes básicas de la electricidad y usar la Ley de Ohm para calcular la resistencia que necesita un LED.

### ¿Para qué me sirve?

**En todas las categorías.** Cada vez que conectes un LED, elijas una batería, revises por qué algo se calienta o protejas un pin del ESP32, estarás usando esta lección.

### Explicación

#### La analogía del agua

La electricidad no se ve, así que para entenderla usamos una comparación con el agua que corre por una tubería:

| Electricidad | Agua | Unidad |
| --- | --- | --- |
| **Voltaje (V)** | La presión que empuja el agua | Voltio (V) |
| **Corriente (I)** | La cantidad de agua que pasa por segundo | Amperio (A) |
| **Resistencia (R)** | Qué tan estrecha es la tubería | Ohmio (Ω) |

- **Voltaje:** es el "empuje" que hace moverse a las cargas eléctricas. Una batería o una fuente lo proporciona. Siempre se mide **entre dos puntos** (por ejemplo, entre el positivo y el negativo de una batería). En nuestros robots verás sobre todo **3.3 V** (el voltaje del ESP32), **5 V** (el de los servos y muchos sensores) y **7.4 V** (una batería LiPo de 2 celdas).
- **Corriente:** es la cantidad de electricidad que circula por el circuito. En electrónica pequeña se usan mucho los **miliamperios (mA)**: 1 A = 1000 mA. Un LED usa unos 10 mA; un motor pequeño puede usar 500 mA o más.
- **Resistencia:** es la oposición al paso de la corriente. Una resistencia "estrecha la tubería" para que pase menos corriente. Se usan mucho los **kiloohmios (kΩ)**: 1 kΩ = 1000 Ω.

#### La Ley de Ohm

Las tres magnitudes están relacionadas por una fórmula muy simple:

**V = I × R**

De ella salen las otras dos:

- **I = V / R** → para calcular la corriente
- **R = V / I** → para calcular la resistencia

> **Truco:** dibuja un triángulo con **V** arriba e **I** y **R** abajo. Tapa con el dedo la que quieres calcular y la posición de las otras dos te dice la operación: si están lado a lado se multiplican, si una está encima de la otra se dividen.

**Ejemplo:** una resistencia de 1 kΩ conectada a 5 V. ¿Cuánta corriente pasa?

I = V / R = 5 V / 1000 Ω = 0.005 A = **5 mA**

> **Cuidado:** antes de usar la fórmula, convierte todo a las unidades base: voltios, amperios y ohmios. 10 mA = 0.010 A; 2.2 kΩ = 2200 Ω.

#### El LED

Un **LED** (diodo emisor de luz) es un componente que se ilumina cuando la corriente lo atraviesa. Tiene dos cosas importantes que debes saber:

1. **Tiene polaridad:** solo funciona conectado en un sentido.
   - **Ánodo (+):** la pata más larga.
   - **Cátodo (−):** la pata más corta, y del lado donde el borde del LED es plano.
   - Si lo conectas al revés, no se enciende (normalmente no se daña, simplemente no conduce).
2. **Tiene una caída de voltaje fija:** el LED "se queda" con una parte del voltaje. Valores típicos:
   - Rojo, amarillo y verde: unos **2.0 V**
   - Azul y blanco: unos **3.0 V**

#### ¿Por qué el LED necesita una resistencia?

Un LED casi no tiene resistencia propia. Si lo conectas directo a una fuente, deja pasar muchísima corriente y se quema en segundos (y además puede dañar el pin del ESP32 que lo alimenta). Por eso **siempre** se conecta con una resistencia en serie que limita la corriente.

**Cómo calcularla:**

1. Al voltaje de la fuente le restas la caída del LED. Lo que sobra es el voltaje que se queda en la resistencia.
2. Eliges cuánta corriente quieres (10 mA es un buen valor para el ESP32).
3. Aplicas R = V / I.

**Ejemplo completo:** LED rojo conectado a un pin del ESP32 (3.3 V), queremos 10 mA.

- Voltaje en la resistencia: 3.3 V − 2.0 V = **1.3 V**
- R = 1.3 V / 0.010 A = **130 Ω**

#### Valores comerciales

Las resistencias no se fabrican en cualquier valor. Existen valores estándar como: 100, 120, 150, 180, **220**, 270, **330**, 470, 680, **1 k**, 2.2 k, 4.7 k, **10 k**…

**Regla:** si tu cálculo no coincide con un valor comercial, elige el **siguiente valor más grande**. Una resistencia más grande deja pasar menos corriente (el LED brilla un poco menos, pero nada se daña). Una más pequeña puede quemar algo.

En Nova usamos **220 Ω** para todos los LEDs conectados al ESP32. Con 220 Ω la corriente queda en:

I = 1.3 V / 220 Ω ≈ **5.9 mA**, suficiente para que el LED se vea bien y muy seguro para el pin.

#### Potencia (un dato extra)

Cuando la corriente atraviesa una resistencia, esta se calienta. La potencia que disipa se calcula con **P = V × I** y se mide en vatios (W). Las resistencias comunes aguantan **0.25 W** (¼ W).

En nuestro LED: P = 1.3 V × 0.0059 A ≈ 0.0077 W. Muy por debajo del límite, así que la resistencia ni se entibia. Esta misma fórmula es la que, más adelante, te explicará por qué algunos componentes de potencia se calientan tanto.

### Paso a paso

Calcula la resistencia para un LED amarillo conectado al ESP32:

1. Anota los datos: fuente = 3.3 V, caída del LED amarillo = 2.0 V, corriente deseada = 10 mA.
2. Convierte la corriente a amperios: 10 mA = 0.010 A.
3. Calcula el voltaje en la resistencia: 3.3 − 2.0 = 1.3 V.
4. Aplica la Ley de Ohm: R = 1.3 / 0.010 = 130 Ω.
5. Busca el valor comercial siguiente: 150 Ω. (También sirve 220 Ω, el que usamos en Nova).
6. Comprueba la corriente con 220 Ω: I = 1.3 / 220 ≈ 5.9 mA. ✅

### Errores comunes

- **Olvidar convertir unidades.** Si usas "10" en vez de "0.010" para 10 mA, el resultado sale 1000 veces más pequeño.
- **Usar el voltaje completo de la fuente** en lugar de restarle la caída del LED.
- **Redondear hacia abajo** al elegir el valor comercial. Siempre hacia arriba.
- **Conectar el LED al revés.** Si no enciende, lo primero que se revisa es la polaridad.

### Mini práctica

1. Un LED verde (2.1 V) se alimenta con 5 V y queremos 15 mA. ¿Qué resistencia necesitas? ¿Qué valor comercial eliges?
2. Un LED amarillo (2.0 V) con una resistencia de 220 Ω conectado a 3.3 V. ¿Cuánta corriente pasa?
3. Una resistencia de 10 kΩ conectada a 3.3 V. ¿Cuánta corriente pasa? Exprésala en mA.
4. ¿Qué pasaría si conectas un LED directo a 5 V sin resistencia? Explícalo con tus palabras.

```respuestas
1. (5 − 2.1) / 0.015 = 193 Ω → valor comercial **220 Ω**.
2. (3.3 − 2.0) / 220 ≈ 0.0059 A = **5.9 mA**.
3. 3.3 / 10 000 = 0.00033 A = **0.33 mA**.
4. Sin nada que limite la corriente, pasaría muchísima corriente y el LED se quemaría (y podría dañar lo que lo alimenta).
```

### Puedo continuar si…

- [ ] Puedo explicar qué es voltaje, corriente y resistencia con la analogía del agua.
- [ ] Sé despejar cualquiera de las tres variables de V = I × R.
- [ ] Puedo calcular la resistencia de un LED y elegir el valor comercial correcto.

## E2 · El divisor de voltaje y el potenciómetro

### Objetivo

Calcular el voltaje de salida de un divisor de voltaje y entender cómo funciona un potenciómetro.

### ¿Para qué me sirve?

- **Seguidor de línea:** sus sensores funcionan como un divisor de voltaje que cambia según el color del piso.
- **Todas las categorías:** para adaptar señales de 5 V a los 3.3 V que soporta el ESP32 y para medir el voltaje de la batería.
- **OTTO y minihumanoide:** un servo tiene un potenciómetro adentro para saber en qué ángulo está.

### Explicación

#### Resistencias en serie

Cuando conectas dos resistencias una detrás de otra (en **serie**), pasan dos cosas:

1. La **misma corriente** atraviesa las dos.
2. Su resistencia total es la **suma**: R total = R1 + R2.

#### El divisor de voltaje

Si conectas dos resistencias en serie entre un voltaje y tierra (GND), en el punto del medio aparece un voltaje **menor** que el de entrada. Ese voltaje depende de la proporción entre las resistencias:

**V salida = V entrada × R2 / (R1 + R2)**

Donde **R1** es la resistencia que va hacia el voltaje de entrada y **R2** es la que va hacia GND.

**Ejemplo 1:** 3.3 V con R1 = 10 kΩ y R2 = 10 kΩ.

V salida = 3.3 × 10 000 / 20 000 = **1.65 V** (exactamente la mitad, porque las resistencias son iguales).

**Ejemplo 2 (muy usado en robótica):** muchos sensores entregan señales de 5 V, pero el ESP32 solo soporta 3.3 V. Con R1 = 1 kΩ y R2 = 2 kΩ:

V salida = 5 × 2000 / 3000 = **3.33 V**. ¡Perfecto para el ESP32!

#### El potenciómetro

Un **potenciómetro** es una resistencia con una perilla que puedes girar. Tiene **3 patas**:

- Las dos de los **extremos** están unidas por una resistencia fija (por ejemplo, 10 kΩ).
- La pata del **centro** (llamada cursor) es un contacto que se desliza sobre esa resistencia cuando giras la perilla.

En la práctica, **un potenciómetro es un divisor de voltaje que puedes ajustar con la mano**. Si conectas un extremo a 3.3 V, el otro a GND y mides en la pata del centro:

- Perilla en un extremo → **0 V**
- Perilla en la mitad → **1.65 V**
- Perilla en el otro extremo → **3.3 V**

#### Sensores que funcionan igual

Muchos sensores son, en el fondo, una resistencia que cambia con algo del mundo exterior:

- Una **fotorresistencia (LDR)** cambia con la luz.
- Los **sensores de línea infrarrojos** reciben más o menos luz reflejada según el piso sea blanco o negro.

Se conectan formando un divisor de voltaje, y el ESP32 lee el voltaje resultante. Por eso, cuando aprendas a leer un potenciómetro en Programación (P5), ya sabrás leer la mayoría de los sensores analógicos.

### Paso a paso

Calcula la salida de un divisor con 3.3 V, R1 = 2 kΩ y R2 = 1 kΩ:

1. Identifica R2: es la que va hacia GND → 1 kΩ = 1000 Ω.
2. Suma las dos: R1 + R2 = 2000 + 1000 = 3000 Ω.
3. Divide R2 entre la suma: 1000 / 3000 = 0.333.
4. Multiplica por el voltaje de entrada: 3.3 × 0.333 = **1.1 V**.

### Errores comunes

- **Confundir R1 y R2.** La fórmula usa en el numerador la resistencia que está conectada a **GND**.
- **Olvidar que la salida siempre es menor** que la entrada. Si te sale un número mayor, revisa el cálculo.
- **Conectar mal el potenciómetro:** si conectas el cursor (pata del centro) a 3.3 V o a GND, no funcionará como divisor.

### Mini práctica

1. 5 V con R1 = 10 kΩ y R2 = 10 kΩ. ¿Cuánto vale la salida?
2. Un potenciómetro de 10 kΩ conectado a 3.3 V está girado al 25% (el cursor está a un cuarto del camino desde GND). ¿Qué voltaje hay en el cursor?
3. **Reto:** solo tienes resistencias de 1 kΩ, 2 kΩ, 10 kΩ y 20 kΩ. Encuentra dos combinaciones de R1 y R2 que conviertan 5 V en aproximadamente 3.3 V.

```respuestas
1. 5 × 10 000 / 20 000 = **2.5 V**
2. 3.3 × 0.25 = **0.825 V**
3. R1 = 1 kΩ y R2 = 2 kΩ, o R1 = 10 kΩ y R2 = 20 kΩ. En ambos casos: 5 × 2/3 = **3.33 V**.
```

### Puedo continuar si…

- [ ] Sé calcular la salida de un divisor de voltaje.
- [ ] Puedo explicar por qué un potenciómetro es un divisor de voltaje.
- [ ] Entiendo por qué un divisor sirve para adaptar señales de 5 V al ESP32.

## E3 · Conoce el ESP32

### Objetivo

Conocer las partes de la placa ESP32 DevKit V1, identificar sus pines y saber qué se puede (y qué no se puede) conectar a ellos.

### ¿Para qué me sirve?

**En todas las categorías.** El ESP32 es el cerebro de la mayoría de los robots de Nova: minisumos, seguidores, soccers, OTTOs y humanoides.

### Explicación

#### ¿Qué es un microcontrolador?

Un **microcontrolador** es una computadora muy pequeña metida en un solo chip. A diferencia de tu laptop, no tiene pantalla ni teclado: ejecuta **un único programa** una y otra vez, leyendo entradas (botones, sensores) y controlando salidas (LEDs, motores).

El **ESP32** es un microcontrolador muy popular porque es rápido, barato y trae **Wi-Fi y Bluetooth** incluidos. La **ESP32 DevKit V1** es una placa que facilita su uso: trae el chip, un conector USB y pines listos para conectar cosas.

#### Las partes de la placa

- **Módulo ESP32:** el rectángulo metálico. Adentro está el microcontrolador y la antena.
- **Conector micro USB:** sirve para dos cosas a la vez: alimentar la placa y cargarle programas desde la computadora.
- **Chip USB-serial (CP2102 o CH340):** traduce entre el USB de tu computadora y el ESP32. Según cuál tenga tu placa, necesitarás un driver distinto (lo verás en la lección Extra de Programación).
- **Regulador de voltaje:** convierte los 5 V del USB en los 3.3 V que necesita el ESP32.
- **Botón EN:** reinicia la placa (como apagar y prender).
- **Botón BOOT:** se usa en algunos casos para cargar programas.
- **30 pines:** 15 de cada lado.

#### Tipos de pines

**Pines de alimentación:**

| Pin | Qué es |
| --- | --- |
| **GND** | Tierra (0 V). La referencia de todo el circuito. |
| **3V3** | Entrega 3.3 V. Sirve para alimentar sensores pequeños. |
| **VIN** | Cuando la placa está conectada por USB, aquí aparecen aproximadamente 5 V. También sirve como entrada para alimentar la placa con una fuente externa de 5 V. |

**Pines GPIO** (entradas y salidas de propósito general): se identifican por su número (GPIO 18, GPIO 21…). En la placa suelen aparecer impresos como **D18**, **D21**, etc. Un GPIO puede funcionar como:

- **Salida digital:** entrega 3.3 V (HIGH) o 0 V (LOW). Para LEDs o para enviar órdenes a un driver de motores.
- **Entrada digital:** lee si le llega voltaje o no. Para botones.
- **Entrada analógica (ADC):** mide un voltaje entre 0 y 3.3 V. Para potenciómetros y sensores analógicos.
- **Salida PWM:** enciende y apaga muy rápido para simular "cantidades" (lo verás en P6). Para controlar brillo o velocidad.

#### La regla de oro

**Nunca conectes más de 3.3 V a un pin GPIO.** Si le llegan 5 V, puedes dañar el ESP32 de forma permanente. Si un sensor entrega 5 V, se usa un divisor de voltaje (E2) para bajarlo.

#### Los pines dan señal, no fuerza

Un GPIO puede entregar muy poca corriente: lo recomendable es no pasar de unos **20 mA** por pin. Eso alcanza para un LED, pero **no para mover un motor ni un servo**.

- Los **motores** se conectan a través de un **driver** (lo verás ya en el equipo): el ESP32 le da la orden y el driver entrega la fuerza.
- Un **servo** recibe del ESP32 solo la **señal** (por un GPIO), mientras que su **alimentación** viene de 5 V (VIN) y GND. En este nivel alimentamos un solo servo pequeño desde VIN, porque la placa está conectada por USB. En robots reales se usa una fuente separada.
- **Regla importante:** todos los componentes deben compartir el mismo **GND** (tierra común). Sin tierra común, las señales no tienen referencia y nada funciona bien.

#### Pines que conviene evitar al empezar

| Pines | Por qué evitarlos |
| --- | --- |
| GPIO 0, 2, 12 y 15 | Intervienen en el arranque de la placa. Si conectas algo ahí, a veces el ESP32 no arranca o no deja cargar programas. |
| GPIO 1 y 3 (TX y RX) | Los usa la comunicación USB con la computadora. |
| GPIO 34, 35, 36 y 39 | **Solo funcionan como entrada.** No sirven para LEDs ni servos, pero son ideales para sensores y potenciómetros. |

#### El Mapa de pines Nova

Por eso elegimos estos pines para todas las lecciones y la tarea final:

| Componente | Pin | Por qué este pin |
| --- | --- | --- |
| LED verde | GPIO 18 | Pin de salida seguro |
| LED amarillo | GPIO 19 | Pin de salida seguro |
| LED rojo | GPIO 23 | Pin de salida seguro |
| Botón | GPIO 21 | Pin de entrada seguro |
| Potenciómetro | GPIO 34 | Solo entrada y con ADC: perfecto para leer voltajes |
| Servo (señal) | GPIO 25 | Pin de salida seguro con PWM |

### Paso a paso

Con una imagen del pinout de la ESP32 DevKit V1 de 30 pines (búscala en internet como "ESP32 DevKit V1 30 pin pinout"):

1. Ubica el conector USB y orienta la imagen con el USB hacia abajo.
2. Encuentra los pines **GND**, **3V3** y **VIN**.
3. Encuentra los 6 pines del Mapa de pines Nova (18, 19, 23, 21, 34 y 25) y anota en qué lado y en qué posición está cada uno.
4. Marca con otro color los pines que conviene evitar.

### Errores comunes

- **Confundir la posición física del pin con su número GPIO.** El pin GPIO 18 no es "el pin número 18 contando desde la esquina". Guíate siempre por la etiqueta (D18).
- **Alimentar un servo o un motor desde 3V3 o desde un GPIO.** La placa se reinicia o se daña.
- **Olvidar la tierra común** entre el ESP32 y lo que controla.
- **Usar GPIO 34 para un LED.** Es solo de entrada: el LED nunca encenderá.

### Mini práctica

Responde con tus palabras:

1. ¿Puedo usar el GPIO 35 para encender un LED? ¿Por qué?
2. Un sensor entrega 5 V en su señal. ¿Lo puedo conectar directo a un GPIO? ¿Qué haría para conectarlo?
3. ¿Por qué el servo no se alimenta desde un GPIO ni desde 3V3?
4. ¿Por qué no usamos el GPIO 2 si está tan a mano?

```respuestas
1. No. Del 34 al 39 son pines solo de entrada.
2. No, se dañaría el ESP32. Usaría un divisor de voltaje (por ejemplo, 1 kΩ y 2 kΩ) para bajar la señal a 3.3 V.
3. Porque el servo necesita mucha más corriente de la que pueden dar, y además funciona con unos 5 V.
4. Porque interviene en el arranque de la placa y puede causar problemas al iniciar o al cargar programas.
```

### Puedo continuar si…

- [ ] Sé ubicar GND, 3V3, VIN y los pines del Mapa Nova en el pinout.
- [ ] Puedo explicar la regla de oro de los 3.3 V.
- [ ] Entiendo por qué un servo se alimenta aparte y por qué se necesita tierra común.

## E4 · Tu primer esquemático en EasyEDA

### Objetivo

Crear una cuenta en EasyEDA y dibujar tu primer esquemático: un LED con su resistencia.

### ¿Para qué me sirve?

**En todas las categorías.** Todo robot de competencia termina teniendo su propia placa (PCB), y toda placa empieza con un esquemático. Además, un esquemático es la forma en que los integrantes del equipo se explican los circuitos entre ellos.

### Explicación

#### ¿Qué es un esquemático?

Un **esquemático** es el "plano" de un circuito. No muestra cómo se ven los componentes, sino **cómo están conectados**. Cada componente se dibuja con un **símbolo** estándar:

- **Resistencia:** un rectángulo (o una línea en zigzag).
- **LED:** un triángulo con una raya y dos flechitas. La corriente circula en la dirección en que apunta el triángulo: del ánodo al cátodo.
- **GND:** unas rayitas horizontales que se hacen más pequeñas hacia abajo.
- **VCC / 3V3 / 5V:** una flecha o una barra que indica una fuente de voltaje.

#### Conceptos clave

- **Red (net):** todos los puntos unidos por un cable forman una red. Todo lo que está en la misma red tiene el mismo voltaje.
- **Etiqueta de red (net label):** un nombre que le pones a una red. Si dos cables tienen la **misma etiqueta**, están conectados aunque no haya un cable dibujado entre ellos. Esto mantiene el esquemático ordenado.
- **Designador:** el nombre único de cada componente: R1, R2 (resistencias), D1 (LED), J1 (conector), U1 (chip o módulo).
- **Valor:** el dato del componente: 220 Ω, 10 kΩ, rojo…
- **Huella (footprint):** el dibujo de cómo el componente se suelda en la placa. Cada símbolo tiene una huella asociada. La usarás en E6.

#### Componentes THT y SMD

- **THT (through-hole):** componentes con patas que atraviesan la placa. Son grandes y fáciles de soldar a mano. **En este nivel usamos solo THT.**
- **SMD:** componentes diminutos que se sueldan sobre la superficie. Aprenderás a soldarlos en la Parte 2.

### Paso a paso

**1. Crear la cuenta**

1. Entra a [easyeda.com](https://easyeda.com) y crea una cuenta gratuita.
2. Abre el editor **EasyEDA Pro** (puedes usarlo en el navegador o descargarlo).

**2. Crear el proyecto**

1. Crea un **proyecto nuevo** y llámalo `Nova - Prácticas`.
2. Dentro del proyecto se crea un esquemático. Ábrelo.

**3. Colocar los componentes**

1. Abre la **librería** de componentes y busca:
   - Una **resistencia THT** (busca "resistor" y elige una de tipo axial o through-hole).
   - Un **LED de 5 mm THT** (busca "LED 5mm").
   - Un **conector de 2 pines** con paso de 2.54 mm (busca "header 2P" o "pin header 1x2").
2. Coloca cada uno en la hoja.

**4. Ponerles nombre y valor**

1. Selecciona la resistencia y, en el panel de propiedades, ponle el valor **220Ω**.
2. Verifica que los designadores sean R1, D1 y J1.

**5. Conectar**

1. Usa la herramienta de **cable (wire)** para unir:
   - Pin 1 de J1 → un extremo de R1
   - El otro extremo de R1 → ánodo de D1
   - Cátodo de D1 → pin 2 de J1
2. Agrega un símbolo de **3V3** en el pin 1 de J1 y uno de **GND** en el pin 2.

**6. Revisar**

1. Ejecuta la **verificación de reglas eléctricas (ERC)**, normalmente en el menú Diseño.
2. Corrige los errores que aparezcan (lee el mensaje: suele decir exactamente qué falta).
3. Guarda el proyecto.

**7. Exportar**

1. Exporta el esquemático en **PDF** y ábrelo para comprobar que se ve bien.

### Errores comunes

- **Cables que parecen conectados pero no lo están:** el extremo del cable debe terminar exactamente en la punta del pin. Si mueves el componente y el cable no lo sigue, no estaba conectado.
- **LED al revés:** revisa que la corriente vaya del ánodo (lado plano del triángulo) al cátodo (lado de la raya).
- **Elegir un componente SMD por error:** revisa la huella. Si las almohadillas son diminutas y no tienen agujero, es SMD.
- **Etiquetas de red mal escritas:** "GND" y "Gnd" o "GPIO21" y "GPI021" (con cero) son redes distintas.

### Mini práctica

Modifica tu esquemático para tener **3 LEDs** (rojo, amarillo y verde), **cada uno con su propia resistencia de 220 Ω**, todos alimentados desde 3V3 y GND.

Pregunta para tu bitácora: ¿por qué cada LED lleva su propia resistencia en lugar de compartir una sola?

### Puedo continuar si…

- [ ] Tengo un proyecto en EasyEDA con un esquemático guardado.
- [ ] El ERC no muestra errores.
- [ ] Sé qué es un designador, una red y una etiqueta de red.

## E5 · Esquemático con ESP32

### Objetivo

Dibujar un esquemático con el ESP32 controlando un LED y leyendo un botón, entendiendo para qué sirve la resistencia pull-down.

### ¿Para qué me sirve?

**En todas las categorías.** El botón de inicio es obligatorio en minisumo y muy común en las demás categorías. Y cualquier placa de robot tiene el ESP32 en el centro de su esquemático.

### Explicación

#### Cómo representar la placa ESP32 en el esquemático

Hay dos formas:

- **Opción A:** buscar en la librería un símbolo de "ESP32 DevKit V1" de 30 pines. Existen varios hechos por la comunidad, pero no todos tienen el orden de pines correcto.
- **Opción B (recomendada):** usar **dos conectores hembra de 1×15 pines** (paso 2.54 mm). La placa ESP32 se enchufa sobre ellos, como en una protoboard. Luego, a cada pin del conector le pones una **etiqueta de red** con su nombre real (GND, 3V3, VIN, GPIO18…), siguiendo el pinout de la E3.

La opción B es la que se usa en muchos robots reales: la placa del robot tiene los conectores y el ESP32 se puede retirar para reemplazarlo.

#### El problema del botón "flotante"

Un botón conectado entre **3V3** y un GPIO parece suficiente: al presionarlo, llegan 3.3 V al pin y el ESP32 lee HIGH. Pero ¿qué lee cuando **no** está presionado?

Si el pin no está conectado a nada, queda **flotante**: funciona como una pequeña antena y capta ruido eléctrico. El ESP32 leerá HIGH y LOW al azar, como si alguien presionara el botón solo.

#### La solución: resistencia pull-down

Se conecta una resistencia de **10 kΩ** entre el GPIO y **GND**:

- **Botón suelto:** la resistencia "jala" el pin hacia 0 V → el ESP32 lee **LOW**.
- **Botón presionado:** el botón conecta el pin directo a 3.3 V → el ESP32 lee **HIGH**.

¿Por qué 10 kΩ? Porque al presionar el botón pasa una corriente pequeñísima de 3V3 a GND a través de ella (3.3 / 10 000 = 0.33 mA). Si fuera de 10 Ω, sería casi un cortocircuito.

> **Dato:** también existe la **resistencia pull-up** (hacia 3V3, con el botón hacia GND). Funciona al revés: presionado = LOW. Ambas son válidas; en Nova usamos pull-down porque es más intuitivo: **presionado = HIGH**.

#### El botón de 4 patas

Los botones comunes tienen 4 patas, pero internamente están **unidas de dos en dos**. En el esquemático se dibujan con 2 terminales. Al diseñar la placa (E6), la huella tendrá 4 agujeros.

### Paso a paso

1. En tu proyecto `Nova - Prácticas`, crea un **nuevo esquemático** llamado `E5 - ESP32 LED y botón`.
2. Coloca **dos conectores hembra de 1×15 pines**. Nómbralos `ESP_IZQ` y `ESP_DER`.
3. Siguiendo el pinout de la E3, pon a cada pin una **etiqueta de red** con su nombre: GND, 3V3, VIN, GPIO18, GPIO21, etc. (al menos los pines que vas a usar, más GND, 3V3 y VIN).
4. **LED verde:** etiqueta `GPIO18` → resistencia 220 Ω (R1) → ánodo del LED (D1) → cátodo → GND.
5. **Botón:** un terminal del botón (SW1) a **3V3**; el otro terminal a una etiqueta `GPIO21`. Desde esa misma red `GPIO21`, una resistencia de **10 kΩ** (R2) hacia **GND**.
6. Ejecuta el **ERC** y corrige los errores.
7. Exporta el **PDF**.

### Errores comunes

- **Pull-down mal ubicada:** la resistencia de 10 kΩ va entre el **GPIO** y **GND**, no en serie con el botón.
- **Etiquetas que no coinciden** con el pinout: revisa dos veces cada nombre.
- **Botón conectado a 5 V (VIN):** ¡estarías enviando 5 V al GPIO! El botón va a **3V3**.
- **Olvidar el GND** del conector del ESP32: sin él, la placa no comparte tierra con el resto del circuito.

### Mini práctica

1. Agrega al esquemático el **LED amarillo** (GPIO19) y el **LED rojo** (GPIO23), cada uno con su resistencia de 220 Ω.
2. Pregunta para tu bitácora: si quisieras usar una resistencia **pull-up** en vez de pull-down, ¿cómo cambiarían las conexiones del botón?

### Puedo continuar si…

- [ ] Puedo explicar qué es un pin flotante y cómo lo soluciona una pull-down.
- [ ] Mi esquemático tiene el ESP32 representado con conectores y etiquetas.
- [ ] El ERC no muestra errores.

## E6 · Del esquemático a la PCB

### Objetivo

Convertir un esquemático en una placa de circuito impreso (PCB): colocar componentes, trazar pistas y verla en 3D.

### ¿Para qué me sirve?

**En todas las categorías.** Los robots de competencia usan placas propias porque son más pequeñas, livianas y confiables que los cables sueltos, que se desconectan con los golpes y las vibraciones.

### Explicación

#### ¿Qué es una PCB?

Una **PCB** (placa de circuito impreso) es una placa de fibra de vidrio con caminos de cobre que reemplazan a los cables. Sus partes:

- **Capas de cobre:** normalmente dos, superior (**Top**) e inferior (**Bottom**).
- **Pistas:** los "cables" de cobre que unen los componentes.
- **Pads:** las zonas de cobre donde se sueldan las patas.
- **Vías:** agujeritos que conectan una pista de la capa superior con una de la inferior.
- **Serigrafía (silkscreen):** los textos y dibujos impresos (nombres de componentes, logos).
- **Contorno (board outline):** la forma y el tamaño de la placa.

#### Las líneas de aire (ratsnest)

Al pasar del esquemático a la PCB, los componentes aparecen sueltos y unidos por **líneas delgadas**. Esas líneas no son pistas: solo te indican **qué falta conectar**. Tu trabajo es reemplazarlas por pistas reales.

#### Reglas básicas de ruteo para empezar

| Tipo de pista | Ancho recomendado |
| --- | --- |
| Señales (LEDs, botón, potenciómetro, señal del servo) | 0.5 mm |
| Alimentación (3V3, 5 V, GND, alimentación del servo) | 1.0 mm |

¿Por qué las de alimentación son más anchas? Porque llevan más corriente. Una pista delgada con mucha corriente se calienta, igual que un cable delgado.

Otras reglas:

- Evita las esquinas de 90°: usa **ángulos de 45°**.
- Dos pistas de la **misma capa no pueden cruzarse**. Si necesitas cruzar, pasa una a la otra capa con una **vía**.
- Mantén los componentes relacionados **cerca** entre sí, y los conectores **en los bordes** de la placa.

#### El plano de tierra (opcional)

En lugar de trazar todas las pistas de GND, se puede **rellenar con cobre** una capa entera y conectarla a GND. Esto simplifica el ruteo y reduce el ruido eléctrico. Se llama **plano de tierra** o **relleno de cobre (copper pour)**.

#### La verificación DRC

La **verificación de reglas de diseño (DRC)** revisa que las pistas no estén demasiado juntas, que no falte ninguna conexión y que todo se pueda fabricar. Es el equivalente al ERC, pero para la placa.

#### Los archivos de fabricación

Para mandar a fabricar una placa se exportan los archivos **Gerber**. En este nivel **no** vas a fabricar nada, pero es bueno que sepas que existen: los usarás cuando diseñes placas reales en el equipo.

### Paso a paso

Vamos a hacer la PCB del circuito de la E4 (conector + resistencia + LED):

1. Abre el esquemático de la E4 y usa la opción para **actualizar o convertir a PCB**.
2. En la PCB, dibuja un **contorno rectangular** de 30 × 20 mm.
3. **Coloca los componentes** dentro del contorno: el conector J1 en un borde, R1 y D1 cerca de él.
4. Configura el **ancho de pista**: 1.0 mm para 3V3 y GND, 0.5 mm para las demás.
5. **Traza las pistas** siguiendo las líneas de aire, con ángulos de 45°.
6. Ejecuta el **DRC** y corrige los errores.
7. Abre la **vista 3D** y toma una captura.

### Errores comunes

- **Cambiar el esquemático y no actualizar la PCB:** cada vez que cambias el esquemático, debes volver a actualizar la PCB.
- **Componentes fuera del contorno:** el DRC lo marcará como error.
- **Pistas que se cruzan en la misma capa:** eso sería un cortocircuito. Usa la otra capa y una vía.
- **Huella equivocada:** si en la vista 3D el componente se ve raro o diminuto, vuelve al esquemático y revisa la huella.

### Mini práctica

Haz la PCB del esquemático de la **E5** (ESP32 con los LEDs y el botón). Ten en cuenta:

- Los dos conectores de 15 pines deben quedar **paralelos**, a la distancia que tienen las filas de pines de la placa real. **Investiga esa distancia** en la hoja de datos de la ESP32 DevKit V1 de 30 pines o en sus planos: es parte del reto.
- Deja los LEDs y el botón en un borde, donde se puedan ver y presionar.

### Puedo continuar si…

- [ ] Sé qué son las pistas, los pads, las vías y la serigrafía.
- [ ] Mi PCB pasa el DRC sin errores.
- [ ] Puedo ver mi placa en 3D.

## Tarea final · Parte Electrónica

Diseña el esquemático y la PCB del **Panel de control Nova** (la descripción completa del proyecto está en la página de la tarea final).

### Requisitos del esquemático

- [ ] ESP32 representado con **dos conectores de 1×15 pines** y etiquetas de red según el pinout.
- [ ] **3 LEDs** (verde, amarillo y rojo) con sus resistencias de **220 Ω** en GPIO 18, 19 y 23.
- [ ] **Botón** en GPIO 21 con su resistencia **pull-down de 10 kΩ**.
- [ ] **Potenciómetro de 10 kΩ:** extremos a 3V3 y GND, cursor a GPIO 34.
- [ ] **Conector de 3 pines para el servo:** GND, 5 V (VIN) y señal en GPIO 25.
- [ ] Tu **nombre** en el cuadro de título o como texto en la hoja.
- [ ] **ERC sin errores.**

### Requisitos de la PCB

- [ ] Todos los componentes dentro del contorno.
- [ ] Pistas de alimentación de 1.0 mm y de señal de 0.5 mm (o plano de tierra).
- [ ] Conectores de la ESP32 a la distancia correcta.
- [ ] **DRC sin errores.**
- [ ] Vista 3D.

### Qué entregas

- **PDF** del esquemático.
- **Dos capturas** de la PCB: una en 2D y otra en 3D.

### Retos extra (opcionales)

- Agrega un **plano de tierra** en la capa inferior.
- Agrega el **logo o el nombre de Nova** en la serigrafía.
- Agrega un **LED de encendido** conectado a 3V3 (con su resistencia) que indique que la placa tiene energía.
- Agrega **4 agujeros de montaje** de 3.2 mm en las esquinas, para atornillar la placa dentro de la caja que diseñarás en Mecánica.
