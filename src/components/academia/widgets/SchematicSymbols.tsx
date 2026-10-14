import { useState, type ReactNode } from "react";
import { RotateCcw, Shapes } from "lucide-react";
import { Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const stroke = { stroke: "white", strokeWidth: 3, fill: "none", strokeLinecap: "round" as const };

interface SymbolCard {
  name: string;
  designator: string;
  note: string;
  hint: string;
  drawing: ReactNode;
}

const SYMBOLS: SymbolCard[] = [
  {
    name: "Resistencia",
    designator: "R1, R2…",
    note: "Un rectángulo (o un zigzag) con dos terminales.",
    hint: "Fíjate: no tiene ninguna flecha ni raya, solo un rectángulo.",
    drawing: (
      <g {...stroke}>
        <line x1="10" y1="50" x2="45" y2="50" />
        <rect x="45" y="38" width="70" height="24" rx="2" />
        <line x1="115" y1="50" x2="150" y2="50" />
      </g>
    ),
  },
  {
    name: "LED",
    designator: "D1, D2…",
    note: "El triángulo apunta hacia donde va la corriente (del ánodo al cátodo) y las flechitas indican que emite luz.",
    hint: "Las flechitas que salen son la pista: algo que emite luz.",
    drawing: (
      <g {...stroke}>
        <line x1="10" y1="55" x2="60" y2="55" />
        <path d="M60 35 L60 75 L95 55 Z" />
        <line x1="95" y1="35" x2="95" y2="75" />
        <line x1="95" y1="55" x2="150" y2="55" />
        <path d="M82 30 L94 16 M88 16 H94 V22" strokeWidth="2" />
        <path d="M96 34 L108 20 M102 20 H108 V26" strokeWidth="2" />
      </g>
    ),
  },
  {
    name: "Tierra (GND)",
    designator: "Sin designador",
    note: "Rayitas que se achican hacia abajo: es la referencia de 0 V.",
    hint: "Las rayas que se hacen más pequeñas hacia abajo son la pista.",
    drawing: (
      <g {...stroke}>
        <line x1="80" y1="15" x2="80" y2="55" />
        <line x1="50" y1="55" x2="110" y2="55" />
        <line x1="60" y1="67" x2="100" y2="67" />
        <line x1="70" y1="79" x2="90" y2="79" />
      </g>
    ),
  },
  {
    name: "Fuente de voltaje (3V3)",
    designator: "Sin designador",
    note: "Una barra (o flecha) arriba con el nombre del voltaje: 3V3, 5V…",
    hint: "Una barra arriba indica de dónde llega el voltaje.",
    drawing: (
      <g {...stroke}>
        <line x1="50" y1="25" x2="110" y2="25" />
        <line x1="80" y1="25" x2="80" y2="85" />
      </g>
    ),
  },
  {
    name: "Conector",
    designator: "J1, J2…",
    note: "Un rectángulo con pines numerados: por ahí entra o sale algo de la placa.",
    hint: "Los pines numerados (1, 2) son la pista: es por donde se conecta algo.",
    drawing: (
      <g>
        <rect x="65" y="20" width="40" height="60" rx="3" {...stroke} />
        <line x1="25" y1="38" x2="65" y2="38" {...stroke} />
        <line x1="25" y1="62" x2="65" y2="62" {...stroke} />
        <text x="72" y="43" fill="white" fontSize="13" fontFamily="inherit">1</text>
        <text x="72" y="67" fill="white" fontSize="13" fontFamily="inherit">2</text>
      </g>
    ),
  },
  {
    name: "Botón",
    designator: "SW1, SW2…",
    note: "Dos contactos y una palanca que los une al presionar.",
    hint: "La palanca levantada sobre dos contactos es la pista.",
    drawing: (
      <g {...stroke}>
        <line x1="10" y1="65" x2="50" y2="65" />
        <circle cx="54" cy="65" r="4" />
        <circle cx="106" cy="65" r="4" />
        <line x1="110" y1="65" x2="150" y2="65" />
        <line x1="50" y1="45" x2="110" y2="45" />
        <line x1="80" y1="45" x2="80" y2="25" />
        <line x1="68" y1="25" x2="92" y2="25" />
      </g>
    ),
  },
];

// Orden fijo de las preguntas y de las opciones, para que no siempre sea la primera.
const ORDER = [1, 4, 0, 5, 2, 3];
const OPTIONS = [
  [1, 0, 5],
  [3, 2, 4],
  [5, 0, 1],
  [5, 4, 0],
  [3, 1, 2],
  [2, 3, 4],
];

export function SchematicSymbols() {
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const finished = round >= ORDER.length;
  const symbol = SYMBOLS[ORDER[Math.min(round, ORDER.length - 1)]];

  const choose = (index: number) => {
    if (solved) return;
    if (index === ORDER[round]) {
      setSolved(true);
      setWrong(null);
    } else {
      setWrong(index);
      setMistakes((m) => m + 1);
    }
  };

  const next = () => {
    setRound((r) => r + 1);
    setSolved(false);
    setWrong(null);
  };

  return (
    <WidgetCard icon={Shapes} label="Juego" title="¿Qué símbolo es?">
      {finished ? (
        <div className="space-y-4">
          <Feedback tone="ok">
            ¡Listo! Reconociste los 6 símbolos{mistakes === 0 ? " sin errores" : ` con ${mistakes} error${mistakes > 1 ? "es" : ""}`}. Así los verás en
            EasyEDA:
          </Feedback>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SYMBOLS.map((s) => (
              <div key={s.name} className="rounded-xl bg-white/[0.04] p-2 text-center">
                <svg viewBox="0 0 160 95" className="h-12 w-full">
                  {s.drawing}
                </svg>
                <p className="text-xs font-semibold">{s.name}</p>
                <p className="text-[11px] text-white/50">{s.designator}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setRound(0);
              setMistakes(0);
            }}
            className="inline-flex items-center gap-2 text-sm text-white/60 underline underline-offset-4 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" /> Jugar de nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-white/50">
            Símbolo {round + 1} de {ORDER.length}
          </p>
          <div className="flex justify-center rounded-xl bg-white/[0.04] py-4">
            <svg viewBox="0 0 160 95" className="h-24 w-48" role="img" aria-label="Símbolo de esquemático">
              {symbol.drawing}
            </svg>
          </div>
          <div className="grid gap-2">
            {OPTIONS[round].map((index) => {
              const isRight = solved && index === ORDER[round];
              const isWrong = wrong === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => choose(index)}
                  className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                    isRight
                      ? "border-emerald-400 bg-emerald-400/15"
                      : isWrong
                        ? "animate-shake border-rose-400 bg-rose-400/10"
                        : "border-white/20 hover:border-[rgb(var(--accent,255_255_255))]"
                  }`}
                >
                  {SYMBOLS[index].name}
                </button>
              );
            })}
          </div>
          {solved ? (
            <div className="space-y-3">
              <Feedback tone="ok">
                <strong>{symbol.name}</strong> · designador {symbol.designator}. {symbol.note}
              </Feedback>
              <button type="button" onClick={next} className="rounded-xl bg-[rgb(var(--accent,255_255_255))] px-5 py-2.5 text-sm font-semibold text-black">
                {round + 1 === ORDER.length ? "Ver resumen" : "Siguiente símbolo"}
              </button>
            </div>
          ) : (
            wrong !== null && <Feedback tone="error">No es {SYMBOLS[wrong].name.toLowerCase()}. {symbol.hint}</Feedback>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
