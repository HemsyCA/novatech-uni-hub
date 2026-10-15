import { useState } from "react";
import { AudioWaveform, Repeat } from "lucide-react";
import { Choice, CodeLine, Feedback, LedIcon, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const PERIODS = 4;

function SquareWave({ duty }: { duty: number }) {
  const width = 240;
  const period = width / PERIODS;
  const high = 8;
  const low = 52;
  let d = `M0 ${low}`;
  for (let i = 0; i < PERIODS; i++) {
    const start = i * period;
    const on = period * duty;
    if (duty === 0) d += ` H${start + period}`;
    else if (duty === 1) d += ` V${high} H${start + period}`;
    else d += ` V${high} H${start + on} V${low} H${start + period}`;
  }
  return (
    <svg viewBox="0 0 270 60" className="h-16 w-full" role="img" aria-label={`Señal PWM encendida el ${Math.round(duty * 100)} % del tiempo`}>
      <text x="246" y="12" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="inherit">3.3 V</text>
      <text x="246" y="55" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="inherit">0 V</text>
      <line x1="0" y1={high + (low - high) * (1 - duty)} x2="240" y2={high + (low - high) * (1 - duty)} stroke="rgba(255,255,255,0.35)" strokeDasharray="3 3" />
      <path d={d} fill="none" stroke="rgb(var(--tone, 255 255 255))" strokeWidth="2" />
    </svg>
  );
}

function Wheel({ duty }: { duty: number }) {
  // Más ciclo de trabajo, más rápido gira.
  const seconds = duty === 0 ? 0 : 2.4 - duty * 2.1;
  return (
    <svg viewBox="0 0 60 60" className="h-16 w-16" role="img" aria-label={`Motor al ${Math.round(duty * 100)} % de velocidad`}>
      <g style={seconds ? { animation: `spin ${seconds}s linear infinite`, transformOrigin: "30px 30px" } : undefined}>
        <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="5" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line key={a} x1="30" y1="30" x2={30 + 22 * Math.cos((a * Math.PI) / 180)} y2={30 + 22 * Math.sin((a * Math.PI) / 180)} stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
        ))}
      </g>
      <circle cx="30" cy="30" r="4" fill="white" />
    </svg>
  );
}

export function PwmDemo() {
  const [value, setValue] = useState(128);
  const duty = value / 255;

  return (
    <WidgetCard icon={AudioWaveform} title="Encender y apagar muy rápido">
      <label htmlFor="pwm-value" className="mb-2 flex justify-between text-xs text-white/50">
        Valor de analogWrite <span className="font-semibold text-white">{value} de 255 · {Math.round(duty * 100)} % encendido</span>
      </label>
      <input
        id="pwm-value"
        type="range"
        min={0}
        max={255}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-[rgb(var(--tone,255_255_255))]"
      />
      <div className="mt-4">
        <CodeLine>analogWrite(LED_ROJO, {value});</CodeLine>
      </div>
      <div className="mt-4 rounded-xl bg-white/[0.03] p-3">
        <p className="text-xs text-white/50">La señal en el pin</p>
        <SquareWave duty={duty} />
        <p className="text-[11px] text-white/40">La línea punteada es el promedio: lo que "ve" el LED o el motor.</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center rounded-xl bg-white/[0.03] p-3">
          <LedIcon color="#f87171" brightness={duty} />
          <p className="mt-1 text-xs text-white/50">Brillo del LED</p>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-white/[0.03] p-3">
          <Wheel duty={duty} />
          <p className="mt-1 text-xs text-white/50">Velocidad de un motor</p>
        </div>
      </div>
    </WidgetCard>
  );
}

type Op = "<" | "<=" | ">" | ">=";

const PRESETS: { label: string; start: number; op: Op; limit: number; up: boolean }[] = [
  { label: "Contar 5", start: 0, op: "<", limit: 5, up: true },
  { label: "Subir brillo", start: 0, op: "<=", limit: 255, up: true },
  { label: "Bajar brillo", start: 255, op: ">=", limit: 0, up: false },
  { label: "¿Error?", start: 0, op: ">=", limit: 0, up: true },
];

const MAX_SHOWN = 12;

const holds = (i: number, op: Op, limit: number) =>
  op === "<" ? i < limit : op === "<=" ? i <= limit : op === ">" ? i > limit : i >= limit;

export function ForLoop() {
  const [start, setStart] = useState(0);
  const [op, setOp] = useState<Op>("<");
  const [limit, setLimit] = useState(5);
  const [up, setUp] = useState(true);

  // Si la condición se cumple al inicio y el paso va "alejándose" del límite, nunca termina.
  const infinite = holds(start, op, limit) && ((up && (op === ">" || op === ">=")) || (!up && (op === "<" || op === "<=")));
  const values: number[] = [];
  if (!infinite) for (let i = start; holds(i, op, limit) && values.length < 1000; i += up ? 1 : -1) values.push(i);

  const numberInput = (value: number, onChange: (v: number) => void, label: string) => (
    <input
      type="number"
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Math.max(-999, Math.min(999, Math.trunc(Number(e.target.value)) || 0)))}
      className="w-14 rounded border border-[rgb(var(--tone,255_255_255)/0.6)] bg-black px-1 text-center text-[rgb(var(--tone,255_255_255))]"
    />
  );

  return (
    <WidgetCard icon={Repeat} title="Arma tu bucle for">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Choice
            key={p.label}
            selected={start === p.start && op === p.op && limit === p.limit && up === p.up}
            onClick={() => {
              setStart(p.start);
              setOp(p.op);
              setLimit(p.limit);
              setUp(p.up);
            }}
          >
            {p.label}
          </Choice>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono text-[13px] text-white/85">
        <span className="whitespace-nowrap">
          for (int i = {numberInput(start, setStart, "Valor inicial")};{" "}
          i{" "}
          <select
            value={op}
            aria-label="Comparador"
            onChange={(e) => setOp(e.target.value as Op)}
            className="rounded border border-[rgb(var(--tone,255_255_255)/0.6)] bg-black text-[rgb(var(--tone,255_255_255))]"
          >
            {["<", "<=", ">", ">="].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>{" "}
          {numberInput(limit, setLimit, "Límite")};{" "}
          <button type="button" onClick={() => setUp(!up)} className="rounded border border-[rgb(var(--tone,255_255_255)/0.6)] px-1 text-[rgb(var(--tone,255_255_255))]">
            i{up ? "++" : "--"}
          </button>
          ) {"{ … }"}
        </span>
      </div>

      <div className="mt-4">
        {infinite ? (
          <Feedback tone="error">
            ⚠️ <strong>Nunca termina:</strong> la condición se cumple al empezar y cada vuelta {up ? "suma" : "resta"} 1, así que
            siempre se seguirá cumpliendo. El robot se quedaría atrapado aquí.
          </Feedback>
        ) : values.length === 0 ? (
          <Feedback tone="info">La condición no se cumple ni al empezar: el bloque se repite 0 veces.</Feedback>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-white/70">
              Se repite <strong className="text-[rgb(var(--tone,255_255_255))]">{values.length} veces</strong>. Valores de i:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {values.slice(0, MAX_SHOWN).map((v, index) => (
                <span key={index} className="rounded-md bg-white/[0.07] px-2 py-1 font-mono text-xs">
                  {v}
                </span>
              ))}
              {values.length > MAX_SHOWN && (
                <span className="px-2 py-1 font-mono text-xs text-white/50">
                  … {values[values.length - 1]}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
