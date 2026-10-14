import { useState } from "react";
import { Cpu, RotateCcw, Trophy } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type PinKind = "power" | "nova" | "input" | "avoid" | "gpio" | "control";

interface Pin {
  label: string;
  kinds: PinKind[];
  info: string;
}

const gpio = (n: number) => `GPIO ${n}. Pin de uso general: entrada o salida digital.`;

// ESP32 DevKit V1 de 30 pines, vista desde arriba con el USB hacia abajo.
const LEFT: Pin[] = [
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

const RIGHT: Pin[] = [
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

const FILTERS: { kind: PinKind | null; label: string; color: string }[] = [
  { kind: null, label: "Todos", color: "255 255 255" },
  { kind: "nova", label: "Mapa Nova", color: "74 222 128" },
  { kind: "power", label: "Alimentación", color: "248 113 113" },
  { kind: "input", label: "Solo entrada", color: "96 165 250" },
  { kind: "avoid", label: "Evitar", color: "251 191 36" },
];

const kindColor = (pin: Pin) => FILTERS.find((f) => f.kind && pin.kinds.includes(f.kind))?.color ?? "163 163 163";

const CHALLENGE = [
  { prompt: "Toca un pin GND", accepts: ["GND"] },
  { prompt: "Toca el pin que entrega 3.3 V", accepts: ["3V3"] },
  { prompt: "Toca el pin de 5 V cuando hay USB", accepts: ["VIN"] },
  { prompt: "¿Dónde va el LED verde? (GPIO 18)", accepts: ["D18"] },
  { prompt: "¿Dónde va el LED amarillo? (GPIO 19)", accepts: ["D19"] },
  { prompt: "¿Dónde va el LED rojo? (GPIO 23)", accepts: ["D23"] },
  { prompt: "¿Dónde va el botón? (GPIO 21)", accepts: ["D21"] },
  { prompt: "¿Dónde va el potenciómetro? (GPIO 34)", accepts: ["D34"] },
  { prompt: "¿Dónde va la señal del servo? (GPIO 25)", accepts: ["D25"] },
];

function PinButton({ pin, side, dimmed, selected, onSelect }: { pin: Pin; side: "left" | "right"; dimmed: boolean; selected: boolean; onSelect: () => void }) {
  const color = kindColor(pin);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex h-7 items-center gap-1.5 text-[11px] transition-opacity sm:text-xs ${side === "left" ? "flex-row-reverse" : ""} ${
        dimmed ? "opacity-25" : "opacity-100"
      }`}
    >
      <span
        className={`h-4 w-4 shrink-0 rounded-full border-2 ${selected ? "scale-125" : ""} transition-transform`}
        style={{ borderColor: `rgb(${color})`, background: selected ? `rgb(${color})` : "transparent" }}
      />
      <span className={`w-9 font-semibold ${side === "left" ? "text-right" : "text-left"}`} style={{ color: `rgb(${color})` }}>
        {pin.label}
      </span>
    </button>
  );
}

export function Esp32Pinout() {
  const [filter, setFilter] = useState<PinKind | null>(null);
  const [selected, setSelected] = useState<{ side: "left" | "right"; index: number } | null>(null);
  const [challenge, setChallenge] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const pinAt = (side: "left" | "right", index: number) => (side === "left" ? LEFT : RIGHT)[index];
  const selectedPin = selected ? pinAt(selected.side, selected.index) : null;
  const inChallenge = challenge !== null && challenge < CHALLENGE.length;

  const select = (side: "left" | "right", index: number) => {
    const pin = pinAt(side, index);
    setSelected({ side, index });
    if (!inChallenge) return;
    const step = CHALLENGE[challenge];
    if (step.accepts.includes(pin.label)) {
      setMessage({ tone: "ok", text: `¡Bien! ${pin.info}` });
      setChallenge(challenge + 1);
    } else {
      setMistakes((m) => m + 1);
      setMessage({ tone: "error", text: `Ese es ${pin.label}. ${pin.info} Intenta otra vez.` });
    }
  };

  const startChallenge = () => {
    setChallenge(0);
    setMistakes(0);
    setMessage(null);
    setSelected(null);
    setFilter(null);
  };

  const column = (pins: Pin[], side: "left" | "right") => (
    <div className="flex flex-col justify-between py-1">
      {pins.map((pin, index) => (
        <PinButton
          key={`${side}-${index}`}
          pin={pin}
          side={side}
          dimmed={Boolean(filter && !pin.kinds.includes(filter))}
          selected={selected?.side === side && selected.index === index}
          onSelect={() => select(side, index)}
        />
      ))}
    </div>
  );

  return (
    <WidgetCard icon={Cpu} label="Explora la placa" title="ESP32 DevKit V1 (30 pines)">
      {inChallenge ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[rgb(var(--accent,255_255_255)/0.12)] px-4 py-3">
          <p className="text-sm font-semibold">
            <span className="mr-2 text-xs font-normal text-white/50">
              {challenge + 1}/{CHALLENGE.length}
            </span>
            {CHALLENGE[challenge].prompt}
          </p>
          <button type="button" onClick={() => setChallenge(null)} className="shrink-0 text-xs text-white/50 underline underline-offset-4">
            Salir
          </button>
        </div>
      ) : (
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Choice key={f.label} selected={filter === f.kind} onClick={() => setFilter(f.kind)}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: `rgb(${f.color})` }} />
              {f.label}
            </Choice>
          ))}
        </div>
      )}

      <div className="mx-auto grid max-w-sm grid-cols-[1fr_auto_1fr] gap-2">
        {column(LEFT, "left")}
        <div className="flex w-24 flex-col items-center rounded-lg border border-white/20 bg-white/[0.04] px-2 py-2 sm:w-28">
          <div className="flex h-20 w-full flex-col items-center justify-center rounded-md border border-white/25 bg-white/[0.06] text-[10px] text-white/60">
            <span className="font-semibold text-white/80">ESP32</span>
            <span>módulo y antena</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center text-[10px] text-white/40">
            <span>regulador</span>
            <span>chip USB</span>
          </div>
          <div className="flex w-full justify-between text-[9px] text-white/50">
            <span className="rounded border border-white/20 px-1">EN</span>
            <span className="rounded border border-white/20 px-1">BOOT</span>
          </div>
          <div className="mt-2 h-4 w-10 rounded-sm border border-white/40 bg-white/10" title="Conector USB" />
          <span className="mt-1 text-[9px] text-white/40">USB</span>
        </div>
        {column(RIGHT, "right")}
      </div>

      <div className="mt-4 space-y-3">
        {message && inChallenge ? (
          <Feedback tone={message.tone}>{message.text}</Feedback>
        ) : challenge === CHALLENGE.length ? (
          <Feedback tone="ok">
            <Trophy className="mr-1 inline h-4 w-4" /> ¡Reto completado
            {mistakes === 0 ? " sin errores!" : ` con ${mistakes} error${mistakes > 1 ? "es" : ""}!`} Ya sabes dónde va cada
            componente del Mapa Nova.
          </Feedback>
        ) : selectedPin ? (
          <Feedback tone="info">
            <span className="font-semibold text-white">{selectedPin.label}: </span>
            {selectedPin.info}
          </Feedback>
        ) : (
          <Feedback tone="info">Toca cualquier pin para ver qué es y si lo usamos en Nova.</Feedback>
        )}

        {!inChallenge && (
          <button
            type="button"
            onClick={startChallenge}
            className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--accent,255_255_255))] px-4 py-2.5 text-sm font-semibold text-black"
          >
            {challenge === CHALLENGE.length ? <RotateCcw className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
            {challenge === CHALLENGE.length ? "Repetir el reto" : "Reto: encuentra los pines"}
          </button>
        )}
        <p className="text-xs text-white/40">
          El orden de los pines puede variar un poco según el fabricante: guíate siempre por la etiqueta impresa en tu placa.
        </p>
      </div>
    </WidgetCard>
  );
}
