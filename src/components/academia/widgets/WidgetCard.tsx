import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// Marco común de los apoyos interactivos: toman el color del módulo (--accent).
export function WidgetCard({
  icon: Icon,
  label = "Pruébalo tú",
  title,
  children,
}: {
  icon: LucideIcon;
  label?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="not-prose my-8 rounded-2xl border border-[rgb(var(--accent,255_255_255)/0.4)] p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--accent,255_255_255))]">
        <Icon className="h-4 w-4" aria-hidden /> {label}
      </p>
      <h4 className="mt-1 font-semibold text-white">{title}</h4>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
        selected
          ? "border-[rgb(var(--accent,255_255_255))] bg-[rgb(var(--accent,255_255_255)/0.12)] text-white"
          : "border-white/15 text-white/70 hover:border-white/35"
      }`}
    >
      {children}
    </button>
  );
}

// Un LED de 5 mm visto de frente. "brightness" va de 0 (apagado) a 1 (máximo).
export function LedIcon({ color, brightness, label }: { color: string; brightness: number; label?: string }) {
  return (
    <svg viewBox="0 0 60 80" className="h-16 w-12" role="img" aria-label={label ?? (brightness > 0 ? "LED encendido" : "LED apagado")}>
      {brightness > 0 && <circle cx="30" cy="28" r={14 + brightness * 12} fill={color} opacity={0.15 + brightness * 0.35} style={{ filter: "blur(8px)" }} />}
      <path d="M18 44 V26 a12 12 0 0 1 24 0 V44 Z" fill={color} opacity={0.2 + brightness * 0.8} />
      <rect x="16" y="44" width="28" height="4" rx="1" fill={color} opacity="0.5" />
      <line x1="25" y1="48" x2="25" y2="78" stroke="#a3a3a3" strokeWidth="2" />
      <line x1="35" y1="48" x2="35" y2="70" stroke="#a3a3a3" strokeWidth="2" />
    </svg>
  );
}

// Una línea de código con el valor resaltado; se usa para mostrar la instrucción que corresponde a lo que se ve.
export function CodeLine({ children }: { children: ReactNode }) {
  return <code className="block overflow-x-auto rounded-lg bg-white/[0.04] px-3 py-2 text-[13px] text-white/85">{children}</code>;
}

export function Feedback({ tone, children }: { tone: "ok" | "error" | "info"; children: ReactNode }) {
  const styles = {
    ok: "bg-emerald-400/10 text-emerald-100",
    error: "bg-rose-400/10 text-rose-100",
    info: "bg-white/[0.05] text-white/75",
  };
  return (
    <p className={`rounded-xl px-4 py-3 text-sm ${styles[tone]}`} aria-live="polite">
      {children}
    </p>
  );
}
