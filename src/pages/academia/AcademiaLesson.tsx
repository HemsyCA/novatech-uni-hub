import { useEffect } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import { useAcademy, useCanAccessPart2 } from "@/components/academia/academy-context";
import { Markdown } from "@/components/academia/Markdown";
import { Breadcrumbs, LessonRow } from "@/components/academia/ui";
import { LessonFichas } from "@/components/academia/LessonFichas";
import { Part2Locked } from "@/components/academia/Part2Locked";
import { PracticaCard } from "@/components/academia/PracticaCard";
import { getLesson, getModule, lessonPath, type CourseModule } from "@/lib/academia/course";

// En esta lección el convocado ve la fecha de su práctica presencial.
const PRACTICE_LESSON_KEY = "soldadura/s5";

function LessonIndex({ module, activeKey }: { module: CourseModule; activeKey: string }) {
  const { progress } = useAcademy();
  return (
    <div className="space-y-0.5">
      {module.lessons.map((lesson) => (
        <LessonRow
          key={lesson.key}
          lesson={lesson}
          done={progress.completed.has(lesson.key)}
          active={lesson.key === activeKey}
        />
      ))}
    </div>
  );
}

export default function AcademiaLesson() {
  const { moduleId, lessonId } = useParams();
  const { progress, fichas, practica } = useAcademy();
  const module = getModule(moduleId);
  const canAccessPart2 = useCanAccessPart2();
  const lesson = getLesson(moduleId, lessonId);

  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }));
    return () => cancelAnimationFrame(frame);
  }, [moduleId, lessonId, hash]);

  if (!module || !lesson) return <Navigate to={module ? `/academia/${module.id}` : "/academia"} replace />;
  if (module.id === "soldadura" && !canAccessPart2) return <Part2Locked />;

  const index = module.lessons.findIndex((l) => l.key === lesson.key);
  const previous = module.lessons[index - 1];
  const following = module.lessons[index + 1];
  const isDone = progress.completed.has(lesson.key);
  const needsModuleFicha = lesson.isTask && !isDone && !fichas.moduleFicha(lesson.moduleId);
  const pendingAfter = progress.nextLesson && progress.nextLesson.key !== lesson.key ? progress.nextLesson : null;
  const doneInModule = module.lessons.filter((l) => !l.optional && progress.completed.has(l.key)).length;
  const requiredInModule = module.lessons.filter((l) => !l.optional).length;

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <Link to={`/academia/${module.id}`} className="block px-3 mb-1 font-display font-bold hover:underline underline-offset-4">
            {module.name}
          </Link>
          <p className="px-3 mb-4 text-xs text-white/50">
            {doneInModule} de {requiredInModule} completadas
          </p>
          <LessonIndex module={module} activeKey={lesson.key} />
        </div>
      </aside>

      <article className="min-w-0 max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "Academia", to: "/academia" },
            { label: module.name, to: `/academia/${module.id}` },
            { label: lesson.code },
          ]}
        />

        <details className="group lg:hidden mb-8 rounded-xl border border-white/15">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm">
            <span>
              Lecciones de {module.name} · {doneInModule}/{requiredInModule}
            </span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-white/10 p-2">
            <LessonIndex module={module} activeKey={lesson.key} />
          </div>
        </details>

        <p className="text-xs uppercase tracking-widest text-white/50">
          {lesson.isTask ? "Tarea final" : `${module.name} · ${lesson.code}`}
          {lesson.optional && " · Opcional"}
        </p>
        <h1 className="font-display text-2xl md:text-4xl font-black tracking-tight mt-2 mb-8">{lesson.title}</h1>

        <Markdown>{lesson.content}</Markdown>

        {lesson.key === PRACTICE_LESSON_KEY && (
          <div className="mt-10">
            <PracticaCard practica={practica.practica} />
          </div>
        )}

        <LessonFichas lesson={lesson} />

        <div className="mt-14 rounded-2xl border border-white/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{isDone ? "Lección completada" : "¿Terminaste esta lección?"}</p>
            <p className="text-sm text-white/60">
              {isDone
                ? pendingAfter
                  ? `Te recomendamos seguir con ${pendingAfter.code} · ${pendingAfter.title}.`
                  : "Ya completaste todas las lecciones del plan."
                : needsModuleFicha
                  ? "Para completar esta parte, primero guarda la ficha del módulo."
                  : "Márcala cuando hayas revisado el checklist “Puedo continuar si…”."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => progress.toggle(lesson.key)}
              aria-pressed={isDone}
              disabled={needsModuleFicha}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-colors ${
                isDone ? "border border-white/30 text-white hover:bg-white/10" : "bg-white text-black hover:bg-white/90"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <Check className="h-4 w-4" />
              {isDone ? "Desmarcar" : "Marcar como completada"}
            </button>
            {isDone && pendingAfter && (
              <Link
                to={lessonPath(pendingAfter)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-black hover:bg-white/90 transition-colors"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <nav aria-label="Lecciones del módulo" className="mt-6 grid grid-cols-2 gap-3">
          {previous ? (
            <Link to={lessonPath(previous)} className="group rounded-xl border border-white/10 p-4 hover:border-white/40 transition-colors">
              <span className="flex items-center gap-1 text-xs text-white/50">
                <ArrowLeft className="h-3 w-3" /> Anterior
              </span>
              <span className="mt-1 block text-sm text-white">
                {previous.code} · {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {following ? (
            <Link
              to={lessonPath(following)}
              className="group rounded-xl border border-white/10 p-4 text-right hover:border-white/40 transition-colors"
            >
              <span className="flex items-center justify-end gap-1 text-xs text-white/50">
                Siguiente <ArrowRight className="h-3 w-3" />
              </span>
              <span className="mt-1 block text-sm text-white">
                {following.code} · {following.title}
              </span>
            </Link>
          ) : (
            <Link
              to="/academia"
              className="group rounded-xl border border-white/10 p-4 text-right hover:border-white/40 transition-colors"
            >
              <span className="flex items-center justify-end gap-1 text-xs text-white/50">
                Fin del módulo <ArrowRight className="h-3 w-3" />
              </span>
              <span className="mt-1 block text-sm text-white">Volver al plan</span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
