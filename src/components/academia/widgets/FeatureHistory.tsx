import { useState } from "react";
import { History } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

// Proyección isométrica sencilla: el observador mira desde (+x, +y, +z).
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
type P3 = [number, number, number];
type P2 = [number, number];
const project = ([x, y, z]: P3): P2 => [(x - y) * COS, (x + y) * SIN - z];
const toPath = (points: P3[]) => points.map((p, i) => `${i ? "L" : "M"}${project(p).map((v) => v.toFixed(2)).join(" ")}`).join(" ") + " Z";

const circle = (cx: number, cy: number, r: number, segments = 28): P2[] =>
  Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

const roundedRect = (w: number, d: number, r: number): P2[] => {
  if (r <= 0) return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
  const corners: [number, number, number][] = [
    [w / 2 - r, -d / 2 + r, -90],
    [w / 2 - r, d / 2 - r, 0],
    [-w / 2 + r, d / 2 - r, 90],
    [-w / 2 + r, -d / 2 + r, 180],
  ];
  return corners.flatMap(([cx, cy, start]) =>
    Array.from({ length: 7 }, (_, i) => {
      const a = ((start + i * 15) * Math.PI) / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as P2;
    }),
  );
};

const TOP = "rgb(103 232 249)";
const SIDE_A = "rgb(14 116 144)";
const SIDE_B = "rgb(21 94 117)";
const HOLE = "#06141a";
const SKETCH = "#60a5fa";

// Un prisma: el contorno 2D (en sentido antihorario) estirado entre z0 y z1. Solo se dibujan las caras visibles.
function Prism({ outline, z0, z1, holes = [] }: { outline: P2[]; z0: number; z1: number; holes?: P2[][] }) {
  const sides = outline
    .map((a, i) => {
      const b = outline[(i + 1) % outline.length];
      const nx = b[1] - a[1];
      const ny = -(b[0] - a[0]);
      return { a, b, nx, ny, depth: a[0] + a[1] + b[0] + b[1] };
    })
    .filter((s) => s.nx + s.ny > 0)
    .sort((s, t) => s.depth - t.depth);
  return (
    <g>
      {sides.map((s, i) => (
        <path
          key={i}
          d={toPath([[...s.a, z0], [...s.b, z0], [...s.b, z1], [...s.a, z1]])}
          fill={s.nx > s.ny ? SIDE_A : SIDE_B}
          stroke={s.nx > s.ny ? SIDE_A : SIDE_B}
          strokeWidth="0.3"
        />
      ))}
      <path d={toPath(outline.map(([x, y]) => [x, y, z1]))} fill={TOP} stroke="rgb(8 51 68)" strokeWidth="0.3" />
      {holes.map((hole, i) => (
        <path key={i} d={toPath(hole.map(([x, y]) => [x, y, z1]))} fill={HOLE} />
      ))}
    </g>
  );
}

function SketchLines({ outlines, z }: { outlines: P2[][]; z: number }) {
  return (
    <g fill="none" stroke={SKETCH} strokeWidth="0.6">
      {outlines.map((o, i) => (
        <path key={i} d={toPath(o.map(([x, y]) => [x, y, z]))} />
      ))}
    </g>
  );
}

const FEATURES = [
  { name: "Boceto 1", detail: "rectángulo con 4 agujeros de 3.2 mm" },
  { name: "Extrusión 1", detail: "3 mm · New" },
  { name: "Boceto 2", detail: "4 círculos de 8 mm sobre la cara superior" },
  { name: "Extrusión 2", detail: "6 mm · Add: las torres" },
  { name: "Extrusión 3", detail: "círculos de 3.2 mm · Remove" },
  { name: "Redondeo 1", detail: "5 mm en las 4 esquinas" },
  { name: "Chaflán 1", detail: "0.5 mm en la cara inferior" },
];

const PLATE = 3;
const TOWER = 6;

export function FeatureHistory() {
  const [width, setWidth] = useState(100);
  const [upTo, setUpTo] = useState(FEATURES.length - 1);
  const depth = 60;
  const holeCenters: P2[] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([sx, sy]) => [sx * (width / 2 - 5), sy * (depth / 2 - 5)]);
  const smallHoles = holeCenters.map(([x, y]) => circle(x, y, 1.6));
  const plate = roundedRect(width, depth, upTo >= 5 ? 5 : 0);

  // Las torres se dibujan de atrás hacia adelante.
  const towers = [...holeCenters].sort((a, b) => a[0] + a[1] - (b[0] + b[1]));

  return (
    <WidgetCard icon={History} label="Explora la pieza" title="La lista de operaciones">
      <div className="rounded-xl bg-white/[0.03] p-2">
        <svg viewBox="-88 -52 176 104" className="h-auto w-full" role="img" aria-label={`Placa de ${width} por 60 mm hasta la operación ${FEATURES[upTo].name}`}>
          {upTo === 0 ? (
            <SketchLines outlines={[plate, ...smallHoles]} z={0} />
          ) : (
            <>
              <Prism outline={plate} z0={0} z1={PLATE} holes={upTo < 3 ? smallHoles : []} />
              {upTo === 2 && <SketchLines outlines={holeCenters.map(([x, y]) => circle(x, y, 4))} z={PLATE} />}
              {upTo >= 3 &&
                towers.map(([x, y], i) => (
                  <Prism key={i} outline={circle(x, y, 4)} z0={PLATE} z1={PLATE + TOWER} holes={upTo >= 4 ? [circle(x, y, 1.6)] : []} />
                ))}
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        <ol className="space-y-1">
          {FEATURES.map((feature, index) => (
            <li key={feature.name}>
              <button
                type="button"
                onClick={() => setUpTo(index)}
                className={`flex w-full items-baseline gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  index === upTo
                    ? "bg-[rgb(var(--accent,255_255_255)/0.15)] text-white"
                    : index < upTo
                      ? "text-white/80 hover:bg-white/[0.05]"
                      : "text-white/30 hover:bg-white/[0.05]"
                }`}
              >
                <span className="w-24 shrink-0 font-semibold">{feature.name}</span>
                <span className="text-xs">{feature.detail}</span>
              </button>
            </li>
          ))}
        </ol>
        <div>
          <p className="mb-2 text-xs text-white/50">Ancho en el Boceto 1</p>
          <div className="flex flex-wrap gap-2">
            {[80, 100, 120].map((w) => (
              <Choice key={w} selected={width === w} onClick={() => setWidth(w)}>
                {w} mm
              </Choice>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Feedback tone="info">
          {upTo === FEATURES.length - 1
            ? "Cambia el ancho: los agujeros y las torres se reacomodan solos porque cada operación guarda sus medidas. Así funciona el diseño paramétrico. (El chaflán está en la cara de abajo: desde aquí no se ve.)"
            : `Estás viendo la pieza hasta "${FEATURES[upTo].name}". Toca otra operación para avanzar o retroceder en el historial.`}
        </Feedback>
      </div>
    </WidgetCard>
  );
}
