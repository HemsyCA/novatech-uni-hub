import { useState } from "react";
import { Layers2 } from "lucide-react";
import { Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const CARDS = [
  { q: "¿Dónde va el cautín cada vez que lo sueltas?", a: "Siempre en su soporte. La punta pasa de 300 °C." },
  { q: "¿Qué temperatura usas con estaño con plomo?", a: "Entre 320 y 350 °C. Sin plomo, entre 350 y 380 °C." },
  { q: "¿Cuál es la regla de oro de la soldadura THT?", a: "Calentar las piezas (pad y pata), no el estaño." },
  { q: "¿Cuánto dura una soldadura THT?", a: "De 3 a 5 segundos, y no se mueve el componente mientras se enfría." },
  { q: "¿Cómo se ve una buena junta?", a: "Brillante, con forma de volcán, cubre el pad y se ve la pata." },
  { q: "¿Cómo corriges una soldadura fría?", a: "Agregas un poco de flux y recalientas hasta que el estaño fluya." },
  { q: "¿Cómo quitas un puente?", a: "Punta limpia con flux entre los pads, o malla desoldante." },
  { q: "En SMD de dos terminales, ¿qué haces primero?", a: "Estañar un solo pad, fijar el componente y luego soldar el otro lado." },
];

export function ReviewCards() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const all = flipped.size === CARDS.length;

  return (
    <WidgetCard icon={Layers2} label="Repaso" title="Tarjetas para antes de la práctica">
      <p className="text-sm text-white/60">
        Lee la pregunta, responde en voz alta y toca la tarjeta para comprobar. ({flipped.size} de {CARDS.length})
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CARDS.map((card, index) => {
          const open = flipped.has(index);
          return (
            <button
              key={card.q}
              type="button"
              aria-pressed={open}
              onClick={() =>
                setFlipped((current) => {
                  const next = new Set(current);
                  if (next.has(index)) next.delete(index);
                  else next.add(index);
                  return next;
                })
              }
              className="h-28 [perspective:800px]"
            >
              <span
                className="relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                style={{ transform: open ? "rotateY(180deg)" : "none" }}
              >
                <span className="absolute inset-0 flex items-center rounded-xl border border-white/15 bg-white/[0.04] px-4 text-left text-sm [backface-visibility:hidden]">
                  {card.q}
                </span>
                <span className="absolute inset-0 flex items-center rounded-xl border border-[rgb(var(--accent,255_255_255)/0.5)] bg-[rgb(var(--accent,255_255_255)/0.12)] px-4 text-left text-sm text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  {card.a}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {all && (
        <div className="mt-4">
          <Feedback tone="ok">¡Repasaste todo! Si alguna respuesta te costó, vuelve a la lección donde se explica antes de la práctica.</Feedback>
        </div>
      )}
    </WidgetCard>
  );
}
