En esta parte vas a aprender a soldar componentes electrónicos: primero los de patas que atraviesan la placa (THT) y luego los de montaje superficial (SMD). Todo es teoría y videos, para que cuando llegues a la práctica presencial ya sepas qué hacer y solo tengas que corregir tu técnica con el equipo.

> **Antes de empezar:** no necesitas un cautín para esta parte. El kit y las herramientas te los da el equipo en la práctica presencial. Aquí te preparas para aprovecharla al máximo.

## S1 · Seguridad y herramientas

### Objetivo

Conocer las herramientas de soldadura, para qué sirve cada una y las reglas de seguridad que se siguen siempre en el laboratorio.

### ¿Para qué me sirve?

**En todas las categorías.** Cada robot de Nova tiene una placa soldada a mano. Una herramienta mal usada daña los componentes; una regla de seguridad olvidada te puede quemar.

### Explicación

#### ¿Qué es soldar?

Soldar en electrónica es unir un componente a la placa con **estaño**, un metal que se derrite a menos de 250 °C. El estaño fundido moja el cobre de la placa y la pata del componente; al enfriarse, forma una unión que es a la vez **mecánica** (sostiene la pieza) y **eléctrica** (deja pasar la corriente).

#### Las herramientas

| Herramienta | Para qué sirve |
| --- | --- |
| **Estación de soldadura** | Un cautín con control de temperatura. Mantiene la punta a la temperatura que eliges. |
| **Soporte y limpiador** | El soporte evita que el cautín caliente toque algo. La viruta de latón (o una esponja húmeda) limpia la punta. |
| **Estaño** | El metal de aporte. Se usa en hilo de 0.6 a 0.8 mm con **alma de flux** en el centro. |
| **Flux** | Limpia el óxido del metal y ayuda a que el estaño fluya. Viene en el estaño, pero en SMD se agrega aparte (en lápiz o pasta). |
| **Malla desoldante** | Una malla de cobre que absorbe el estaño sobrante por capilaridad. Sirve para corregir errores. |
| **Bomba desoldadora** | Succiona el estaño fundido de una junta. Útil en componentes THT. |
| **Pinzas finas** | Imprescindibles para colocar componentes SMD. |
| **Alicate de corte** | Corta las patas sobrantes de los componentes THT, al ras de la junta. |
| **Lupa** | Para revisar las juntas, sobre todo en SMD. |
| **Alcohol isopropílico** | Limpia los restos de flux con un cepillo pequeño. |

#### La temperatura

| Tipo de estaño | Se funde a | Temperatura de la punta |
| --- | --- | --- |
| Con plomo (63/37 o 60/40) | unos 183 a 190 °C | 320 a 350 °C |
| Sin plomo | unos 217 a 220 °C | 350 a 380 °C |

Más temperatura no siempre es mejor: demasiado calor quema el flux antes de tiempo, oxida la punta y puede despegar las pistas de cobre de la placa.

#### Cuida la punta

- **Estáñala** antes de guardar el cautín: una capa de estaño fresco protege la punta del óxido.
- **Límpiala** en la viruta de latón antes de cada soldadura.
- **Nunca la lijes ni la limes:** se le va el recubrimiento y deja de mojar el estaño.

#### Reglas de seguridad

- **Agarra el cautín siempre por el mango** y devuélvelo al soporte cada vez que lo sueltes. La punta pasa de 300 °C.
- **Trabaja con ventilación** y no respires el humo: viene del flux, no del estaño, pero irrita.
- **Usa lentes de seguridad** al cortar patas: salen disparadas.
- **Lávate las manos** después de soldar, sobre todo con estaño con plomo. No comas mientras sueldas.
- **Aleja el cable** de la punta caliente y **apaga la estación** al terminar.

### Videos de apoyo

```video
J4L9huA-MRE
Soldadura de componentes electrónicos: accesorios y herramientas para soldar y desoldar · MatiTech
```

### Errores comunes

- **Dejar el cautín sobre la mesa** en lugar del soporte.
- **Subir la temperatura al máximo** "para que caliente más rápido": se oxida la punta y se dañan los pads.
- **Limpiar la punta con una esponja seca**: debe estar húmeda, o usar viruta de latón.

### Puedo continuar si…

