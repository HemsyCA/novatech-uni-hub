import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CircuitBoard, Code2, Cog, Flag, NotebookPen, type LucideIcon } from "lucide-react";
import { useAcademy } from "@/components/academia/academy-context";
import { LessonRow, ProgressBar } from "@/components/academia/ui";
import { courseModules, lessonPath, weeklyPlan, type ModuleId } from "@/lib/academia/course";
import { daysLeft, formatDate } from "@/lib/academy-dates";

const moduleIcons: Record<ModuleId, LucideIcon> = {
  electronica: CircuitBoard,
  mecanica: Cog,
  programacion: Code2,
};

export default function AcademiaHome() {
  const { progress, fichas, activeMembership } = useAcademy();
  const moduleFichas = courseModules.filter((m) => fichas.moduleFicha(m.id)).length;
  const next = progress.nextLesson;
  const started = progress.done > 0;

  const cta = !next
    ? {
        to: "/academia/tarea-final",
        label: "Ir a la tarea final",
        message: "Completaste todas las lecciones. Revisa los criterios y prepara tu entrega.",
      }
    : started
      ? { to: lessonPath(next), label: "Continuar", message: `Siguiente: ${next.code} · ${next.title}` }
      : {
          to: "/academia/guia",
          label: "Empezar",
          message: "Empieza por la guía: te explica cómo funciona esta etapa y qué necesitas.",
        };

  return (
    <div className="space-y-14">
      <section>
        <p className="text-xs uppercase tracking-widest text-white/50">Nivel 0 · Bienvenida</p>
        <h1 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight mt-2">Academia Nova</h1>
        <p className="mt-3 text-sm text-white/60">
          {activeMembership
            ? `${activeMembership.grupo_nombre} · acceso hasta el ${formatDate(activeMembership.ends_at)} · quedan ${daysLeft(activeMembership.ends_at)} día(s)`
            : "Acceso permanente como parte de la directiva."}
        </p>
      </section>

      <section className="rounded-2xl border border-white/20 p-6 md:p-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <h2 className="font-display text-lg font-bold">Tu progreso</h2>
            <span className="text-sm text-white/60">
              {progress.done} de {progress.total} lecciones · {progress.percent}%
            </span>
          </div>
          <ProgressBar value={progress.percent} label="Progreso del curso" />
          <p className="mt-4 text-sm text-white/70">{cta.message}</p>
          <p className="mt-1 text-xs text-white/50">
            Fichas de módulo: {moduleFichas} de {courseModules.length} ·{" "}
            <Link to="/academia/bitacora" className="underline underline-offset-4 hover:text-white">
              ver bitácora
            </Link>
          </p>
        </div>
        <Link
          to={cta.to}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 transition-colors"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-5">Contenido</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/academia/guia" className="group rounded-2xl border border-white/10 p-5 hover:border-white/40 transition-colors">
            <BookOpen className="h-7 w-7 mb-4" />
            <h3 className="font-display font-bold">Guía de inicio</h3>
            <p className="mt-2 text-sm text-white/60">Cómo funciona el Nivel 0, qué necesitas y el Mapa de pines Nova.</p>
          </Link>

          <Link to="/academia/bitacora" className="group rounded-2xl border border-white/10 p-5 hover:border-white/40 transition-colors">
            <NotebookPen className="h-7 w-7 mb-4" />
            <h3 className="font-display font-bold">Bitácora Nova</h3>
            <p className="mt-2 text-sm text-white/60">Una ficha de cuatro preguntas para compartir lo que aprendes.</p>
          </Link>

          {courseModules.map((module) => {
            const Icon = moduleIcons[module.id];
            const required = module.lessons.filter((l) => !l.optional);
            const done = required.filter((l) => progress.completed.has(l.key)).length;
            return (
              <Link
                key={module.id}
                to={`/academia/${module.id}`}
                className="group rounded-2xl border border-white/10 p-5 hover:border-white/40 transition-colors flex flex-col"
              >
                <Icon className="h-7 w-7 mb-4" />
                <h3 className="font-display font-bold">{module.name}</h3>
                <p className="mt-2 text-sm text-white/60 flex-1">{module.summary}</p>
                <p className="mt-4 text-xs text-white/40">
                  {module.tool} · {module.duration} · Ficha del módulo: {fichas.moduleFicha(module.id) ? "lista" : "pendiente"}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={Math.round((done / required.length) * 100)} label={`Progreso de ${module.name}`} />
                  <span className="shrink-0 text-xs text-white/60">
                    {done}/{required.length}
                  </span>
                </div>
              </Link>
            );
          })}

          <Link
            to="/academia/tarea-final"
            className="group rounded-2xl border border-white/10 p-5 hover:border-white/40 transition-colors"
          >
            <Flag className="h-7 w-7 mb-4" />
            <h3 className="font-display font-bold">Tarea final</h3>
            <p className="mt-2 text-sm text-white/60">
              El Panel de control Nova: une electrónica, mecánica y programación en un solo proyecto.
            </p>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold">Plan de 3 semanas</h2>
          <p className="mt-2 text-sm text-white/60">
            Puedes avanzar como prefieras, pero este orden hace que cada tema se apoye en el anterior. P5 usa lo de E2 y P7
            usa lo de E3.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {weeklyPlan.map((week) => (
            <div key={week.title} className="rounded-2xl border border-white/10 p-3">
              <h3 className="px-3 pt-2 pb-3 text-xs uppercase tracking-widest text-white/50">{week.title}</h3>
              <div className="space-y-0.5">
                {week.lessons.map((lesson) => (
                  <LessonRow
                    key={lesson.key}
                    lesson={lesson}
                    done={progress.completed.has(lesson.key)}
                    active={lesson.key === next?.key && started}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/40">Tu progreso se guarda en tu cuenta: puedes continuar desde cualquier dispositivo.</p>
      </section>
    </div>
  );
}
