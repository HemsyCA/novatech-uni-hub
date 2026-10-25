import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Lightbulb, ListOrdered, Play, RotateCcw, X } from "lucide-react";
import { Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const SOLUTION = [
  "Encender verde",
  "Esperar 3 s",
  "Apagar verde",
  "Encender amarillo",
  "Esperar 1 s",
  "Apagar amarillo",
  "Encender rojo",
  "Esperar 3 s",
  "Apagar rojo",
];

// Orden mezclado fijo, para que todos vean el mismo reto.
const SHUFFLED = [6, 1, 3, 8, 0, 4, 7, 2, 5];

type Lamp = "rojo" | "amarillo" | "verde";
const LAMPS: { id: Lamp; color: string }[] = [
  { id: "rojo", color: "#f87171" },
  { id: "amarillo", color: "#facc15" },
  { id: "verde", color: "#4ade80" },
];

function TrafficLight({ on, size = "md" }: { on: Set<Lamp>; size?: "sm" | "md" }) {
  const d = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  return (
    <div
      className="inline-flex flex-col gap-1.5 rounded-xl border border-white/20 bg-[#111] p-2"
      aria-label={`Luces encendidas: ${[...on].join(", ") || "ninguna"}`}
    >
      {LAMPS.map((lamp) => (
        <span
          key={lamp.id}
          className={`${d} rounded-full transition-all duration-200`}
          style={{
            background: lamp.color,
            opacity: on.has(lamp.id) ? 1 : 0.15,
            boxShadow: on.has(lamp.id) ? `0 0 14px ${lamp.color}` : "none",
          }}
        />
      ))}
    </div>
  );
}

// El semáforo que se quiere programar, funcionando en bucle: así el reto se entiende antes de empezar.
function DemoLight() {
  const reduceMotion = useReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setT((v) => (v + 1) % 7), 1000);
    return () => window.clearInterval(id);
  }, [reduceMotion]);
  // 3 s verde, 1 s amarillo, 3 s rojo
  const lamp: Lamp = t < 3 ? "verde" : t < 4 ? "amarillo" : "rojo";
  const left = lamp === "verde" ? 3 - t : lamp === "amarillo" ? 1 : 7 - t;
  return (
    <div className="flex flex-col items-center gap-2">
      <TrafficLight on={new Set([lamp])} />
      {!reduceMotion && (
        <p className="text-xs text-white/50">
          {lamp} · {left} s
        </p>
      )}
    </div>
  );
}

function TrafficFlowchart() {
  const boxH = 24;
  const gap = 12;
  const top = 44;
  const yOf = (i: number) => top + i * (boxH + gap);
  const bottom = yOf(SOLUTION.length - 1) + boxH;
  const lampColor = (text: string) =>
    text.includes("verde") ? "#4ade80" : text.includes("amarillo") ? "#facc15" : text.includes("rojo") ? "#f87171" : "#a3a3a3";

  return (
    <svg
      viewBox={`0 0 260 ${bottom + 20}`}
      className="mx-auto h-auto w-full max-w-[260px]"
      role="img"
      aria-label="Diagrama de flujo del semáforo: después de apagar el rojo vuelve a encender el verde"
    >
      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="white" />
        </marker>
      </defs>
      <ellipse cx="120" cy="14" rx="40" ry="12" fill="none" stroke="white" strokeWidth="1.5" />
      <text x="120" y="18" textAnchor="middle" fill="white" fontSize="11" fontFamily="inherit">
        Inicio
      </text>
      <line x1="120" y1="26" x2="120" y2={top - 2} stroke="white" markerEnd="url(#flow-arrow)" />
      {SOLUTION.map((text, i) => (
        <g key={`${text}-${i}`}>
          <rect
            x="50"
            y={yOf(i)}
            width="140"
            height={boxH}
            rx="4"
            fill="rgba(255,255,255,0.04)"
            stroke={lampColor(text)}
            strokeWidth="1.5"
          />
          <text x="120" y={yOf(i) + 16} textAnchor="middle" fill="white" fontSize="11" fontFamily="inherit">
            {text}
          </text>
          {i < SOLUTION.length - 1 && (
            <line x1="120" y1={yOf(i) + boxH} x2="120" y2={yOf(i + 1) - 2} stroke="white" markerEnd="url(#flow-arrow)" />
          )}
        </g>
      ))}
      {/* La flecha que vuelve al principio: el programa nunca termina. */}
      <path
        d={`M190 ${bottom - boxH / 2} H225 V${top + boxH / 2} H194`}
        fill="none"
        stroke="rgb(var(--tone, 255 255 255))"
        strokeWidth="2"
        markerEnd="url(#flow-arrow)"
      />
      <text
        x="232"
        y={(top + bottom) / 2}
        fill="rgb(var(--tone, 255 255 255))"
        fontSize="10"
        fontFamily="inherit"
        transform={`rotate(90 232 ${(top + bottom) / 2})`}
        textAnchor="middle"
      >
        se repite para siempre
      </text>
    </svg>
  );
}

