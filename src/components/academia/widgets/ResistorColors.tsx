import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

// El código de colores de una resistencia de 4 bandas y sus dos tamaños más comunes.

interface Color {
  name: string;
  hex: string;
  digit?: number;
  multiplier?: number;
  tolerance?: string;
}

const COLORS: Color[] = [
  { name: "Negro", hex: "#141414", digit: 0, multiplier: 1 },
  { name: "Marrón", hex: "#7b4a26", digit: 1, multiplier: 10, tolerance: "±1 %" },
  { name: "Rojo", hex: "#d32f2f", digit: 2, multiplier: 100, tolerance: "±2 %" },
  { name: "Naranja", hex: "#f57c00", digit: 3, multiplier: 1_000 },
  { name: "Amarillo", hex: "#fdd835", digit: 4, multiplier: 10_000 },
  { name: "Verde", hex: "#2e9d4b", digit: 5, multiplier: 100_000 },
  { name: "Azul", hex: "#1e63c8", digit: 6, multiplier: 1_000_000 },
  { name: "Violeta", hex: "#7e3fb5", digit: 7 },
  { name: "Gris", hex: "#8a8a8a", digit: 8 },
  { name: "Blanco", hex: "#f2f2f2", digit: 9 },
  { name: "Dorado", hex: "#c9a227", multiplier: 0.1, tolerance: "±5 %" },
  { name: "Plateado", hex: "#c0c0c0", multiplier: 0.01, tolerance: "±10 %" },
];

const byName = (name: string) => COLORS.find((c) => c.name === name)!;

const BANDS = [
  { label: "1.ª cifra", options: COLORS.filter((c) => c.digit !== undefined && c.digit > 0) },
  { label: "2.ª cifra", options: COLORS.filter((c) => c.digit !== undefined) },
  { label: "Multiplicador", options: COLORS.filter((c) => c.multiplier !== undefined) },
  { label: "Tolerancia", options: COLORS.filter((c) => c.tolerance !== undefined) },
];

const CHALLENGES = [
  { ohms: 220, why: "la de los LEDs de Nova" },
  { ohms: 10_000, why: "el pull-down del botón" },
  { ohms: 330, why: "otro valor común para LEDs" },
  { ohms: 4_700, why: "muy usada con sensores" },
  { ohms: 1_000, why: "1 kΩ, de las más comunes" },
];

// Medidas reales aproximadas de una resistencia de película de carbón.
const SIZES = {
  "1/8": { label: "1/8 W", watts: 0.125, length: 3.4, diameter: 1.8 },
  "1/4": { label: "1/4 W", watts: 0.25, length: 6.3, diameter: 2.4 },
} as const;
type SizeId = keyof typeof SIZES;

const LED_POWER = 0.0077; // la potencia que disipa la resistencia del LED de E1 (ver «Potencia»)

const formatOhms = (value: number) => {
  const clean = (n: number) => String(+n.toFixed(2)).replace(".", ",");
  if (value >= 1_000_000) return `${clean(value / 1_000_000)} MΩ`;
  if (value >= 1_000) return `${clean(value / 1_000)} kΩ`;
  return `${clean(value)} Ω`;
};

// ---------------------------------------------------------------- dibujo de la resistencia

const MM = 20; // píxeles por milímetro, igual para los dos tamaños: así se comparan de verdad

function ResistorDrawing({ bands, size }: { bands: Color[]; size: SizeId }) {
  const { length, diameter } = SIZES[size];
  const width = 300;
  const height = 80;
  const bodyW = length * MM;
  const bodyH = diameter * MM;
  const x = (width - bodyW) / 2;
  const y = (height - bodyH) / 2;
  // Posición de las bandas a lo largo del cuerpo; la de tolerancia va separada.
  const positions = [0.22, 0.36, 0.5, 0.78];
  const bandW = Math.max(bodyW * 0.07, 4);

  return (
    <svg viewBox={`0 0 ${width} ${height + 26}`} className="w-full max-w-md" role="img" aria-label={`Resistencia de ${SIZES[size].label}`}>
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#9ca3af" strokeWidth="3" />
      <rect x={x} y={y} width={bodyW} height={bodyH} rx={bodyH / 2.4} fill="#d8b98a" />
      {bands.map((band, index) => (
        <rect
          key={index}
          x={x + bodyW * positions[index] - bandW / 2}
          y={y}
          width={bandW}
          height={bodyH}
          fill={band.hex}
          stroke={band.name === "Negro" ? "#3f3f3f" : "none"}
        />
      ))}
      {/* Regla de 10 mm para ver el tamaño real */}
      <g transform={`translate(${(width - 10 * MM) / 2}, ${height + 8})`}>
        <line x1="0" y1="0" x2={10 * MM} y2="0" stroke="rgba(255,255,255,0.4)" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={i * MM} y1="0" x2={i * MM} y2={i % 5 === 0 ? 7 : 4} stroke="rgba(255,255,255,0.4)" />
        ))}
        <text x={10 * MM + 6} y="9" fill="rgba(255,255,255,0.5)" fontSize="10">
          10 mm
        </text>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------- el apoyo completo