- [ ] Sé para qué sirve cada herramienta de la tabla.
- [ ] Puedo explicar qué temperatura usar según el tipo de estaño y por qué no conviene exagerar.
- [ ] Conozco las cinco reglas de seguridad.

## S2 · Soldadura THT

### Objetivo

Aprender la técnica para soldar componentes de patas (THT) y reconocer cómo se ve una buena soldadura.

### ¿Para qué me sirve?

**En todas las categorías.** Los conectores, los headers donde va el ESP32, los botones y muchos componentes de potencia de los robots son THT.

### Explicación

#### La regla de oro

**Calienta las piezas, no el estaño.** El estaño debe derretirse al tocar el pad y la pata calientes, no al tocar la punta del cautín. Si derrites el estaño en la punta y lo "pintas" sobre la unión, queda una soldadura fría.

#### Cómo se ve una buena soldadura

- Tiene forma de **volcán o cono**, con los lados un poco cóncavos.
- **Cubre todo el pad** y sube un poco por la pata.
- Es **lisa y brillante** con estaño con plomo (el estaño sin plomo queda algo más mate).
- Se ve el contorno de la pata: no está enterrada en una bola de estaño.

#### El orden de montaje

Suelda **de los componentes más bajos a los más altos**: resistencias y diodos primero, luego zócalos y headers, después capacitores y al final conectores y componentes grandes. Así la placa se apoya plana sobre la mesa mientras trabajas.

Revisa la **polaridad** antes de soldar: LEDs, diodos y capacitores electrolíticos solo funcionan en un sentido. Desoldarlos después cuesta mucho más.

### Videos de apoyo

```video
imNW5Gv7CCg
Cómo soldar manualmente en 5 pasos un PCB con componentes THT (norma IPC 610) · Aldelta Technologies
```

```video
XOb-zoFPLxA
Aprende a soldar en 3 segundos · Humberto Higinio
```

### Paso a paso

1. **Inserta el componente** y dobla un poco sus patas por debajo para que no se caiga al voltear la placa.
2. **Limpia la punta** en la viruta de latón.
3. **Apoya la punta tocando a la vez el pad y la pata** durante 1 a 2 segundos.
4. **Acerca el estaño a la unión**, del lado opuesto a la punta. Debe derretirse y correr alrededor de la pata.
5. **Retira el estaño** cuando la junta tenga forma de cono.
6. **Retira el cautín** un instante después. Todo el proceso toma de 3 a 5 segundos.
7. **No muevas el componente** mientras el estaño se enfría (unos 2 segundos).
8. **Corta la pata sobrante** justo por encima de la junta.

> **Truco para headers y conectores:** suelda primero un solo pin, revisa que el conector esté recto y bien apoyado, y recién entonces suelda el resto. Si quedó torcido, basta con recalentar ese único pin.

### Errores comunes

- **Calentar solo la pata o solo el pad:** el estaño no moja la parte fría.
- **Mantener el cautín demasiado tiempo** (más de 5 a 6 segundos): se quema el flux y puede despegarse el pad.
- **Poner demasiado estaño:** queda una bola que esconde si la unión está bien hecha.
- **Soldar un componente polarizado al revés.**

### Puedo continuar si…

- [ ] Puedo explicar por qué se calientan las piezas y no el estaño.
- [ ] Sé describir los pasos de una soldadura THT y cuánto dura.
- [ ] Sé reconocer una buena soldadura y en qué orden se montan los componentes.

## S3 · Defectos y cómo corregirlos

### Objetivo

Reconocer los defectos más comunes de soldadura y saber corregirlos, incluyendo cómo desoldar un componente.

### ¿Para qué me sirve?

**En todas las categorías.** Un robot que falla en plena competencia muchas veces tiene una soldadura fría o un puente que nadie revisó. Saber inspeccionar una placa es tan importante como saber soldar.

### Explicación

#### Los defectos más comunes