// Qué le pasa al semáforo después de cada instrucción del algoritmo de la persona.
const lampOf = (text: string): Lamp | null =>
  text.includes("verde") ? "verde" : text.includes("amarillo") ? "amarillo" : text.includes("rojo") ? "rojo" : null;
const statesFor = (order: number[]) => {
  const on = new Set<Lamp>();
  return order.map((index) => {
    const text = SOLUTION[index];
    const lamp = lampOf(text);
    if (lamp && text.startsWith("Encender")) on.add(lamp);
    if (lamp && text.startsWith("Apagar")) on.delete(lamp);
    return new Set(on);
  });
};

// Explica el primer error con lo que se vería en el semáforo.
const explain = (order: number[]) => {
  const states = statesFor(order);
  for (let i = 0; i < order.length; i++) {
    if (SOLUTION[order[i]] === SOLUTION[i]) continue;
    const text = SOLUTION[order[i]];
    const before = states[i - 1] ?? new Set<Lamp>();
    if (text.startsWith("Encender") && before.size > 0)
      return `En el paso ${i + 1} quedan dos luces encendidas a la vez. Antes de encender otra, apaga la que estaba prendida.`;
    if (text.startsWith("Esperar") && before.size === 0) return `En el paso ${i + 1} el semáforo espera con todas las luces apagadas.`;
    if (text.startsWith("Apagar") && !before.has(lampOf(text)!))
      return `En el paso ${i + 1} intentas apagar una luz que no estaba encendida.`;
    return `El paso ${i + 1} no va ahí. Revisa el orden de los colores (verde → amarillo → rojo) y cuánto dura cada uno.`;
  }
  return null;
};

