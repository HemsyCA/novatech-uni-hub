import { Fragment, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Lock } from "lucide-react";
import { lessonPath, type Lesson } from "@/lib/academia/course";
import { moduleAccent } from "@/lib/academia/modules";
import type { LessonState } from "@/lib/academia/path";

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
    >
      <div className="h-full rounded-full bg-[rgb(var(--accent,255_255_255))] transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-white/50">
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 && <ChevronRight className="h-3 w-3" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-white/80">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

export function StatusDot({ done }: { done: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        done ? "border-white bg-white text-black" : "border-white/30"
      }`}
    >
      {done && <Check className="h-3 w-3" strokeWidth={3} />}
      <span className="sr-only">{done ? "Completada" : "Pendiente"}</span>
    </span>
  );
}

const accentStyle = (moduleId: string) => ({ "--accent": moduleAccent(moduleId) }) as CSSProperties;

export function LessonRow({ lesson, state, active = false }: { lesson: Lesson; state: LessonState; active?: boolean }) {
  const content = (
    <>
      {state === "locked" ? (
        <Lock className="h-4 w-4 shrink-0 text-white/30" aria-label="Bloqueada" />
      ) : (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            state === "done"
              ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))] text-black"
              : state === "current"
                ? "border-[rgb(var(--accent))]"
                : "border-white/30"
          }`}
        >
          {state === "done" && <Check className="h-3 w-3" strokeWidth={3} />}
          {state === "current" && <span className="h-2 w-2 rounded-full bg-[rgb(var(--accent))]" />}
          <span className="sr-only">{state === "done" ? "Completada" : state === "current" ? "Actual" : "Pendiente"}</span>
        </span>
      )}
      <span className="w-12 shrink-0 text-xs text-white/40">{lesson.code}</span>
      <span className="flex-1 min-w-0">{lesson.title}</span>
      {lesson.optional && <span className="text-[10px] uppercase tracking-wider text-white/40">Opcional</span>}
    </>
  );

  if (state === "locked") {
    return (
      <div
        style={accentStyle(lesson.moduleId)}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/35"
        title="Se abre cuando completes la lección actual"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={lessonPath(lesson)}
      style={accentStyle(lesson.moduleId)}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {content}
    </Link>
  );
}
