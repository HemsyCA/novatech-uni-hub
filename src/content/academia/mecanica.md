En esta parte vas a aprender a diseñar piezas en 3D en la computadora y a prepararlas para imprimirlas. Es la forma en que se crean los chasis, soportes, carcasas y piezas de todos los robots de Nova.

Si tienes un calibrador (pie de rey) en casa, te servirá para medir objetos reales, pero no es obligatorio.

### Curso completo de Onshape (apoyo)

Tus compañeros encontraron este curso completo de Onshape en YouTube: 22 videos en español, desde lo más básico. Las lecciones de Mecánica siguen siendo tu camino; usa el curso **si algo no te queda claro** o si quieres verlo a la par para reforzar.

```video
q1tiLwEI6uY list=PLoPH28cIrLDbhIonaCsPcU2-dUCvCgHaS
Onshape: Tutoriales de diseño 3D · SHARE HORIZONS (22 videos)
```

## M1 · Primeros pasos en Onshape

### Objetivo

Crear tu cuenta, conocer la interfaz de Onshape y moverte con soltura en el espacio 3D.

### ¿Para qué me sirve?

**En todas las categorías.** El chasis del minisumo, la carcasa del seguidor de línea, las piezas del cuerpo del OTTO y del humanoide, los soportes de sensores… todo se diseña en un programa de CAD como este.

### Explicación

#### ¿Qué es el CAD?

**CAD** significa *diseño asistido por computadora*. Es el programa donde se dibujan las piezas en 3D con medidas exactas antes de fabricarlas.

Onshape es un **CAD paramétrico**: cada pieza se construye con una secuencia de pasos (operaciones), y cada paso guarda sus medidas. Si mañana cambias una medida, todo lo que depende de ella se actualiza solo. Es como una receta: si cambias la cantidad de harina, el pastel entero cambia.

```widget
cad-parametrico
```

#### ¿Por qué Onshape?

- Funciona **en el navegador**: no se instala nada y funciona en computadoras sencillas.
- Tus diseños se guardan **en la nube**: puedes trabajar desde cualquier computadora.
- Es **gratuito** para uso personal y educativo.