export function AlgorithmOrder() {
  const [placed, setPlaced] = useState<number[]>([]);
  const [running, setRunning] = useState<number | null>(null);
  const [result, setResult] = useState<"ok" | "error" | null>(null);
  const [hint, setHint] = useState(false);
  const timer = useRef<number>();

  const available = SHUFFLED.filter((index) => !placed.includes(index));
  const complete = placed.length === SOLUTION.length;
  const states = statesFor(placed);
  const shown = running !== null ? states[running] : new Set<Lamp>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reset = () => {
    window.clearTimeout(timer.current);
    setPlaced([]);
    setRunning(null);
    setResult(null);
  };

  // Ejecuta el algoritmo de la persona en el semáforo, una instrucción a la vez.
  const run = () => {
    setResult(null);
    const step = (i: number) => {
      setRunning(i);
      if (i < placed.length - 1)
        timer.current = window.setTimeout(() => step(i + 1), SOLUTION[placed[i]].startsWith("Esperar") ? 900 : 600);
      else
        timer.current = window.setTimeout(() => {
          setRunning(null);
          setResult(explain(placed) ? "error" : "ok");
        }, 700);
    };
    step(0);
  };

  const edit = (next: number[]) => {
    window.clearTimeout(timer.current);
    setRunning(null);
    setResult(null);
    setPlaced(next);
  };

  return (
    <WidgetCard icon={ListOrdered} title="Programa el semáforo">
      {result === "ok" ? (
        <div className="space-y-4">
          <Feedback tone="ok">
            ¡Exacto! Tu semáforo funciona. Así se ve como diagrama de flujo. Fíjate en la flecha de la derecha: después de apagar el rojo,
            vuelve a encender el verde. Los programas de robots nunca terminan.
          </Feedback>
          <TrafficFlowchart />
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 text-sm text-white/60 underline underline-offset-4 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" /> Hacerlo de nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. Qué tiene que hacer el semáforo */}
          <div className="flex gap-4 rounded-xl bg-white/[0.04] p-4">
            <DemoLight />
            <div className="min-w-0 text-sm text-white/75">
              <p className="font-semibold text-white">Así debe funcionar el semáforo:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  La luz <span className="font-semibold text-emerald-300">verde</span> se enciende{" "}
                  <strong className="text-white">3 segundos</strong>.
                </li>
                <li>
                  Luego la <span className="font-semibold text-yellow-300">amarilla</span>,{" "}
                  <strong className="text-white">1 segundo</strong>.
                </li>
                <li>
                  Luego la <span className="font-semibold text-rose-300">roja</span>, <strong className="text-white">3 segundos</strong>.
                </li>
              </ol>
              <p className="mt-2">
                Solo puede haber <strong className="text-white">una luz encendida a la vez</strong>: antes de encender la siguiente, hay que
                apagar la anterior.
              </p>
            </div>
          </div>

          {/* 2. La tarea */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-white/80">
                <strong className="text-white">Tu tarea:</strong> toca las 9 instrucciones de abajo en el orden en que el ESP32 debe
                hacerlas.
              </p>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">{placed.length}/9</span>
            </div>
            {!hint ? (
              <button
                type="button"
                onClick={() => setHint(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50 underline underline-offset-4 hover:text-white"
              >
                <Lightbulb className="h-3.5 w-3.5" /> Ver una pista
              </button>
            ) : (
              <p className="mt-2 rounded-lg bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                <strong>Pista:</strong> cada color sigue el mismo patrón de 3 pasos: <strong>Encender → Esperar → Apagar</strong>. Hazlo con
                el verde, luego con el amarillo y luego con el rojo.
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <ol className="min-h-[3rem] flex-1 space-y-1.5 rounded-xl border border-dashed border-white/20 p-2">
              {placed.length === 0 && <li className="px-2 py-2 text-sm text-white/35">Tu algoritmo aparecerá aquí, en orden…</li>}
              {placed.map((index, position) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => edit(placed.filter((i) => i !== index))}
                    disabled={running !== null}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      running === position
                        ? "bg-[rgb(var(--tone,255_255_255)/0.25)] text-white ring-1 ring-[rgb(var(--tone,255_255_255))]"
                        : "bg-white/[0.06] text-white"
                    }`}
                  >
                    <span className="w-5 text-xs text-white/40">{position + 1}.</span>
                    <span className="flex-1">{SOLUTION[index]}</span>
                    <X className="h-3.5 w-3.5 text-white/40" aria-label="Quitar" />
                  </button>
                </li>
              ))}
            </ol>
            {/* El semáforo de la persona: se enciende al probar su algoritmo */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <TrafficLight on={shown} size="sm" />
              <span className="text-[10px] text-white/40">el tuyo</span>
            </div>
          </div>

          {available.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {available.map((index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => edit([...placed, index])}
                  className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/85 transition-colors hover:border-[rgb(var(--tone,255_255_255))]"
                >
                  {SOLUTION[index]}
                </button>
              ))}
            </div>
          )}

          {complete && running === null && result === null && (
            <button
              type="button"
              onClick={run}
              className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--tone,255_255_255))] px-5 py-2.5 text-sm font-semibold text-black"
            >
              <Play className="h-4 w-4" /> Probar en el semáforo
            </button>
          )}
          {result === "error" && (
            <Feedback tone="error">{explain(placed)} Toca una instrucción de tu lista para quitarla y vuelve a probar.</Feedback>
          )}
          {placed.length > 0 && (
            <button type="button" onClick={reset} className="block text-xs text-white/40 underline underline-offset-4 hover:text-white">
              Empezar de nuevo
            </button>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
