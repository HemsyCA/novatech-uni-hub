import { useState } from "react";
import { ListOrdered, RotateCcw, X } from "lucide-react";
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

function TrafficFlowchart() {
  const boxH = 24;
  const gap = 12;
  const top = 44;
  const yOf = (i: number) => top + i * (boxH + gap);
  const bottom = yOf(SOLUTION.length - 1) + boxH;
  const lampColor = (text: string) =>
    text.includes("verde") ? "#4ade80" : text.includes("amarillo") ? "#facc15" : text.includes("rojo") ? "#f87171" : "#a3a3a3";

  return (
    <svg viewBox={`0 0 260 ${bottom + 20}`} className="mx-auto h-auto w-full max-w-[260px]" role="img" aria-label="Diagrama de flujo del semáforo: después de apagar el rojo vuelve a encender el verde">
      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="white" />
        </marker>
      </defs>
      <ellipse cx="120" cy="14" rx="40" ry="12" fill="none" stroke="white" strokeWidth="1.5" />
      <text x="120" y="18" textAnchor="middle" fill="white" fontSize="11" fontFamily="inherit">Inicio</text>
      <line x1="120" y1="26" x2="120" y2={top - 2} stroke="white" markerEnd="url(#flow-arrow)" />
      {SOLUTION.map((text, i) => (
        <g key={`${text}-${i}`}>
          <rect x="50" y={yOf(i)} width="140" height={boxH} rx="4" fill="rgba(255,255,255,0.04)" stroke={lampColor(text)} strokeWidth="1.5" />
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
      <text x="232" y={(top + bottom) / 2} fill="rgb(var(--tone, 255 255 255))" fontSize="10" fontFamily="inherit" transform={`rotate(90 232 ${(top + bottom) / 2})`} textAnchor="middle">
        se repite para siempre
      </text>
    </svg>
  );
}

export function AlgorithmOrder() {
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const available = SHUFFLED.filter((index) => !placed.includes(index));
  const firstWrong = placed.findIndex((index, position) => SOLUTION[index] !== SOLUTION[position]);
  const complete = placed.length === SOLUTION.length;
  const solved = complete && firstWrong === -1;

  const reset = () => {
    setPlaced([]);
    setChecked(false);
  };

  return (
    <WidgetCard icon={ListOrdered} title="Ordena el algoritmo del semáforo">
      {solved && checked ? (
        <div className="space-y-4">
          <Feedback tone="ok">
            ¡Exacto! Así se ve como diagrama de flujo. Fíjate en la flecha de la derecha: después de apagar el rojo, vuelve a
            encender el verde. Los programas de robots nunca terminan.
          </Feedback>
          <TrafficFlowchart />
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-sm text-white/60 underline underline-offset-4 hover:text-white">
            <RotateCcw className="h-4 w-4" /> Hacerlo de nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-white/60">Toca las instrucciones en el orden en que el ESP32 debe hacerlas. El semáforo empieza en verde.</p>

          <ol className="min-h-[3rem] space-y-1.5 rounded-xl border border-dashed border-white/20 p-2">
            {placed.length === 0 && <li className="px-2 py-2 text-sm text-white/35">Tu algoritmo aparecerá aquí…</li>}
            {placed.map((index, position) => {
              const wrong = checked && position === firstWrong;
              return (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaced((current) => current.filter((i) => i !== index));
                      setChecked(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                      wrong ? "bg-rose-400/15 text-rose-100 ring-1 ring-rose-400" : "bg-white/[0.06] text-white"
                    }`}
                  >
                    <span className="w-5 text-xs text-white/40">{position + 1}.</span>
                    <span className="flex-1">{SOLUTION[index]}</span>
                    <X className="h-3.5 w-3.5 text-white/40" aria-label="Quitar" />
                  </button>
                </li>
              );
            })}
          </ol>

          {available.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {available.map((index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPlaced((current) => [...current, index])}
                  className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/85 transition-colors hover:border-[rgb(var(--tone,255_255_255))]"
                >
                  {SOLUTION[index]}
                </button>
              ))}
            </div>
          )}

          {complete && !checked && (
            <button
              type="button"
              onClick={() => setChecked(true)}
              className="rounded-xl bg-[rgb(var(--tone,255_255_255))] px-5 py-2.5 text-sm font-semibold text-black"
            >
              Comprobar
            </button>
          )}
          {checked && !solved && (
            <Feedback tone="error">
              El paso {firstWrong + 1} no va ahí. Piensa: ¿qué tiene que pasar justo después de "{SOLUTION[placed[firstWrong - 1]] ?? "Inicio"}"? Toca
              una instrucción de tu lista para quitarla.
            </Feedback>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
