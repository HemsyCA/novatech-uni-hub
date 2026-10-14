import { useState, type ReactNode } from "react";
import { Layers } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type Layer = "top" | "bottom" | "silk" | "outline";
type Part = "pad" | "via" | "top" | "bottom" | "silk" | "outline" | "ratsnest";

const TOP = "#ef4444";
const BOTTOM = "#3b82f6";
const SILK = "#f5f5f5";
const OUTLINE = "#facc15";
const PAD = "#d4a017";

const INFO: Record<Part, string> = {
  pad: "Pad: la zona de cobre donde se suelda una pata. Como son componentes THT, tiene un agujero que atraviesa la placa.",
  via: "Vía: un agujerito que conecta una pista de la capa superior con una de la inferior. Así dos pistas pueden \"cruzarse\" sin tocarse.",
  top: "Pista en la capa superior (Top). Las de alimentación miden 1.0 mm y las de señal 0.5 mm.",
  bottom: "Pista en la capa inferior (Bottom). Esta es la de GND, por eso es ancha: 1.0 mm.",
  silk: "Serigrafía: los textos y dibujos impresos. Te dicen qué componente va en cada lugar (J1, R1, D1) y hacia dónde va.",
  outline: "Contorno: la forma y el tamaño de la placa, aquí 30 × 20 mm. Todo debe quedar dentro.",
  ratsnest: "Línea de aire: no es una pista. Solo te avisa que esos dos pads deben conectarse. Tu trabajo es reemplazarla por una pista.",
};

const LAYERS: { id: Layer; label: string; color: string }[] = [
  { id: "top", label: "Cobre superior", color: TOP },
  { id: "bottom", label: "Cobre inferior", color: BOTTOM },
  { id: "silk", label: "Serigrafía", color: SILK },
  { id: "outline", label: "Contorno", color: OUTLINE },
];

// Pads del circuito de la E4: conector J1, resistencia R1 y LED D1 (los cuadrados marcan el pin 1 o el cátodo).
const PADS = [
  { x: 40, y: 80, square: true },
  { x: 40, y: 120, square: false },
  { x: 110, y: 60, square: false },
  { x: 190, y: 60, square: false },
  { x: 240, y: 80, square: false },
  { x: 240, y: 120, square: true },
];

const RATSNEST = [
  [40, 80, 110, 60],
  [190, 60, 240, 80],
  [240, 120, 40, 120],
];

function Hit({ part, onSelect, children }: { part: Part; onSelect: (p: Part) => void; children: ReactNode }) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={INFO[part].split(":")[0]}
      onClick={() => onSelect(part)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(part)}
      className="cursor-pointer outline-none"
    >
      {children}
    </g>
  );
}

export function PcbLayers() {
  const [visible, setVisible] = useState<Set<Layer>>(new Set(["top", "bottom", "silk", "outline"]));
  const [routed, setRouted] = useState(false);
  const [selected, setSelected] = useState<Part | null>(null);

  const toggle = (layer: Layer) =>
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });

  const glow = (part: Part) => (selected === part ? { filter: "drop-shadow(0 0 4px white)" } : undefined);

  return (
    <WidgetCard icon={Layers} label="Explora la placa" title="Las capas de una PCB">
      <div className="flex flex-wrap gap-2">
        <Choice selected={!routed} onClick={() => setRouted(false)}>Recién convertida</Choice>
        <Choice selected={routed} onClick={() => setRouted(true)}>Con pistas</Choice>
      </div>

      <div className="mt-4 rounded-xl bg-[#0b1f14] p-2">
        <svg viewBox="0 0 300 200" className="h-auto w-full" role="img" aria-label="PCB de 30 por 20 mm con un conector, una resistencia y un LED">
          {visible.has("outline") && (
            <Hit part="outline" onSelect={setSelected}>
              <rect x="10" y="10" width="280" height="180" rx="4" fill="none" stroke={OUTLINE} strokeWidth="2" style={glow("outline")} />
            </Hit>
          )}

          {visible.has("bottom") && routed && (
            <Hit part="bottom" onSelect={setSelected}>
              <path d="M210 150 H70 L40 120" fill="none" stroke={BOTTOM} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" style={glow("bottom")} />
            </Hit>
          )}
          {visible.has("top") && routed && (
            <Hit part="top" onSelect={setSelected}>
              <g fill="none" stroke={TOP} strokeLinejoin="round" strokeLinecap="round" opacity="0.9" style={glow("top")}>
                <path d="M40 80 V60 H110" strokeWidth="10" />
                <path d="M190 60 H220 L240 80" strokeWidth="5" />
                <path d="M240 120 L210 150" strokeWidth="10" />
              </g>
            </Hit>
          )}

          {!routed && (
            <Hit part="ratsnest" onSelect={setSelected}>
              {RATSNEST.map(([x1, y1, x2, y2], i) => (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="14" />
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" style={glow("ratsnest")} />
                </g>
              ))}
            </Hit>
          )}

          {(visible.has("top") || visible.has("bottom")) && (
            <Hit part="pad" onSelect={setSelected}>
              <g style={glow("pad")}>
                {PADS.map((pad, i) =>
                  pad.square ? (
                    <rect key={i} x={pad.x - 9} y={pad.y - 9} width="18" height="18" fill={PAD} />
                  ) : (
                    <circle key={i} cx={pad.x} cy={pad.y} r="9" fill={PAD} />
                  ),
                )}
                {PADS.map((pad, i) => (
                  <circle key={`h${i}`} cx={pad.x} cy={pad.y} r="3.5" fill="#0b1f14" />
                ))}
              </g>
            </Hit>
          )}
          {routed && (visible.has("top") || visible.has("bottom")) && (
            <Hit part="via" onSelect={setSelected}>
              <circle cx="210" cy="150" r="6" fill={PAD} style={glow("via")} />
              <circle cx="210" cy="150" r="2.5" fill="#0b1f14" />
            </Hit>
          )}

          {visible.has("silk") && (
            <Hit part="silk" onSelect={setSelected}>
              <g fill="none" stroke={SILK} strokeWidth="1.5" style={glow("silk")}>
                <rect x="26" y="66" width="28" height="68" />
                <rect x="126" y="50" width="48" height="20" />
                {/* Contorno del LED con el lado plano en el cátodo (pad cuadrado). */}
                <path d="M251 119 A22 22 0 1 0 229 119" />
                <line x1="229" y1="119" x2="251" y2="119" />
              </g>
              <g fill={SILK} fontSize="12" fontFamily="inherit">
                <text x="22" y="150">J1</text>
                <text x="140" y="88">R1</text>
                <text x="268" y="104">D1</text>
              </g>
            </Hit>
          )}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {LAYERS.map((layer) => (
          <Choice key={layer.id} selected={visible.has(layer.id)} onClick={() => toggle(layer.id)}>
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: layer.color }} />
            {layer.label}
          </Choice>
        ))}
      </div>

      <div className="mt-4">
        <Feedback tone="info">
          {selected
            ? INFO[selected]
            : routed
              ? "Toca una pista, la vía o un pad. La pista de GND baja a la capa inferior por la vía."
              : "Así aparece la placa al convertirla: los pads están unidos por líneas de aire. Toca una, o pasa a \"Con pistas\"."}
        </Feedback>
      </div>
    </WidgetCard>
  );
}
