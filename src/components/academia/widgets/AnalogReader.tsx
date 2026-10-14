import { useState } from "react";
import { Activity } from "lucide-react";
import { WidgetCard } from "@/components/academia/widgets/WidgetCard";

const ADC_MAX = 4095;
const VREF = 3.3;

// map() de Arduino trabaja con enteros: el resultado se corta, no se redondea.
const arduinoMap = (x: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  Math.trunc(((x - inMin) * (outMax - outMin)) / (inMax - inMin)) + outMin;

function Scale({ label, value, max, unit }: { label: string; value: number; max: number; unit?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-white/50">
        <span>{label}</span>
        <span className="font-semibold text-white">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/10">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[rgb(var(--accent,255_255_255))]" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <div className="mt-0.5 flex justify-between text-[10px] text-white/35">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

const BRANCHES = [
  { code: "if (porcentaje < 33)", label: "nivel bajo" },
  { code: "else if (porcentaje < 66)", label: "nivel medio" },
  { code: "else", label: "nivel alto" },
];

export function AnalogReader() {
  const [volts, setVolts] = useState(1.65);
  const valor = Math.round((volts / VREF) * ADC_MAX);
  const voltaje = (valor * VREF) / ADC_MAX;
  const porcentaje = arduinoMap(valor, 0, ADC_MAX, 0, 100);
  const branch = porcentaje < 33 ? 0 : porcentaje < 66 ? 1 : 2;

  return (
    <WidgetCard icon={Activity} title="Del pin al número">
      <label htmlFor="adc-volts" className="mb-2 flex justify-between text-xs text-white/50">
        Gira el potenciómetro <span className="font-semibold text-white">{volts.toFixed(2)} V en el GPIO 34</span>
      </label>
      <input
        id="adc-volts"
        type="range"
        min={0}
        max={VREF}
        step={0.01}
        value={volts}
        onChange={(e) => setVolts(Number(e.target.value))}
        className="w-full accent-[rgb(var(--accent,255_255_255))]"
      />

      <div className="mt-5 space-y-4">
        <Scale label="analogRead(POT)" value={valor} max={ADC_MAX} />
        <Scale label="map(valor, 0, 4095, 0, 100)" value={porcentaje} max={100} unit=" %" />
      </div>

      <div className="mt-5 rounded-md bg-black px-3 py-2 font-mono text-xs text-emerald-300">
        Valor: {valor}   Voltaje: {voltaje.toFixed(2)} V   Porcentaje: {porcentaje} %
      </div>

      <div className="mt-4 space-y-1">
        {BRANCHES.map((b, index) => (
          <div
            key={b.code}
            className={`flex items-center justify-between rounded-lg px-3 py-2 font-mono text-[13px] transition-colors ${
              index === branch ? "bg-[rgb(var(--accent,255_255_255)/0.15)] text-white" : "text-white/40"
            }`}
          >
            <span>{b.code}</span>
            <span className="font-sans text-xs">{index === branch ? `← se ejecuta: ${b.label}` : b.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/45">
        Fíjate: el programa revisa las condiciones en orden y solo ejecuta la primera que se cumple.
      </p>
    </WidgetCard>
  );
}
