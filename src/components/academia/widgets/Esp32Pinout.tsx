import { useState } from "react";
import { Cpu, RotateCcw, Trophy } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";
import { FILTERS, LEFT, RIGHT, kindColor, type Pin, type PinKind } from "@/lib/academia/esp32-pins";

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
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[rgb(var(--tone,255_255_255)/0.12)] px-4 py-3">
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
            className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--tone,255_255_255))] px-4 py-2.5 text-sm font-semibold text-black"
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
