import { useState } from "react";
import { Layers3 } from "lucide-react";
import { Choice, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const LAYER_HEIGHTS = [0.12, 0.2, 0.28];
const PART_HEIGHT = 30; // la caja de M4

// Vista de una capa por dentro: paredes alrededor y relleno ondulado (como el giroide) en el centro.
function LayerPreview({ walls, infill }: { walls: number; infill: number }) {
  const size = 140;
  const gap = 6;
  const inner = size - 2 * walls * gap;
  const lines = Math.round((infill / 100) * 22);
  const spacing = lines > 0 ? inner / (lines + 1) : 0;
  const start = walls * gap;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-36 w-36" role="img" aria-label={`Capa con ${walls} paredes y ${infill} % de relleno`}>
      <rect width={size} height={size} fill="rgba(255,255,255,0.03)" />
      {Array.from({ length: walls }, (_, i) => (
        <rect
          key={i}
          x={i * gap + gap / 2}
          y={i * gap + gap / 2}
          width={size - (2 * i + 1) * gap}
          height={size - (2 * i + 1) * gap}
          fill="none"
          stroke="rgb(var(--accent, 255 255 255))"
          strokeWidth="3"
          rx="2"
        />
      ))}
      <clipPath id="infill-clip">
        <rect x={start} y={start} width={inner} height={inner} />
      </clipPath>
      <g clipPath="url(#infill-clip)" stroke="rgb(var(--accent, 255 255 255) / 0.55)" strokeWidth="1.5" fill="none">
        {Array.from({ length: lines }, (_, i) => {
          const y = start + spacing * (i + 1);
          const amp = Math.min(spacing / 2, 6);
          let d = `M${start} ${y}`;
          for (let x = start; x <= start + inner; x += 4) d += ` L${x} ${y + amp * Math.sin(x / 8 + i)}`;
          return <path key={i} d={d} />;
        })}
      </g>
    </svg>
  );
}

function Meter({ label, value, low, high }: { label: string; value: number; low: string; high: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-white/50">{label}</p>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[rgb(var(--accent,255_255_255))] transition-[width] duration-300" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <div className="mt-0.5 flex justify-between text-[10px] text-white/35">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export function Slicer() {
  const [layer, setLayer] = useState(0.2);
  const [walls, setWalls] = useState(2);
  const [infill, setInfill] = useState(15);

  // Comparaciones relativas, no gramos ni minutos reales: Bambu Studio te dará los valores exactos.
  const material = (walls * 12 + infill * 0.75 + 8) / (4 * 12 + 75 + 8);
  const time = Math.min(1, (material * 0.2) / layer / (0.2 / 0.12));
  const strength = Math.min(1, (walls * 14 + infill * 0.55 + 6) / (4 * 14 + 55 + 6));
  const layers = Math.round(PART_HEIGHT / layer);
  const recommended = layer === 0.2 && walls >= 2 && walls <= 3 && infill >= 15 && infill <= 20;

  return (
    <WidgetCard icon={Layers3} title="Configura el laminador">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs text-white/50">Altura de capa</p>
          <div className="flex flex-wrap gap-2">
            {LAYER_HEIGHTS.map((h) => (
              <Choice key={h} selected={layer === h} onClick={() => setLayer(h)}>
                {h} mm
              </Choice>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-white/50">Paredes (perímetros)</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((w) => (
              <Choice key={w} selected={walls === w} onClick={() => setWalls(w)}>
                {w}
              </Choice>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="slicer-infill" className="mb-2 flex justify-between text-xs text-white/50">
            Relleno (giroide) <span className="font-semibold text-white">{infill} %</span>
          </label>
          <input
            id="slicer-infill"
            type="range"
            min={0}
            max={100}
            step={5}
            value={infill}
            onChange={(e) => setInfill(Number(e.target.value))}
            className="w-full accent-[rgb(var(--accent,255_255_255))]"
          />
        </div>
      </div>

      <div className="mt-5 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center">
          <LayerPreview walls={walls} infill={infill} />
          <p className="mt-1 text-xs text-white/50">
            La caja de M4 tendría {layers} capas
          </p>
        </div>
        <div className="space-y-3">
          <Meter label="Tiempo de impresión" value={time} low="rápido" high="lento" />
          <Meter label="Filamento" value={material} low="poco" high="mucho" />
          <Meter label="Resistencia" value={strength} low="frágil" high="fuerte" />
        </div>
      </div>

      <p
        className={`mt-4 rounded-xl px-4 py-3 text-sm ${recommended ? "bg-emerald-400/10 text-emerald-100" : "bg-white/[0.05] text-white/75"}`}
        aria-live="polite"
      >
        {recommended
          ? "✅ Estos son los valores que usamos en Nova para nuestras piezas: buen equilibrio entre tiempo, material y resistencia."
          : infill > 50
            ? "Mucho relleno: gana algo de resistencia, pero tarda y gasta bastante más. Sumar paredes suele ayudar más."
            : walls === 1
              ? "Con una sola pared la pieza queda frágil. Usa 2 o 3."
              : "Compara con lo recomendado para nuestras piezas: 0.2 mm de capa, 2 a 3 paredes y 15 a 20 % de relleno."}
      </p>
    </WidgetCard>
  );
}
