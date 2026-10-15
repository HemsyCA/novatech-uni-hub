import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type Defect = "buena" | "fria" | "puente" | "poco" | "exceso" | "sin-mojar";

const NAMES: Record<Defect, string> = {
  buena: "Buena soldadura",
  fria: "Soldadura fría",
  puente: "Puente",
  poco: "Poco estaño",
  exceso: "Exceso de estaño",
  "sin-mojar": "Pad sin mojar",
};

const FIX: Record<Defect, string> = {
  buena: "Forma de volcán, cubre el pad y se ve la pata. No hay que tocarla.",
  fria: "Opaca y agrietada. Agrega un poco de flux y recalienta hasta que el estaño fluya.",
  puente: "Une dos pads: es un cortocircuito. Pasa la punta limpia con flux entre los pads o retira el sobrante con malla.",
  poco: "El estaño no cubre todo el pad. Recalienta y agrega un poco más.",
  exceso: "Una bola que esconde la unión. Retira el sobrante con malla y vuelve a soldar.",
  "sin-mojar": "El estaño se pegó a la pata pero no al pad. Limpia, agrega flux y calienta el pad junto con la pata.",
};

// Orden fijo de las juntas en la placa.
const JOINTS: Defect[] = ["fria", "buena", "exceso", "puente", "sin-mojar", "poco"];

const SHINY = "url(#defect-shiny)";

function Drawing({ defect }: { defect: Defect }) {
  const board = <rect x="0" y="44" width="80" height="10" fill="#1f6f43" />;
  const pad = (x: number) => <rect x={x - 14} y="41" width="28" height="3" fill="#d4a017" />;
  const lead = (x: number) => <line x1={x} y1="6" x2={x} y2="58" stroke="#d4d4d4" strokeWidth="2.5" />;
  const volcano = (x: number, h = 20, w = 13) => (
    <path d={`M${x - w} 41 Q${x - w * 0.3} ${41 - h * 0.2} ${x - 1.5} ${41 - h} L${x + 1.5} ${41 - h} Q${x + w * 0.3} ${41 - h * 0.2} ${x + w} 41 Z`} fill={SHINY} />
  );
  const shapes: Record<Defect, ReactNode> = {
    buena: (
      <>
        {pad(40)}
        {lead(40)}
        {volcano(40)}
      </>
    ),
    fria: (
      <>
        {pad(40)}
        {lead(40)}
        <path d="M27 41 Q30 30 34 32 Q36 22 41 25 Q46 20 47 30 Q52 29 53 41 Z" fill="url(#defect-grain)" />
        <path d="M36 36 L40 31 L38 27" stroke="#3f3f46" strokeWidth="0.8" fill="none" />
      </>
    ),
    puente: (
      <>
        {pad(24)}
        {pad(56)}
        {lead(24)}
        {lead(56)}
        <path d="M12 41 Q14 26 24 22 Q40 28 56 22 Q66 26 68 41 Z" fill={SHINY} />
      </>
    ),
    poco: (
      <>
        {pad(40)}
        {lead(40)}
        {volcano(40, 8, 6)}
      </>
    ),
    exceso: (
      <>
        {pad(40)}
        {lead(40)}
        <circle cx="40" cy="28" r="15" fill={SHINY} />
      </>
    ),
    "sin-mojar": (
      <>
        {pad(40)}
        {lead(40)}
        <ellipse cx="40" cy="30" rx="8" ry="7" fill={SHINY} />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 80 60" className="h-auto w-full" aria-hidden>
      {board}
      {shapes[defect]}
    </svg>
  );
}

export function DefectHunt() {
  const [selected, setSelected] = useState<number | null>(null);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<Defect | null>(null);
  const done = found.size === JOINTS.length;

  const answer = (defect: Defect) => {
    if (selected === null) return;
    if (defect === JOINTS[selected]) {
      setFound((current) => new Set(current).add(selected));
      setWrong(null);
    } else {
      setWrong(defect);
    }
  };

  const current = selected !== null ? JOINTS[selected] : null;
  const solvedCurrent = selected !== null && found.has(selected);

  return (
    <WidgetCard icon={Search} label="Juego" title="Encuentra el defecto">
      {/* Degradado y textura compartidos por los dibujos de las juntas. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="defect-shiny" x1="0" x2="1">
            <stop offset="0" stopColor="#9ca3af" />
            <stop offset="0.45" stopColor="#f3f4f6" />
            <stop offset="1" stopColor="#6b7280" />
          </linearGradient>
          <pattern id="defect-grain" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#8b8b8b" />
            <circle cx="1" cy="1" r="0.8" fill="#5f5f5f" />
            <circle cx="3" cy="3" r="0.6" fill="#a3a3a3" />
          </pattern>
        </defs>
      </svg>

      <p className="text-sm text-white/60">
        Toca cada junta y elige qué defecto tiene. Una de ellas está bien. ({found.size} de {JOINTS.length})
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {JOINTS.map((defect, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setSelected(index);
              setWrong(null);
            }}
            className={`rounded-xl border p-2 transition-colors ${
              found.has(index)
                ? "border-emerald-400/60 bg-emerald-400/10"
                : selected === index
                  ? "border-[rgb(var(--tone,255_255_255))] bg-[rgb(var(--tone,255_255_255)/0.1)]"
                  : "border-white/15 hover:border-white/35"
            }`}
          >
            <Drawing defect={defect} />
            <span className="mt-1 block text-[11px] text-white/60">{found.has(index) ? NAMES[defect] : `Junta ${index + 1}`}</span>
          </button>
        ))}
      </div>

      {selected !== null && !solvedCurrent && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-white/50">¿Qué tiene la junta {selected + 1}?</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(NAMES) as Defect[]).map((defect) => (
              <button
                key={defect}
                type="button"
                onClick={() => answer(defect)}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${
                  wrong === defect ? "border-rose-400 bg-rose-400/10" : "border-white/20 hover:border-[rgb(var(--tone,255_255_255))]"
                }`}
              >
                {NAMES[defect]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        {done ? (
          <Feedback tone="ok">¡Encontraste todos! Antes de conectar una placa a la batería, revísala así: con lupa, junta por junta.</Feedback>
        ) : solvedCurrent && current ? (
          <Feedback tone="ok">
            <strong>{NAMES[current]}.</strong> {FIX[current]}
          </Feedback>
        ) : wrong ? (
          <Feedback tone="error">No es {NAMES[wrong].toLowerCase()}. Mira la forma, el brillo y si el estaño toca el pad.</Feedback>
        ) : (
          <Feedback tone="info">Pista: una buena junta es brillante, con forma de volcán y cubre todo el pad.</Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
