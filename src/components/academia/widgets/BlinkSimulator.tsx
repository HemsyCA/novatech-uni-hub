import { useEffect, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, StepForward, Zap } from "lucide-react";
import { WidgetCard } from "@/components/academia/widgets/WidgetCard";

// Líneas del sketch de P2. "setup" se ejecuta una vez y "loop" se repite.
const SETUP = [3];
const LOOP = [7, 8, 9, 10];
const VISUAL_LINE_MS = 350;

type Delays = [number, number];

const clampDelay = (value: number) => Math.min(Math.max(Math.round(value) || 0, 50), 3000);

function DelayInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      type="number"
      min={50}
      max={3000}
      step={50}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))}
      onBlur={(e) => onChange(clampDelay(Number(e.target.value)))}
      className="w-16 rounded border border-[rgb(var(--tone,255_255_255)/0.6)] bg-black px-1 text-center text-[rgb(var(--tone,255_255_255))]"
    />
  );
}

export function BlinkSimulator() {
  const [delays, setDelays] = useState<Delays>([1000, 1000]);
  const [step, setStep] = useState(-1); // -1: aún no empieza; 0: setup; 1…: líneas del loop
  const [running, setRunning] = useState(false);
  const [ledOn, setLedOn] = useState(false);
  const [laps, setLaps] = useState(0);

  const currentLine = step < 0 ? null : step < SETUP.length ? SETUP[step] : LOOP[(step - SETUP.length) % LOOP.length];

  const advance = () => {
    const next = step + 1;
    const line = next < SETUP.length ? SETUP[next] : LOOP[(next - SETUP.length) % LOOP.length];
    if (line === 7) setLedOn(true);
    if (line === 9) setLedOn(false);
    if (line === 7) setLaps((n) => n + 1);
    setStep(next);
  };

  useEffect(() => {
    if (!running) return;
    const wait = currentLine === 8 ? clampDelay(delays[0]) : currentLine === 10 ? clampDelay(delays[1]) : VISUAL_LINE_MS;
    const timer = setTimeout(advance, step < 0 ? 0 : wait);
    return () => clearTimeout(timer);
    // advance depende de step, que ya está en la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, step, delays]);

  const reset = () => {
    setRunning(false);
    setStep(-1);
    setLedOn(false);
    setLaps(0);
  };

  const setDelay = (index: 0 | 1) => (value: number) => setDelays((current) => (index === 0 ? [value, current[1]] : [current[0], value]));

  const lines: ReactNode[] = [
    <><span className="text-white/40">const int</span> LED_VERDE = 18;</>,
    "",
    <><span className="text-sky-300">void</span> setup() {"{"}</>,
    <>  pinMode(LED_VERDE, OUTPUT);</>,
    "}",
    "",
    <><span className="text-sky-300">void</span> loop() {"{"}</>,
    <>  digitalWrite(LED_VERDE, HIGH);</>,
    <>  delay(<DelayInput value={delays[0]} onChange={setDelay(0)} label="Primer delay en milisegundos" />);</>,
    <>  digitalWrite(LED_VERDE, LOW);</>,
    <>  delay(<DelayInput value={delays[1]} onChange={setDelay(1)} label="Segundo delay en milisegundos" />);</>,
    "}",
  ];

  return (
    <WidgetCard icon={Zap} label="Mira cómo se ejecuta" title="El ESP32 leyendo tu programa">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] py-3 text-[12px] leading-6">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`flex whitespace-pre px-3 transition-colors ${
                currentLine === index ? "bg-[rgb(var(--tone,255_255_255)/0.2)]" : ""
              }`}
            >
              <span className="mr-3 w-4 shrink-0 select-none text-right text-white/25">{index + 1}</span>
              <span className={currentLine === index ? "text-white" : "text-white/75"}>{line}</span>
            </div>
          ))}
        </pre>

        <div className="flex flex-row items-center justify-around gap-4 rounded-xl bg-white/[0.03] p-4 sm:flex-col sm:justify-center">
          <svg viewBox="0 0 60 80" className="h-20 w-16" aria-label={ledOn ? "LED encendido" : "LED apagado"}>
            {ledOn && <circle cx="30" cy="28" r="24" fill="#4ade80" opacity="0.45" style={{ filter: "blur(8px)" }} />}
            <path d="M18 44 V26 a12 12 0 0 1 24 0 V44 Z" fill="#4ade80" opacity={ledOn ? 1 : 0.2} />
            <rect x="16" y="44" width="28" height="4" rx="1" fill="#4ade80" opacity="0.5" />
            <line x1="25" y1="48" x2="25" y2="78" stroke="#a3a3a3" strokeWidth="2" />
            <line x1="35" y1="48" x2="35" y2="70" stroke="#a3a3a3" strokeWidth="2" />
          </svg>
          <dl className="space-y-1 text-xs">
            <div>
              <dt className="inline text-white/50">GPIO 18: </dt>
              <dd className="inline font-semibold">{ledOn ? "3.3 V (HIGH)" : "0 V (LOW)"}</dd>
            </div>
            <div>
              <dt className="inline text-white/50">setup(): </dt>
              <dd className="inline font-semibold">{step >= 0 ? "1 vez" : "—"}</dd>
            </div>
            <div>
              <dt className="inline text-white/50">loop(): </dt>
              <dd className="inline font-semibold">vuelta {laps}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--tone,255_255_255))] px-4 py-2.5 text-sm font-semibold text-black"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pausar" : step < 0 ? "Ejecutar" : "Continuar"}
        </button>
        <button
          type="button"
          onClick={advance}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm hover:bg-white/10 disabled:opacity-30"
        >
          <StepForward className="h-4 w-4" /> Una línea
        </button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:text-white">
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
      </div>
      <p className="mt-3 text-xs text-white/45">
        Cambia los números de los <code>delay</code> (por ejemplo, a 200) y vuelve a ejecutar. En el ESP32 real, las líneas sin
        delay tardan millonésimas de segundo: aquí van más lento para que veas el orden.
      </p>
    </WidgetCard>
  );
}