export function ResistorColors() {
  const [bands, setBands] = useState<Color[]>([byName("Marrón"), byName("Negro"), byName("Negro"), byName("Dorado")]);
  const [size, setSize] = useState<SizeId>("1/4");
  const [challenge, setChallenge] = useState(0);
  const [solved, setSolved] = useState<Set<number>>(new Set());

  const value = ((bands[0].digit ?? 0) * 10 + (bands[1].digit ?? 0)) * (bands[2].multiplier ?? 1);
  const target = CHALLENGES[challenge];
  const matches = Math.abs(value - target.ohms) < 0.001;
  const allSolved = solved.size === CHALLENGES.length;

  const pick = (index: number, color: Color) => {
    const next = bands.map((band, i) => (i === index ? color : band));
    setBands(next);
    const nextValue = ((next[0].digit ?? 0) * 10 + (next[1].digit ?? 0)) * (next[2].multiplier ?? 1);
    if (Math.abs(nextValue - target.ohms) < 0.001) setSolved((current) => new Set(current).add(challenge));
  };

  return (
    <WidgetCard icon={Palette} title="El código de colores de una resistencia">
      <div className="space-y-6">
        {/* El tamaño */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/50">Tamaño:</span>
          {(Object.keys(SIZES) as SizeId[]).map((id) => (
            <Choice key={id} selected={size === id} onClick={() => setSize(id)}>
              {SIZES[id].label}
            </Choice>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-4">
          <ResistorDrawing bands={bands} size={size} />
          <p className="font-display text-3xl font-black">{formatOhms(value)}</p>
          <p className="text-xs text-white/55">
            {bands.map((b) => b.name).join(" · ")} · tolerancia {bands[3].tolerance}
          </p>
        </div>

        {/* Las bandas */}
        <div className="space-y-3">
          {BANDS.map((band, index) => (
            <div key={band.label}>
              <p className="mb-1.5 text-xs text-white/50">
                Banda {index + 1} · {band.label}
                {index < 3 && (
                  <span className="text-white/35">
                    {" "}
                    ({index < 2 ? `vale ${bands[index].digit}` : `× ${formatOhms(bands[2].multiplier ?? 1).replace(/ ?Ω$/, "")}`})
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {band.options.map((color) => {
                  const selected = bands[index].name === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => pick(index, color)}
                      aria-pressed={selected}
                      title={`${color.name}${index < 2 ? ` = ${color.digit}` : index === 2 ? ` = × ${color.multiplier}` : ` = ${color.tolerance}`}`}
                      className={`h-8 w-8 rounded-lg border-2 transition-transform ${selected ? "scale-110 border-white" : "border-white/10 hover:border-white/40"}`}
                      style={{ background: color.hex }}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Feedback tone="info">
          Se lee desde la banda que está más lejos de la dorada o plateada: <strong>cifra, cifra, multiplicador</strong>. Por ejemplo,
          rojo-rojo-marrón = 2, 2 y × 10 = <strong>220 Ω</strong>.
        </Feedback>

        {/* Retos */}
        <div className="rounded-xl border border-white/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Reto: arma estas resistencias</p>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">
              {solved.size}/{CHALLENGES.length}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CHALLENGES.map((c, index) => (
              <button
                key={c.ohms}
                type="button"
                onClick={() => setChallenge(index)}
                aria-pressed={challenge === index}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
                  challenge === index ? "border-[rgb(var(--tone,255_255_255))] text-white" : "border-white/15 text-white/60"
                }`}
              >
                {solved.has(index) && <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />}
                {formatOhms(c.ohms)}
              </button>
            ))}
          </div>
          <div className="mt-3">
            {matches ? (
              <Feedback tone="ok">
                ¡Bien! Esa es {formatOhms(target.ohms)}, {target.why}.{" "}
                {allSolved ? "Completaste todos los retos." : "Elige otro valor de arriba."}
              </Feedback>
            ) : (
              <Feedback tone="info">
                Arma una de <strong>{formatOhms(target.ohms)}</strong> ({target.why}). Ahora tienes {formatOhms(value)}.
              </Feedback>
            )}
          </div>
        </div>

        {/* Potencia según el tamaño */}
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(SIZES) as SizeId[]).map((id) => (
            <div key={id} className={`rounded-xl px-4 py-3 ${size === id ? "bg-[rgb(var(--tone,255_255_255)/0.12)]" : "bg-white/[0.04]"}`}>
              <p className="text-xs text-white/50">{SIZES[id].label}</p>
              <p className="mt-1 text-sm text-white/85">
                Aguanta hasta <strong>{String(SIZES[id].watts).replace(".", ",")} W</strong>. Mide unos{" "}
                {String(SIZES[id].length).replace(".", ",")} mm de largo.
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-white/60">
          En el LED de esta lección la resistencia disipa unos {String(LED_POWER).replace(".", ",")} W: cualquiera de las dos aguanta de sobra. La de
          1/4 W es la más común; la de 1/8 W es más pequeña y sirve cuando falta espacio. El tamaño no cambia su valor en ohmios, solo
          cuánto calor aguanta.
        </p>
      </div>
    </WidgetCard>
  );
}
