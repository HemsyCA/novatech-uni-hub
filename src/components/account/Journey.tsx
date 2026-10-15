import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { moduleAccent } from "@/lib/academia/modules";
import type { JourneyStage, NextStep } from "@/lib/account/journey";

// La acción principal de la pantalla: grande, arriba y con un solo botón.
// Sin lección, la tarjeta usa el morado de Nova (texto blanco); con lección, el color del módulo (texto negro).
const NOVA_ACCENT = "137 84 212";

export function NextStepCard({ step, children }: { step: NextStep; children?: ReactNode }) {
  const accent = step.lesson ? moduleAccent(step.lesson.moduleId) : NOVA_ACCENT;
  const onAccent = step.lesson ? "text-black" : "text-white";
  return (
    <section
      style={{ "--tone": accent } as CSSProperties}
      className="rounded-2xl border border-[rgb(var(--tone)/0.45)] bg-[rgb(var(--tone)/0.07)] p-6 md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--tone))]">{step.eyebrow}</p>
          <h2 className="mt-2 font-display text-2xl font-black leading-tight md:text-3xl first-letter:uppercase">{step.title}</h2>
          {step.description && <p className="mt-2 text-white/70">{step.description}</p>}
        </div>
        {step.cta && (
          <Link
            to={step.cta.to}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--tone))] px-6 py-3.5 font-semibold ${onAccent} transition-transform hover:scale-[1.02]`}
          >
            {step.cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}

function StageNode({ stage }: { stage: JourneyStage }) {
  return (
    <span
      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
        stage.status === "done"
          ? "border-white bg-white text-black"
          : stage.status === "current"
            ? "border-white bg-black text-white ring-4 ring-white/15"
            : "border-white/15 bg-black text-white/30"
      }`}
    >
      {stage.status === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : stage.status === "current" ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
    </span>
  );
}

function StageText({ stage }: { stage: JourneyStage }) {
  return (
    <span className="min-w-0">
      <span className={`block text-sm font-semibold ${stage.status === "pending" ? "text-white/40" : "text-white"}`}>{stage.label}</span>
      <span className={`block text-xs first-letter:uppercase ${stage.status === "current" ? "text-white/70" : "text-white/40"}`}>{stage.detail}</span>
    </span>
  );
}

// Dónde está la persona en el camino a ser miembro: horizontal en computadora, vertical en el celular.
export function JourneyStepper({ stages }: { stages: JourneyStage[] }) {
  const wrap = (stage: JourneyStage, children: ReactNode, className: string) =>
    stage.to && stage.status !== "pending" ? (
      <Link to={stage.to} className={`${className} rounded-xl transition-colors hover:bg-white/[0.05]`}>
        {children}
      </Link>
    ) : (
      <div className={className}>{children}</div>
    );

  return (
    <section aria-label="Tu recorrido en Nova">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Tu recorrido en Nova</h2>

      <ol className="hidden grid-cols-6 md:grid">
        {stages.map((stage, index) => (
          <li key={stage.id} className="relative">
            {index < stages.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[18px] h-0.5 ${
                  stage.status === "done" ? "bg-white" : "bg-white/15"
                }`}
              />
            )}
            {wrap(
              stage,
              <>
                <StageNode stage={stage} />
                <StageText stage={stage} />
              </>,
              "flex flex-col items-center gap-2 px-1 py-2 text-center",
            )}
          </li>
        ))}
      </ol>

      <ol className="md:hidden">
        {stages.map((stage, index) => (
          <li key={stage.id} className="relative">
            {index < stages.length - 1 && (
              <span aria-hidden className={`absolute left-[17px] top-9 h-[calc(100%-1.5rem)] w-0.5 ${stage.status === "done" ? "bg-white" : "bg-white/15"}`} />
            )}
            {wrap(
              stage,
              <>
                <StageNode stage={stage} />
                <StageText stage={stage} />
              </>,
              "flex items-center gap-3 py-1.5",
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
