import { useEffect, useRef, useState } from "react";
import { FlaskConical } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const SAMPLES = 48;
const SAMPLE_MS = 80;

type Mode = "mientras" | "pulsacion";

function SignalChart({ samples }: { samples: number[] }) {
  const step = 240 / (SAMPLES - 1);
  const points = samples.map((v, i) => `${i * step},${v ? 8 : 52}`).join(" ");
  return (
    <svg viewBox="0 0 270 60" className="h-16 w-full" role="img" aria-label="Lo que lee el pin a lo largo del tiempo">
      <text x="244" y="12" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="inherit">HIGH</text>
      <text x="244" y="55" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="inherit">LOW</text>
      <line x1="0" y1="8" x2="240" y2="8" stroke="rgba(255,255,255,0.08)" />
      <line x1="0" y1="52" x2="240" y2="52" stroke="rgba(255,255,255,0.08)" />
      <polyline points={points} fill="none" stroke="rgb(var(--tone, 255 255 255))" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function ButtonLab() {
  const [pressed, setPressed] = useState(false);
  const [pullDown, setPullDown] = useState(true);
  const [mode, setMode] = useState<Mode>("mientras");
  const [debounce, setDebounce] = useState(true);
  const [samples, setSamples] = useState<number[]>(() => Array(SAMPLES).fill(0));
  const [ledToggled, setLedToggled] = useState(false);
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const pressedRef = useRef(pressed);
  pressedRef.current = pressed;

  // Lo que lee digitalRead: presionado = HIGH; suelto = LOW con pull-down, o al azar si el pin queda flotante.
  const read = () => (pressedRef.current ? 1 : pullDown ? 0 : Math.random() < 0.5 ? 1 : 0);
  const current = samples[samples.length - 1];

  useEffect(() => {
    const timer = setInterval(() => setSamples((s) => [...s.slice(1), read()]), SAMPLE_MS);
    return () => clearInterval(timer);
    // read solo depende de pullDown y de la ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullDown]);

  const press = () => {
    setPressed(true);
    pressedRef.current = true;
    if (mode !== "pulsacion") return;
    // Sin antirrebote, los contactos "rebotan" y el ESP32 cuenta varias pulsaciones.
    const counted = debounce ? 1 : 2 + Math.floor(Math.random() * 3);
    setCount((n) => n + counted);
    setLedToggled((on) => (counted % 2 === 1 ? !on : on));
    setLog((lines) => {
      const added = Array.from({ length: counted }, (_, i) => `Pulsaciones: ${count + i + 1}`);
      return [...lines, ...added].slice(-5);
    });
  };

  const release = () => {
    setPressed(false);
    pressedRef.current = false;
  };

  const ledOn = mode === "mientras" ? current === 1 : ledToggled;

  return (
    <WidgetCard icon={FlaskConical} label="Laboratorio" title="El botón por dentro">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-28 text-xs text-white/50">Resistencia pull-down</span>
          <Choice selected={pullDown} onClick={() => setPullDown(true)}>Con 10 kΩ</Choice>
          <Choice selected={!pullDown} onClick={() => setPullDown(false)}>Sin resistencia</Choice>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-28 text-xs text-white/50">El programa</span>
          <Choice selected={mode === "mientras"} onClick={() => setMode("mientras")}>Mientras está presionado</Choice>
          <Choice selected={mode === "pulsacion"} onClick={() => setMode("pulsacion")}>Cada pulsación</Choice>
        </div>
        {mode === "pulsacion" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-28 text-xs text-white/50">Antirrebote</span>
            <Choice selected={debounce} onClick={() => setDebounce(true)}>Con delay(50)</Choice>
            <Choice selected={!debounce} onClick={() => setDebounce(false)}>Sin antirrebote</Choice>
          </div>
        )}
      </div>

      <div className="mt-5 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onPointerDown={press}
            onPointerUp={release}
            onPointerLeave={() => pressed && release()}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && press()}
            onKeyUp={(e) => (e.key === " " || e.key === "Enter") && release()}
            aria-pressed={pressed}
            className="flex h-24 w-24 touch-none select-none items-center justify-center rounded-2xl border-2 border-white/30 bg-white/[0.05]"
          >
            <span
              className={`h-14 w-14 rounded-full transition-transform ${pressed ? "scale-90 bg-[rgb(var(--tone,255_255_255))]" : "bg-white/70"}`}
            />
            <span className="sr-only">Botón: mantén presionado</span>
          </button>
          <svg viewBox="0 0 60 80" className="h-20 w-14" aria-label={ledOn ? "LED encendido" : "LED apagado"}>
            {ledOn && <circle cx="30" cy="28" r="24" fill="#4ade80" opacity="0.45" style={{ filter: "blur(8px)" }} />}
            <path d="M18 44 V26 a12 12 0 0 1 24 0 V44 Z" fill="#4ade80" opacity={ledOn ? 1 : 0.2} />
            <rect x="16" y="44" width="28" height="4" rx="1" fill="#4ade80" opacity="0.5" />
            <line x1="25" y1="48" x2="25" y2="78" stroke="#a3a3a3" strokeWidth="2" />
            <line x1="35" y1="48" x2="35" y2="70" stroke="#a3a3a3" strokeWidth="2" />
          </svg>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3">
          <p className="flex justify-between text-xs text-white/50">
            digitalRead(21) <span className="font-semibold text-white">{current ? "HIGH" : "LOW"}</span>
          </p>
          <SignalChart samples={samples} />
          {mode === "pulsacion" && (
            <div className="mt-2 rounded-md bg-black px-3 py-2 font-mono text-xs text-emerald-300">
              {log.length === 0 ? <span className="text-white/30">Monitor Serial…</span> : log.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {!pullDown ? (
          <Feedback tone="error">
            Sin la resistencia, el pin queda <strong>flotante</strong>: aunque nadie toque el botón, lee HIGH y LOW al azar
            {mode === "mientras" ? " y el LED parpadea solo." : "."}
          </Feedback>
        ) : mode === "pulsacion" && !debounce ? (
          <Feedback tone="error">
            Presiona una sola vez y mira el contador: sin antirrebote, cada pulsación cuenta como varias y el LED puede terminar
            al revés.
          </Feedback>
        ) : (
          <Feedback tone="info">
            Mantén presionado el botón y mira la señal. Después prueba quitar la resistencia o el antirrebote para ver qué falla.
          </Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