| Defecto | Cómo se ve | Por qué pasa | Cómo se corrige |
| --- | --- | --- | --- |
| **Soldadura fría** | Opaca, granulosa o agrietada. | Poco calor, o el componente se movió mientras se enfriaba. | Agrega un poco de flux y recalienta la junta hasta que el estaño fluya. |
| **Puente** | El estaño une dos pads que deberían estar separados. | Exceso de estaño o pines muy juntos. | Pasa la punta limpia con flux entre los pads, o retira el sobrante con malla. |
| **Poco estaño** | El estaño no cubre todo el pad. | Se retiró el estaño demasiado pronto. | Recalienta y agrega un poco más. |
| **Exceso de estaño** | Una bola grande sobre la junta. | Se aplicó estaño de más. | Retira el sobrante con malla y vuelve a soldar. |
| **Pad sin mojar** | El estaño forma una bola sobre la pata pero no se pega al pad. | El pad no se calentó o está oxidado. | Limpia, agrega flux y calienta el pad junto con la pata. |
| **Pad levantado** | El cobre del pad se despegó de la placa. | Demasiado calor o demasiado tiempo. | Es difícil de reparar: evita el exceso de calor. |

> **Importante:** un puente es un **cortocircuito**. Antes de conectar una placa a la batería, revísala con la lupa y, si puedes, con el multímetro en modo continuidad entre pines vecinos.

#### Cómo desoldar con malla

1. Coloca la malla sobre la junta que quieres limpiar. Si no trae flux, agrégale un poco.
2. Presiona la malla con la punta del cautín durante unos segundos.
3. El estaño se derrite y sube por la malla.
4. **Retira la malla y el cautín al mismo tiempo**; si retiras primero el cautín, la malla queda pegada a la placa.
5. Corta la parte usada de la malla antes de volver a usarla.

#### Cómo desoldar con bomba

1. Arma la bomba presionando el émbolo.
2. Calienta la junta hasta que el estaño se derrita.
3. Acerca la boquilla de la bomba a la junta, retira el cautín y presiona el botón: el estaño se succiona.

### Videos de apoyo

```video
-ec2atB3m80
Desoldadura con malla desoldante · Kriss Electronics
```

```video
gBqCgPMxJL0
Soldadura fría: cómo solucionarla · jonh pared
```

### Errores comunes

- **Raspar un puente con un objeto metálico** en lugar de usar flux y malla: se dañan las pistas.
- **Calentar una y otra vez la misma junta** sin flux: el estaño se oxida y la junta empeora.
- **Tirar del componente mientras el estaño no está derretido del todo:** se arranca el pad.

### Puedo continuar si…

- [ ] Sé reconocer una soldadura fría, un puente y un pad sin mojar.
- [ ] Puedo explicar cómo corregir cada defecto de la tabla.
- [ ] Sé desoldar con malla y con bomba, y por qué la malla se retira junto con el cautín.

## S4 · Soldadura SMD

### Objetivo

Aprender a soldar componentes de montaje superficial (SMD): resistencias, capacitores y LEDs de dos terminales, y circuitos integrados de varias patas.

### ¿Para qué me sirve?

**En todas las categorías.** Las placas de competencia usan cada vez más componentes SMD porque son más pequeños y livianos. Las PCBs universales de Nova también los tienen.

### Explicación

#### Los tamaños

Los componentes SMD de dos terminales se nombran con un código de su tamaño en centésimas de pulgada:

| Código | Tamaño aproximado | Dificultad |
| --- | --- | --- |
| **1206** | 3.2 × 1.6 mm | Fácil, ideal para empezar |
| **0805** | 2.0 × 1.25 mm | Fácil con práctica |
| **0603** | 1.6 × 0.8 mm | Requiere pinzas finas y lupa |

Los circuitos integrados más comunes para soldar a mano son los **SOIC** (patas cada 1.27 mm) y los **SOT-23** (transistores y reguladores pequeños).

#### Por qué el flux es clave en SMD

En SMD se trabaja con muy poco estaño, y el flux del alma del hilo se consume rápido. **Agregar flux extra** sobre los pads hace que el estaño corra solo hacia donde debe ir y evita puentes. Al terminar, limpia los restos con alcohol isopropílico.

#### Técnica para componentes de dos terminales

Se usa la técnica de **estañar un pad primero**:

