import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Box } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type View = "Top" | "Front" | "Right" | "Iso";

// Rotación de la escena para mirar cada cara de frente.
const VIEWS: Record<View, { x: number; y: number }> = {
  Front: { x: 0, y: 0 },
  Top: { x: -90, y: 0 },
  Right: { x: 0, y: -90 },
  Iso: { x: -30, y: -45 },
};

const SIZE = 120;
const HALF = SIZE / 2;

const FACES: { name: string; transform: string; plane?: View }[] = [
  { name: "Front", transform: `translateZ(${HALF}px)`, plane: "Front" },
  { name: "Back", transform: `rotateY(180deg) translateZ(${HALF}px)` },
  { name: "Right", transform: `rotateY(90deg) translateZ(${HALF}px)`, plane: "Right" },
  { name: "Left", transform: `rotateY(-90deg) translateZ(${HALF}px)` },
  { name: "Top", transform: `rotateX(90deg) translateZ(${HALF}px)`, plane: "Top" },
  { name: "Bottom", transform: `rotateX(-90deg) translateZ(${HALF}px)` },
];

export function ViewCube() {
  const [rotation, setRotation] = useState(VIEWS.Iso);
  const [view, setView] = useState<View | null>("Iso");
  const [seen, setSeen] = useState<Set<View>>(new Set());
  const [dragging, setDragging] = useState(false);
  // Solo se considera arrastre después de moverse unos píxeles; así un toque en una cara sigue siendo un clic.
  const pointer = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const snap = (next: View) => {
    setRotation(VIEWS[next]);
    setView(next);
    if (next !== "Iso") setSeen((current) => new Set(current).add(next));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = { x: event.clientX, y: event.clientY, moved: false };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      start.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    pointer.current = { x: event.clientX, y: event.clientY, moved: true };
    setRotation((r) => ({ x: Math.max(-90, Math.min(90, r.x - dy * 0.5)), y: r.y + dx * 0.5 }));
    setView(null);
  };

  const onPointerEnd = () => {
    pointer.current = null;
    setDragging(false);
  };

  const done = seen.size === 3;

  return (
    <WidgetCard icon={Box} label="Explora en 3D" title="El cubo de vistas">
      <p className="text-sm text-white/60">
        Arrastra para girar (en Onshape es con el botón derecho). Toca una cara del cubo o un botón para mirarla de frente.
      </p>

      <div
        className="mt-4 flex h-56 touch-none select-none items-center justify-center rounded-xl bg-white/[0.03]"
        style={{ perspective: 700 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div
          className="relative"
          style={{
            width: SIZE,
            height: SIZE,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: dragging ? "none" : "transform 0.5s ease",
          }}
        >
          {FACES.map((face) => (
            <button
              key={face.name}
              type="button"
              onClick={() => face.plane && snap(face.plane)}
              style={{ transform: face.transform, backfaceVisibility: "hidden" } as CSSProperties}
              className={`absolute inset-0 flex items-center justify-center border-2 text-sm font-bold ${
                face.plane
                  ? "border-[rgb(var(--tone,255_255_255))] bg-[rgb(var(--tone,255_255_255)/0.2)] text-white"
                  : "border-white/25 bg-white/[0.06] text-white/40"
              }`}
            >
              {face.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["Top", "Front", "Right", "Iso"] as View[]).map((v) => (
          <Choice key={v} selected={view === v} onClick={() => snap(v)}>
            {v === "Iso" ? "Isométrica (tecla F)" : v}
          </Choice>
        ))}
      </div>

      <div className="mt-4">
        {done ? (
          <Feedback tone="ok">
            ¡Viste los tres planos! Top (superior), Front (frontal) y Right (derecho) son los planos sobre los que dibujarás tus
            bocetos.
          </Feedback>
        ) : (
          <Feedback tone="info">
            {view && view !== "Iso" ? `Estás viendo de frente la cara ${view}. ` : view === null ? "Vista libre. " : ""}
            Mira de frente las caras Top, Front y Right ({seen.size} de 3).
          </Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
