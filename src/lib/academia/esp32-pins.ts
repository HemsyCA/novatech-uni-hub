// Los 30 pines del ESP32 DevKit V1: los usan la placa 2D y la placa 3D de E3.
export type PinKind = "power" | "nova" | "input" | "avoid" | "gpio" | "control";

export interface Pin {
  label: string;
  kinds: PinKind[];
  info: string;
}

const gpio = (n: number) => `GPIO ${n}. Pin de uso general: entrada o salida digital.`;

// ESP32 DevKit V1 de 30 pines, vista desde arriba con el USB hacia abajo.
export const LEFT: Pin[] = [
  { label: "EN", kinds: ["control"], info: "Reinicia la placa, igual que el botón EN. No se usa para conectar cosas." },
  { label: "VP", kinds: ["input"], info: "GPIO 36. Solo entrada: sirve para leer sensores, no para LEDs ni servos." },
  { label: "VN", kinds: ["input"], info: "GPIO 39. Solo entrada: sirve para leer sensores, no para LEDs ni servos." },
  { label: "D34", kinds: ["nova", "input"], info: "GPIO 34 · Potenciómetro en el Mapa Nova. Solo entrada y con ADC: perfecto para leer voltajes." },
  { label: "D35", kinds: ["input"], info: "GPIO 35. Solo entrada: un LED aquí nunca encenderá." },
  { label: "D32", kinds: ["gpio"], info: gpio(32) },
  { label: "D33", kinds: ["gpio"], info: gpio(33) },
  { label: "D25", kinds: ["nova"], info: "GPIO 25 · Señal del servo en el Mapa Nova. Salida segura con PWM." },
  { label: "D26", kinds: ["gpio"], info: gpio(26) },
  { label: "D27", kinds: ["gpio"], info: gpio(27) },
  { label: "D14", kinds: ["gpio"], info: gpio(14) },
  { label: "D12", kinds: ["avoid"], info: "GPIO 12. Interviene en el arranque: si conectas algo, a veces el ESP32 no arranca." },
  { label: "D13", kinds: ["gpio"], info: gpio(13) },
  { label: "GND", kinds: ["power"], info: "Tierra (0 V). La referencia de todo el circuito: todo debe compartir este GND." },
  { label: "VIN", kinds: ["power"], info: "Con la placa conectada por USB, aquí hay unos 5 V. También sirve para alimentarla con una fuente externa de 5 V." },
];

export const RIGHT: Pin[] = [
  { label: "D23", kinds: ["nova"], info: "GPIO 23 · LED rojo en el Mapa Nova. Salida segura." },
  { label: "D22", kinds: ["gpio"], info: gpio(22) },
  { label: "TX0", kinds: ["avoid"], info: "GPIO 1. Lo usa la comunicación USB con la computadora: no conectes nada aquí." },
  { label: "RX0", kinds: ["avoid"], info: "GPIO 3. Lo usa la comunicación USB con la computadora: no conectes nada aquí." },
  { label: "D21", kinds: ["nova"], info: "GPIO 21 · Botón en el Mapa Nova. Entrada segura." },
  { label: "D19", kinds: ["nova"], info: "GPIO 19 · LED amarillo en el Mapa Nova. Salida segura." },
  { label: "D18", kinds: ["nova"], info: "GPIO 18 · LED verde en el Mapa Nova. Salida segura." },
  { label: "D5", kinds: ["gpio"], info: gpio(5) },
  { label: "TX2", kinds: ["gpio"], info: "GPIO 17. Pin de uso general (también sirve para comunicación serial)." },
  { label: "RX2", kinds: ["gpio"], info: "GPIO 16. Pin de uso general (también sirve para comunicación serial)." },
  { label: "D4", kinds: ["gpio"], info: gpio(4) },
  { label: "D2", kinds: ["avoid"], info: "GPIO 2. Interviene en el arranque y en la carga de programas. Mejor evitarlo al empezar." },
  { label: "D15", kinds: ["avoid"], info: "GPIO 15. Interviene en el arranque: si conectas algo, a veces el ESP32 no arranca." },
  { label: "GND", kinds: ["power"], info: "Tierra (0 V). La referencia de todo el circuito: todo debe compartir este GND." },
  { label: "3V3", kinds: ["power"], info: "Entrega 3.3 V. Sirve para alimentar sensores pequeños, no motores ni servos." },
];

export const FILTERS: { kind: PinKind | null; label: string; color: string }[] = [
  { kind: null, label: "Todos", color: "255 255 255" },
  { kind: "nova", label: "Mapa Nova", color: "74 222 128" },
  { kind: "power", label: "Alimentación", color: "248 113 113" },
  { kind: "input", label: "Solo entrada", color: "96 165 250" },
  { kind: "avoid", label: "Evitar", color: "251 191 36" },
];

export const kindColor = (pin: Pin) => FILTERS.find((f) => f.kind && pin.kinds.includes(f.kind))?.color ?? "163 163 163";
