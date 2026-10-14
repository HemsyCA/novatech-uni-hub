En esta parte vas a aprender a darle instrucciones al ESP32: encender luces, leer botones y sensores, mover un servo y recibir comandos. Son las mismas instrucciones que usan todos los robots de Nova, sin importar la categoría.

#### ¿Por qué empezamos con un simulador?

**Wokwi** es un simulador que funciona en el navegador: tiene un ESP32 virtual al que le puedes conectar LEDs, botones, potenciómetros y servos, y programarlo exactamente igual que uno real. Así:

- No necesitas comprar nada para aprender.
- No hay riesgo de quemar componentes.
- El mismo código funcionará después en una placa real (lo verás en la lección Extra).

## P1 · Pensar como un robot

### Objetivo

Entender qué es un algoritmo y representarlo con un diagrama de flujo, antes de escribir una sola línea de código.

### ¿Para qué me sirve?

**En todas las categorías.** La estrategia de un minisumo, la lógica de corrección de un seguidor de línea o la secuencia de pasos de un OTTO son algoritmos. Los buenos programadores primero piensan y dibujan; después escriben código.

### Explicación

#### ¿Qué es un algoritmo?

Un **algoritmo** es una lista de instrucciones **exactas y ordenadas** para resolver un problema. Una receta de cocina es un algoritmo.

La diferencia con una persona es que **una computadora no interpreta**: hace exactamente lo que le dices, ni más ni menos. Si a una persona le dices "camina hasta la puerta", lo hace. A un robot tienes que decirle: "avanza un paso; ¿llegaste a la puerta? Si no, avanza otro paso; si sí, detente".

#### El ciclo de todo robot

Todo programa de robot repite sin parar:

1. **Percibir:** leer botones, sensores o comandos.
2. **Decidir:** según lo que leyó, elegir qué hacer.
3. **Actuar:** mover motores o servos, encender luces.

#### Los 3 bloques de todo programa

Cualquier algoritmo, por complicado que sea, se arma combinando solo tres cosas:

| Bloque | Qué es | Ejemplo |
| --- | --- | --- |
| **Secuencia** | Instrucciones una tras otra | Encender LED, esperar 1 s, apagar LED |
| **Decisión** | Elegir un camino según una condición | Si el botón está presionado, encender; si no, apagar |
| **Repetición** | Hacer algo varias veces | Parpadear 5 veces |

#### Diagramas de flujo

Un **diagrama de flujo** dibuja un algoritmo con figuras estándar:

| Figura | Significado |
| --- | --- |
| **Óvalo** | Inicio o fin |
| **Rectángulo** | Una acción ("encender LED") |
| **Rombo** | Una decisión con dos salidas: sí / no ("¿botón presionado?") |
| **Flechas** | El orden en que se siguen los pasos |

**Ejemplo: un semáforo.**

Inicio → Encender verde → Esperar 3 s → Apagar verde → Encender amarillo → Esperar 1 s → Apagar amarillo → Encender rojo → Esperar 3 s → Apagar rojo → volver a "Encender verde".

Fíjate en la última flecha: vuelve al principio. Los programas de robots **nunca terminan**: se repiten mientras el robot esté encendido.

### Paso a paso

Dibuja el diagrama de flujo de este algoritmo:

> Un robot espera a que presionen su botón de inicio. Cuando lo presionan, avanza. Mientras avanza, si detecta un obstáculo, gira; si no, sigue avanzando.

1. Empieza con un óvalo de **Inicio**.
2. Agrega un rombo: **¿Botón presionado?** Si la respuesta es "no", la flecha vuelve al mismo rombo (el robot sigue esperando).
3. Si es "sí", un rectángulo: **Avanzar**.
4. Un rombo: **¿Hay obstáculo?**
   - Sí → rectángulo **Girar** → la flecha vuelve al rombo del obstáculo.
   - No → la flecha vuelve a **Avanzar**.

