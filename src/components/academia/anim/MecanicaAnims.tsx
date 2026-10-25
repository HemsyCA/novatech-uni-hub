import { AnimCard, Pill } from "@/components/academia/anim/AnimKit";
import { TONE, usePhase, useTick } from "@/components/academia/anim/use-anim";

// Animaciones de Mecánica (M1–M5). Las piezas se dibujan en perspectiva isométrica, como se ven en Onshape.

const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);
// Coordenadas 3D (x hacia la derecha-abajo, y hacia la izquierda-abajo, z hacia arriba) → pantalla.
const iso = (x: number, y: number, z: number, ox = 150, oy = 70) => [ox + (x - y) * C, oy + (x + y) * S - z] as const;
const pts = (list: (readonly [number, number])[]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

// Una caja en isométrico: cara de arriba, cara derecha y cara izquierda.
function IsoBox({
  x = 0,
  y = 0,
  z = 0,
  w,
  d,
  h,
  color = "#94a3b8",
  ox,
  oy,
}: {
  x?: number;
  y?: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  color?: string;
  ox?: number;
  oy?: number;
}) {
  const p = (a: number, b: number, c: number) => iso(a, b, c, ox, oy);
  const top = [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)];
  const right = [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)];
  const left = [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)];
  return (
    <g stroke="rgba(0,0,0,0.35)" strokeWidth="0.8">
      <polygon points={pts(left)} fill={color} style={{ filter: "brightness(0.7)" }} />
      <polygon points={pts(right)} fill={color} style={{ filter: "brightness(0.85)" }} />
      <polygon points={pts(top)} fill={color} />
    </g>
  );
}

// ---------------------------------------------------------------- M1 · CAD paramétrico

