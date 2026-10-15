import { useEffect, type CSSProperties } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";
import { useAcademy, useCanAccessPart2, useLessonState } from "@/components/academia/academy-context";
import { Breadcrumbs, LessonRow } from "@/components/academia/ui";
import { Part2Locked } from "@/components/academia/Part2Locked";
import { PracticaCard } from "@/components/academia/PracticaCard";
import { SteppedLesson } from "@/components/academia/SteppedLesson";
import { getLesson, getModule, lessonPath, type CourseModule, type Lesson } from "@/lib/academia/course";
import { moduleAccent } from "@/lib/academia/modules";

// En esta lección el convocado ve la fecha de su práctica presencial.
const PRACTICE_LESSON_KEY = "soldadura/s5";

function LessonIndex({ module, activeKey }: { module: CourseModule; activeKey: string }) {
  const stateOf = useLessonState();
  return (
    <div className="space-y-0.5">
      {module.lessons.map((lesson) => (
        <LessonRow key={lesson.key} lesson={lesson} state={stateOf(lesson)} active={lesson.key === activeKey} />
      ))}
    </div>
  );
}

function LessonLocked({ lesson, current }: { lesson: Lesson; current: Lesson | null }) {
  return (
    <div className="max-w-xl mx-auto rounded-2xl border border-white/15 p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06]">
        <Lock className="h-6 w-6 text-white/60" />
      </span>
      <p className="mt-5 text-xs uppercase tracking-widest text-white/50">{lesson.code} · Todavía bloqueada</p>
      <h1 className="mt-2 font-display text-2xl font-bold">{lesson.title}</h1>
      <p className="mt-3 text-white/60">
        Las lecciones se abren en orden: cada una se apoya en la anterior.
        {current && ` Termina ${current.code} para seguir avanzando.`}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        {current && (
          <Link
            to={lessonPath(current)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition-colors"
          >
            Ir a {current.code} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link to="/academia" className="rounded-xl border border-white/20 px-5 py-3 text-sm hover:bg-white/10 transition-colors">
          Ver mi camino
        </Link>
      </div>
    </div>
  );
}

export default function AcademiaLesson() {
  const { moduleId, lessonId } = useParams();
  const { progress, practica } = useAcademy();
  const module = getModule(moduleId);
  const canAccessPart2 = useCanAccessPart2();
  const stateOf = useLessonState();
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
  if (stateOf(lesson) === "locked") return <LessonLocked lesson={lesson} current={progress.nextLesson} />;

  const doneInModule = module.lessons.filter((l) => !l.optional && progress.completed.has(l.key)).length;
  const requiredInModule = module.lessons.filter((l) => !l.optional).length;

  return (
    <div
      style={{ "--tone": moduleAccent(module.id) } as CSSProperties}
      className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]"
    >
      <aside className="hidden lg:block">
        <div className="sticky top-28">
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

        <SteppedLesson
          lesson={lesson}
          aside={lesson.key === PRACTICE_LESSON_KEY ? <PracticaCard practica={practica.practica} /> : undefined}
        />
      </article>
    </div>
  );
}
