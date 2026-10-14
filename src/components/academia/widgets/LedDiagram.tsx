import { useState } from "react";
import { Eye } from "lucide-react";

const LED_COLOR = "#f87171";
const LABEL = { fill: "white", fontSize: 12, fontFamily: "inherit" };
const HINT = { fill: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "inherit" };

function PhysicalLed() {
  return (
    <svg viewBox="0 0 260 250" className="h-auto w-full max-w-[260px]" role="img" aria-label="LED con la pata larga (ánodo) a la izquierda y la pata corta (cátodo) a la derecha, junto al borde plano">
      <path d="M80 135 V75 A40 40 0 0 1 160 75 V135 Z" fill={LED_COLOR} opacity="0.85" />
      <path d="M92 70 A28 28 0 0 1 112 52" stroke="white" strokeOpacity="0.5" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* El borde sobresale a la izquierda y es recto a la derecha (lado del cátodo). */}
      <rect x="70" y="135" width="90" height="12" rx="3" fill={LED_COLOR} />
      <line x1="105" y1="147" x2="105" y2="240" stroke="#d4d4d4" strokeWidth="4" />
      <line x1="135" y1="147" x2="135" y2="200" stroke="#d4d4d4" strokeWidth="4" />

      <line x1="163" y1="141" x2="182" y2="120" stroke="white" strokeOpacity="0.5" />
      <text x="168" y="104" {...LABEL}>Borde plano</text>
      <text x="168" y="117" {...HINT}>= cátodo</text>

      <line x1="72" y1="228" x2="101" y2="228" stroke="white" strokeOpacity="0.5" />
      <text x="0" y="224" {...LABEL}>Ánodo (+)</text>
      <text x="0" y="238" {...HINT}>pata larga</text>

      <line x1="139" y1="196" x2="160" y2="196" stroke="white" strokeOpacity="0.5" />
      <text x="164" y="194" {...LABEL}>Cátodo (−)</text>
      <text x="164" y="208" {...HINT}>pata corta</text>
    </svg>
  );
}

function SchematicLed({ reversed }: { reversed: boolean }) {
  const on = !reversed;
  return (
    <svg viewBox="0 0 260 130" className="h-auto w-full max-w-[300px]" role="img" aria-label={on ? "LED bien conectado: la corriente pasa y se enciende" : "LED al revés: no pasa corriente y no se enciende"}>
      <text x="14" y="40" {...LABEL}>{reversed ? "−" : "+"}</text>
      <text x="236" y="40" {...LABEL}>{reversed ? "+" : "−"}</text>
      <line x1="10" y1="65" x2="105" y2="65" stroke="#d4d4d4" strokeWidth="3" />
      <line x1="145" y1="65" x2="250" y2="65" stroke="#d4d4d4" strokeWidth="3" />
      {on && (
        <line x1="10" y1="65" x2="250" y2="65" stroke={LED_COLOR} strokeWidth="3" strokeDasharray="4 12">
          <animate attributeName="stroke-dashoffset" from="32" to="0" dur="0.8s" repeatCount="indefinite" />
        </line>
      )}
      {on && <circle cx="125" cy="65" r="30" fill={LED_COLOR} opacity="0.25" style={{ filter: "blur(8px)" }} />}
      <polygon points="105,42 105,88 145,65" fill={on ? LED_COLOR : "#404040"} stroke="white" strokeWidth="2" />
      <line x1="145" y1="42" x2="145" y2="88" stroke="white" strokeWidth="3" />
      {[0, 14].map((dx) => (
        <g key={dx} stroke={on ? LED_COLOR : "#525252"} strokeWidth="2" fill="none">
          <line x1={128 + dx} y1="38" x2={140 + dx} y2="24" />
          <polyline points={`${133 + dx},24 ${140 + dx},24 ${140 + dx},31`} />
        </g>
      ))}
      <text x="78" y="115" {...LABEL}>ánodo</text>
      <text x="140" y="115" {...LABEL}>cátodo</text>
    </svg>
  );
}

export function LedDiagram() {
  const [reversed, setReversed] = useState(false);

  return (
    <figure className="not-prose my-8 rounded-2xl border border-[rgb(var(--accent,255_255_255)/0.4)] p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--accent,255_255_255))]">
        <Eye className="h-4 w-4" /> Míralo de cerca
      </p>
      <div className="mt-4 grid items-center gap-6 sm:grid-cols-2">
        <div className="flex flex-col items-center">
          <PhysicalLed />
          <p className="mt-2 text-center text-xs text-white/50">Así lo reconoces en la mano</p>
        </div>
        <div className="flex flex-col items-center">
          <SchematicLed reversed={reversed} />
          <p className="mt-2 text-center text-xs text-white/50">Así se dibuja en un esquemático</p>
          <div className="mt-4 inline-flex rounded-lg border border-white/15 p-1 text-sm">
            {[false, true].map((value) => (
              <button
                key={String(value)}
                type="button"
                aria-pressed={reversed === value}
                onClick={() => setReversed(value)}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  reversed === value ? "bg-[rgb(var(--accent,255_255_255))] font-semibold text-black" : "text-white/70 hover:text-white"
                }`}
              >
                {value ? "Al revés" : "Bien conectado"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-4 rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-white/75" aria-live="polite">
        {reversed
          ? "Al revés no conduce: no pasa corriente y el LED no se enciende. Normalmente no se daña; basta con darle la vuelta."
          : "La corriente entra por el ánodo (+), sale por el cátodo (−) y el LED se enciende. El triángulo apunta hacia donde va la corriente."}
      </figcaption>
    </figure>
  );
}
