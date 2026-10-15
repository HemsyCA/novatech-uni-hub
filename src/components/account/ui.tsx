import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Piezas comunes de las páginas de la cuenta, para que todas se lean igual.

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export interface PageTab {
  id: string;
  label: string;
  to: string;
  count?: number;
}

// Pestañas que viven en la URL (?vista=...), así un enlace o un aviso puede abrir la correcta.
export function PageTabs({ tabs, active }: { tabs: PageTab[]; active: string }) {
  return (
    <nav aria-label="Vistas" className="flex gap-1 overflow-x-auto border-b border-white/10">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            to={tab.to}
            replace
            aria-current={isActive ? "page" : undefined}
            className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors ${
              isActive ? "border-white text-white" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {tab.label}
            {!!tab.count && <span className="rounded-full bg-white/15 px-1.5 text-[11px] text-white">{tab.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export type StatusTone = "neutral" | "progress" | "done" | "attention" | "off";

const TONES: Record<StatusTone, string> = {
  neutral: "border-white/25 text-white/70",
  progress: "border-white/40 text-white",
  done: "border-white bg-white text-black",
  attention: "border-nova bg-nova/15 text-white",
  off: "border-white/10 text-white/40 line-through",
};

// La misma píldora para pedidos, reservas, tareas y aportes.
export function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] ${TONES[tone]}`}>{children}</span>;
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-5 py-10 text-center">
      <p className="text-sm text-white/50">{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