Puedes dibujarlo en papel o en [app.diagrams.net](https://app.diagrams.net) (gratuito, en el navegador).

### Errores comunes

- **Rombos con una sola salida:** toda decisión tiene dos caminos (sí y no).
- **Instrucciones ambiguas:** "moverse un poco" no es una instrucción. "Avanzar durante 1 segundo" sí lo es.
- **Olvidar qué pasa en el caso "no":** es el error de lógica más común en los robots.

### Mini práctica

Dibuja el diagrama de flujo de una **lámpara inteligente**: si está oscuro **y** hay alguien en la habitación, se enciende; en cualquier otro caso, se apaga. Pista: necesitarás dos rombos.

### Puedo continuar si…

- [ ] Puedo explicar qué es un algoritmo y el ciclo percibir → decidir → actuar.
- [ ] Reconozco secuencia, decisión y repetición.
- [ ] Puedo dibujar un diagrama de flujo con decisiones.

## P2 · Salida digital: tu primer programa

### Objetivo

Crear tu primer proyecto en Wokwi y hacer parpadear un LED, entendiendo la estructura de un programa de Arduino.

### ¿Para qué me sirve?

**En todas las categorías.** Encender y apagar un pin es la acción más básica: con ella se encienden indicadores y se envían órdenes de dirección a los drivers de motores.

### Explicación

#### La estructura de un programa de Arduino

Todo programa (en Arduino se llama **sketch**) tiene dos partes obligatorias:

```cpp
void setup() {
  // Se ejecuta UNA sola vez, al encender el ESP32.
  // Aquí se configura todo.
}

void loop() {
  // Se repite PARA SIEMPRE, una y otra vez.
  // Aquí va el comportamiento del robot.
}
```

- **`setup()`** es como prepararte antes de una carrera: se hace una vez.
- **`loop()`** es la carrera: se repite sin parar mientras el ESP32 tenga energía.

#### Reglas de escritura

- Cada instrucción termina con **punto y coma** `;`
- Las **llaves** `{ }` agrupan instrucciones: todo lo que está entre ellas pertenece a `setup()` o a `loop()`.
- Lo que va después de `//` es un **comentario**: el ESP32 lo ignora. Sirve para explicar tu código a otras personas (y a ti mismo en el futuro).
- **Mayúsculas y minúsculas importan:** `pinMode` funciona, `pinmode` no.

#### Las tres primeras instrucciones

| Instrucción | Qué hace | Ejemplo |
| --- | --- | --- |
| `pinMode(pin, modo)` | Configura un pin como salida (`OUTPUT`) o entrada (`INPUT`) | `pinMode(18, OUTPUT);` |
| `digitalWrite(pin, valor)` | Pone el pin en 3.3 V (`HIGH`) o en 0 V (`LOW`) | `digitalWrite(18, HIGH);` |
| `delay(ms)` | Espera los milisegundos indicados (1000 ms = 1 s) | `delay(500);` |

#### Ponerle nombre a los pines

En vez de escribir el número del pin en todo el programa, se le da un nombre al principio:

```cpp
const int LED_VERDE = 18;
```

Así el código se entiende mejor (`LED_VERDE` dice más que `18`) y, si cambias el LED de pin, solo cambias una línea. `const` significa que ese valor no cambiará durante el programa.

> **Dato:** en internet verás también `#define LED_VERDE 18`. Hace algo parecido. Ojo: esa forma **no** lleva `=` ni `;`.

### Paso a paso

**1. Crear el proyecto**

1. Entra a [wokwi.com](https://wokwi.com) y crea una cuenta (puedes usar tu cuenta de Google).
2. Crea un **nuevo proyecto** con **ESP32** y la plantilla de **Arduino**.
3. Verás tres zonas: el **código** (`sketch.ino`) a la izquierda, la **simulación** a la derecha y, arriba, la pestaña `diagram.json` (que guarda tus conexiones; no necesitas tocarla).

**2. Armar el circuito**

1. En la zona de simulación, haz clic en el botón **+** y agrega un **LED** y una **resistencia**.
2. Haz clic en la resistencia y cambia su valor a **220 Ω**.
3. Conecta haciendo clic en un pin y luego en otro:
   - **GPIO 18 (D18)** del ESP32 → un extremo de la resistencia.
   - El otro extremo de la resistencia → **ánodo** del LED (pata **A**, la doblada).
   - **Cátodo** del LED (pata **C**) → **GND** del ESP32.

**3. Escribir el código**

```cpp
// P2: Mi primer parpadeo
const int LED_VERDE = 18;   // el LED está en el GPIO 18

void setup() {
  pinMode(LED_VERDE, OUTPUT);   // el pin 18 será una SALIDA
}

void loop() {
  digitalWrite(LED_VERDE, HIGH);  // encender (3.3 V)
  delay(1000);                    // esperar 1 segundo
  digitalWrite(LED_VERDE, LOW);   // apagar (0 V)
  delay(1000);                    // esperar 1 segundo
}
```

**4. Probar**

1. Presiona el botón verde de **Play** ▶. El LED debe parpadear cada segundo.
2. Cambia los `delay` a 200 y vuelve a probar. ¿Qué pasa?
3. **Guarda** el proyecto (botón Save) con el nombre `P2 - Parpadeo`.

### Errores comunes

- **Falta un `;`:** el error suele aparecer en la línea **siguiente** a donde falta.
- **LED al revés:** el ánodo (A) va hacia el pin y el cátodo (C) hacia GND.
- **El LED no enciende y no hay error:** revisa que el número del pin en el código coincida con el pin donde conectaste el cable.
- **Escribir `High` o `Output`:** deben ir en mayúsculas: `HIGH`, `OUTPUT`.

### Mini práctica

Agrega el **LED amarillo** (GPIO 19) y el **LED rojo** (GPIO 23), cada uno con su resistencia, y programa un **semáforo**:

- Verde encendido 3 segundos.
- Amarillo encendido 1 segundo.
- Rojo encendido 3 segundos.
- Y vuelta a empezar.

Guárdalo como `P2 - Semáforo`.

### Puedo continuar si…

- [ ] Sé para qué sirven `setup()` y `loop()`.
- [ ] Sé usar `pinMode`, `digitalWrite` y `delay`.
- [ ] Mi semáforo funciona en Wokwi y está guardado.

## P3 · El Monitor Serial y las variables

### Objetivo

Hacer que el ESP32 te "hable" a través del Monitor Serial y guardar información en variables.

### ¿Para qué me sirve?

**En todas las categorías.** El Monitor Serial es tu principal herramienta para encontrar errores: te muestra qué está leyendo el robot y qué está decidiendo. Se usa para calibrar sensores de línea, revisar ángulos de servos y depurar estrategias.

### Explicación

#### El Monitor Serial

El ESP32 puede enviar texto a la computadora por el mismo cable USB (en Wokwi, aparece en una ventana debajo de la simulación). Para usarlo:

| Instrucción | Qué hace |
| --- | --- |
| `Serial.begin(115200);` | Inicia la comunicación (va en `setup()`). 115200 es la velocidad. |
| `Serial.print("texto");` | Escribe el texto y se queda en la misma línea |
| `Serial.println("texto");` | Escribe el texto y salta a la línea siguiente |

#### Las variables

Una **variable** es una "caja" con nombre donde el programa guarda un dato que puede cambiar. Al crearla, indicas qué **tipo** de dato guarda:

| Tipo | Qué guarda | Ejemplo |
| --- | --- | --- |
| `int` | Números enteros | `int contador = 0;` |
| `float` | Números con decimales | `float voltaje = 3.3;` |
| `bool` | Verdadero o falso | `bool encendido = true;` |
| `char` | Una sola letra o símbolo | `char letra = 'a';` |
| `String` | Texto | `String nombre = "Nova";` |

#### Operaciones

Con las variables puedes hacer cuentas: `+` (suma), `-` (resta), `*` (multiplicación) y `/` (división).

```cpp
contador = contador + 1;   // toma el valor de contador, súmale 1 y guárdalo de nuevo
```

> **Cuidado con la división de enteros.** `7 / 2` da **3**, no 3.5, porque los dos números son enteros y el resultado se corta. Para obtener decimales, al menos uno debe tener punto: `7 / 2.0` da **3.5**.

#### ¿Dónde se crean las variables?

- **Fuera de `setup()` y `loop()`** (arriba del todo): la variable existe durante todo el programa y la pueden usar todas las partes. Se llama **variable global**.
- **Dentro de `loop()`**: la variable se crea de nuevo en cada vuelta y solo existe ahí. Se llama **variable local**.

### Paso a paso

1. Crea un nuevo proyecto ESP32 en Wokwi (no necesitas conectar nada).
2. Escribe este código:

```cpp
// P3: Contador
int contador = 0;          // número entero
float voltaje = 3.3;       // número con decimales

void setup() {
  Serial.begin(115200);
  Serial.println("Hola, soy el ESP32 de Nova");
  Serial.print("Trabajo con ");
  Serial.print(voltaje);
  Serial.println(" voltios");
}

void loop() {
  contador = contador + 1;
  Serial.print("Contador: ");
  Serial.println(contador);
  delay(1000);
}
```

3. Presiona **Play** y observa el **Monitor Serial**: debe aparecer el saludo una sola vez y luego el contador aumentando cada segundo.
4. Guárdalo como `P3 - Contador`.

### Errores comunes

- **No aparece nada en el Monitor Serial:** revisa que hayas escrito `Serial.begin(115200);` en `setup()`.
- **Aparecen símbolos raros:** la velocidad del Monitor Serial no coincide con la de `Serial.begin`. En Arduino IDE, selecciónala abajo a la derecha del monitor.
- **Usar comillas dobles para un `char`:** una letra suelta va con comillas simples `'a'`; el texto, con dobles `"hola"`.
- **Resultados de división "incorrectos":** revisa la división de enteros.

### Mini práctica

Programa una **calculadora de resistencias para LEDs** (lo que aprendiste en Electrónica E1):

1. Crea tres variables `float`: el voltaje de la fuente (3.3), el voltaje del LED (2.0) y la corriente deseada en amperios (0.010).
2. Calcula la resistencia con la Ley de Ohm y guárdala en otra variable.
3. Imprime el resultado en el Monitor Serial con un mensaje claro.

Si todo está bien, debe mostrar **130**. Prueba cambiar los valores con los ejercicios de E1.

### Puedo continuar si…

- [ ] Sé imprimir textos y valores en el Monitor Serial.
- [ ] Sé crear variables `int`, `float` y `bool`.
- [ ] Entiendo por qué `7 / 2` da 3.

## P4 · Entrada digital: el botón

### Objetivo

Leer un botón, tomar decisiones con `if` / `else` y detectar el momento exacto en que se presiona.

### ¿Para qué me sirve?

- **Minisumo:** el botón de inicio es obligatorio en el reglamento.
- **Todas las categorías:** botones para elegir estrategias, finales de carrera, sensores de choque.
- Aquí aprendes además a tomar **decisiones**, la base de la parte "decidir" de cualquier robot.

### Explicación

#### Leer un pin

`digitalRead(pin)` devuelve `HIGH` si le llegan 3.3 V y `LOW` si le llegan 0 V. Para usarla, el pin se configura como entrada: `pinMode(pin, INPUT);`.

El botón va entre **3V3** y el pin, y además se agrega una **resistencia pull-down de 10 kΩ** entre el pin y **GND**. ¿Por qué? Si al soltar el botón el pin quedara sin conexión, leería valores al azar (se dice que queda "flotante"). La resistencia lo mantiene en `LOW` mientras nadie presiona. Resultado: **presionado = `HIGH`, suelto = `LOW`**. (Lo verás en detalle en Electrónica E5).

#### Decisiones con `if` / `else`

```cpp
if (condición) {
  // se ejecuta si la condición es verdadera
} else {
  // se ejecuta si es falsa
}
```

Las condiciones comparan valores:

| Operador | Significado |
| --- | --- |
| `==` | igual a |
| `!=` | distinto de |

> **El error más famoso:** `=` **guarda** un valor; `==` **compara**. `if (estado = HIGH)` está mal; `if (estado == HIGH)` está bien.

Puedes combinar condiciones:

| Operador | Significado | Ejemplo |
| --- | --- | --- |
| `&&` | Y (las dos deben cumplirse) | `if (a == HIGH && b == HIGH)` |
| `\|\|` | O (basta con una) | `if (a == HIGH \|\| b == HIGH)` |
| `!` | NO (invierte) | `!true` es `false` |

#### Estar presionado vs. "acabar de presionar"

Hay dos formas de usar un botón:

1. **Mientras está presionado:** el LED se enciende solo mientras mantienes el dedo encima.
2. **Cada vez que se presiona:** cada pulsación cambia algo (encender/apagar, cambiar de modo). Para esto hay que detectar el **cambio**: el botón estaba en `LOW` y ahora está en `HIGH`. Para saberlo, se guarda en una variable cómo estaba el botón en la vuelta anterior del `loop()`.

#### El rebote

Cuando presionas un botón real, sus contactos metálicos "rebotan" durante unos milisegundos: el ESP32 ve varias pulsaciones muy rápidas en lugar de una. La solución más simple es **esperar unos 50 ms** después de detectar un cambio, hasta que la señal se estabilice. A esto se le llama **antirrebote (debounce)**.

### Paso a paso

**Parte 1: mientras está presionado**

1. Nuevo proyecto en Wokwi. Agrega un **LED verde** con su resistencia de 220 Ω en el GPIO 18 (como en P2).
2. Agrega un **botón** y una **resistencia** de **10 kΩ** (escribe 10000 en su valor).
3. Conecta:
   - Un lado del botón → **3V3**.
   - El otro lado del botón → **GPIO 21 (D21)**.
   - GPIO 21 → resistencia de 10 kΩ → **GND**.
4. Escribe y prueba:

```cpp
// P4 - Parte 1: LED mientras el botón está presionado
const int BOTON = 21;
const int LED_VERDE = 18;

void setup() {
  pinMode(BOTON, INPUT);        // entrada, con pull-down externa de 10 kΩ
  pinMode(LED_VERDE, OUTPUT);
}

void loop() {
  int estado = digitalRead(BOTON);   // HIGH = presionado, LOW = suelto

  if (estado == HIGH) {
    digitalWrite(LED_VERDE, HIGH);
  } else {
    digitalWrite(LED_VERDE, LOW);
  }
}
```

**Parte 2: cada pulsación cambia el LED**

1. Cambia el código por este y pruébalo:

```cpp
// P4 - Parte 2: cada pulsación enciende o apaga el LED
const int BOTON = 21;
const int LED_VERDE = 18;

int estadoAnterior = LOW;     // cómo estaba el botón en la vuelta anterior
bool ledEncendido = false;    // ¿el LED está encendido?

void setup() {
  Serial.begin(115200);
  pinMode(BOTON, INPUT);
  pinMode(LED_VERDE, OUTPUT);
}

void loop() {
  int estado = digitalRead(BOTON);

  if (estado != estadoAnterior) {        // ¿cambió el botón?
    if (estado == HIGH) {                // ...y ahora está presionado
      ledEncendido = !ledEncendido;      // invertir: true ↔ false
      digitalWrite(LED_VERDE, ledEncendido);

      if (ledEncendido) {
        Serial.println("LED encendido");
      } else {
        Serial.println("LED apagado");
      }
    }
    delay(50);                           // antirrebote
  }

  estadoAnterior = estado;               // recordar para la próxima vuelta
}
```

2. Presiona el botón varias veces y revisa el Monitor Serial.
3. Guarda el proyecto como `P4 - Botón`.

### Errores comunes

- **El LED se enciende y apaga solo:** falta la resistencia pull-down o está mal conectada (el pin está flotando).
- **Una pulsación cuenta como varias:** falta el antirrebote.
- **Usar `=` en lugar de `==`** dentro del `if`.
- **Olvidar `estadoAnterior = estado;`** al final: el programa nunca detectará el cambio correctamente.

### Mini práctica

Modifica la Parte 2 para que, además, el programa **cuente cuántas veces** se presionó el botón e imprima el total en cada pulsación (por ejemplo: `Pulsaciones: 5`).

### Puedo continuar si…

- [ ] Sé leer un botón con `digitalRead`.
- [ ] Sé usar `if` / `else` y la diferencia entre `=` y `==`.
- [ ] Entiendo cómo detectar el momento en que se presiona el botón y para qué sirve el antirrebote.

## P5 · Entrada analógica: el potenciómetro

### Objetivo

Leer un valor que varía con `analogRead`, convertirlo a otras escalas con `map` y tomar decisiones por rangos.

### ¿Para qué me sirve?

- **Seguidor de línea:** sus sensores se leen exactamente así; el número cambia según el piso sea blanco o negro.
- **Todas las categorías:** medir la batería, leer sensores de distancia analógicos, perillas de ajuste.

### Explicación

#### De voltaje a número

En Electrónica E2 viste que un potenciómetro entrega un voltaje entre 0 y 3.3 V. El ESP32 lo mide con su **convertidor analógico-digital (ADC)** y lo transforma en un número entre **0 y 4095**:

| Voltaje en el pin | Número que lee el ESP32 |
| --- | --- |
| 0 V | 0 |
| 1.65 V | ≈ 2048 |
| 3.3 V | 4095 |

¿Por qué 4095? Porque el ADC del ESP32 es de **12 bits**: puede distinguir 4096 niveles distintos (de 0 a 4095).

La instrucción es `analogRead(pin)`. Solo funciona en pines con ADC; por eso usamos el **GPIO 34**.

#### Convertir a voltios

```cpp
float voltaje = valor * 3.3 / 4095.0;
```

(Fíjate en el `4095.0`: es para evitar la división de enteros que viste en P3).

#### La función `map`

`map` convierte un número de una escala a otra, como una regla de tres:

```cpp
int porcentaje = map(valor, 0, 4095, 0, 100);
```

Se lee así: "toma `valor`, que va de 0 a 4095, y conviértelo a la escala de 0 a 100".

#### Decisiones por rangos

Para elegir entre más de dos caminos se usa `else if`:

```cpp
if (porcentaje < 33) {
  // nivel bajo
} else if (porcentaje < 66) {
  // nivel medio
} else {
  // nivel alto
}
```

El programa revisa las condiciones **en orden** y ejecuta solo la primera que se cumpla.

Comparadores disponibles: `<` (menor), `>` (mayor), `<=` (menor o igual), `>=` (mayor o igual).

### Paso a paso

1. Nuevo proyecto en Wokwi. Agrega un **potenciómetro**.
2. Conecta: **VCC** del potenciómetro → **3V3**; **GND** → **GND**; **SIG** (el del centro) → **GPIO 34 (D34)**.
3. Escribe y prueba:

```cpp
// P5: Leer un potenciómetro
const int POT = 34;

void setup() {
  Serial.begin(115200);
  // analogRead no necesita pinMode
}

void loop() {
  int valor = analogRead(POT);                  // 0 a 4095
  float voltaje = valor * 3.3 / 4095.0;         // en voltios
  int porcentaje = map(valor, 0, 4095, 0, 100); // de 0 a 100 %

  Serial.print("Valor: ");
  Serial.print(valor);
  Serial.print("   Voltaje: ");
  Serial.print(voltaje);
  Serial.print(" V   Porcentaje: ");
  Serial.print(porcentaje);
  Serial.println(" %");

  delay(300);
}
```

4. Durante la simulación, haz clic en el potenciómetro y gíralo. Observa cómo cambian los tres valores.
5. Guárdalo como `P5 - Potenciómetro`.

### Errores comunes

- **Siempre lee 0 o siempre 4095:** el cable del centro (SIG) no está en el GPIO 34, o los extremos están mal conectados.
- **Conectar el potenciómetro a 5 V (VIN):** ¡más de 3.3 V en un GPIO! Siempre a **3V3**.
- **Orden equivocado de los `else if`:** si pones primero `porcentaje < 66` y después `porcentaje < 33`, la segunda nunca se cumplirá.
- **En una placa real, los valores "tiemblan" un poco** o no llegan exactamente a 0 o a 4095: es normal. Los sensores reales siempre tienen algo de ruido.

### Mini práctica

Agrega los **3 LEDs** (GPIO 18, 19 y 23) y programa un **indicador de nivel**, como el de la batería de un celular:

- Menos de 33 %: solo el **verde**.
- De 33 % a 65 %: **verde y amarillo**.
- 66 % o más: **los tres**.

Bonus: si el nivel supera el 90 %, que el LED rojo parpadee.

### Puedo continuar si…

- [ ] Sé leer un valor con `analogRead` y por qué va de 0 a 4095.
- [ ] Sé usar `map` para cambiar de escala.
- [ ] Sé usar `else if` para decidir por rangos.

## P6 · PWM: controlar "cuánto"

### Objetivo

Controlar el brillo de un LED con PWM y repetir instrucciones con el bucle `for`.

### ¿Para qué me sirve?

- **Minisumo, soccer y seguidor de línea:** la **velocidad de los motores** se controla exactamente igual que el brillo de este LED.
- **Todas las categorías:** el bucle `for` está en cualquier programa que repita algo un número de veces.

### Explicación

#### El problema

Un pin digital solo tiene dos estados: 3.3 V o 0 V. Pero un robot necesita "cantidades": ir a media velocidad, brillar un poco. ¿Cómo se logra con algo que solo puede estar prendido o apagado?

#### La solución: PWM

**PWM** (modulación por ancho de pulso) consiste en **encender y apagar el pin muy rápido**, cientos o miles de veces por segundo. Tan rápido que el LED (y tu ojo) no alcanzan a notar el parpadeo: lo que se ve es el **promedio**.

- Si el pin está encendido el **50 %** del tiempo, el LED brilla a la mitad.
- Si está encendido el **10 %** del tiempo, brilla muy poco.
- A ese porcentaje se le llama **ciclo de trabajo (duty cycle)**.

Con un motor pasa lo mismo: recibe "empujones" muy rápidos y gira a una velocidad proporcional al ciclo de trabajo. Por eso, ya en el equipo, controlarás la velocidad de los motores con el mismo código que usarás aquí.

#### La instrucción `analogWrite`

```cpp
analogWrite(pin, valor);   // valor de 0 (apagado) a 255 (máximo)
```

- `analogWrite(23, 0);` → apagado
- `analogWrite(23, 128);` → aproximadamente la mitad
- `analogWrite(23, 255);` → brillo máximo

#### El bucle `for`

Repite un bloque un número determinado de veces:

```cpp
for (int i = 0; i < 5; i++) {
  // esto se repite 5 veces
}
```

Tiene tres partes, separadas por `;`:

1. **Inicio:** `int i = 0` → crea un contador que empieza en 0.
2. **Condición:** `i < 5` → se repite mientras se cumpla.
3. **Paso:** `i++` → al final de cada vuelta, suma 1 al contador (`i++` es lo mismo que `i = i + 1`; `i--` resta 1).

### Paso a paso

1. Nuevo proyecto en Wokwi con el **LED rojo** y su resistencia de 220 Ω en el **GPIO 23**.
2. Escribe el efecto "respiración":

```cpp
// P6: LED que "respira"
const int LED_ROJO = 23;

void setup() {
  // con analogWrite no hace falta pinMode
}

void loop() {
  // Subir el brillo de 0 a 255
  for (int brillo = 0; brillo <= 255; brillo++) {
    analogWrite(LED_ROJO, brillo);
    delay(5);
  }

  // Bajar el brillo de 255 a 0
  for (int brillo = 255; brillo >= 0; brillo--) {
    analogWrite(LED_ROJO, brillo);
    delay(5);
  }
}
```

3. Ejecuta y observa cómo el LED se enciende y se apaga suavemente.
4. Guárdalo como `P6 - PWM`.

### Errores comunes

- **Usar un pin de solo entrada** (34, 35, 36 o 39) para PWM: no funcionará.
- **Valores fuera de rango:** `analogWrite` acepta de 0 a 255. Si le pasas, por ejemplo, la lectura del potenciómetro (hasta 4095) sin convertirla con `map`, no funcionará como esperas.
- **Error al compilar `analogWrite`** en Arduino IDE: tu versión del soporte para ESP32 es antigua. Actualízala (lo verás en la lección Extra).
- **Bucle `for` que nunca termina:** revisa que la condición alguna vez deje de cumplirse (por ejemplo, `brillo++` con condición `brillo >= 0` nunca termina).

### Mini práctica

Agrega el **potenciómetro** en el GPIO 34 y haz que **controle el brillo** del LED rojo. Pista: necesitas `analogRead`, `map` (de 0–4095 a 0–255) y `analogWrite`.

### Puedo continuar si…

- [ ] Puedo explicar qué es PWM y el ciclo de trabajo.
- [ ] Sé usar `analogWrite` con valores de 0 a 255.
- [ ] Sé escribir un bucle `for` que suba y otro que baje.

## P7 · El servomotor

### Objetivo

Controlar el ángulo de un servomotor SG90 con la librería ESP32Servo.

### ¿Para qué me sirve?

- **OTTO y minihumanoide:** cada articulación es un servo. Caminar, bailar o saludar es mover servos a ángulos en el orden correcto.
- **Otras categorías:** brazos, pinzas, pateadores, mecanismos que se despliegan.

### Explicación

#### ¿Qué es un servo?

Un **servomotor** es un motor que no gira libremente, sino que **va a un ángulo exacto y se queda ahí**. Por dentro tiene:

- Un **motor** pequeño.
- **Engranajes** que reducen la velocidad y aumentan la fuerza.
- Un **potenciómetro** conectado al eje, que le dice en qué ángulo está (¡el mismo componente que usaste en P5!).
- Un **circuito de control** que compara el ángulo actual con el pedido y mueve el motor hasta que coincidan.

El **SG90** es el servo más usado en robótica educativa: se mueve de **0° a 180°**.

#### Sus 3 cables

| Color | Función | Conexión |
| --- | --- | --- |
| **Marrón** (o negro) | GND | GND |
| **Rojo** | Alimentación (≈ 5 V) | VIN (5 V) |
| **Naranja** (o amarillo) | Señal | GPIO 25 |

Recuerda lo que viste en E3: el GPIO solo envía la **señal**; la **energía** viene de 5 V.

#### ¿Cómo sabe el servo a qué ángulo ir?

Recibe un **pulso cada 20 milisegundos** (50 veces por segundo). La **duración** de ese pulso indica el ángulo:

- Pulso de **0.5 ms** → **0°**
- Pulso de **1.5 ms** → **90°**
- Pulso de **2.5 ms** → **180°**

¿Te suena? Es una señal **PWM**, como la de P6. Por suerte, no tienes que generarla a mano: una **librería** lo hace por ti.

#### ¿Qué es una librería?

Una **librería** es código que otras personas escribieron y que puedes reutilizar. Para el servo en el ESP32 usamos **ESP32Servo**.

> **Cuidado:** en internet verás mucho la librería `Servo.h`. Esa es para placas Arduino clásicas y **no funciona en el ESP32**. Usa siempre `ESP32Servo.h`.

#### Las instrucciones del servo

```cpp
#include <ESP32Servo.h>   // incluir la librería (arriba de todo)

Servo miServo;            // crear un "objeto" servo con el nombre que quieras

miServo.attach(pin, 500, 2500);   // conectarlo a un pin (va en setup)
miServo.write(90);                // mover a 90°
```

En `attach`, los números 500 y 2500 son la duración del pulso (en microsegundos) para 0° y para 180°.

### Paso a paso

1. Nuevo proyecto en Wokwi. Agrega un **servo**.
2. Conecta: **GND** del servo → GND; **V+** → **VIN** (o 5V); **PWM** (señal) → **GPIO 25 (D25)**.
3. Agrega la librería: abre la pestaña **Library Manager**, presiona **+** y busca **ESP32Servo**.
4. Escribe un barrido:

```cpp
// P7: Barrido del servo
#include <ESP32Servo.h>

const int PIN_SERVO = 25;
Servo miServo;

void setup() {
  miServo.setPeriodHertz(50);             // un pulso cada 20 ms
  miServo.attach(PIN_SERVO, 500, 2500);   // 0.5 ms = 0°, 2.5 ms = 180°
  miServo.write(90);                      // empezar en el centro
  delay(1000);
}

void loop() {
  // De 0° a 180°
  for (int angulo = 0; angulo <= 180; angulo++) {
    miServo.write(angulo);
    delay(10);
  }
  // De 180° a 0°
  for (int angulo = 180; angulo >= 0; angulo--) {
    miServo.write(angulo);
    delay(10);
  }
}
```

5. Ejecuta: el servo debe ir y volver de un extremo al otro, suavemente.
6. Prueba cambiar el `delay(10)` por `delay(2)` y por `delay(30)`. ¿Qué cambia?
7. Guárdalo como `P7 - Servo`.

### Errores comunes

- **Error al compilar con `Servo.h`:** usa `ESP32Servo.h` y verifica que la librería esté instalada.
- **El servo no se mueve:** revisa que el número del pin en `attach` sea el mismo que el del cable de señal.
- **En una placa real, el servo tiembla o el ESP32 se reinicia:** el servo pide más corriente de la que llega. Revisa la alimentación y que el GND sea común.
- **Ángulos fuera de rango:** el SG90 va de 0° a 180°. Para asegurarte de no pasarte, puedes usar `constrain(angulo, 0, 180)`, que recorta el valor a ese rango.
- **Mezclar `analogWrite` con un servo en el mismo programa:** en el ESP32, ambos usan el mismo hardware interno de PWM y pueden interferir; por ejemplo, el servo deja de responder después de usar `analogWrite`. Si te pasa, investígalo (es uno de los retos extra de la tarea final).

### Mini práctica

Agrega el **potenciómetro** en el GPIO 34 y haz que el servo **siga a la perilla**: al girarla, el servo se mueve de 0° a 180°. Imprime el ángulo en el Monitor Serial.

Pista: `map` de 0–4095 a 0–180.

### Puedo continuar si…

- [ ] Puedo explicar cómo un servo sabe a qué ángulo ir.
- [ ] Sé instalar una librería en Wokwi.
- [ ] Sé usar `attach` y `write` para mover el servo.

## P8 · Recibir comandos

### Objetivo

Recibir letras desde la computadora, reaccionar con `switch` y organizar tu código con funciones propias.

### ¿Para qué me sirve?

- **Minisumo y soccer por Bluetooth:** el robot recibe letras desde una app del celular y las convierte en movimientos. Lo que aprendes aquí es exactamente eso, pero desde la computadora.
- **Todas las categorías:** las funciones propias hacen que cualquier programa largo sea ordenado y fácil de corregir.

### Explicación

#### Recibir datos por Serial

Además de enviar texto, el ESP32 puede **recibir** lo que escribes en el Monitor Serial:

| Instrucción | Qué hace |
| --- | --- |
| `Serial.available()` | Dice cuántos caracteres llegaron y están esperando ser leídos. Si es mayor que 0, hay algo nuevo. |
| `Serial.read()` | Lee **un** carácter (una letra) y lo saca de la fila de espera. |

```cpp
if (Serial.available() > 0) {   // ¿llegó algo?
  char comando = Serial.read(); // leer una letra
}
```

#### La estructura `switch`

Cuando una variable puede tener muchos valores y cada uno lleva a una acción distinta, `switch` es más ordenado que muchos `if`:

```cpp
switch (comando) {
  case 'a':
    // si comando es 'a'
    break;
  case 'b':
    // si comando es 'b'
    break;
  default:
    // si no es ninguno de los anteriores
    break;
}
```

> **Cuidado:** cada `case` termina con `break`. Si lo olvidas, el programa sigue ejecutando el `case` siguiente.

#### Funciones propias

Una **función** es un bloque de código con nombre que puedes usar cuantas veces quieras. Ya usaste muchas (`digitalWrite`, `delay`…); ahora vas a crear las tuyas.

```cpp
void apagarTodo() {               // definir la función
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_ROJO, LOW);
}

apagarTodo();                     // usarla (llamarla)
```

Una función puede recibir **datos** (llamados **parámetros**) para trabajar con ellos:

```cpp
void encenderSolo(int pin) {      // recibe el número del pin
  apagarTodo();
  digitalWrite(pin, HIGH);
}

encenderSolo(LED_ROJO);           // apaga todo y enciende solo el rojo
```

**¿Por qué usar funciones?** Porque en vez de repetir las mismas 3 líneas en 5 lugares, escribes una vez y usas el nombre. Si hay un error, lo corriges en un solo lugar. Es lo que harás en el equipo con funciones como `adelante()`, `atras()` o `girarIzquierda()` para mover un robot.

#### El salto al Bluetooth

En el ESP32, recibir por Bluetooth es casi idéntico. Solo cambian unas pocas líneas:

```cpp
#include "BluetoothSerial.h"
BluetoothSerial SerialBT;

// en setup():
SerialBT.begin("Nova_Robot_1");    // el nombre que verás en el celular

// en loop():
if (SerialBT.available() > 0) {
  char comando = SerialBT.read();
  // ...el mismo switch de siempre
}
```

El simulador no puede probar Bluetooth, así que lo harás con una placa real ya en el equipo. Lo importante es que **la lógica ya la sabes**.

> **Dato:** el Bluetooth "clásico" del ESP32 (el de `BluetoothSerial`) funciona con celulares Android, pero no con iPhone.

### Paso a paso

1. Nuevo proyecto en Wokwi con los **3 LEDs** y sus resistencias (GPIO 18, 19 y 23).
2. Escribe:

```cpp
// P8: Controlar LEDs con letras
const int LED_VERDE = 18;
const int LED_AMARILLO = 19;
const int LED_ROJO = 23;

void setup() {
  Serial.begin(115200);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  Serial.println("Comandos: v = verde, a = amarillo, r = rojo, x = apagar todo");
}

void loop() {
  if (Serial.available() > 0) {     // ¿llegó algo?
    char comando = Serial.read();   // leer una letra

    switch (comando) {
      case 'v':
        encenderSolo(LED_VERDE);
        break;
      case 'a':
        encenderSolo(LED_AMARILLO);
        break;
      case 'r':
        encenderSolo(LED_ROJO);
        break;
      case 'x':
        apagarTodo();
        Serial.println("Todo apagado");
        break;
      case '\n':                    // ignorar el "Enter"
      case '\r':
        break;
      default:
        Serial.print("Comando desconocido: ");
        Serial.println(comando);
        break;
    }
  }
}

// ----- Funciones propias -----

void apagarTodo() {
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_ROJO, LOW);
}

void encenderSolo(int pin) {
  apagarTodo();
  digitalWrite(pin, HIGH);
  Serial.print("Encendido el LED del pin ");
  Serial.println(pin);
}
```

3. Ejecuta. Haz clic en la parte inferior del Monitor Serial, escribe `v` y presiona **Enter**. Prueba con `a`, `r`, `x` y con una letra que no exista.
4. Guárdalo como `P8 - Comandos`.

### Errores comunes

- **Aparece "Comando desconocido" después de cada letra:** al presionar Enter se envía también un salto de línea (`'\n'` o `'\r'`). Por eso el código los ignora en su propio `case`.
- **Olvidar el `break`:** se ejecutan dos acciones a la vez.
- **Comillas dobles en el `case`:** debe ser `case 'v':` (simples), no `case "v":`.
- **Mayúsculas:** `'V'` y `'v'` son letras distintas. Si quieres que funcionen las dos, pon dos `case` seguidos, como se hizo con `'\n'` y `'\r'`.

### Mini práctica

Agrega dos comandos nuevos, cada uno con su propia función:

1. `s` → ejecuta una vez la secuencia del **semáforo** de P2 (función `semaforo()`).
2. `p` → hace **parpadear 3 veces** el LED rojo. Crea la función `parpadear(int pin, int veces)` usando un bucle `for`, para que también sirva con otros pines y otras cantidades.

### Puedo continuar si…

- [ ] Sé recibir letras con `Serial.available()` y `Serial.read()`.
- [ ] Sé usar `switch` con `case`, `break` y `default`.
- [ ] Sé crear funciones propias, con y sin parámetros.
- [ ] Entiendo cómo esto se convierte en control por Bluetooth.

## Extra · Pasar a una placa real con Arduino IDE

> **Opcional:** esta lección es opcional en la Parte 1. Hazla si tienes una ESP32 DevKit V1, o déjala lista para cuando tengas tu placa.

### Objetivo

Instalar Arduino IDE, configurar el soporte para ESP32 y cargar un programa en una placa real.

### Explicación

**Arduino IDE** es el programa donde escribirás el código y lo cargarás a la placa por USB. El código es **el mismo** que usaste en Wokwi.

Para que tu computadora pueda hablar con el ESP32 necesitas tres cosas:

1. **Arduino IDE** instalado.
2. El **soporte para ESP32** dentro de Arduino IDE (no viene incluido).
3. El **driver** del chip USB de tu placa: **CP2102** o **CH340**. Mira el chip pequeño junto al conector USB para saber cuál tienes.

### Paso a paso

1. Descarga e instala **Arduino IDE 2** desde [arduino.cc](https://arduino.cc) (sección Software).
2. Abre **Archivo → Preferencias** y, en **URLs adicionales de gestor de placas**, pega: `https://espressif.github.io/arduino-esp32/package_esp32_index.json`
3. Abre el **Gestor de placas** (ícono de placa en la barra izquierda), busca **esp32** e instala **esp32 by Espressif Systems**.
4. Instala el **driver** de tu placa:
   - **CP2102:** búscalo como "CP210x driver" en la página de Silicon Labs.
   - **CH340:** búscalo como "CH340 driver" en la página de WCH.
5. Conecta la placa con un cable USB.
6. En **Herramientas → Placa**, elige **ESP32 Dev Module** (o **DOIT ESP32 DEVKIT V1**).
7. En **Herramientas → Puerto**, elige el puerto que apareció al conectar la placa (en Windows, algo como `COM3`).
8. Copia el código de **P2** y presiona **Subir** (la flecha →).
9. Si usas librerías (como ESP32Servo), instálalas desde el **Gestor de librerías** (ícono de libros).

### Errores comunes

- **No aparece ningún puerto:** falta el driver, o tu **cable USB es solo de carga** (no transmite datos). Prueba con otro cable; este error es mucho más común de lo que parece.
- **"Failed to connect to ESP32… Timed out waiting for packet header":** mantén presionado el botón **BOOT** de la placa cuando aparezca "Connecting…" en la consola, y suéltalo cuando empiece a cargar.
- **El programa se cargó, pero no pasa nada:** presiona el botón **EN** para reiniciar la placa.
- **Símbolos raros en el Monitor Serial:** selecciona **115200** baudios en el monitor.

### Puedo continuar si…

- [ ] Tengo Arduino IDE con el soporte para ESP32 instalado.
- [ ] Sé elegir la placa y el puerto.
- [ ] (Si tengo placa) Cargué el parpadeo y funciona.

## Tarea final · Parte Programación

Programa el **Panel de control Nova** en Wokwi (la descripción completa está en la página de la tarea final).

### El circuito

Arma en Wokwi el circuito completo usando el **Mapa de pines Nova**:

| Componente | Pin |
| --- | --- |
| LED verde (+ 220 Ω) | GPIO 18 |
| LED amarillo (+ 220 Ω) | GPIO 19 |
| LED rojo (+ 220 Ω) | GPIO 23 |
| Botón (+ pull-down de 10 kΩ) | GPIO 21 |
| Potenciómetro | GPIO 34 |
| Servo (señal) | GPIO 25 |

### Lo que debe hacer

- [ ] Al encender, el panel arranca en **modo MANUAL**.
- [ ] Cada pulsación del **botón** cambia entre modo MANUAL y modo COMANDOS (con antirrebote).
- [ ] **Modo MANUAL:** LED **verde** encendido; el **potenciómetro** mueve el servo de 0° a 180°.
- [ ] **Modo COMANDOS:** LED **amarillo** encendido; **3 letras elegidas por ti** llevan el servo a 0°, 90° y 180°. Las demás letras muestran un mensaje de "comando desconocido".
- [ ] **LED rojo:** se enciende cuando el servo está a **menos de 10°** o **más de 170°**, en cualquiera de los dos modos.
- [ ] **Reporte en el Monitor Serial:** cada vez que cambie el modo o el ángulo, imprime una línea con **tu nombre**, el **modo** y el **ángulo**. Por ejemplo: `[Ana] Modo: MANUAL | Ángulo: 95`
- [ ] Al iniciar, el programa imprime cuáles son tus 3 comandos.
- [ ] Usa al menos **2 funciones propias**.

### Recomendaciones

1. **Primero el diagrama de flujo** (P1), después el código.
2. **Construye por etapas** y prueba cada una antes de seguir:
   1. Botón que cambia de modo y enciende el LED correspondiente.
   2. Modo manual: potenciómetro → servo.
   3. Modo comandos: letras → servo.
   4. LED rojo de alerta.
   5. Reporte en el Monitor Serial.
3. **Cuidado con los `delay` largos** dentro del `loop()`: mientras el ESP32 espera, no lee el botón ni los comandos. Si algo "no responde", revisa esto.
4. **Para imprimir solo cuando algo cambie**, usa la misma idea que el `estadoAnterior` del botón (P4): guarda el valor anterior y compáralo con el actual.

### Qué entregas

1. **Link público** de tu proyecto de Wokwi (botón Share). Comprueba que se abre en una ventana de incógnito.
2. **Imagen del diagrama de flujo** de tu programa.

### Retos extra (opcionales)

- **Movimiento suave:** en modo comandos, que el servo no salte de golpe al nuevo ángulo, sino que avance grado a grado.
- **Comando de ayuda:** que `?` imprima la lista de comandos disponibles.
- **Brillo proporcional (reto de investigación):** que el brillo del LED rojo dependa del ángulo del servo. Atención: en el ESP32, `analogWrite` y la librería del servo pueden interferir entre sí. Investiga por qué pasa y cómo resolverlo, y explícalo en tu bitácora.
- **Memoria de posición:** al pasar de modo COMANDOS a MANUAL, que el servo no salte de golpe a la posición de la perilla, sino que se mueva despacio hasta ella.
