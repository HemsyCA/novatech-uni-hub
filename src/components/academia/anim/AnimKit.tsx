import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { TONE } from "@/components/academia/anim/use-anim";

// Piezas comunes de las animaciones de las lecciones: no son para tocar, muestran la idea en movimiento.
// Todas avanzan con un reloj y, si la persona pidió "reducir movimiento", se quedan quietas en un cuadro claro.

export function AnimCard({ title, children, caption }: { title: string; children: ReactNode; caption?: ReactNode }) {
  return (
    <section className="not-prose my-8 rounded-2xl border border-[rgb(var(--tone,255_255_255)/0.35)] p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--tone,255_255_255))]">
        <Sparkles className="h-4 w-4" aria-hidden /> Así funciona
      </p>
      <h4 className="mt-1 font-semibold text-white">{title}</h4>
      <div className="mt-4">{children}</div>
      {caption && <div className="mt-4 text-sm leading-relaxed text-white/65">{caption}</div>}
    </section>
  );
}

// Una etiqueta que se ilumina cuando está activa (pasos, ramas de un if, etc.).
export function Pill({ on, children, className = "" }: { on: boolean; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs transition-colors duration-300 ${
        on ? "border-[rgb(var(--tone,255_255_255))] bg-[rgb(var(--tone,255_255_255)/0.15)] text-white" : "border-white/15 text-white/45"
      } ${className}`}
    >
      {children}
    </span>
  );
}

// Un LED de 5 mm dibujado dentro de un <svg>. `level` de 0 (apagado) a 1.
export function LedShape({ x, y, level, color = "#f87171", scale = 1 }: { x: number; y: number; level: number; color?: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {level > 0 && <circle cx="0" cy="-6" r={10 + level * 6} fill={color} opacity={0.15 + level * 0.25} style={{ filter: "blur(4px)" }} />}
      <path d="M-7 4 V-6 a7 7 0 0 1 14 0 V4 Z" fill={color} opacity={0.2 + level * 0.8} style={{ transition: "opacity 0.25s" }} />
      <rect x="-8.5" y="4" width="17" height="2.5" rx="1" fill={color} opacity="0.5" />
      <line x1="-3" y1="6.5" x2="-3" y2="16" stroke="#a3a3a3" strokeWidth="1.5" />
      <line x1="3" y1="6.5" x2="3" y2="13" stroke="#a3a3a3" strokeWidth="1.5" />
    </g>
  );
}

// Una línea de código que se ilumina cuando el programa pasa por ella.
export function CodeRow({ on, children, indent = 0 }: { on: boolean; children: ReactNode; indent?: number }) {
  return (
    <div
      className={`rounded px-2 py-0.5 font-mono text-[12px] leading-5 transition-colors duration-200 ${
        on ? "bg-[rgb(var(--tone,255_255_255)/0.2)] text-white" : "text-white/55"
      }`}
      style={{ paddingLeft: 8 + indent * 16 }}
    >
      {children}
    </div>
  );
}

// Puntitos que avanzan por un camino: la corriente, los datos, el agua.
export function FlowDots({ path, count = 6, duration = 2, color = TONE, radius = 2.5, still = false }: {
  path: string;
  count?: number;
  duration?: number;
  color?: string;
  radius?: number;
  still?: boolean;
}) {
  if (still) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} r={radius} fill={color}>
          <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${-(duration / count) * i}s`} path={path} />
        </circle>
      ))}
    </>
  );
}
