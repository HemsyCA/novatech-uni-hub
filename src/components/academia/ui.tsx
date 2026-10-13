import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import { lessonPath, type Lesson } from "@/lib/academia/course";

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
      <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${value}%` }} />
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

export function LessonRow({ lesson, done, active = false }: { lesson: Lesson; done: boolean; active?: boolean }) {
  return (
    <Link
      to={lessonPath(lesson)}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <StatusDot done={done} />
      <span className="w-12 shrink-0 text-xs text-white/40">{lesson.code}</span>
      <span className="flex-1 min-w-0">{lesson.title}</span>
      {lesson.optional && <span className="text-[10px] uppercase tracking-wider text-white/40">Opcional</span>}
    </Link>
  );
}
