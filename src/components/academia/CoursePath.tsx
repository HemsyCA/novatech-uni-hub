import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, CircuitBoard, Code2, Cog, Flag, Lock, type LucideIcon } from "lucide-react";
import { useAcademy, useLessonState } from "@/components/academia/academy-context";
import { lessonPath, weeklyPlan, type Lesson } from "@/lib/academia/course";
import { moduleAccent, moduleName } from "@/lib/academia/modules";
import { currentWeekIndex, type LessonState } from "@/lib/academia/path";

const moduleIcons: Record<string, LucideIcon> = {
  electronica: CircuitBoard,
  mecanica: Cog,
  programacion: Code2,
};

function Node({ lesson, state }: { lesson: Lesson; state: LessonState }) {
  const Icon = lesson.isTask ? Flag : moduleIcons[lesson.moduleId];
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      {state === "current" && (
        <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--tone)/0.35)] motion-reduce:animate-none" />
      )}
      <span
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 ${
          state === "done"
            ? "border-[rgb(var(--tone))] bg-[rgb(var(--tone))] text-black"
            : state === "current"
              ? "border-[rgb(var(--tone))] bg-black text-[rgb(var(--tone))]"
              : state === "open"
                ? "border-[rgb(var(--tone)/0.6)] bg-black text-[rgb(var(--tone))]"
                : "border-white/10 bg-white/[0.03] text-white/25"
        }`}
      >
        {state === "done" ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : state === "locked" ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </span>
    </span>
  );
}

function PathStep({
  lesson,
  state,
  isLast,
  nextDone,
}: {
  lesson: Lesson;
  state: LessonState;
  isLast: boolean;
  nextDone: boolean;
}) {
  const label = (
    <span className="min-w-0 flex-1">
      <span
        className={`block text-[11px] uppercase tracking-widest ${
          state === "locked" ? "text-white/25" : "text-[rgb(var(--tone))]"
        }`}
      >
        {lesson.code} · {moduleName(lesson.moduleId)}
      </span>
      <span className={`block text-sm ${state === "locked" ? "text-white/35" : "text-white"}`}>{lesson.title}</span>
    </span>
  );

  return (
    <li style={{ "--tone": moduleAccent(lesson.moduleId) } as CSSProperties} className="relative flex gap-4 pb-3">
      {!isLast && (
        <span
          aria-hidden
          className={`absolute left-[21px] top-11 h-[calc(100%-2.75rem)] w-0.5 ${
            state === "done" && nextDone ? "bg-[rgb(var(--tone)/0.6)]" : "bg-white/10"
          }`}
        />
      )}
      <Node lesson={lesson} state={state} />
      {state === "current" ? (
        <Link
          to={lessonPath(lesson)}
          className="group -mt-1 flex flex-1 flex-col gap-2 rounded-2xl border border-[rgb(var(--tone)/0.6)] bg-[rgb(var(--tone)/0.08)] p-4"
        >
          <span className="min-w-0 flex-1">
            <span className="mb-1 inline-block rounded-full bg-[rgb(var(--tone))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
              Estás aquí
            </span>
            {label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--tone))]">
            Continuar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ) : state === "locked" ? (
        <div className="flex min-h-11 flex-1 items-center" title="Se abre cuando completes la lección actual">
          {label}
        </div>
      ) : (
        <Link
          to={lessonPath(lesson)}
          className="flex min-h-11 flex-1 items-center rounded-xl px-3 -mx-3 transition-colors hover:bg-white/[0.05]"
        >
          {label}
        </Link>
      )}
    </li>
  );
}

export function CoursePath() {
  const { progress } = useAcademy();
  const stateOf = useLessonState();
  // Se muestra una semana a la vez; empieza en la que toca cursar.
  const [selected, setSelected] = useState(() => currentWeekIndex(progress.nextLesson));
  const week = weeklyPlan[selected];
  const done = week.lessons.filter((l) => progress.completed.has(l.key)).length;

  return (
    <div>
      <div role="tablist" aria-label="Semanas del curso" className="mb-4 flex flex-wrap gap-2">
        {weeklyPlan.map((w, index) => {
          const weekDone = w.lessons.filter((l) => progress.completed.has(l.key)).length;
          const active = index === selected;
          return (
            <button
              key={w.title}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(index)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                active
                  ? "border-nova bg-nova text-white"
                  : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
              }`}
            >
              {w.title}
              <span
                className={`text-xs ${weekDone === w.lessons.length ? "font-semibold text-emerald-500" : active ? "text-white/70" : "text-white/40"}`}
              >
                {weekDone}/{w.lessons.length}
              </span>
            </button>
          );
        })}
      </div>
      <div key={week.title} className="rounded-2xl border border-white/10 p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest">{week.title}</h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs ${
              done === week.lessons.length ? "bg-emerald-400 font-semibold text-black" : "bg-white/10 text-white/60"
            }`}
          >
            {done}/{week.lessons.length}
          </span>
        </div>
        <ol>
          {week.lessons.map((lesson, index) => {
            const following = week.lessons[index + 1];
            return (
              <PathStep
                key={lesson.key}
                lesson={lesson}
                state={stateOf(lesson)}
                isLast={!following}
                nextDone={
                  Boolean(following && progress.completed.has(following.key)) ||
                  following?.key === progress.nextLesson?.key
                }
              />
            );
          })}
        </ol>
      </div>
    </div>
  );
}
