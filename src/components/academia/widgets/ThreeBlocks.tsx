import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowDown, Repeat } from "lucide-react";

// P1 · Los 3 bloques de todo programa: secuencia, decisión y repetición, cada uno con su ejemplo animado.
// No es para tocar: el reloj avanza solo y cada tarjeta muestra lo que hace su bloque con un LED.

const TONE = "rgb(var(--tone, 255 255 255))";

function useTick(ms: number) {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms, reduceMotion]);
  return { tick, still: Boolean(reduceMotion) };
}

function Led({ on, color = "#f87171" }: { on: boolean; color?: string }) {
  return (
    <svg viewBox="0 0 40 52" className="h-12 w-9 shrink-0" aria-label={on ? "LED encendido" : "LED apagado"}>
      {on && <circle cx="20" cy="18" r="17" fill={color} opacity="0.3" style={{ filter: "blur(4px)" }} />}
      <path d="M11 30 V18 a9 9 0 0 1 18 0 V30 Z" fill={color} opacity={on ? 1 : 0.2} style={{ transition: "opacity 0.2s" }} />
      <rect x="9" y="30" width="22" height="3" rx="1" fill={color} opacity="0.5" />
      <line x1="16" y1="33" x2="16" y2="50" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="24" y1="33" x2="24" y2="46" stroke="#a3a3a3" strokeWidth="2" />
    </svg>
  );
}

function Step({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span
      className={`block rounded-lg border px-3 py-1.5 text-center text-sm transition-colors duration-300 ${
        active ? "border-[rgb(var(--tone,255_255_255))] bg-[rgb(var(--tone,255_255_255)/0.15)] text-white" : "border-white/15 text-white/50"
      }`}
    >
      {children}
    </span>
  );
}

function Card({
  number,
  title,
  what,
  example,
  children,
}: {
  number: number;
  title: string;
  what: string;
  example: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/15 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--tone,255_255_255))]">Bloque {number}</p>
      <p className="mt-1 font-display text-xl font-black">{title}</p>
      <p className="mt-1 text-sm text-white/70">{what}</p>
      <div className="my-4 flex flex-1 items-center justify-center rounded-xl bg-white/[0.03] p-3">{children}</div>
      <p className="text-xs text-white/50">
        <span className="font-semibold text-white/70">Ejemplo: </span>
        {example}
      </p>
    </div>
  );
}

// Secuencia: una instrucción después de otra, siempre en el mismo orden.
function Sequence() {
  const { tick, still } = useTick(900);
  const step = still ? -1 : tick % 4; // el cuarto tiempo es una pausa antes de repetir
  const ledOn = step === 0 || step === 1;
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex flex-1 flex-col items-stretch gap-1">
        {["Encender LED", "Esperar 1 s", "Apagar LED"].map((text, i) => (
          <div key={text} className="flex flex-col items-center gap-1">
            <Step active={step === i}>{text}</Step>
            {i < 2 && <ArrowDown className="h-3 w-3 text-white/30" />}
          </div>
        ))}
      </div>
      <Led on={still || ledOn} />
    </div>
  );
}

// Decisión: según una condición, el programa toma un camino u otro.
function Decision() {
  const { tick, still } = useTick(1600);
  const pressed = still ? true : tick % 2 === 0;
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex flex-1 flex-col items-center gap-1.5">
        {/* El botón que se presiona y se suelta */}
        <svg viewBox="0 0 60 26" className="h-6 w-14" aria-label={pressed ? "Botón presionado" : "Botón suelto"}>
          <rect x="6" y="16" width="48" height="8" rx="2" fill="rgba(255,255,255,0.25)" />
          <rect x="18" y={pressed ? 10 : 4} width="24" height="8" rx="2" fill={TONE} style={{ transition: "y 0.2s" }} />
        </svg>
        <span className="rounded-md border border-[rgb(var(--tone,255_255_255)/0.6)] px-2 py-1 text-center text-xs text-white [clip-path:polygon(8%_0,92%_0,100%_50%,92%_100%,8%_100%,0_50%)]">
          ¿Botón presionado?
        </span>
        <div className="grid w-full gap-1">
          <Step active={pressed}>Sí → encender</Step>
          <Step active={!pressed}>No → apagar</Step>
        </div>
      </div>
      <Led on={pressed} color="#4ade80" />
    </div>
  );
}

// Repetición: hacer lo mismo varias veces sin escribirlo varias veces.
function Repetition() {
  const { tick, still } = useTick(450);
  // 5 parpadeos (encendido + apagado = 2 tiempos cada uno) y una pausa de 3 tiempos.
  const cycle = tick % 13;
  const blinking = cycle < 10;
  const count = still ? 5 : blinking ? Math.floor(cycle / 2) + 1 : 5;
  const ledOn = still || (blinking && cycle % 2 === 0);
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex flex-1 flex-col items-center gap-2">
        <Repeat
          className={`h-6 w-6 text-[rgb(var(--tone,255_255_255))] ${blinking && !still ? "animate-[spin_2.2s_linear_infinite]" : ""}`}
        />
        <p className="text-sm text-white">
          Vez <span className="font-display text-xl font-black tabular-nums">{count}</span> de 5
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`h-1.5 w-4 rounded-full transition-colors ${n <= count ? "bg-[rgb(var(--tone,255_255_255))]" : "bg-white/15"}`}
            />
          ))}
        </div>
      </div>
      <Led on={ledOn} color="#facc15" />
    </div>
  );
}

export function ThreeBlocks() {
  return (
    <div className="not-prose my-6 grid gap-3 md:grid-cols-3">
      <Card
        number={1}
        title="Secuencia"
        what="Instrucciones una tras otra, siempre en el mismo orden."
        example="encender LED, esperar 1 s, apagar LED."
      >
        <Sequence />
      </Card>
      <Card
        number={2}
        title="Decisión"
        what="Elegir un camino según una condición."
        example="si el botón está presionado, encender; si no, apagar."
      >
        <Decision />
      </Card>
      <Card number={3} title="Repetición" what="Hacer algo varias veces." example="parpadear 5 veces.">
        <Repetition />
      </Card>
    </div>
  );
}
