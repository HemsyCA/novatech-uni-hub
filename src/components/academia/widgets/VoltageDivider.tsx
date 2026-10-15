import { useState } from "react";
import { Gauge, SlidersHorizontal } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const ESP32_MAX = 3.3;
const RESISTORS = [1000, 2000, 4700, 10000, 20000];

const ohms = (value: number) => (value >= 1000 ? `${+(value / 1000).toFixed(1)} kΩ` : `${value} Ω`);
const volts = (value: number) => `${(Math.round(value * 100) / 100).toFixed(2)} V`;

function OutputBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
      <div className="h-full rounded-full bg-[rgb(var(--tone,255_255_255))] transition-[width] duration-300" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}

function DividerSchematic({ vin, r1, r2, vout }: { vin: number; r1: number; r2: number; vout: number }) {
  const text = { fill: "white", fontSize: 12, fontFamily: "inherit" };
  const hint = { fill: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "inherit" };
  return (
    <svg viewBox="0 0 200 250" className="h-auto w-full max-w-[200px]" role="img" aria-label={`Divisor: ${vin} V, R1 ${ohms(r1)}, R2 ${ohms(r2)}, salida ${volts(vout)}`}>
      <text x="44" y="16" {...text}>{vin} V</text>
      <line x1="60" y1="22" x2="60" y2="40" stroke="#d4d4d4" strokeWidth="2" />
      <rect x="45" y="40" width="30" height="55" rx="4" fill="none" stroke="white" strokeWidth="2" />
      <text x="84" y="64" {...text}>R1</text>
      <text x="84" y="79" {...hint}>{ohms(r1)}</text>
      <line x1="60" y1="95" x2="60" y2="140" stroke="#d4d4d4" strokeWidth="2" />
      <circle cx="60" cy="117" r="4" fill="rgb(var(--tone, 255 255 255))" />
      <line x1="60" y1="117" x2="120" y2="117" stroke="rgb(var(--tone, 255 255 255))" strokeWidth="2" strokeDasharray="4 3" />
      <text x="124" y="114" fill="rgb(var(--tone, 255 255 255))" fontSize="12" fontFamily="inherit">V salida</text>
      <text x="124" y="129" fill="rgb(var(--tone, 255 255 255))" fontSize="13" fontWeight="bold" fontFamily="inherit">{volts(vout)}</text>
      <rect x="45" y="140" width="30" height="55" rx="4" fill="none" stroke="white" strokeWidth="2" />
      <text x="84" y="164" {...text}>R2</text>
      <text x="84" y="179" {...hint}>{ohms(r2)}</text>
      <line x1="60" y1="195" x2="60" y2="222" stroke="#d4d4d4" strokeWidth="2" />
      <line x1="44" y1="222" x2="76" y2="222" stroke="white" strokeWidth="2" />
      <line x1="50" y1="229" x2="70" y2="229" stroke="white" strokeWidth="2" />
      <line x1="56" y1="236" x2="64" y2="236" stroke="white" strokeWidth="2" />
      <text x="84" y="234" {...hint}>GND</text>
    </svg>
  );
}

export function VoltageDivider() {
  const [vin, setVin] = useState(5);
  const [r1, setR1] = useState(1000);
  const [r2, setR2] = useState(2000);
  const vout = (vin * r2) / (r1 + r2);

  const picker = (label: string, value: number, onChange: (v: number) => void) => (
    <div>
      <p className="mb-2 text-xs text-white/50">{label}</p>
      <div className="flex flex-wrap gap-2">
        {RESISTORS.map((r) => (
          <Choice key={r} selected={r === value} onClick={() => onChange(r)}>
            {ohms(r)}
          </Choice>
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard icon={SlidersHorizontal} title="Arma tu divisor de voltaje">
      <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-white/50">Voltaje de entrada</p>
            <div className="flex flex-wrap gap-2">
              {[3.3, 5].map((v) => (
                <Choice key={v} selected={v === vin} onClick={() => setVin(v)}>
                  {v} V
                </Choice>
              ))}
            </div>
          </div>
          {picker("R1 (hacia la entrada)", r1, setR1)}
          {picker("R2 (hacia GND)", r2, setR2)}
        </div>
        <div className="flex justify-center">
          <DividerSchematic vin={vin} r1={r1} r2={r2} vout={vout} />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-xl bg-white/[0.04] px-4 py-3 text-sm">
          <p className="text-xs text-white/50">V salida = V entrada × R2 / (R1 + R2)</p>
          <p className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-white/70">
              {vin} × {r2} / ({r1} + {r2})
            </span>
            <span className="text-lg font-semibold text-[rgb(var(--tone,255_255_255))]">{volts(vout)}</span>
          </p>
          <div className="mt-3">
            <OutputBar value={vout} max={vin} />
          </div>
        </div>
        {vin === 5 &&
          (vout <= ESP32_MAX + 0.05 ? (
            <Feedback tone="ok">✅ {volts(vout)} es seguro para un pin del ESP32 (máximo 3.3 V).</Feedback>
          ) : (
            <Feedback tone="error">⚠️ {volts(vout)} es más de 3.3 V: dañaría el ESP32. Haz R2 más grande o R1 más pequeña.</Feedback>
          ))}
      </div>
    </WidgetCard>
  );
}

export function Potentiometer() {
  const [percent, setPercent] = useState(50);
  const vout = (ESP32_MAX * percent) / 100;
  const angle = -135 + (percent / 100) * 270;

  return (
    <WidgetCard icon={Gauge} title="Gira la perilla">
      <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        <svg viewBox="0 0 160 160" className="mx-auto h-40 w-40" aria-hidden>
          <path d="M 36.4 123.6 A 62 62 0 1 1 123.6 123.6" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M 36.4 123.6 A 62 62 0 1 1 123.6 123.6"
            fill="none"
            stroke="rgb(var(--tone, 255 255 255))"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${percent} 100`}
          />
          <g transform={`rotate(${angle} 80 80)`}>
            <circle cx="80" cy="80" r="40" fill="#262626" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <line x1="80" y1="80" x2="80" y2="48" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </g>
          <text x="22" y="150" fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily="inherit">GND</text>
          <text x="116" y="150" fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily="inherit">3.3 V</text>
        </svg>
        <div className="space-y-4">
          <div>
            <label htmlFor="pot-percent" className="mb-2 flex justify-between text-xs text-white/50">
              Posición del cursor <span className="font-semibold text-white">{percent}%</span>
            </label>
            <input
              id="pot-percent"
              type="range"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full accent-[rgb(var(--tone,255_255_255))]"
            />
          </div>
          <div className="rounded-xl bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-white/50">Voltaje en la pata del centro</p>
            <p className="mt-1 text-2xl font-semibold text-[rgb(var(--tone,255_255_255))]">{volts(vout)}</p>
            <p className="mt-1 text-xs text-white/50">
              3.3 V × {percent}% · en P5 el ESP32 leerá este voltaje
            </p>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