> **Dato:** si algo de Mecánica no te queda claro, hay un [curso completo de Onshape en YouTube](https://www.youtube.com/playlist?list=PLoPH28cIrLDbhIonaCsPcU2-dUCvCgHaS) (22 videos en español) para reforzar. Lo tienes también en la página del módulo de Mecánica. Úsalo como apoyo: las lecciones siguen siendo tu camino.

#### Primeros pasos: crea tu cuenta

Antes de conocer la interfaz, entra a Onshape. Primero elige uno de sus planes gratuitos:

- **Plan Free:** gratuito para cualquiera. Tus documentos son **públicos** (cualquiera con el link puede verlos). Para esta etapa eso es una ventaja: así entregas tu tarea con un simple link.
- **Plan Education:** gratuito para estudiantes (con correo de tu institución). Tus documentos pueden ser privados; para entregar la tarea tendrás que compartir el link.

Luego:

1. Entra a [onshape.com](https://onshape.com) y crea tu cuenta con el plan que elegiste.
2. Confirma tu correo e inicia sesión.
3. Llegas a la **página de documentos**: es lo primero que verás cada vez que entres. La conoces en el siguiente concepto.

#### La interfaz

- **Página de documentos:** donde ves todos tus proyectos. Cada proyecto es un **documento**.

```imagen
/academia/mecanica/onshape-pagina-documentos.webp
La página de documentos de Onshape después de iniciar sesión
La página de documentos: con Create creas documentos o folders para tus proyectos. Abajo, la lista muestra solo los documentos del folder que tienes abierto.
```

- **Pestañas inferiores:** dentro de un documento hay pestañas.
  - **Part Studio:** donde se diseñan las piezas. Aquí trabajaremos en toda la Parte 1.
  - **Assembly:** donde se juntan varias piezas (lo usarás ya en el equipo).
- **Barra de herramientas** (arriba): las operaciones (boceto, extruir, redondear…).
- **Lista de operaciones** (a la izquierda): el historial de pasos de tu pieza. Puedes hacer doble clic en cualquiera para editarlo.
- **Cubo de vistas** (arriba a la derecha): haz clic en sus caras para ver la pieza de frente, de arriba, de lado.
- **Planos de referencia:** Top (superior), Front (frontal) y Right (derecho). Sobre ellos se dibujan los bocetos.

#### Cómo moverte en 3D

| Acción | Cómo se hace |
| --- | --- |
| **Girar** la vista | Mantén presionado el **botón derecho** del mouse y arrastra |
| **Desplazar** la vista | Mantén presionada la **rueda** y arrastra (o Ctrl + botón derecho) |
| **Acercar / alejar** | Gira la **rueda** del mouse |
| **Ver todo** | Tecla **F** |

Practica aquí antes de entrar a Onshape:

```widget
cubo-vistas
```

### Paso a paso

1. Inicia sesión en [onshape.com](https://onshape.com) con la cuenta que creaste.
2. En la página de documentos, crea un **nuevo documento** llamado `Nova - Prácticas`.
3. Se abre un **Part Studio** vacío. Ubica los tres planos y el origen.
4. Practica girar, desplazar y acercar. Haz clic en las caras del cubo de vistas.
5. Vuelve a la página de documentos y busca en los **documentos públicos** un modelo de "SG90" (el servo que usamos). Ábrelo y explóralo: gíralo, acércate y ve cómo está construido en la lista de operaciones.

### Errores comunes

- **La página carga lenta o no muestra el 3D:** usa Chrome o Firefox actualizados y verifica que la aceleración por hardware del navegador esté activada.
- **Me perdí y no veo nada:** presiona **F** para encuadrar todo.
- **Edité por accidente un documento público ajeno:** no puedes modificar documentos de otros; si quieres trabajar sobre uno, haz una copia.

### Mini práctica

Explora otros 2 documentos públicos de piezas de robots (busca "robot chassis" o "sensor bracket"). Anota en tu bitácora qué operaciones de la lista se repiten más.

### Puedo continuar si…

- [ ] Tengo mi cuenta y el documento `Nova - Prácticas` creado.
- [ ] Puedo girar, desplazar y acercar la vista sin perderme.
- [ ] Sé qué es un Part Studio y dónde está la lista de operaciones.

## M2 · Bocetos 2D

### Objetivo

Dibujar un boceto 2D completamente definido, con cotas y restricciones.

### ¿Para qué me sirve?

**En todas las categorías.** Toda pieza 3D nace de un dibujo 2D. Si el boceto está bien hecho, la pieza es fácil de modificar; si está mal hecho, cualquier cambio la rompe.

### Explicación

#### ¿Qué es un boceto?

Un **boceto (sketch)** es un dibujo plano hecho sobre un plano o sobre una cara de una pieza. Después, ese dibujo se convierte en 3D (lo verás en M3).

#### Herramientas básicas

| Herramienta | Atajo | Para qué sirve |
| --- | --- | --- |
| Línea | **L** | Dibujar segmentos rectos |
| Rectángulo | **R** | Dibujar rectángulos |
| Círculo | **C** | Dibujar círculos desde su centro |
| Cota (dimensión) | **D** | Fijar medidas: largos, diámetros, distancias |
| Construcción | **Q** | Convertir una línea en "auxiliar" (sirve de guía, pero no forma parte de la pieza) |

```widget
herramientas-boceto
```

#### Cotas y restricciones

Dibujar "a ojo" no sirve en ingeniería. Cada forma se fija con dos tipos de reglas:

- **Cotas:** medidas numéricas. "Este lado mide 100 mm", "este círculo mide 3.2 mm de diámetro".
- **Restricciones:** reglas geométricas. Las más usadas:
  - **Coincidente:** dos puntos en el mismo lugar.
  - **Horizontal / vertical:** una línea perfectamente horizontal o vertical.
  - **Igual:** dos líneas o círculos del mismo tamaño.
  - **Simétrico:** dos elementos a la misma distancia de un eje.
  - **Tangente:** una línea que toca una curva sin cortarla.

#### Los colores te dicen si está bien

En Onshape, el color de las líneas indica si el boceto está **completamente definido**:

- **Azul:** le faltan cotas o restricciones. Si arrastras esa línea, se mueve.
- **Negro:** está completamente definido. No se mueve, porque todas sus medidas y posiciones están fijadas.

**Objetivo de todo buen boceto: que quede completamente negro.** Así, cuando cambies una medida, la pieza cambiará exactamente como esperas.

Este es el boceto del Paso a paso. Aplica las reglas una por una y mira cómo pasa de azul a negro:

```widget
boceto-definido
```

#### Agujeros para tornillos

En robótica se usan mucho los tornillos **M3** (3 mm de diámetro). Para que pasen por un agujero sin forzarse, el agujero se hace un poco más grande: **3.2 mm**.

### Paso a paso

Dibuja la base de una placa de 100 × 60 mm con 4 agujeros para tornillos M3:

1. En tu documento, selecciona el plano **Top** y haz clic en **Sketch**.
2. Con el **rectángulo**, dibuja uno cualquiera alrededor del origen.
3. Con la **cota (D)**, fija el ancho en **100 mm** y el alto en **60 mm**.
4. Céntralo: dibuja una línea de **construcción (Q)** en diagonal, de una esquina a la opuesta, y haz que su punto medio sea **coincidente** con el origen.
5. Dibuja un **círculo** cerca de cada esquina.
6. Fija el diámetro de uno en **3.2 mm** y aplica la restricción **Igual** entre ese y los otros tres.
7. Fija la posición de cada círculo: **5 mm** desde cada borde (horizontal y vertical).
8. Revisa que **todo el boceto esté negro**. Si algo sigue azul, arrástralo para descubrir qué le falta.
9. Haz clic en el ✔ verde para cerrar el boceto.

### Errores comunes

- **Formas que no se cierran:** si las líneas no se tocan exactamente en sus extremos, la forma queda "abierta" y no se podrá convertir en 3D. Usa la restricción coincidente.
- **Demasiadas cotas:** si pones una cota que ya está determinada por otras, Onshape la marca en rojo o te avisa de un conflicto. Bórrala.
- **Dibujar en el plano equivocado:** si dibujaste en Front en vez de Top, tu pieza quedará "parada". No es grave, pero mejor rehacerlo desde el comienzo.

### Mini práctica

En un nuevo boceto, dibuja la silueta de una **placa con forma de "L"** (como una escuadra) de 50 × 50 mm y 10 mm de ancho en cada brazo, con un agujero de 3.2 mm en cada extremo. Todo debe quedar negro.

### Puedo continuar si…

- [ ] Sé usar línea, rectángulo, círculo y cota.
- [ ] Sé aplicar las restricciones coincidente, horizontal, igual y simétrico.
- [ ] Mis bocetos quedan completamente negros.

## M3 · De 2D a 3D

### Objetivo

Convertir bocetos en piezas 3D con extrusiones, cortes, redondeos y chaflanes, y aprovechar el diseño paramétrico.

### ¿Para qué me sirve?

**En todas las categorías.** Con estas cuatro operaciones se construye la gran mayoría de las piezas de un robot: placas, torres para tornillos, soportes y carcasas.

### Explicación

#### Extruir (Extrude)

**Extruir** es "estirar" un boceto en la tercera dimensión, como cuando un rectángulo se convierte en una caja. Al extruir eliges:

- **Profundidad:** cuánto se estira (por ejemplo, 3 mm).
- **Dirección:** hacia un lado, hacia el otro o hacia ambos (simétrico).
- **Tipo de operación:**
  - **New:** crea una pieza nueva.
  - **Add:** agrega material a una pieza existente.
  - **Remove:** **quita** material. Así se hacen agujeros, ranuras y cortes.

```widget
extruir
```

#### Bocetos sobre caras

No solo se puede dibujar sobre los planos de referencia: también sobre **cualquier cara plana** de una pieza. Así se construye una pieza por capas: haces una placa, dibujas sobre su cara superior y extruyes algo encima.

```widget
boceto-cara
```

#### Redondeo (Fillet) y chaflán (Chamfer)

- **Redondeo:** suaviza una arista convirtiéndola en una curva. Evita esquinas filosas y hace la pieza más resistente.
- **Chaflán:** corta una arista en ángulo (en diagonal). Muy útil en el borde que toca la cama de la impresora, porque evita que la pieza quede "con pie de elefante".

```widget
redondeo
```

#### El poder del diseño paramétrico

En la **lista de operaciones** está el historial completo de tu pieza. Si haces **doble clic** en el boceto original y cambias una cota, todas las operaciones que vienen después se recalculan solas. Esto permite probar variantes de un diseño en segundos.

Esta es la pieza que harás en el Paso a paso. Toca cada operación para ver cómo se construye, y cambia el ancho del primer boceto:

```widget
historial-operaciones
```

### Paso a paso

Convierte la placa de M2 en una pieza con torres para tornillos:

1. Selecciona el boceto de la placa y usa **Extrude** con **3 mm** y tipo **New**.
2. Haz un **nuevo boceto sobre la cara superior** de la placa.
3. Dibuja **4 círculos de 8 mm** de diámetro, centrados en cada agujero (usa la restricción coincidente entre los centros).
4. **Extruye** esos círculos **6 mm** hacia arriba con tipo **Add**: son las torres.
5. Haz otro boceto sobre la cara superior de las torres con **círculos de 3.2 mm** en sus centros, y **extruye con Remove** atravesando todo, para que el agujero pase por la torre y la placa.
6. Aplica un **redondeo de 5 mm** a las 4 aristas verticales de las esquinas de la placa.
7. Aplica un **chaflán de 0.5 mm** a las aristas de la cara inferior.
8. **Prueba el poder paramétrico:** haz doble clic en el primer boceto y cambia el ancho de 100 a **120 mm**. Observa cómo los agujeros y las torres se reacomodan solos.

### Errores comunes

- **Extruir hacia el lado equivocado:** usa el botón de invertir dirección en el cuadro de la operación.
- **Usar "New" en vez de "Add":** terminas con dos piezas separadas que se ven juntas pero no lo están. Revísalo en la lista de piezas (abajo a la izquierda).
- **Cambiar una cota y que la pieza "se rompa"** (operaciones en rojo): normalmente pasa cuando el boceto no estaba completamente definido. Vuelve a él y complétalo.
- **Seleccionar la región equivocada** del boceto al extruir: fíjate en qué zonas aparecen resaltadas antes de confirmar.

### Mini práctica

Convierte la escuadra en "L" de la mini práctica de M2 en una pieza de 3 mm de espesor, con un redondeo en la esquina interior de la L.

Pregunta para tu bitácora: ¿por qué crees que el redondeo en la esquina interior la hace más resistente?

### Puedo continuar si…

- [ ] Sé extruir con New, Add y Remove.
- [ ] Sé dibujar bocetos sobre caras de una pieza.
- [ ] Sé aplicar redondeos y chaflanes.
- [ ] Puedo cambiar una medida y entender cómo se actualiza la pieza.

## M4 · Diseñar para imprimir en 3D

### Objetivo

Aplicar las reglas básicas de diseño para impresión 3D: holguras, espesores y voladizos, y diseñar un alojamiento para un servo.

### ¿Para qué me sirve?

- **OTTO y minihumanoide:** todas sus piezas abrazan servos SG90, así que el alojamiento que harás aquí es su pieza básica.
- **Todas las categorías:** que una pieza encaje a la primera ahorra horas de impresión y filamento.

### Explicación

#### ¿Cómo imprime una impresora 3D?

Las impresoras de Nova son de tipo **FDM**: derriten un hilo de plástico (filamento) y lo depositan **capa por capa**, de abajo hacia arriba, como si construyeran la pieza con fideos muy delgados. Datos típicos:

- **Boquilla:** 0.4 mm (el grosor de cada "fideo").
- **Altura de capa:** 0.2 mm.

```widget
capas-impresion
```

#### Regla 1: las holguras

Una pieza impresa **nunca sale exactamente con la medida del diseño**: los agujeros salen un poco más pequeños y los bordes un poco más grandes. Si diseñas un agujero de 5 mm para un LED de 5 mm, el LED **no entrará**.

Por eso se deja una **holgura** (espacio extra) donde una pieza debe encajar en otra.

> **Regla Nova para empezar:** agrega **0.2 mm por lado**. Es decir, al diámetro de un agujero o al ancho de una ranura le sumas **0.4 mm** en total.

| Componente | Medida real | Medida en el diseño |
| --- | --- | --- |
| LED de 5 mm | 5.0 mm | **5.4 mm** |
| Tornillo M3 | 3.0 mm | **3.2 a 3.4 mm** |
| Cuerpo del servo SG90 | ≈ 22.2 × 11.8 mm | **≈ 22.6 × 12.2 mm** |

Cada impresora es un poco distinta. Ya en el equipo aprenderás a imprimir una pieza de prueba de holguras para ajustar estos valores.

```widget
holguras
```

#### Regla 2: espesores mínimos

Una pared muy delgada sale frágil o directamente no se imprime. Con boquilla de 0.4 mm:

- **Mínimo:** 1.2 mm (tres "fideos").
- **Recomendado:** **2 mm** para paredes de carcasas y soportes.

#### Regla 3: los voladizos

La impresora no puede depositar plástico "en el aire". Una parte que sobresale sin nada debajo se llama **voladizo**:

- Hasta unos **45°** de inclinación, la impresora lo resuelve sola (cada capa se apoya un poco en la anterior).
- Más de 45°, o una parte totalmente horizontal en el aire, necesita **soportes**: estructuras extra que se imprimen debajo y luego se retiran. Gastan material y dejan marcas.

**Diseña pensando en cómo se va a apoyar la pieza en la cama de la impresora:** la cara más grande y plana, abajo.

```widget
voladizos
```

#### Regla 4: la resistencia depende de la orientación

Las capas se pegan entre sí, pero esa unión es el punto más débil de la pieza. Una pieza impresa se rompe mucho más fácil **separando sus capas** que a lo largo de ellas. Si una pieza va a recibir fuerza (como el soporte de un servo), piensa en qué dirección quedarán sus capas.

```widget
orientacion-capas
```

#### La operación Vaciado (Shell)

**Shell** convierte un sólido en una cáscara hueca con paredes de un espesor que tú eliges, quitando las caras que selecciones. Es la forma más rápida de hacer una caja.

```widget
vaciado
```

### Paso a paso

Diseña una caja con un alojamiento para servo SG90 en una de sus paredes:

1. En un **nuevo Part Studio** (pestaña de abajo, botón **+**), dibuja un rectángulo de **60 × 40 mm** sobre el plano Top y extrúyelo **30 mm**.
2. Usa **Shell**: selecciona la **cara superior** para quitarla y pon un espesor de **2 mm**. Ya tienes una caja abierta.
3. Busca en internet la hoja de datos del **servo SG90** y anota: el largo y ancho del cuerpo, y la distancia entre los agujeros de sus "orejas" de montaje.
4. Haz un boceto sobre la **cara exterior de una de las paredes largas** (la de 60 × 30 mm). Dibuja un **rectángulo** del tamaño del cuerpo del servo **más la holgura** (≈ 22.6 × 12.2 mm), centrado en la pared.
5. Dibuja **dos círculos de 2 mm** a cada lado del rectángulo, separados según la distancia entre las orejas del servo (verifícala en la hoja de datos; suele estar alrededor de 27.5 mm).
6. **Extruye con Remove** para cortar la ranura y los agujeros a través de la pared.
7. Aplica **redondeos** en las aristas exteriores de la caja.

### Errores comunes

- **Diseñar con las medidas exactas** del componente sin holgura: no encajará.
- **Aplicar la holgura en una sola dirección:** recuerda sumarla tanto al largo como al ancho.
- **Paredes de 1 mm o menos:** se romperán o saldrán con huecos.
- **Confiar en una sola medida de internet:** las medidas varían entre fabricantes. Si consultas dos fuentes y no coinciden, anótalo en tu bitácora y usa la que tenga más sentido.

### Mini práctica

En la misma caja, agrega en otra pared **3 agujeros para LEDs de 5 mm** (con su holgura), separados 10 mm entre centros y alineados horizontalmente.

### Puedo continuar si…

- [ ] Sé qué es una holgura y aplico la regla Nova de +0.2 mm por lado.
- [ ] Mis paredes tienen al menos 2 mm.
- [ ] Puedo explicar qué es un voladizo y cuándo necesita soportes.
- [ ] Sé usar Shell para hacer una caja.

## M5 · Exportar e imprimir

### Objetivo

Exportar una pieza en formato STL, entender qué hace un laminador y compartir tu diseño con un link.

### ¿Para qué me sirve?

**En todas las categorías.** Ningún diseño sirve hasta que se fabrica. Este es el paso que conecta tu diseño en la computadora con la impresora 3D.

### Explicación

#### Los formatos de archivo

- **STL:** describe la superficie de la pieza con miles de triángulos pequeños. Es el formato que entienden los programas de impresión 3D.
- **STEP:** guarda la pieza con su geometría exacta. Se usa para compartir diseños entre programas de CAD (por ejemplo, para importar el modelo 3D de un sensor o una placa a tu ensamble).

```widget
stl-step
```

#### ¿Qué es un laminador?

Una impresora no entiende un STL directamente. Primero, un programa llamado **laminador (slicer)** "corta" la pieza en cientos de capas y genera las instrucciones exactas que seguirá la impresora: por dónde mover la boquilla, cuánto plástico poner y a qué temperatura. En Nova usamos **Bambu Studio** (gratuito).

Los ajustes más importantes del laminador:

| Ajuste | Qué es | Valor típico para nuestras piezas |
| --- | --- | --- |
| **Altura de capa** | El grosor de cada capa | 0.2 mm |
| **Paredes (perímetros)** | Cuántas líneas forman el borde de la pieza | 2 a 3 |
| **Relleno (infill)** | Qué tan lleno está el interior. Las piezas no se imprimen sólidas: por dentro tienen un patrón | 15 a 20 %, patrón **giroide** |
| **Soportes** | Las estructuras para los voladizos | Solo si hacen falta. Los de tipo **árbol** son los más fáciles de retirar |
| **Orientación** | Cómo se apoya la pieza en la cama | La cara grande y plana, abajo |

Prueba los ajustes antes de abrir Bambu Studio: mira cómo cambian el tiempo, el material y la resistencia.

```widget
laminador
```

### Paso a paso

**1. Exportar el STL**

1. Abre el Part Studio de la caja de M4.
2. En la **lista de piezas** (abajo a la izquierda), haz clic derecho sobre la caja y elige **Export**.
3. Formato: **STL**. Unidades: **milímetros**. Resolución: **fina**.
4. Guarda el archivo en tu computadora.

**2. Compartir el diseño**

1. Haz clic en **Share** (arriba a la derecha) y asegúrate de que el documento sea **público** o accesible con link.
2. Copia el link y ábrelo en una **ventana de incógnito** para comprobar que se ve sin iniciar sesión.

**3. Laminar (opcional, pero recomendado)**

1. Descarga e instala **Bambu Studio** (gratuito).
2. Importa tu STL.
3. Revisa la orientación, configura los valores de la tabla y lamina la pieza.
4. Mira la vista previa capa por capa y anota **cuánto tiempo** tardaría la impresión y **cuántos gramos** de filamento usaría.

### Errores comunes

- **Exportar en pulgadas:** la pieza sale 25.4 veces más grande (o más pequeña) en el laminador. Exporta siempre en **milímetros**.
- **Exportar todas las piezas juntas** cuando querías solo una: revisa qué está seleccionado antes de exportar.
- **El link no abre para otros:** revisa la configuración de Share y pruébalo en incógnito.

### Mini práctica

Exporta como STL la placa con torres de M3. Si instalaste Bambu Studio, compárala con la caja de M4: ¿cuál tarda más en imprimirse y por qué? Anótalo en tu bitácora.

### Puedo continuar si…

- [ ] Sé exportar una pieza en STL y en milímetros.
- [ ] Puedo explicar qué hace un laminador y qué son el relleno y los soportes.
- [ ] Mi link de Onshape se abre en una ventana de incógnito.

## Tarea final · Parte Mecánica

Diseña la **caja del Panel de control Nova**, donde irían montados todos los componentes del proyecto (la descripción completa está en la página de la tarea final).

### Requisitos

- [ ] Una **caja** (base) con espacio interior suficiente para la **ESP32 DevKit V1** (investiga sus medidas).
- [ ] Una **abertura** para el cable USB de la ESP32.
- [ ] En la cara superior o frontal (el panel): **3 agujeros para LEDs de 5 mm.**
- [ ] **1 agujero para el botón.** Elige un modelo de botón, busca sus medidas y anótalo.
- [ ] **1 agujero para el eje del potenciómetro.** Elige un modelo de potenciómetro de panel, busca la medida de su rosca o eje y anótalo.
- [ ] **1 alojamiento para el servo SG90** con sus 2 agujeros de montaje, de forma que su eje quede hacia afuera.
- [ ] **Holguras** aplicadas (regla Nova: +0.2 mm por lado).
- [ ] **Paredes de 2 mm** como mínimo.
- [ ] **Bocetos completamente definidos** (negros).

### Qué entregas

1. **Link público** del documento de Onshape (comprueba que abre en incógnito).
2. **Archivo STL** de la caja.
3. **Tabla de medidas:** cada componente con la medida real, la medida que usaste en el diseño y **de dónde sacaste el dato** (link a la hoja de datos o a la página).

| Componente | Medida real | Medida en el diseño | Fuente |
| --- | --- | --- | --- |
| LED 5 mm | | | |
| Botón | | | |
| Potenciómetro | | | |
| Servo SG90 | | | |
| ESP32 DevKit V1 | | | |

Usa la calculadora para llenar la columna "Medida en el diseño":

```widget
holguras
```

### Retos extra (opcionales)

- Haz una **tapa separada** que se atornille a la caja con 4 tornillos M3 (con torres en las esquinas).
- **Graba** tu nombre o el logo de Nova en la caja (con un corte de 0.5 mm de profundidad).
- Diseña una **aguja indicadora** que se coloque sobre el eje del servo, y graba en el panel las marcas de **0°, 90° y 180°**, como un medidor.
- Agrega las **torres de montaje** para la PCB que diseñaste en Electrónica.
