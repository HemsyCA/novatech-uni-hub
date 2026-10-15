import { useState } from "react";
import { Move, PencilRuler, RotateCcw } from "lucide-react";
import { Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type Rule = "ancho" | "alto" | "centro" | "diametro" | "igual" | "posicion";

const RULES: { id: Rule; label: string; tool: string }[] = [
  { id: "ancho", label: "Cota del ancho: 100 mm", tool: "D" },
  { id: "alto", label: "Cota del alto: 60 mm", tool: "D" },
  { id: "centro", label: "Centrar: construcción en diagonal + coincidente con el origen", tool: "Q" },
  { id: "diametro", label: "Cota de un agujero: Ø 3.2 mm", tool: "D" },
  { id: "igual", label: "Igual: los 4 agujeros del mismo tamaño", tool: "=" },
  { id: "posicion", label: "Posición: 5 mm desde cada borde", tool: "D" },
];

// Colores de Onshape: azul = todavía se mueve, negro = completamente definido.
const BLUE = "#2563eb";
const BLACK = "#111827";
const RED = "#dc2626";

// Hoja en milímetros: el origen está en el centro.
const SCALE = 1.25;
const CX = 80;
const CY = 50;

const LOOSE_DIAMETERS = [4.6, 3.8, 5.2, 4.2];
const LOOSE_OFFSETS = [
  [7, 6],
  [4, 8],
  [8, 4],
  [6, 7],
];

export function SketchConstraints() {
  const [applied, setApplied] = useState<Set<Rule>>(new Set());
  const [wiggle, setWiggle] = useState(0);
  const [overDefined, setOverDefined] = useState(false);
  const has = (rule: Rule) => applied.has(rule);

  // Lo que no está fijado cambia al "arrastrarlo".
  const width = has("ancho") ? 100 : 88 + wiggle;
  const height = has("alto") ? 60 : 52 + wiggle / 2;
  const [ox, oy] = has("centro") ? [0, 0] : [9 + wiggle, -6 + wiggle / 2];
  const rectDefined = has("ancho") && has("alto") && has("centro");
  const holesDefined = rectDefined && has("diametro") && has("igual") && has("posicion");
  const complete = holesDefined;

  const diameterOf = (i: number) => {
    if (has("igual")) return has("diametro") ? 3.2 : LOOSE_DIAMETERS[0];
    if (has("diametro") && i === 0) return 3.2;
    return LOOSE_DIAMETERS[i];
  };

  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  const holes = corners.map(([sx, sy], i) => {
    const [dx, dy] = has("posicion") ? [5, 5] : LOOSE_OFFSETS[i].map((v) => v + (holesDefined ? 0 : wiggle / 3));
    return { x: ox + sx * (width / 2 - dx), y: oy + sy * (height / 2 - dy), d: diameterOf(i) };
  });

  const toSvg = (x: number, y: number) => [CX + x * SCALE, CY + y * SCALE];
  const [rx, ry] = toSvg(ox - width / 2, oy - height / 2);

  const toggle = (rule: Rule) => {
    setOverDefined(false);
    setApplied((current) => {
      const next = new Set(current);
      if (next.has(rule)) next.delete(rule);
      else next.add(rule);
      return next;
    });
  };

  const drag = () => {
    setWiggle(6);
    setTimeout(() => setWiggle(0), 400);
  };

  return (
    <WidgetCard icon={PencilRuler} title="Del boceto azul al boceto negro">
      <div className="overflow-hidden rounded-xl bg-white p-2">
        <svg viewBox="0 0 160 100" className="h-auto w-full" role="img" aria-label={complete ? "Boceto completamente definido" : "Boceto sin definir"}>
          <defs>
            <pattern id="sketch-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0 H0 V10" fill="none" stroke="#e5e7eb" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="160" height="100" fill="url(#sketch-grid)" />
          <line x1={CX - 4} y1={CY} x2={CX + 4} y2={CY} stroke="#9ca3af" strokeWidth="0.5" />
          <line x1={CX} y1={CY - 4} x2={CX} y2={CY + 4} stroke="#9ca3af" strokeWidth="0.5" />
          <g style={{ transition: "all 0.3s ease" }}>
            {has("centro") && (
              <line
                x1={rx}
                y1={ry}
                x2={rx + width * SCALE}
                y2={ry + height * SCALE}
                stroke="#9ca3af"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            )}
            <rect
              x={rx}
              y={ry}
              width={width * SCALE}
              height={height * SCALE}
              fill="none"
              stroke={overDefined ? RED : rectDefined ? BLACK : BLUE}
              strokeWidth="1"
              style={{ transition: "all 0.3s ease" }}
            />
            {holes.map((h, i) => {
              const [hx, hy] = toSvg(h.x, h.y);
              return (
                <circle
                  key={i}
                  cx={hx}
                  cy={hy}
                  r={(h.d / 2) * SCALE}
                  fill="none"
                  stroke={holesDefined ? BLACK : BLUE}
                  strokeWidth="0.8"
                  style={{ transition: "all 0.3s ease" }}
                />
              );
            })}
          </g>
          {has("ancho") && (
            <text x={CX + ox * SCALE} y={ry - 2} textAnchor="middle" fontSize="5" fill={BLACK} fontFamily="inherit">
              100
            </text>
          )}
          {has("alto") && (
            <text x={rx - 2} y={CY + oy * SCALE} textAnchor="end" fontSize="5" fill={BLACK} fontFamily="inherit">
              60
            </text>
          )}
          {has("diametro") && (
            <text x={toSvg(holes[0].x, holes[0].y)[0] + 4} y={toSvg(holes[0].x, holes[0].y)[1] - 3} fontSize="4.5" fill={BLACK} fontFamily="inherit">
              Ø3.2
            </text>
          )}
          {overDefined && (
            <text x={rx + width * SCALE + 2} y={CY} fontSize="5" fill={RED} fontFamily="inherit">
              100?
            </text>
          )}
        </svg>
      </div>

      <div className="mt-4 space-y-2">
        {RULES.map((rule) => (
          <button
            key={rule.id}
            type="button"
            aria-pressed={has(rule.id)}
            onClick={() => toggle(rule.id)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
              has(rule.id) ? "border-[rgb(var(--tone,255_255_255)/0.6)] bg-[rgb(var(--tone,255_255_255)/0.1)]" : "border-white/15 hover:border-white/35"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 font-mono text-xs">{rule.tool}</span>
            <span className="flex-1">{rule.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!complete && (
          <button type="button" onClick={drag} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
            <Move className="h-4 w-4" /> Intentar arrastrarlo
          </button>
        )}
        {complete && !overDefined && (
          <button type="button" onClick={() => setOverDefined(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
            Poner una cota de más
          </button>
        )}
        {applied.size > 0 && (
          <button
            type="button"
            onClick={() => {
              setApplied(new Set());
              setOverDefined(false);
            }}
            className="inline-flex items-center gap-2 px-2 py-2 text-sm text-white/60 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" /> Empezar de nuevo
          </button>
        )}
      </div>

      <div className="mt-4">
        {overDefined ? (
          <Feedback tone="error">
            Esa cota ya estaba decidida por las demás: el boceto queda <strong>sobredefinido</strong> y Onshape lo marca en rojo. Bórrala.
          </Feedback>
        ) : complete ? (
          <Feedback tone="ok">¡Todo negro! El boceto está completamente definido: ya no se mueve aunque lo arrastres.</Feedback>
        ) : (
          <Feedback tone="info">
            {applied.size} de {RULES.length} reglas aplicadas. Lo que sigue azul todavía se puede mover: prueba arrastrarlo.
          </Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
