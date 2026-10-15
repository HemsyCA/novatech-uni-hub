import { useState, type ReactNode } from "react";
import { Calculator } from "lucide-react";

const SOURCES = [
  { volts: 3.3, label: "3.3 V", hint: "pin del ESP32" },
  { volts: 5, label: "5 V", hint: "USB" },
  { volts: 7.4, label: "7.4 V", hint: "LiPo 2S" },
];

// Caídas típicas de la lección E1.
const LEDS = [
  { name: "Rojo", drop: 2.0, color: "#f87171" },
  { name: "Amarillo", drop: 2.0, color: "#facc15" },
  { name: "Verde", drop: 2.0, color: "#4ade80" },
  { name: "Azul", drop: 3.0, color: "#60a5fa" },
  { name: "Blanco", drop: 3.0, color: "#f5f5f5" },
];

// Serie comercial E12, de 10 Ω a 82 kΩ.
const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
const COMMERCIAL = [1, 10, 100, 1000].flatMap((factor) => E12.map((value) => value * factor));

const POWER_LIMIT = 0.25;

const ohms = (value: number) => (value >= 1000 ? `${+(value / 1000).toFixed(1)} kΩ` : `${Math.round(value)} Ω`);
// Como en la lección: 2.0 V, 1.3 V, 0.25 V.
const volts = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toFixed(Number.isInteger(rounded * 10) ? 1 : 2)} V`;
};
const milliamps = (amps: number) => `${+(amps * 1000).toFixed(1)} mA`;

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
        selected
          ? "border-[rgb(var(--tone,255_255_255))] bg-[rgb(var(--tone,255_255_255)/0.12)] text-white"
          : "border-white/15 text-white/70 hover:border-white/35"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, math, result, highlight = false }: { label: string; math: string; result: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${highlight ? "bg-[rgb(var(--tone,255_255_255)/0.12)]" : "bg-white/[0.04]"}`}>
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span className="text-white/70">{math}</span>
        <span className={`font-semibold ${highlight ? "text-[rgb(var(--tone,255_255_255))] text-lg" : "text-white"}`}>{result}</span>
      </p>
    </div>
  );
}

export function LedResistorCalculator() {
  const [source, setSource] = useState(SOURCES[0]);
  const [led, setLed] = useState(LEDS[0]);
  const [currentMa, setCurrentMa] = useState(10);

  const current = currentMa / 1000;
  const resistorVolts = source.volts - led.drop;
  const ideal = resistorVolts / current;
  const commercial = COMMERCIAL.find((value) => value >= ideal) ?? COMMERCIAL[COMMERCIAL.length - 1];
  const realCurrent = resistorVolts / commercial;
  const power = resistorVolts * realCurrent;
  const glow = Math.min(realCurrent / 0.02, 1);

  return (
    <section className="not-prose my-8 rounded-2xl border border-[rgb(var(--tone,255_255_255)/0.4)] p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--tone,255_255_255))]">
        <Calculator className="h-4 w-4" /> Calculadora · pruébalo tú
      </p>
      <h4 className="mt-1 font-semibold text-white">¿Qué resistencia necesita mi LED?</h4>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-xs text-white/50">Fuente</p>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <Choice key={s.label} selected={s === source} onClick={() => setSource(s)}>
                {s.label} <span className="text-xs text-white/40">{s.hint}</span>
              </Choice>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-white/50">Color del LED</p>
          <div className="flex flex-wrap gap-2">
            {LEDS.map((l) => (
              <Choice key={l.name} selected={l === led} onClick={() => setLed(l)}>
                <span className="h-3 w-3 rounded-full" style={{ background: l.color }} />
                {l.name}
              </Choice>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="led-current" className="mb-2 flex justify-between text-xs text-white/50">
            Corriente que quieres <span className="font-semibold text-white">{currentMa} mA</span>
          </label>
          <input
            id="led-current"
            type="range"
            min={1}
            max={20}
            value={currentMa}
            onChange={(e) => setCurrentMa(Number(e.target.value))}
            className="w-full accent-[rgb(var(--tone,255_255_255))]"
          />
        </div>
      </div>

      {resistorVolts <= 0 ? (
        <p className="mt-5 rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          Con {source.label} no alcanza para un LED {led.name.toLowerCase()}: él solo necesita unos {volts(led.drop)}. Prueba con una
          fuente de más voltaje.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="space-y-2">
            <Row
              label="1. Voltaje que queda en la resistencia"
              math={`${volts(source.volts)} − ${volts(led.drop)}`}
              result={volts(resistorVolts)}
            />
            <Row label="2. Ley de Ohm: R = V / I" math={`${volts(resistorVolts)} ÷ ${current.toFixed(3)} A`} result={ohms(ideal)} />
            <Row label="3. Valor comercial (el siguiente más grande)" math="Serie comercial" result={ohms(commercial)} highlight />
            <Row
              label={`4. Comprobación con ${ohms(commercial)}`}
              math={`${milliamps(realCurrent)} · ${+power.toFixed(3)} W`}
              result={power < POWER_LIMIT ? "✅ Seguro" : "⚠️ Se calienta"}
            />
          </div>
          <div className="flex flex-row items-center justify-center gap-4 rounded-xl bg-white/[0.03] p-4 sm:flex-col">
            <svg viewBox="0 0 60 80" className="h-20 w-16" aria-hidden>
              <circle cx="30" cy="28" r={14 + glow * 12} fill={led.color} opacity={0.15 + glow * 0.35} style={{ filter: "blur(6px)" }} />
              <path d="M18 44 V26 a12 12 0 0 1 24 0 V44 Z" fill={led.color} opacity={0.35 + glow * 0.65} />
              <rect x="16" y="44" width="28" height="4" rx="1" fill={led.color} opacity="0.6" />
              <line x1="25" y1="48" x2="25" y2="78" stroke="#a3a3a3" strokeWidth="2" />
              <line x1="35" y1="48" x2="35" y2="70" stroke="#a3a3a3" strokeWidth="2" />
            </svg>
            <p className="max-w-[9rem] text-center text-xs text-white/50">Más corriente, más brillo… y más riesgo para el pin.</p>
          </div>
        </div>
      )}

      {source.volts === 3.3 && currentMa > 12 && resistorVolts > 0 && (
        <p className="mt-3 text-xs text-amber-200/80">
          Para cuidar los pines del ESP32, en Nova usamos alrededor de 10 mA por LED.
        </p>
      )}
      {resistorVolts > 0 && resistorVolts < 0.5 && (
        <p className="mt-3 text-xs text-amber-200/80">
          Queda muy poco voltaje para la resistencia: el LED puede brillar poco o de forma irregular.
        </p>
      )}
    </section>
  );
}
