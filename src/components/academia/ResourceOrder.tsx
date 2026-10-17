import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import type { StageStatus } from "@/lib/account/journey";

// Los recursos de la Academia en el orden en que se usan:
// la guía antes de empezar, la bitácora mientras avanzas y la tarea final al terminar.

export interface ResourceStep {
  to: string;
  when: string;
  title: string;
  detail: string;
  status: StageStatus;
}

function Badge({ number, status }: { number: number; status: StageStatus }) {
  return (
    <span
      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
        status === "done"
          ? "border-white bg-white text-black"
          : status === "current"
            ? "border-white bg-black text-white ring-4 ring-white/15"
            : "border-white/20 bg-black text-white/40"
      }`}
    >
      {status === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : number}
    </span>
  );
}

export function ResourceOrder({ steps, title = "Tus recursos, en orden" }: { steps: ResourceStep[]; title?: string }) {
  return (
    <section aria-label={title}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">{title}</h2>
      <ol className="grid gap-2 md:grid-cols-3 md:gap-3">
        {steps.map((step, index) => (
          <li key={step.to} className="relative">
            {index < steps.length - 1 && (
              <>
                {/* Conector: hacia abajo en el celular, hacia la derecha en computadora. */}
                <span aria-hidden className="absolute left-[32px] top-12 h-[calc(100%-1.5rem)] w-0.5 bg-white/15 md:hidden" />
                <ArrowRight aria-hidden className="absolute -right-3 top-1/2 z-10 hidden h-3 w-3 -translate-y-1/2 text-white/30 md:block" />
              </>
            )}
            <Link
              to={step.to}
              className={`group flex h-full items-center gap-3 rounded-xl border px-4 py-3 transition-colors md:items-start ${
                step.status === "current" ? "border-white/40 bg-white/[0.04]" : "border-white/10 hover:border-white/30"
              }`}
            >
              <Badge number={index + 1} status={step.status} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-widest text-white/40">{step.when}</span>
                <span className="block text-sm font-semibold">{step.title}</span>
                <span className="block text-xs text-white/50 first-letter:uppercase">{step.detail}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 self-center text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