1. Pon un poco de estaño en **uno solo** de los dos pads.
2. Con la pinza, toma el componente y acércalo a su lugar.
3. Recalienta el pad estañado y desliza el componente hasta que quede apoyado y centrado. Retira el cautín: el componente queda fijo de un lado.
4. Suelda el **otro extremo** normalmente: punta en el pad y en el componente, estaño a la unión.
5. Vuelve al primer extremo, agrega flux y retócalo para que quede igual de bien.

Revisa la **polaridad**: los LEDs SMD tienen una marca (a menudo verde) en el lado del cátodo y los diodos tienen una raya.

#### Técnica para circuitos integrados

1. **Alinea** el chip con la pinza, verificando que la marca del pin 1 coincida con la de la placa.
2. **Fija dos pines en esquinas opuestas.** Revisa con la lupa que todas las patas caigan sobre sus pads.
3. **Agrega flux** a lo largo de todas las patas.
4. Suelda **pin por pin**, o usa la **soldadura por arrastre**: con un poco de estaño en la punta, arrástrala despacio a lo largo de las patas; el flux reparte el estaño en cada pin.
5. Si quedan **puentes**, quítalos con flux y malla.
6. Revisa con la lupa que no haya pines sin soldar ni puentes.

> **Para más adelante:** en el equipo también se sueldan componentes SMD con **pasta de soldar y aire caliente**. Para empezar, el cautín es suficiente.

### Videos de apoyo

```video
9kQBgfa8-l4
Cómo soldar componentes SMD con cautín · UNIT Electronics
```

```video
Vzd9XppZriw
Soldar circuitos integrados SMD con cautín (fácil) · biblioman09
```

### Errores comunes

- **Poner estaño en los dos pads antes de colocar el componente:** queda inclinado ("efecto lápida").
- **Soldar sin flux extra:** el estaño se hace bolitas y aparecen puentes.
- **Usar una punta muy gruesa** para componentes pequeños: calienta a los vecinos.
- **No revisar con lupa:** en SMD, muchos defectos no se ven a simple vista.

### Puedo continuar si…

- [ ] Sé qué significan los códigos 1206, 0805 y 0603.
- [ ] Puedo explicar la técnica de estañar un pad primero, paso a paso.
- [ ] Sé cómo fijar un circuito integrado y cómo quitar un puente entre sus patas.

## S5 · Preparación para la práctica presencial

### Objetivo

Repasar todo lo aprendido y saber cómo será la práctica presencial, para llegar listo a soldar tu kit.

### ¿Para qué me sirve?

Los kits son limitados: por eso solo los reciben quienes llegaron hasta aquí. Llegar preparado significa que la práctica sirve para pulir tu técnica, no para aprender desde cero.

### Explicación

#### Cómo será la práctica

1. **El encargado de la convocatoria te asigna una fecha.** La verás en tu panel y en la Academia.
2. **El día de la práctica recibes un kit de placa** con componentes THT y SMD.
3. **Sueldas tu placa con guía del equipo:** primero un repaso rápido de seguridad y técnica, y luego trabajas tú, con alguien revisando tus juntas.
4. **Al terminar revisan tu placa juntos:** juntas, puentes, polaridad.

#### Repaso rápido

- **Seguridad:** cautín siempre en el soporte, ventilación, lentes, manos limpias.
- **THT:** calienta el pad y la pata a la vez, estaño a la unión, 3 a 5 segundos, junta en forma de volcán.
- **SMD:** flux extra, estaña un pad primero, fija y suelda el otro extremo, revisa con lupa.
- **Defectos:** soldadura fría y pad sin mojar se recalientan con flux; los puentes se quitan con flux y malla.

### Videos de apoyo

```video
SNQgJk5NLb0
Soldadura de componentes electrónicos: técnicas de soldadura (cautín y estación) THT y SMD · MatiTech
```

### Paso a paso

1. Vuelve a ver los videos de S2 y S4 justo antes de la práctica.
2. Llena una **ficha de bitácora** con la duda que más te preocupe: así el equipo sabrá qué reforzar contigo.
3. Llega puntual a la fecha que te asignen. El encargado te dirá si necesitas llevar algo.

### Puedo continuar si…

- [ ] Puedo explicar en voz alta los pasos de una soldadura THT y de una SMD.
- [ ] Sé reconocer los defectos más comunes y cómo corregirlos.
- [ ] Conozco las reglas de seguridad del laboratorio.
