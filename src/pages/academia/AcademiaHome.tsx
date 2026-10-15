import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CircuitBoard, Code2, Cog, Flag, Flame, Lock, NotebookPen, type LucideIcon } from "lucide-react";
import { useAcademy, useCanAccessPart2 } from "@/components/academia/academy-context";
import { Part2Status } from "@/components/academia/Part2Locked";
import { PracticaCard } from "@/components/academia/PracticaCard";
import { ProgressBar } from "@/components/academia/ui";
import { CoursePath } from "@/components/academia/CoursePath";
import { JourneyStepper, NextStepCard } from "@/components/account/Journey";
import { courseModules, part2Module, type CourseModuleId } from "@/lib/academia/course";
import { moduleAccent } from "@/lib/academia/modules";
import { daysLeft, formatDate } from "@/lib/academy-dates";
import { buildJourney, nextStepFor, type JourneyInput } from "@/lib/account/journey";

const moduleIcons: Record<CourseModuleId, LucideIcon> = {
  electronica: CircuitBoard,
  mecanica: Cog,
  programacion: Code2,
  soldadura: Flame,
};

const ENTREGA_LABEL = { enviada: "en revisión", observada: "con observaciones", aprobada: "aprobada" } as const;

function ResourceLink({ to, icon: Icon, title, detail }: { to: string; icon: LucideIcon; title: string; detail: string }) {
  return (
    <Link to={to} className="group flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 transition-colors hover:border-white/40">
      <Icon className="h-5 w-5 shrink-0 text-white/70" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-white/50">{detail}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
    </Link>
  );
}

export default function AcademiaHome() {
  const { progress, fichas, entrega, practica, activeMembership, isStaff } = useAcademy();
  const moduleFichas = courseModules.filter((m) => fichas.moduleFicha(m.id)).length;
  const canAccessPart2 = useCanAccessPart2();
  const part2Done = part2Module.lessons.filter((l) => progress.completed.has(l.key)).length;
  const estado = entrega.entrega?.estado;

  const journeyInput: JourneyInput = {
    hasAccess: true,
    isStaff,
    isMember: false,
    memberships: [],
    completed: progress.completed,
    done: progress.done,
    total: progress.total,
    nextLesson: progress.nextLesson,
    entrega: entrega.entrega,
    practica: practica.practica,
  };
  const step = nextStepFor(journeyInput);

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <header>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">Academia Nova</h1>
        <p className="mt-1 text-sm text-white/50">
          {activeMembership
            ? `${activeMembership.grupo_nombre} · acceso hasta el ${formatDate(activeMembership.ends_at)} · quedan ${daysLeft(activeMembership.ends_at)} día(s)`
            : "Acceso permanente como parte de la directiva."}
        </p>
      </header>

      <NextStepCard step={step}>
        <div className="flex items-center gap-3">
          <ProgressBar value={progress.percent} label="Progreso de la Parte 1" />
          <span className="shrink-0 text-xs text-white/60">
            Parte 1 · {progress.done}/{progress.total}
          </span>
        </div>
      </NextStepCard>

      {/* El recorrido de la convocatoria vive aquí: es el contexto de quien está en la Academia. */}
      {!isStaff && <JourneyStepper stages={buildJourney(journeyInput)} />}

      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold">Parte 1 · Tu camino</h2>
          <p className="mt-1 text-sm text-white/50">
            Electrónica, programación y mecánica en 3 semanas. Las lecciones se abren en orden; al terminar podrás repasar
            cualquiera.
          </p>
        </div>
        <CoursePath />
        <div className="mt-4 flex flex-wrap gap-2">
          {courseModules.map((module) => {
            const Icon = moduleIcons[module.id];
            const required = module.lessons.filter((l) => !l.optional);
            const done = required.filter((l) => progress.completed.has(l.key)).length;
            return (
              <Link
                key={module.id}
                to={`/academia/${module.id}`}
                style={{ "--tone": moduleAccent(module.id) } as CSSProperties}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[rgb(var(--tone)/0.6)] hover:text-white"
              >
                <Icon className="h-3.5 w-3.5 text-[rgb(var(--tone))]" />
                {module.name} · {done}/{required.length}
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-5 font-display text-xl font-bold">Parte 2 · Soldadura</h2>
        {canAccessPart2 ? (
          <div className="space-y-4">
            <Link
              to="/academia/soldadura"
              style={{ "--tone": moduleAccent("soldadura") } as CSSProperties}
              className="group flex flex-col gap-5 rounded-2xl border border-[rgb(var(--tone)/0.4)] p-6 transition-colors hover:border-[rgb(var(--tone))] sm:flex-row sm:items-center"
            >
              <Flame className="h-8 w-8 shrink-0 text-[rgb(var(--tone))]" />
              <div className="flex-1">
                <p className="text-sm text-white/70">{part2Module.summary}</p>
                <p className="mt-1 text-xs text-white/40">
                  {part2Module.lessons.length} lecciones · {part2Module.tool} · {part2Module.duration}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={Math.round((part2Done / part2Module.lessons.length) * 100)} label="Progreso de la Parte 2" />
                  <span className="shrink-0 text-xs text-white/60">
                    {part2Done}/{part2Module.lessons.length}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 font-semibold">
                Entrar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <PracticaCard practica={practica.practica} />
          </div>
        ) : (
          <div className="flex gap-4 rounded-2xl border border-dashed border-white/15 p-6">
            <Lock className="h-6 w-6 shrink-0 text-white/40" />
            <div>
              <p className="text-sm text-white/70">Soldadura THT y SMD, y después una práctica presencial con tu propio kit.</p>
              <p className="mt-2 text-sm text-white/50">
                <Part2Status />
              </p>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Recursos</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <ResourceLink to="/academia/guia" icon={BookOpen} title="Guía de inicio" detail="Cómo funciona y el Mapa de pines Nova" />
          <ResourceLink
            to="/academia/bitacora"
            icon={NotebookPen}
            title="Bitácora Nova"
            detail={`Fichas de módulo: ${moduleFichas} de ${courseModules.length}`}
          />
          <ResourceLink
            to="/academia/tarea-final"
            icon={Flag}
            title="Tarea final"
            detail={estado ? `Tu entrega está ${ENTREGA_LABEL[estado]}` : "El Panel de control Nova"}
          />
        </div>
      </section>
    </div>
  );
}
