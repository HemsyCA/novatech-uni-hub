import { Link } from "react-router-dom";
import { Check, Flag, Lock } from "lucide-react";
import type { GuideStop } from "@/content/academia/guia-ruta";
import { GOAL_HREF, stopHref } from "@/lib/academia/guide-progress";

// El mapa de la Ruta de bienvenida: un camino que serpentea de parada en parada,
// como el mapa de niveles de un videojuego. Blanco y negro; el morado de Nova marca
// solo dónde estás.

export type StopState = "done" | "current" | "locked" | "open";

const STEP = 100; // separación vertical entre paradas (px)
const PAD = 52;
const WAVE = [50, 76, 50, 24]; // posición horizontal (%) que se repite: la "serpiente"

const xAt = (index: number) => WAVE[index % WAVE.length];
const yAt = (index: number) => PAD + index * STEP;
// La etiqueta va del lado por el que no pasa el camino, y ocupa el espacio libre hasta el borde del mapa.
const labelLeft = (index: number) => index % WAVE.length < 2;
const labelClass = (index: number) =>
  `absolute top-1/2 -translate-y-1/2 ${
    xAt(index) === 50 ? "w-[min(9rem,calc(50cqw-3rem))]" : "w-[min(11rem,calc(76cqw-3rem))]"
  } ${labelLeft(index) ? "right-[calc(100%+0.875rem)] text-right" : "left-[calc(100%+0.875rem)]"}`;

const segment = (from: number) => {
  const x1 = xAt(from);
  const y1 = yAt(from);
  const x2 = xAt(from + 1);
  const y2 = yAt(from + 1);
  return `M ${x1} ${y1} C ${x1} ${y1 + STEP / 2} ${x2} ${y2 - STEP / 2} ${x2} ${y2}`;
};


function NodeIcon({ stop, state }: { stop: GuideStop; state: StopState }) {
  const Icon = stop.icon;
  if (state === "done") return <Check className="h-6 w-6" strokeWidth={3} />;
  if (state === "locked") return <Lock className="h-5 w-5" />;
  return <Icon className="h-6 w-6" />;
}

const nodeClass: Record<StopState, string> = {
  done: "border-white bg-white text-black",
  current: "border-nova bg-nova text-white shadow-[0_0_0_6px_hsl(var(--nova)/0.2)]",
  open: "border-white/60 bg-black text-white",
  locked: "border-white/10 bg-[#0d0d0d] text-white/25",
};

export function SnakeMap({
  stops,
  stateOf,
  selected,
  goalOpen,
  goalSelected,
}: {
  stops: GuideStop[];
  stateOf: (index: number) => StopState;
  selected: number | null;
  goalOpen: boolean;
  goalSelected: boolean;
}) {
  const goal = stops.length; // la meta es el último punto del camino
  const height = yAt(goal) + PAD;

  return (
    <div className="relative [container-type:inline-size]" style={{ height }}>
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {Array.from({ length: goal }, (_, index) => {
          const walked = stateOf(index) === "done";
          return (
            <path
              key={index}
              d={segment(index)}
              fill="none"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              className={walked ? "stroke-white/70" : "stroke-white/15"}
              strokeWidth={walked ? 4 : 3}
              strokeDasharray={walked ? undefined : "2 10"}
            />
          );
        })}
      </svg>

      <ol>
        {stops.map((stop, index) => {
          const state = stateOf(index);
          const isSelected = selected === index;
          const node = (
            <span
              className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-transform ${nodeClass[state]} ${
                isSelected ? "ring-2 ring-white ring-offset-4 ring-offset-black" : ""
              } ${state !== "locked" ? "group-hover:scale-105" : ""}`}
            >
              {state === "current" && (
                <span className="absolute inset-0 animate-ping rounded-full bg-nova/30 motion-reduce:animate-none" />
              )}
              <span className="relative">
                <NodeIcon stop={stop} state={state} />
              </span>
              <span
                className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                  state === "locked" ? "border-white/10 bg-black text-white/30" : "border-black bg-white text-black"
                }`}
              >
                {index + 1}
              </span>
            </span>
          );
          const label = (
            <span className={labelClass(index)}>
              {state === "current" && (
                <span className="mb-1 inline-block rounded-full bg-nova px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Estás aquí
                </span>
              )}
              <span className={`block text-sm font-semibold leading-tight ${state === "locked" ? "text-white/35" : "text-white"}`}>
                {stop.label}
              </span>
              <span className="block text-[11px] text-white/40">
                Parada {index + 1} · {stop.minutes} min
              </span>
            </span>
          );

          return (
            <li
              key={stop.title}
              data-stop={index}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${xAt(index)}%`, top: yAt(index) }}
            >
              {state === "locked" ? (
                <span className="relative block" title="Se abre al terminar la parada anterior">
                  {node}
                  {label}
                </span>
              ) : (
                <Link
                  to={stopHref(index)}
                  aria-current={isSelected ? "step" : undefined}
                  aria-label={`Parada ${index + 1}: ${stop.label}${state === "done" ? " (completada)" : ""}`}
                  className="group relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {node}
                  {label}
                </Link>
              )}
            </li>
          );
        })}

        <li data-stop="meta" className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${xAt(goal)}%`, top: yAt(goal) }}>
          {(() => {
            const flag = (
              <span
                className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${
                  goalOpen ? "border-white bg-white text-black" : "border-dashed border-white/20 bg-black text-white/30"
                } ${goalSelected ? "ring-2 ring-white ring-offset-4 ring-offset-black" : ""}`}
              >
                <Flag className="h-7 w-7" />
              </span>
            );
            const label = (
              <span className={labelClass(goal)}>
                <span className={`block text-sm font-semibold ${goalOpen ? "text-white" : "text-white/35"}`}>Meta</span>
                <span className="block text-[11px] text-white/40">Tu primera lección</span>
              </span>
            );
            return goalOpen ? (
              <Link to={GOAL_HREF} aria-label="Meta: tu primera lección" className="relative block rounded-2xl">
                {flag}
                {label}
              </Link>
            ) : (
              <span className="relative block" title="Completa las paradas para llegar a la meta">
                {flag}
                {label}
              </span>
            );
          })()}
        </li>
      </ol>
    </div>
  );
}

// Las paradas en una línea: para saber dónde estás mientras lees.
export function StopsBar({ stops, stateOf, selected }: { stops: GuideStop[]; stateOf: (index: number) => StopState; selected: number }) {
  return (
    <div className="flex gap-1" aria-hidden>
      {stops.map((stop, index) => {
        const state = stateOf(index);
        return (
          <span
            key={stop.title}
            className={`h-1.5 flex-1 rounded-full ${
              index === selected ? "bg-nova" : state === "done" ? "bg-white/70" : "bg-white/10"
            }`}
          />
        );
      })}
    </div>
  );
}