export function ParametricCad() {
  const phase = usePhase(2, 2200, 0);
  const width = phase === 0 ? 40 : 70;
  return (
    <AnimCard
      title="Cambias una medida y la pieza se actualiza sola"
      caption="El agujero está definido 'en el centro de la placa'. Si cambias el ancho de 40 a 70 mm, el agujero se mueve solo para seguir centrado: eso es diseño paramétrico."
    >
      <svg viewBox="50 20 170 130" className="mx-auto w-full max-w-xs" aria-label={`Placa de ${width} mm con un agujero centrado`}>
        <IsoBox w={width * 1.4} d={50} h={10} color="#94a3b8" ox={110} oy={50} />
        {(() => {
          const [cx, cy] = iso((width * 1.4) / 2, 25, 10, 110, 50);
          return <ellipse cx={cx} cy={cy} rx="9" ry="5" fill="#1f2937" style={{ transition: "cx 0.6s, cy 0.6s" }} />;
        })()}
        <text x="150" y="140" textAnchor="middle" fontSize="12" fontWeight="700" fill={TONE}>
          ancho = {width} mm
        </text>
      </svg>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- M2 · Herramientas básicas del boceto

export function SketchTools() {
  const phase = usePhase(5, 1800, 4);
  const tools = [
    { name: "Línea", key: "L" },
    { name: "Rectángulo", key: "R" },
    { name: "Círculo", key: "C" },
    { name: "Cota", key: "D" },
    { name: "Construcción", key: "Q" },
  ];
  const draw = (index: number) => ({
    strokeDasharray: 400,
    strokeDashoffset: phase >= index ? 0 : 400,
    transition: "stroke-dashoffset 1.2s ease",
  });
  return (
    <AnimCard title="Las herramientas del boceto, una por una">
      <div className="flex flex-wrap gap-1.5">
        {tools.map((t, i) => (
          <Pill key={t.name} on={i === phase}>
            {t.name} · <span className="font-mono">{t.key}</span>
          </Pill>
        ))}
      </div>
      <svg viewBox="0 0 300 130" className="mt-3 w-full rounded-xl bg-white/[0.03]" aria-label="Boceto en construcción">
        <path d="M20 110 L120 30" fill="none" stroke="white" strokeWidth="2" style={draw(0)} />
        <rect x="140" y="30" width="80" height="60" fill="none" stroke="white" strokeWidth="2" style={draw(1)} />
        <circle cx="180" cy="60" r="16" fill="none" stroke="white" strokeWidth="2" style={draw(2)} />
        {phase >= 3 && (
          <g>
            <line x1="140" y1="104" x2="220" y2="104" stroke={TONE} strokeWidth="1.5" />
            <line x1="140" y1="98" x2="140" y2="110" stroke={TONE} />
            <line x1="220" y1="98" x2="220" y2="110" stroke={TONE} />
            <text x="180" y="122" textAnchor="middle" fontSize="11" fill={TONE}>
              80 mm
            </text>
          </g>
        )}
        <line x1="240" y1="20" x2="240" y2="115" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="5 4" style={draw(4)} />
        {phase >= 4 && (
          <text x="246" y="30" fontSize="9" fill="rgba(255,255,255,0.6)">
            guía
          </text>
        )}
      </svg>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- M3 · Extruir: New, Add y Remove

export function Extrude() {
  const { tick, still, restart } = useTick(110);
  const cycle = still ? 60 : tick % 80;
  // 0-25: el rectángulo se estira (New) · 30-50: aparece un agujero (Remove) · 55-75: se agrega un bloque (Add)
  const h = Math.min(20, Math.max(0, cycle) * 0.8);
  const hole = cycle >= 30;
  const add = cycle >= 55 ? Math.min(16, (cycle - 55) * 0.8) : 0;
  const label =
    cycle < 30
      ? "New: el boceto se estira y crea una pieza"
      : cycle < 55
        ? "Remove: un círculo quita material (un agujero)"
        : "Add: otro boceto agrega material encima";
  const [hx, hy] = iso(30, 25, h);
  return (
    <AnimCard onRestart={restart} title="Extruir: estirar un boceto en 3D" caption={label}>
      <svg viewBox="92 22 140 118" className="mx-auto w-full max-w-xs" aria-label={label}>
        {h === 0 ? (
          <polygon points={pts([iso(0, 0, 0), iso(80, 0, 0), iso(80, 50, 0), iso(0, 50, 0)])} fill="none" stroke={TONE} strokeWidth="2" />
        ) : (
          <IsoBox w={80} d={50} h={h} color="#94a3b8" />
        )}
        {hole && <ellipse cx={hx} cy={hy} rx="12" ry="7" fill="#111827" />}
        {add > 0 && <IsoBox x={55} y={10} z={h} w={20} d={30} h={add} color={TONE} />}
      </svg>
      <div className="flex flex-wrap justify-center gap-1.5">
        <Pill on={cycle < 30}>New</Pill>
        <Pill on={cycle >= 30 && cycle < 55}>Remove</Pill>
        <Pill on={cycle >= 55}>Add</Pill>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- M3 · Bocetos sobre caras

export function SketchOnFace() {
  const phase = usePhase(3, 1700, 2);
  const [a, b, c, d] = [iso(15, 12, 10), iso(45, 12, 10), iso(45, 38, 10), iso(15, 38, 10)];
  return (
    <AnimCard
      title="Dibujar sobre la cara de una pieza"
      caption="1. La placa ya existe. 2. Dibujas un rectángulo sobre su cara de arriba. 3. Lo extruyes y la pieza crece por capas."
    >
      <svg viewBox="92 22 140 118" className="mx-auto w-full max-w-xs" aria-label="Boceto sobre la cara superior y extrusión">
        <IsoBox w={80} d={50} h={10} color="#94a3b8" />
        {phase === 1 && (
          <polygon points={pts([a, b, c, d])} fill="rgba(255,255,255,0.12)" stroke={TONE} strokeWidth="2" strokeDasharray="5 3" />
        )}
        {phase === 2 && <IsoBox x={15} y={12} z={10} w={30} d={26} h={24} color={TONE} />}
      </svg>
      <div className="flex flex-wrap justify-center gap-1.5">
        <Pill on={phase === 0}>1 · la placa</Pill>
        <Pill on={phase === 1}>2 · boceto sobre la cara</Pill>
        <Pill on={phase === 2}>3 · extruir encima</Pill>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- M3 · Redondeo y chaflán

export function FilletChamfer() {
  const phase = usePhase(3, 1800, 1);
  const shapes = [
    { name: "Arista viva", d: "M40 120 V40 H160" },
    { name: "Redondeo (Fillet)", d: "M40 120 V80 A40 40 0 0 1 80 40 H160" },
    { name: "Chaflán (Chamfer)", d: "M40 120 V80 L80 40 H160" },
  ];
  return (
    <AnimCard
      title="La misma esquina vista de lado"
      caption="El redondeo convierte la arista en una curva; el chaflán la corta en diagonal."
    >
      <svg viewBox="0 0 200 140" className="mx-auto w-full max-w-xs" aria-label={shapes[phase].name}>
        <path d={`${shapes[phase].d} V120 Z`} fill="#94a3b8" stroke="white" strokeWidth="2" style={{ transition: "d 0.6s" }} />
      </svg>
      <div className="flex flex-wrap justify-center gap-1.5">
        {shapes.map((s, i) => (
          <Pill key={s.name} on={i === phase}>
            {s.name}
          </Pill>
        ))}
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- M4 · Cómo imprime una impresora 3D (FDM)

export function FdmLayers() {
  const { tick, still, restart } = useTick(60);
  const layers = 8;
  const steps = 40;
  const t = still ? layers * steps - 1 : tick % (layers * steps + 30);
  const layer = Math.min(layers - 1, Math.floor(t / steps));
  const progress = t >= layers * steps ? 1 : (t % steps) / steps;
  const forward = layer % 2 === 0;
  const nozzleX = 60 + (forward ? progress : 1 - progress) * 180;
  const y = (i: number) => 116 - i * 9;
  return (
    <AnimCard
      onRestart={restart}
      title="Capa por capa, de abajo hacia arriba"
      caption="La boquilla deposita un hilo de plástico derretido de 0.4 mm. Al terminar una capa sube 0.2 mm y dibuja la siguiente encima."
    >
      <svg viewBox="30 20 270 115" className="mx-auto w-full max-w-md" aria-label={`Imprimiendo la capa ${layer + 1}`}>
        <rect x="40" y="122" width="220" height="8" rx="2" fill="#374151" />
        {Array.from({ length: layer }, (_, i) => (
          <rect key={i} x="60" y={y(i)} width="180" height="8" rx="4" fill={TONE} opacity={0.55 + (i % 2) * 0.15} />
        ))}
        <rect
          x={forward ? 60 : nozzleX}
          y={y(layer)}
          width={Math.abs(nozzleX - 60) * (forward ? 1 : 0) + (forward ? 0 : 240 - nozzleX)}
          height="8"
          rx="4"
          fill={TONE}
        />
        <g transform={`translate(${nozzleX} ${y(layer) - 2})`}>
          <rect x="-12" y="-30" width="24" height="18" rx="2" fill="#9ca3af" />
          <path d="M-6 -12 L6 -12 L2 -2 L-2 -2 Z" fill="#d1d5db" />
        </g>
        <text x="270" y={y(layer) + 7} fontSize="9" fill="white">
          capa {layer + 1}
        </text>
      </svg>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- M4 · La orientación cambia la resistencia

export function LayerOrientation() {
  const phase = usePhase(2, 2400, 1);
  const pulling = phase === 1;
  // Dos barras iguales que se jalan de los extremos; solo cambia la dirección de sus capas.
  const bar = (ox: number, layersAlongPull: boolean) => {
    const gap = pulling && !layersAlongPull ? 6 : 0;
    return (
      <g>
        {layersAlongPull
          ? Array.from({ length: 6 }, (_, i) => <rect key={i} x={ox} y={36 + i * 8} width="110" height="7" rx="3" fill="#94a3b8" />)
          : Array.from({ length: 10 }, (_, i) => (
              <rect
                key={i}
                x={ox + i * 11 + (i >= 5 ? gap : 0)}
                y="36"
                width="10"
                height="47"
                rx="3"
                fill="#94a3b8"
                style={{ transition: "x 0.4s" }}
              />
            ))}
        {pulling && (
          <>
            <path d={`M${ox - 4} 60 H${ox - 22}`} stroke={TONE} strokeWidth="3" markerEnd="url(#pull)" />
            <path d={`M${ox + 114 + gap} 60 H${ox + 132 + gap}`} stroke={TONE} strokeWidth="3" markerEnd="url(#pull)" />
          </>
        )}
      </g>
    );
  };
  return (
    <AnimCard
      title="Jala las dos piezas de los extremos: ¿se separan sus capas?"
      caption="Las capas se pegan entre sí, pero esa unión es lo más débil. Si la fuerza trata de separar las capas, la pieza se rompe con poco. Si va a lo largo de ellas, aguanta mucho más."
    >
      <svg viewBox="0 0 320 110" className="mx-auto w-full max-w-md" aria-label="Dos piezas con capas en distinta dirección">
        <defs>
          <marker id="pull" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill={TONE} />
          </marker>
        </defs>
        {bar(28, true)}
        {bar(182, false)}
        <text x="83" y="104" textAnchor="middle" fontSize="9" fill="#4ade80">
          capas a lo largo: aguanta
        </text>
        <text x="237" y="104" textAnchor="middle" fontSize="9" fill="#f87171">
          capas de través: se separan
        </text>
      </svg>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- M4 · Vaciado (Shell)

export function ShellOperation() {
  const phase = usePhase(2, 2200, 1);
  const hollow = phase === 1;
  const wall = 6;
  const inner = [iso(wall, wall, 30), iso(80 - wall, wall, 30), iso(80 - wall, 50 - wall, 30), iso(wall, 50 - wall, 30)];
  return (
    <AnimCard
      title="Shell: de un bloque sólido a una caja"
      caption="Eliges la cara que se quita (la de arriba) y el espesor de las paredes. El resto queda hueco: así se hace una carcasa en un solo paso."
    >
      <svg viewBox="92 22 140 118" className="mx-auto w-full max-w-xs" aria-label={hollow ? "Caja hueca con paredes" : "Bloque sólido"}>
        <IsoBox w={80} d={50} h={30} color="#94a3b8" />
        {hollow && <polygon points={pts(inner)} fill="#111827" stroke={TONE} strokeWidth="1.5" />}
      </svg>
      <div className="flex flex-wrap justify-center gap-1.5">
        <Pill on={!hollow}>Sólido</Pill>
        <Pill on={hollow}>Después del Shell: paredes de 2 mm</Pill>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- M5 · STL vs STEP

export function StlVsStep() {
  const { tick, still } = useTick(500);
  const sides = still ? 12 : [6, 8, 12, 20][Math.floor(tick / 2) % 4];
  const polygon = Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2;
    return [50 + 38 * Math.cos(a), 50 + 38 * Math.sin(a)] as const;
  });
  return (
    <AnimCard
      title="El mismo agujero en los dos formatos"
      caption="STL describe la superficie con triángulos: un círculo es en realidad un polígono de muchos lados. STEP guarda la curva exacta."
    >
      <div className="grid grid-cols-2 gap-3">
        <figure className="rounded-xl bg-white/[0.03] p-3 text-center">
          <svg viewBox="0 0 100 100" className="mx-auto h-28 w-28" aria-label={`Círculo hecho con ${sides} lados`}>
            <polygon points={pts(polygon)} fill="none" stroke={TONE} strokeWidth="2" />
            {polygon.map(([x, y], i) => (
              <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="rgba(255,255,255,0.15)" />
            ))}
          </svg>
          <figcaption className="text-xs">
            <strong>STL</strong> · {sides} lados
          </figcaption>
        </figure>
        <figure className="rounded-xl bg-white/[0.03] p-3 text-center">
          <svg viewBox="0 0 100 100" className="mx-auto h-28 w-28" aria-label="Círculo exacto">
            <circle cx="50" cy="50" r="38" fill="none" stroke="white" strokeWidth="2" />
          </svg>
          <figcaption className="text-xs">
            <strong>STEP</strong> · curva exacta
          </figcaption>
        </figure>
      </div>
    </AnimCard>
  );
}
