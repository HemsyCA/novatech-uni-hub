import { useState } from "react";
import { Ruler, Triangle } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const CLEARANCE = 0.4; // regla Nova: +0.2 mm por lado

const PARTS = [
  { name: "LED de 5 mm", real: 5.0 },
  { name: "Tornillo M3", real: 3.0 },
  { name: "Servo SG90 (ancho)", real: 11.8 },
];

const mm = (value: number) => `${(Math.round(value * 100) / 100).toFixed(1)} mm`;

export function Clearance() {
  const [part, setPart] = useState(PARTS[0]);
  const [withClearance, setWithClearance] = useState(false);
  const [custom, setCustom] = useState("");

  const design = part.real + (withClearance ? CLEARANCE : 0);
  // Dibujo exagerado para que se note: el agujero impreso sale un poco más chico que el diseño.
  const holeW = 120;
  const printedW = withClearance ? 110 : 100;
  const partW = 104;
  const fits = withClearance;
  const customValue = Number(custom.replace(",", "."));

  return (
    <WidgetCard icon={Ruler} title="Holguras: ¿entra o no entra?">
      <div className="flex flex-wrap gap-2">
        {PARTS.map((p) => (
          <Choice key={p.name} selected={p === part} onClick={() => setPart(p)}>
            {p.name}
          </Choice>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Choice selected={!withClearance} onClick={() => setWithClearance(false)}>Medida exacta</Choice>
        <Choice selected={withClearance} onClick={() => setWithClearance(true)}>Con holgura (+0.2 mm por lado)</Choice>
      </div>

      <div className="mt-4 rounded-xl bg-white/[0.03] p-3">
        <svg viewBox="0 0 240 120" className="h-auto w-full" role="img" aria-label={fits ? "La pieza entra en el agujero" : "La pieza no entra en el agujero"}>
          {/* Pieza impresa vista en corte: el agujero diseñado y lo que realmente sale. */}
          <rect x="0" y="60" width="240" height="56" fill="rgb(var(--tone, 255 255 255) / 0.25)" />
          <rect x={120 - holeW / 2} y="60" width={holeW} height="56" fill="#111" />
          <rect x={120 - holeW / 2} y="60" width={(holeW - printedW) / 2} height="56" fill="rgb(var(--tone, 255 255 255) / 0.5)" />
          <rect x={120 + printedW / 2} y="60" width={(holeW - printedW) / 2} height="56" fill="rgb(var(--tone, 255 255 255) / 0.5)" />
          <line x1={120 - holeW / 2} y1="56" x2={120 + holeW / 2} y2="56" stroke="rgba(255,255,255,0.4)" strokeDasharray="3 3" />
          <text x="120" y="52" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="inherit">
            diseño: {mm(design)}
          </text>
          {/* La pieza que entra desde arriba. */}
          <rect
            x={120 - partW / 2}
            y={fits ? 34 : 8}
            width={partW}
            height={fits ? 70 : 50}
            rx="3"
            fill={fits ? "#4ade80" : "#f87171"}
            opacity="0.85"
            style={{ transition: "all 0.4s ease" }}
          />
          <text x="120" y={fits ? 74 : 38} textAnchor="middle" fill="black" fontSize="10" fontWeight="bold" fontFamily="inherit">
            {part.name.split(" (")[0]} · {mm(part.real)}
          </text>
        </svg>
        <p className="mt-1 text-[11px] text-white/40">Dibujo exagerado. La franja clara es lo que la impresora "se come" del agujero.</p>
      </div>

      <div className="mt-4">
        {fits ? (
          <Feedback tone="ok">
            Diseñas {mm(design)} para un componente de {mm(part.real)}. Aunque el agujero salga un poco más chico, encaja.
          </Feedback>
        ) : (
          <Feedback tone="error">
            Con la medida exacta ({mm(design)}), el agujero impreso sale un poco más chico y el componente no entra, o entra forzado.
          </Feedback>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 p-3">
        <label htmlFor="clearance-real" className="text-xs text-white/50">
          Calculadora: medida real de tu componente (mm)
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            id="clearance-real"
            inputMode="decimal"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Ej.: 7"
            className="w-24 rounded-lg border border-white/20 bg-black px-3 py-2 text-sm"
          />
          <span className="text-sm text-white/70">
            {customValue > 0 ? (
              <>
                → en el diseño: <strong className="text-[rgb(var(--tone,255_255_255))]">{mm(customValue + CLEARANCE)}</strong>
              </>
            ) : (
              "→ te digo cuánto poner en el diseño"
            )}
          </span>
        </div>
      </div>
    </WidgetCard>
  );
}

const LAYERS = 9;
const LAYER_H = 10;
const LINE_W = 20; // ancho de cada "fideo" dibujado (relación 0.4 / 0.2 mm de la impresora real)

export function Overhang() {
  const [angle, setAngle] = useState(30);
  const [supports, setSupports] = useState(false);
  // Cada capa se corre hacia afuera según el ángulo. Si se corre más de medio fideo, queda en el aire.
  const shift = LAYER_H * Math.tan((angle * Math.PI) / 180);
  const unsupported = shift > LINE_W / 2 + 0.01;
  const needsSupport = angle > 45;
  const baseX = 60;

  return (
    <WidgetCard icon={Triangle} title="Voladizos: hasta dónde se sostiene">
      <label htmlFor="overhang-angle" className="mb-2 flex justify-between text-xs text-white/50">
        Inclinación del voladizo <span className="font-semibold text-white">{angle}°</span>
      </label>
      <input
        id="overhang-angle"
        type="range"
        min={0}
        max={80}
        step={5}
        value={angle}
        onChange={(e) => setAngle(Number(e.target.value))}
        className="w-full accent-[rgb(var(--tone,255_255_255))]"
      />

      <div className="mt-4 rounded-xl bg-white/[0.03] p-3">
        <svg viewBox="0 0 260 130" className="h-auto w-full" role="img" aria-label={`Capas de un voladizo a ${angle} grados`}>
          <line x1="0" y1="122" x2="260" y2="122" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <text x="4" y="118" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="inherit">cama</text>
          {Array.from({ length: LAYERS }, (_, i) => {
            const y = 122 - (i + 1) * LAYER_H;
            // A partir de cierto ángulo el corrimiento se limita solo para que el dibujo quepa.
            const x = baseX + i * Math.min(shift, 20);
            const falling = unsupported && !supports && i > 0;
            return (
              <g key={i}>
                {/* Pared vertical de la pieza */}
                <rect x={baseX - 40} y={y} width="40" height={LAYER_H - 1} rx="4" fill="rgb(var(--tone, 255 255 255) / 0.7)" />
                {/* Capa del voladizo */}
                <rect
                  x={x}
                  y={falling ? y + 3 : y}
                  width={LINE_W}
                  height={LAYER_H - 1}
                  rx="4"
                  fill={falling ? "#f87171" : "rgb(var(--tone, 255 255 255) / 0.7)"}
                  style={{ transition: "all 0.3s ease" }}
                />
                {supports && unsupported && i > 0 && (
                  <line x1={x + LINE_W / 2} y1={y + LAYER_H} x2={x + LINE_W / 2} y2="122" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="2 2" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {needsSupport && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Choice selected={!supports} onClick={() => setSupports(false)}>Sin soportes</Choice>
          <Choice selected={supports} onClick={() => setSupports(true)}>Con soportes</Choice>
        </div>
      )}

      <div className="mt-4">
        {!needsSupport ? (
          <Feedback tone="ok">
            Hasta 45°, cada capa se apoya al menos en la mitad de la capa de abajo: la impresora lo resuelve sola.
          </Feedback>
        ) : supports ? (
          <Feedback tone="info">
            Los soportes sostienen las capas que quedaban en el aire. Funcionan, pero gastan material y dejan marcas al retirarlos.
          </Feedback>
        ) : (
          <Feedback tone="error">
            Más de 45°: cada capa queda casi toda en el aire y el plástico se cae. Necesita soportes, o mejor, gira la pieza.
          </Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
