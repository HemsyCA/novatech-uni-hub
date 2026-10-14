// Preguntas de "Comprueba lo aprendido" al final de cada lección.
// Responderlas bien es lo que abre la siguiente lección del camino.

export interface QuizOption {
  text: string;
  // Por qué esta opción no es la correcta (se muestra al elegirla).
  hint?: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  correct: number;
  // Se muestra al acertar, para reforzar la idea.
  explanation: string;
}

export const lessonQuizzes: Record<string, QuizQuestion[]> = {
  "electronica/e1": [
    {
      question: "Con la analogía del agua, ¿qué es la corriente?",
      options: [
        { text: "La presión que empuja el agua", hint: "Esa es el voltaje: el empuje." },
        { text: "La cantidad de agua que pasa por segundo" },
        { text: "Qué tan estrecha es la tubería", hint: "Esa es la resistencia: se opone al paso." },
      ],
      correct: 1,
      explanation: "La corriente es cuánta electricidad circula. Se mide en amperios (A) o miliamperios (mA).",
    },
    {
      question: "Un LED rojo (2.0 V) va en un pin del ESP32 (3.3 V). ¿Cuánto voltaje queda en la resistencia?",
      options: [
        { text: "3.3 V", hint: "Ese es el voltaje de la fuente: falta restarle lo que se queda el LED." },
        { text: "2.0 V", hint: "Eso es lo que se queda el LED, no la resistencia." },
        { text: "1.3 V" },
        { text: "5.3 V", hint: "No se suman: el LED se queda con una parte del voltaje de la fuente." },
      ],
      correct: 2,
      explanation: "Fuente menos caída del LED: 3.3 V − 2.0 V = 1.3 V. Ese es el voltaje que usas en R = V / I.",
    },
    {
      question: "Tu cálculo da 193 Ω. ¿Qué resistencia comercial eliges?",
      options: [
        { text: "180 Ω", hint: "Es más pequeña: dejaría pasar más corriente de la calculada. Siempre se redondea hacia arriba." },
        { text: "220 Ω" },
        { text: "100 Ω", hint: "Demasiado pequeña: el LED y el pin trabajarían con más corriente de la segura." },
      ],
      correct: 1,
      explanation: "Se elige el siguiente valor comercial más grande: el LED brilla un poco menos, pero nada se daña.",
    },
  ],
  "electronica/e2": [
    {
      question: "En la fórmula del divisor, ¿qué resistencia va arriba, en el numerador?",
      options: [
        { text: "La que va hacia el voltaje de entrada", hint: "Esa es R1. En el numerador va la que está conectada a GND." },
        { text: "La que va hacia GND" },
        { text: "La más grande de las dos", hint: "No depende del tamaño, sino de dónde está conectada." },
      ],
      correct: 1,
      explanation: "V salida = V entrada × R2 / (R1 + R2), y R2 es la que va hacia GND.",
    },
    {
      question: "3.3 V con R1 = 10 kΩ y R2 = 10 kΩ. ¿Cuánto sale?",
      options: [
        { text: "3.3 V", hint: "La salida de un divisor siempre es menor que la entrada." },
        { text: "1.65 V" },
        { text: "0.33 V", hint: "Revisa la proporción: R2 / (R1 + R2) = 10 / 20 = 0.5." },
      ],
      correct: 1,
      explanation: "Con resistencias iguales, la salida es exactamente la mitad: 3.3 × 0.5 = 1.65 V.",
    },
    {
      question: "Un potenciómetro tiene 3.3 V y GND en sus extremos y lo giras hasta la mitad. ¿Qué voltaje hay en la pata del centro?",
      options: [
        { text: "0 V", hint: "Eso se lee con la perilla en el extremo de GND." },
        { text: "1.65 V" },
        { text: "3.3 V", hint: "Eso se lee con la perilla en el otro extremo." },
      ],
      correct: 1,
      explanation: "Un potenciómetro es un divisor que ajustas con la mano: a la mitad del recorrido, la mitad del voltaje.",
    },
  ],
  "electronica/e3": [
    {
      question: "Un sensor entrega una señal de 5 V. ¿Qué haces antes de conectarlo a un GPIO?",
      options: [
        { text: "Lo conecto directo: el ESP32 lo aguanta", hint: "Recuerda la regla de oro: nunca más de 3.3 V en un GPIO." },
        { text: "Lo bajo con un divisor de voltaje" },
        { text: "Lo conecto a VIN", hint: "VIN es para alimentar la placa, no para leer señales." },
      ],
      correct: 1,
      explanation: "Con un divisor (por ejemplo, 1 kΩ y 2 kΩ) los 5 V bajan a unos 3.3 V, seguros para el ESP32.",
    },
    {
      question: "¿Por qué el GPIO 34 no sirve para encender un LED?",
      options: [
        { text: "Porque es solo de entrada" },
        { text: "Porque entrega 5 V", hint: "Ningún GPIO entrega 5 V: las salidas dan 3.3 V." },
        { text: "Porque es un pin de tierra", hint: "Los pines de tierra se llaman GND." },
      ],
      correct: 0,
      explanation: "Del 34 al 39 son pines solo de entrada: perfectos para sensores y potenciómetros, pero no encienden nada.",
    },
    {
      question: "En estas lecciones, ¿cómo se conecta el servo pequeño?",
      options: [
        { text: "Todo a un GPIO", hint: "Un GPIO da muy poca corriente: alcanza para un LED, no para un servo." },
        { text: "Alimentación a 3V3", hint: "El servo necesita unos 5 V y más corriente de la que da 3V3." },
        { text: "Señal a un GPIO, alimentación a VIN y GND compartido" },
      ],
      correct: 2,
      explanation: "El ESP32 solo da la orden por el GPIO; la fuerza viene de VIN (5 V). Y todo comparte el mismo GND.",
    },
  ],
  "programacion/p1": [
    {
      question: "¿Cuál es una instrucción que un robot puede seguir?",
      options: [
        { text: "Moverse un poco", hint: "Es ambigua: ¿cuánto es \"un poco\"?" },
        { text: "Avanzar durante 1 segundo" },
        { text: "Ir rápido si conviene", hint: "Es ambigua: ¿cuándo conviene? ¿qué tan rápido?" },
      ],
      correct: 1,
      explanation: "Una computadora no interpreta: necesita instrucciones exactas, como una acción y cuánto dura.",
    },
    {
      question: "En un diagrama de flujo, ¿qué figura representa una decisión?",
      options: [
        { text: "El óvalo", hint: "El óvalo marca el inicio o el fin." },
        { text: "El rectángulo", hint: "El rectángulo es una acción, como \"encender LED\"." },
        { text: "El rombo" },
      ],
      correct: 2,
      explanation: "El rombo hace una pregunta y siempre tiene dos salidas: sí y no.",
    },
    {
      question: "Hacer parpadear un LED 5 veces es un ejemplo de…",
      options: [
        { text: "Secuencia", hint: "Una secuencia hace las instrucciones una tras otra, sin volver atrás." },
        { text: "Decisión", hint: "Aquí no hay ninguna condición que elegir." },
        { text: "Repetición" },
      ],
      correct: 2,
      explanation: "Repetir la misma acción varias veces es una repetición, uno de los 3 bloques de todo programa.",
    },
  ],
  "programacion/p2": [
    {
      question: "¿Qué parte del programa se ejecuta una sola vez?",
      options: [
        { text: "setup()" },
        { text: "loop()", hint: "loop() se repite para siempre mientras el ESP32 tenga energía." },
        { text: "Las dos", hint: "Una se ejecuta una vez y la otra se repite." },
      ],
      correct: 0,
      explanation: "setup() prepara todo al encender; después loop() se repite sin parar.",
    },
    {
      question: "¿Qué hace digitalWrite(18, HIGH);?",
      options: [
        { text: "Configura el pin 18 como salida", hint: "Eso lo hace pinMode(18, OUTPUT)." },
        { text: "Pone 3.3 V en el pin 18" },
        { text: "Espera 18 milisegundos", hint: "Para esperar se usa delay()." },
      ],
      correct: 1,
      explanation: "HIGH pone el pin en 3.3 V y LOW en 0 V.",
    },
    {
      question: "Wokwi marca un error en la línea 8, pero esa línea se ve bien. ¿Qué revisas primero?",
      options: [
        { text: "Que el LED no esté al revés", hint: "Un LED al revés no da error: simplemente no enciende." },
        { text: "Que no falte un ; en la línea anterior" },
        { text: "Cambiar HIGH por High", hint: "Al revés: debe ir en mayúsculas, HIGH." },
      ],
      correct: 1,
      explanation: "Cuando falta un punto y coma, el error suele aparecer en la línea siguiente.",
    },
  ],
  "programacion/p3": [
    {
      question: "¿Qué imprime Serial.println(7 / 2);?",
      options: [
        { text: "3.5", hint: "Los dos números son enteros, así que el resultado también: se cortan los decimales." },
        { text: "3" },
        { text: "4", hint: "No se redondea: se corta." },
      ],
      correct: 1,
      explanation: "Entero entre entero da entero. Para obtener 3.5, uno debe tener punto: 7 / 2.0.",
    },
    {
      question: "Quieres guardar si el LED está encendido o apagado. ¿Qué tipo de variable usas?",
      options: [
        { text: "int", hint: "Funcionaría, pero hay un tipo hecho justo para verdadero o falso." },
        { text: "bool" },
        { text: "String", hint: "String es para texto." },
      ],
      correct: 1,
      explanation: "bool guarda true o false: ideal para estados de encendido y apagado.",
    },
    {
      question: "No aparece nada en el Monitor Serial. ¿Qué falta casi siempre?",
      options: [
        { text: "Serial.begin(115200); en setup()" },
        { text: "Un delay al final de loop()", hint: "Sin delay se imprimiría muy rápido, pero algo aparecería." },
        { text: "Un LED conectado", hint: "El Monitor Serial no necesita nada conectado." },
      ],
      correct: 0,
      explanation: "Sin Serial.begin, la comunicación con la computadora nunca empieza.",
    },
  ],
  "programacion/p4": [
    {
      question: "¿Para qué sirve la resistencia pull-down de 10 kΩ?",
      options: [
        { text: "Para que el LED no se queme", hint: "Esa es la de 220 Ω que va con el LED." },
        { text: "Para que el pin lea LOW cuando nadie presiona" },
        { text: "Para que el botón dure más", hint: "No protege el botón: evita que el pin quede flotante." },
      ],
      correct: 1,
      explanation: "Sin ella el pin queda flotante y lee HIGH y LOW al azar.",
    },
    {
      question: "¿Cuál condición está bien escrita?",
      options: [
        { text: "if (estado = HIGH)", hint: "Un solo = guarda un valor, no compara." },
        { text: "if (estado == HIGH)" },
        { text: "if (estado == High)", hint: "Debe ir en mayúsculas: HIGH." },
      ],
      correct: 1,
      explanation: "Para comparar se usan dos signos: ==.",
    },
    {
      question: "Presionas el botón una vez y el contador sube 3. ¿Qué falta?",
      options: [
        { text: "El antirrebote" },
        { text: "La resistencia pull-down", hint: "Sin pull-down el pin cambia solo, incluso sin tocar el botón." },
        { text: "Serial.begin", hint: "Si faltara, no verías nada en el Monitor Serial." },
      ],
      correct: 0,
      explanation: "Los contactos rebotan unos milisegundos: esperar unos 50 ms después del cambio evita contar de más.",
    },
  ],
  "programacion/p5": [
    {
      question: "El potenciómetro deja 3.3 V en el GPIO 34. ¿Qué número devuelve analogRead?",
      options: [
        { text: "3.3", hint: "analogRead no devuelve voltios: devuelve un número entre 0 y 4095." },
        { text: "255", hint: "Esa es otra escala. El ADC del ESP32 es de 12 bits: llega más alto." },
        { text: "4095" },
      ],
      correct: 2,
      explanation: "El ADC de 12 bits distingue 4096 niveles: 0 V es 0 y 3.3 V es 4095.",
    },
    {
      question: "¿Qué hace map(valor, 0, 4095, 0, 100)?",
      options: [
        { text: "Pasa el valor de la escala 0–4095 a la escala 0–100" },
        { text: "Lee el pin 100 veces", hint: "map no lee nada: solo convierte un número que ya tienes." },
        { text: "Corta el valor para que no pase de 100", hint: "Eso sería constrain. map cambia de escala, como una regla de tres." },
      ],
      correct: 0,
      explanation: "map es una regla de tres: 2048 de 4095 se convierte en 50 de 100.",
    },
    {
      question: "porcentaje vale 20. ¿Qué rama se ejecuta? if (porcentaje < 66) {A} else if (porcentaje < 33) {B} else {C}",
      options: [
        { text: "A" },
        { text: "B", hint: "El programa revisa en orden: la primera condición, porcentaje < 66, ya se cumple." },
        { text: "C", hint: "else solo se ejecuta si ninguna condición anterior se cumplió." },
      ],
      correct: 0,
      explanation: "Se ejecuta solo la primera condición que se cumple. Con este orden, B nunca se ejecutaría: el orden importa.",
    },
  ],
  "programacion/p6": [
    {
      question: "analogWrite(LED_ROJO, 64); ¿Cómo brilla el LED?",
      options: [
        { text: "Apagado", hint: "Apagado sería 0." },
        { text: "Más o menos a un cuarto" },
        { text: "Al máximo", hint: "El máximo es 255." },
      ],
      correct: 1,
      explanation: "64 de 255 es más o menos el 25 %: el pin está encendido un cuarto del tiempo.",
    },
    {
      question: "¿Qué es el ciclo de trabajo (duty cycle)?",
      options: [
        { text: "Cuántas veces se repite un for", hint: "Eso es el número de vueltas de un bucle." },
        { text: "El voltaje máximo del pin", hint: "El pin siempre da 3.3 V o 0 V. Lo que cambia es cuánto tiempo está encendido." },
        { text: "El porcentaje del tiempo que el pin está encendido" },
      ],
      correct: 2,
      explanation: "Con 50 % de ciclo de trabajo, el LED o el motor reciben en promedio la mitad.",
    },
    {
      question: "¿Cuántas veces se repite for (int i = 0; i < 5; i++)?",
      options: [
        { text: "4", hint: "Cuenta los valores de i: 0, 1, 2, 3 y 4." },
        { text: "5" },
        { text: "6", hint: "Cuando i llega a 5, la condición i < 5 ya no se cumple y el bucle termina." },
      ],
      correct: 1,
      explanation: "i toma los valores 0, 1, 2, 3 y 4: son 5 vueltas.",
    },
  ],
  "programacion/p7": [
    {
      question: "¿Qué librería usas para mover un servo con el ESP32?",
      options: [
        { text: "Servo.h", hint: "Es para las placas Arduino clásicas: no funciona en el ESP32." },
        { text: "ESP32Servo.h" },
        { text: "No hace falta ninguna", hint: "Sin librería tendrías que generar los pulsos a mano." },
      ],
      correct: 1,
      explanation: "ESP32Servo genera por ti los pulsos que le dicen al servo a qué ángulo ir.",
    },
    {
      question: "El servo recibe un pulso de 1.5 ms cada 20 ms. ¿A qué ángulo va?",
      options: [
        { text: "0°", hint: "0° es un pulso de 0.5 ms." },
        { text: "90°" },
        { text: "180°", hint: "180° es un pulso de 2.5 ms." },
      ],
      correct: 1,
      explanation: "La duración del pulso indica el ángulo: 0.5 ms es 0°, 1.5 ms es 90° y 2.5 ms es 180°.",
    },
    {
      question: "¿Para qué tiene el servo un potenciómetro adentro?",
      options: [
        { text: "Para ajustar su velocidad con la mano", hint: "No tiene perilla: el potenciómetro está unido al eje." },
        { text: "Para saber en qué ángulo está" },
        { text: "Para bajar el voltaje a 3.3 V", hint: "No protege al ESP32: mide la posición del eje." },
      ],
      correct: 1,
      explanation: "El circuito de control compara el ángulo que mide el potenciómetro con el pedido y mueve el motor hasta que coincidan.",
    },
  ],
  "programacion/p8": [
    {
      question: "¿Qué hace Serial.available() > 0?",
      options: [
        { text: "Pregunta si llegó algo para leer" },
        { text: "Lee una letra", hint: "Para leer se usa Serial.read()." },
        { text: "Inicia la comunicación", hint: "Eso lo hace Serial.begin() en setup()." },
      ],
      correct: 0,
      explanation: "Dice cuántos caracteres están esperando. Si es mayor que 0, hay algo nuevo.",
    },
    {
      question: "Olvidaste el break del case 'v'. ¿Qué pasa al enviar v?",
      options: [
        { text: "Solo se enciende el verde", hint: "Sin break, el programa no se detiene al terminar ese case." },
        { text: "El programa se detiene con un error", hint: "No da error: compila y se ejecuta, pero hace algo que no querías." },
        { text: "Sigue de largo y ejecuta también el case siguiente" },
      ],
      correct: 2,
      explanation: "break es lo que termina cada case. Sin él, se ejecutan dos acciones a la vez.",
    },
    {
      question: "¿Cuál case está bien escrito?",
      options: [
        { text: "case \"v\":", hint: "Las comillas dobles son para texto. Una sola letra va con comillas simples." },
        { text: "case 'v':" },
        { text: "case v:", hint: "Sin comillas, v sería el nombre de una variable." },
      ],
      correct: 1,
      explanation: "Una letra (char) se escribe con comillas simples: 'v'.",
    },
  ],
  "electronica/e4": [
    {
      question: "¿Qué designador lleva un LED en el esquemático?",
      options: [
        { text: "L1", hint: "La L se usa para las bobinas." },
        { text: "D1" },
        { text: "R1", hint: "La R es para las resistencias." },
      ],
      correct: 1,
      explanation: "Un LED es un diodo, por eso lleva D: D1, D2…",
    },
    {
      question: "Dos cables tienen la etiqueta de red GPIO21, pero no hay ningún cable dibujado entre ellos. ¿Están conectados?",
      options: [
        { text: "Sí: la misma etiqueta los une" },
        { text: "No: falta dibujar el cable", hint: "La etiqueta de red sirve justamente para no tener que dibujar ese cable." },
        { text: "Solo si están cerca en la hoja", hint: "La distancia no importa: importa que el nombre sea igual." },
      ],
      correct: 0,
      explanation: "Misma etiqueta, misma red. Por eso hay que escribirlas con cuidado: GND y Gnd son redes distintas.",
    },
    {
      question: "Una huella tiene almohadillas diminutas y sin agujero. ¿Qué tipo de componente es?",
      options: [
        { text: "THT", hint: "Los THT tienen patas que atraviesan la placa: sus almohadillas tienen agujero." },
        { text: "SMD" },
        { text: "Un conector", hint: "Lo que importa aquí es cómo se monta, no qué componente es." },
      ],
      correct: 1,
      explanation: "Los SMD se sueldan sobre la superficie. En este nivel usamos solo THT.",
    },
  ],
  "electronica/e5": [
    {
      question: "¿Dónde va la resistencia pull-down de 10 kΩ?",
      options: [
        { text: "En serie con el botón", hint: "Es el error más común: no va en el camino del botón." },
        { text: "Entre el GPIO y GND" },
        { text: "Entre 3V3 y GND", hint: "Ahí no afectaría al pin: solo gastaría corriente." },
      ],
      correct: 1,
      explanation: "Con el botón suelto, la resistencia jala el pin hacia 0 V y el ESP32 lee LOW.",
    },
    {
      question: "Con una resistencia pull-up, ¿qué lee el ESP32 con el botón presionado?",
      options: [
        { text: "HIGH", hint: "Eso pasa con pull-down. La pull-up funciona al revés." },
        { text: "LOW" },
        { text: "Valores al azar", hint: "Los valores al azar aparecen cuando no hay ninguna resistencia." },
      ],
      correct: 1,
      explanation: "Con pull-up el botón va a GND: al presionarlo, el pin baja a 0 V.",
    },
    {
      question: "¿Por qué la pull-down es de 10 kΩ y no de 10 Ω?",
      options: [
        { text: "Porque con 10 Ω sería casi un cortocircuito" },
        { text: "Porque no existen resistencias de 10 Ω", hint: "Sí existen. El problema es la corriente." },
        { text: "Para que el LED brille más", hint: "Esta resistencia no tiene nada que ver con el LED." },
      ],
      correct: 0,
      explanation: "Con 10 kΩ pasan solo 0.33 mA al presionar; con 10 Ω serían 330 mA.",
    },
  ],
  "electronica/e6": [
    {
      question: "Al convertir a PCB aparecen líneas delgadas entre los pads. ¿Qué son?",
      options: [
        { text: "Pistas que ya conducen", hint: "Todavía no conducen nada: hay que trazar las pistas." },
        { text: "Serigrafía", hint: "La serigrafía son los textos y dibujos impresos." },
        { text: "Líneas de aire: lo que falta conectar" },
      ],
      correct: 2,
      explanation: "Las líneas de aire (ratsnest) te avisan qué pads deben unirse. Tu trabajo es reemplazarlas por pistas.",
    },
    {
      question: "¿Qué ancho de pista usas para GND?",
      options: [
        { text: "0.5 mm", hint: "0.5 mm es para las señales: LEDs, botón, potenciómetro." },
        { text: "1.0 mm" },
        { text: "0.1 mm", hint: "Demasiado delgada: con mucha corriente se calentaría." },
      ],
      correct: 1,
      explanation: "Las pistas de alimentación (3V3, 5 V y GND) llevan más corriente, por eso son más anchas.",
    },
    {
      question: "Dos pistas de la misma capa se tienen que cruzar. ¿Qué haces?",
      options: [
        { text: "Las cruzo igual", hint: "Dos pistas que se tocan en la misma capa son un cortocircuito." },
        { text: "Paso una a la otra capa con una vía" },
        { text: "Hago una de las pistas más delgada", hint: "Aunque sea delgada, si se toca con la otra, hay cortocircuito." },
      ],
      correct: 1,
      explanation: "La vía conecta las dos capas: una pista va por arriba y la otra por abajo.",
    },
  ],
  "mecanica/m1": [
    {
      question: "¿Qué significa que Onshape sea un CAD paramétrico?",
      options: [
        { text: "Que funciona en el navegador", hint: "Es cierto, pero no es lo que significa paramétrico." },
        { text: "Que cada operación guarda sus medidas y, si cambias una, todo lo que depende de ella se actualiza" },
        { text: "Que es gratuito", hint: "Es gratuito para uso personal, pero eso no tiene que ver con ser paramétrico." },
      ],
      correct: 1,
      explanation: "Como una receta: si cambias la cantidad de harina, el pastel entero cambia.",
    },
    {
      question: "¿Dónde se diseñan las piezas en Onshape?",
      options: [
        { text: "En el Assembly", hint: "En el Assembly se juntan varias piezas ya hechas." },
        { text: "En la página de documentos", hint: "Ahí solo ves tus proyectos." },
        { text: "En el Part Studio" },
      ],
      correct: 2,
      explanation: "El Part Studio es donde trabajarás toda la Parte 1.",
    },
    {
      question: "Te perdiste en la vista 3D y no ves nada. ¿Qué haces?",
      options: [
        { text: "Presiono la tecla F" },
        { text: "Giro la rueda del mouse", hint: "La rueda acerca o aleja, pero no encuadra la pieza." },
        { text: "Cierro y vuelvo a abrir el documento", hint: "No hace falta: hay una tecla para eso." },
      ],
      correct: 0,
      explanation: "F encuadra todo y te devuelve la pieza a la vista.",
    },
  ],
  "mecanica/m2": [
    {
      question: "Una línea de tu boceto está azul. ¿Qué significa?",
      options: [
        { text: "Que le faltan cotas o restricciones" },
        { text: "Que tiene un error", hint: "Los conflictos se marcan en rojo. El azul solo dice que todavía se puede mover." },
        { text: "Que está seleccionada", hint: "El color azul aquí indica algo sobre si está definida." },
      ],
      correct: 0,
      explanation: "Azul se mueve; negro está completamente definido. El objetivo es que todo quede negro.",
    },
    {
      question: "¿De qué diámetro haces el agujero para un tornillo M3?",
      options: [
        { text: "3.0 mm", hint: "Con la medida exacta, el tornillo entraría forzado." },
        { text: "3.2 mm" },
        { text: "4.0 mm", hint: "Demasiado grande: el tornillo quedaría bailando." },
      ],
      correct: 1,
      explanation: "Un poco más que los 3 mm del tornillo, para que pase sin forzarse.",
    },
    {
      question: "Quieres que los 4 círculos midan lo mismo sin poner 4 cotas. ¿Qué restricción usas?",
      options: [
        { text: "Coincidente", hint: "Coincidente pone dos puntos en el mismo lugar." },
        { text: "Simétrico", hint: "Simétrico pone dos elementos a la misma distancia de un eje." },
        { text: "Igual" },
      ],
      correct: 2,
      explanation: "Con una cota en un círculo y la restricción Igual en los demás, todos miden lo mismo.",
    },
  ],
  "mecanica/m3": [
    {
      question: "¿Qué tipo de extrusión usas para hacer un agujero?",
      options: [
        { text: "New", hint: "New crea una pieza nueva." },
        { text: "Remove" },
        { text: "Add", hint: "Add agrega material." },
      ],
      correct: 1,
      explanation: "Remove quita material: así se hacen agujeros, ranuras y cortes.",
    },
    {
      question: "Hiciste las torres con New en vez de Add. ¿Qué pasa?",
      options: [
        { text: "Quedan dos piezas separadas que solo se ven juntas" },
        { text: "Las torres no aparecen", hint: "Sí aparecen, pero como otra pieza." },
        { text: "La placa se vuelve hueca", hint: "New no quita material." },
      ],
      correct: 0,
      explanation: "Revisa la lista de piezas: si ves dos, las torres no están unidas a la placa.",
    },
    {
      question: "Cambias el ancho de la placa de 100 a 120 mm y los agujeros se reacomodan solos. ¿Por qué?",
      options: [
        { text: "Porque Onshape agranda toda la pieza", hint: "No la agranda: los agujeros siguen midiendo 3.2 mm y a 5 mm del borde." },
        { text: "Porque las operaciones se recalculan con las medidas nuevas" },
        { text: "Porque tienes que moverlos tú después", hint: "Si el boceto está bien definido, no hace falta." },
      ],
      correct: 1,
      explanation: "Es el diseño paramétrico: cada operación depende de las anteriores y se actualiza sola.",
    },
  ],
  "mecanica/m4": [
    {
      question: "¿Qué medida pones en el diseño para el agujero de un LED de 5 mm?",
      options: [
        { text: "5.0 mm", hint: "El agujero impreso sale un poco más chico: el LED no entraría." },
        { text: "5.4 mm" },
        { text: "6.0 mm", hint: "Demasiado: el LED quedaría suelto." },
      ],
      correct: 1,
      explanation: "Regla Nova: +0.2 mm por lado, es decir, 0.4 mm más en total.",
    },
    {
      question: "Una parte sobresale a 60° sin nada debajo. ¿Qué necesita?",
      options: [
        { text: "Nada: la impresora lo resuelve sola", hint: "Eso solo pasa hasta unos 45°." },
        { text: "Más relleno", hint: "El relleno está dentro de la pieza: no sostiene lo que está en el aire." },
        { text: "Soportes, o girar la pieza" },
      ],
      correct: 2,
      explanation: "Más de 45° y cada capa queda casi toda en el aire. Mejor aún: diseña o gira la pieza para evitarlo.",
    },
    {
      question: "¿Qué espesor de pared recomendamos para carcasas y soportes?",
      options: [
        { text: "0.4 mm", hint: "Es un solo \"fideo\": saldría muy frágil o no se imprimiría." },
        { text: "1 mm", hint: "Por debajo del mínimo de 1.2 mm." },
        { text: "2 mm" },
      ],
      correct: 2,
      explanation: "El mínimo es 1.2 mm (tres fideos), pero 2 mm es lo recomendado.",
    },
  ],
  "mecanica/m5": [
    {
      question: "¿Qué hace un laminador como Bambu Studio?",
      options: [
        { text: "Corta la pieza en capas y genera las instrucciones para la impresora" },
        { text: "Exporta el STL", hint: "El STL se exporta desde Onshape." },
        { text: "Diseña la pieza", hint: "El diseño se hace en el CAD, antes." },
      ],
      correct: 0,
      explanation: "Le dice a la impresora por dónde mover la boquilla, cuánto plástico poner y a qué temperatura.",
    },
    {
      question: "En el laminador, tu caja aparece 25 veces más grande. ¿Qué pasó?",
      options: [
        { text: "El STL está dañado", hint: "El archivo está bien: el problema son las unidades." },
        { text: "La exportaste en pulgadas en vez de milímetros" },
        { text: "Le falta relleno", hint: "El relleno no cambia el tamaño." },
      ],
      correct: 1,
      explanation: "Una pulgada son 25.4 mm. Exporta siempre en milímetros.",
    },
    {
      question: "¿Qué relleno usamos para nuestras piezas?",
      options: [
        { text: "100 %", hint: "Gastaría mucho más filamento y tiempo sin necesidad." },
        { text: "15 a 20 %, giroide" },
        { text: "0 %", hint: "Sin relleno, la pieza sería solo una cáscara frágil." },
      ],
      correct: 1,
      explanation: "Con 2 a 3 paredes y 15 a 20 % de relleno giroide, las piezas quedan resistentes y se imprimen rápido.",
    },
  ],
  "programacion/extra": [
    {
      question: "Conectas la placa y no aparece ningún puerto. ¿Qué revisas primero?",
      options: [
        { text: "El driver del chip USB y que el cable sea de datos" },
        { text: "La placa elegida en Herramientas", hint: "La placa no cambia que aparezca o no el puerto: el problema está antes." },
        { text: "El código", hint: "El código no tiene nada que ver con que aparezca el puerto." },
      ],
      correct: 0,
      explanation: "Sin driver o con un cable solo de carga, la computadora no ve la placa. El cable es el culpable más común.",
    },
    {
      question: "Aparece “Failed to connect to ESP32… Timed out waiting for packet header”. ¿Qué haces?",
      options: [
        { text: "Presiono EN", hint: "EN reinicia la placa: sirve cuando el programa ya cargó y no pasa nada." },
        { text: "Mantengo presionado BOOT mientras dice “Connecting…”" },
        { text: "Reinstalo Arduino IDE", hint: "No hace falta: la placa solo necesita entrar en modo de carga." },
      ],
      correct: 1,
      explanation: "BOOT pone al ESP32 en modo de carga. Suéltalo cuando empiece a escribir.",
    },
    {
      question: "¿Qué eliges en Herramientas → Placa?",
      options: [
        { text: "Arduino Uno", hint: "Esa es otra placa: el programa se prepararía para ella y no cargaría." },
        { text: "Cualquiera, da igual", hint: "La placa elegida define para qué se compila el programa." },
        { text: "ESP32 Dev Module" },
      ],
      correct: 2,
      explanation: "ESP32 Dev Module, o DOIT ESP32 DEVKIT V1.",
    },
  ],
  "soldadura/s1": [
    {
      question: "¿Para qué sirve la malla desoldante?",
      options: [
        { text: "Para absorber el estaño sobrante" },
        { text: "Para limpiar la punta", hint: "Para eso está la viruta de latón o la esponja húmeda." },
        { text: "Para sostener la placa", hint: "No sostiene nada: es una malla de cobre." },
      ],
      correct: 0,
      explanation: "El estaño derretido sube por la malla por capilaridad. Sirve para corregir errores.",
    },
    {
      question: "Usas estaño con plomo. ¿A qué temperatura pones la punta?",
      options: [
        { text: "200 °C", hint: "Apenas pasa el punto de fusión: la punta pierde calor al tocar la pieza y la junta saldría fría." },
        { text: "320 a 350 °C" },
        { text: "450 °C", hint: "Demasiado: quema el flux, oxida la punta y puede despegar pistas." },
      ],
      correct: 1,
      explanation: "Sin plomo se usa un poco más: 350 a 380 °C.",
    },
    {
      question: "¿De dónde viene el humo que no debes respirar?",
      options: [
        { text: "Del estaño", hint: "Viene de otra cosa que se quema al soldar." },
        { text: "Del cobre de la placa", hint: "El cobre no se quema a esas temperaturas." },
        { text: "Del flux" },
      ],
      correct: 2,
      explanation: "El flux se quema al calentarse. Su humo irrita: trabaja con ventilación.",
    },
  ],
  "soldadura/s2": [
    {
      question: "¿Cuál es la regla de oro al soldar?",
      options: [
        { text: "Calentar las piezas, no el estaño" },
        { text: "Derretir el estaño en la punta y llevarlo a la junta", hint: "Así sale una soldadura fría: el estaño no moja piezas frías." },
        { text: "Usar mucho estaño para asegurar", hint: "El exceso esconde si la unión está bien hecha." },
      ],
      correct: 0,
      explanation: "El estaño debe derretirse al tocar el pad y la pata calientes.",
    },
    {
      question: "¿Cuánto dura una soldadura THT?",
      options: [
        { text: "Menos de 1 segundo", hint: "No alcanza a calentar el pad y la pata." },
        { text: "De 3 a 5 segundos" },
        { text: "Unos 15 segundos", hint: "Se quema el flux y el pad puede despegarse." },
      ],
      correct: 1,
      explanation: "Y no muevas el componente mientras el estaño se enfría, unos 2 segundos.",
    },
    {
      question: "¿En qué orden montas los componentes?",
      options: [
        { text: "Los más grandes primero", hint: "Así la placa ya no se apoyaría plana sobre la mesa." },
        { text: "El orden no importa", hint: "Sí importa: afecta cómo se apoya la placa mientras trabajas." },
        { text: "De los más bajos a los más altos" },
      ],
      correct: 2,
      explanation: "Resistencias y diodos primero, conectores y componentes grandes al final.",
    },
  ],
  "soldadura/s3": [
    {
      question: "Una junta se ve opaca, granulosa y agrietada. ¿Qué defecto es?",
      options: [
        { text: "Un puente", hint: "Un puente une dos pads que deberían estar separados." },
        { text: "Una soldadura fría" },
        { text: "Exceso de estaño", hint: "El exceso es una bola grande y brillante." },
      ],
      correct: 1,
      explanation: "Se corrige con un poco de flux y recalentando hasta que el estaño fluya.",
    },
    {
      question: "¿Por qué un puente es tan peligroso?",
      options: [
        { text: "Porque es un cortocircuito" },
        { text: "Porque se ve feo", hint: "El problema es eléctrico, no estético." },
        { text: "Porque gasta estaño", hint: "Eso es lo de menos." },
      ],
      correct: 0,
      explanation: "Une dos pines que no deberían tocarse. Revisa la placa con lupa antes de conectarla.",
    },
    {
      question: "Al desoldar con malla, ¿cuándo la retiras?",
      options: [
        { text: "Después de retirar el cautín", hint: "Si el estaño se enfría, la malla queda pegada a la placa." },
        { text: "Antes de calentar", hint: "Sin calor, el estaño no sube por la malla." },
        { text: "Al mismo tiempo que el cautín" },
      ],
      correct: 2,
      explanation: "Malla y cautín juntos, mientras el estaño sigue derretido.",
    },
  ],
  "soldadura/s4": [
    {
      question: "¿Qué tamaño SMD es el mejor para empezar?",
      options: [
        { text: "0603", hint: "Es el más pequeño de la tabla: requiere pinzas finas y lupa." },
        { text: "0805", hint: "Se puede, pero hay uno más grande y más fácil." },
        { text: "1206" },
      ],
      correct: 2,
      explanation: "1206 mide 3.2 × 1.6 mm: el más fácil de manejar con cautín.",
    },
    {
      question: "Para soldar una resistencia SMD, ¿qué haces primero?",
      options: [
        { text: "Pongo estaño en un solo pad" },
        { text: "Pongo estaño en los dos pads", hint: "El componente quedaría inclinado: el efecto lápida." },
        { text: "Coloco el componente y caliento el centro", hint: "El calor va en los extremos, donde están los pads." },
      ],
      correct: 0,
      explanation: "Con un pad estañado fijas el componente; después sueldas el otro lado y retocas el primero.",
    },
    {
      question: "¿Por qué se agrega flux extra en SMD?",
      options: [
        { text: "Para pegar el componente", hint: "El flux no es pegamento." },
        { text: "Para que el estaño corra solo a su lugar y evitar puentes" },
        { text: "Para enfriar la punta", hint: "El flux limpia el óxido; no enfría." },
      ],
      correct: 1,
      explanation: "En SMD se usa muy poco estaño y el flux del hilo se consume rápido.",
    },
  ],
  "soldadura/s5": [
    {
      question: "¿Quiénes reciben un kit de placa para soldar?",
      options: [
        { text: "Todos los inscritos en la convocatoria", hint: "Los kits son limitados." },
        { text: "Quienes llegaron hasta la Parte 2" },
        { text: "Solo los miembros del equipo", hint: "La práctica es parte de la convocatoria, antes de ser miembro." },
      ],
      correct: 1,
      explanation: "Por eso conviene llegar preparado: la práctica es para pulir tu técnica.",
    },
    {
      question: "¿Dónde verás la fecha de tu práctica presencial?",
      options: [
        { text: "En tu panel y en la Academia" },
        { text: "Tienes que preguntar en el laboratorio", hint: "El encargado te la asigna aquí, en la web." },
        { text: "No hay fecha: vas cuando quieras", hint: "La práctica es en una fecha que asigna el encargado." },
      ],
      correct: 0,
      explanation: "El encargado de la convocatoria te asigna la fecha y aparece en tu panel y aquí.",
    },
    {
      question: "Repaso: una resistencia SMD quedó parada, como una lápida. ¿Qué pasó?",
      options: [
        { text: "Le faltó flux a la punta", hint: "El flux ayuda, pero la causa es otra." },
        { text: "Se usó una punta fina", hint: "Una punta fina es lo adecuado para SMD." },
        { text: "Se estañaron los dos pads antes de colocarla" },
      ],
      correct: 2,
      explanation: "Por eso se estaña un solo pad primero.",
    },
  ],
};
