import { useState, type CSSProperties } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCheck,
  Compass,
  Flag,
  Flame,
  Home,
  Lock,
  Menu,
  type LucideIcon,
} from "lucide-react";
import type { AcademyContext } from "@/components/academia/academy-context";
import { lessonPath, part2Module, weeklyPlan, type Lesson } from "@/lib/academia/course";
import { moduleAccent } from "@/lib/academia/modules";
import { currentWeekIndex, lessonState } from "@/lib/academia/path";

const linkBase = "flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors";
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? "bg-white/10 font-semibold text-white" : "text-white/60 hover:bg-white/[0.05] hover:text-white"}`;

function GroupLabel({ children }: { children: string }) {
  return <p className="px-3 pb-1 pt-4 text-[11px] uppercase tracking-widest text-white/35">{children}</p>;
}

function ResourceLink({ to, icon: Icon, label, end }: { to: string; icon: LucideIcon; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={linkClass}>
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  );
}

function LessonLink({
  lesson,
  locked,
  done,
  current,
}: {
  lesson: Lesson;
  locked: boolean;
  done: boolean;
  current: boolean;
}) {
  const inner = (
    <>
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {done ? (
          <Check className="h-4 w-4 text-[rgb(var(--tone))]" strokeWidth={3} />
        ) : locked ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <span
            className={`h-2 w-2 rounded-full ${current ? "bg-[rgb(var(--tone))] ring-4 ring-[rgb(var(--tone)/0.25)]" : "border border-[rgb(var(--tone)/0.7)]"}`}
          />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">
        <span className={locked ? "" : "text-[rgb(var(--tone))]"}>{lesson.code}</span> · {lesson.title}
      </span>
      {lesson.isTask && <Flag className="h-3 w-3 shrink-0 opacity-60" />}
    </>
  );
  const style = { "--tone": moduleAccent(lesson.moduleId) } as CSSProperties;
  if (locked) {
    return (
      <span
        style={style}
        title="Se abre cuando completes la lección actual"
        className={`${linkBase} cursor-not-allowed text-white/25`}
      >
        {inner}
      </span>
    );
  }
  return (
    <NavLink to={lessonPath(lesson)} style={style} className={linkClass}>
      {inner}
    </NavLink>
  );
}

function SidebarNav({ academy }: { academy: AcademyContext }) {
  const { progress, entrega, isStaff } = academy;
  const stateOf = (lesson: Lesson) => lessonState(lesson, progress.completed, progress.nextLesson, isStaff);
  const canAccessPart2 = isStaff || entrega.entrega?.estado === "aprobada";
  const [open, setOpen] = useState<Set<number>>(() => new Set([currentWeekIndex(progress.nextLesson)]));

  const toggle = (index: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(index)) next.add(index);
      return next;
    });

  return (
    <nav aria-label="Menú del curso" className="space-y-0.5">
      <ResourceLink to="/academia" icon={Home} label="Resumen" end />

      <GroupLabel>Recursos</GroupLabel>
      <ResourceLink to="/academia/guia" icon={Compass} label="Ruta de bienvenida" />
      <ResourceLink to="/academia/bitacora" icon={BookOpen} label="Bitácora Nova" />
      <ResourceLink to="/academia/tarea-final" icon={ClipboardCheck} label="Tarea final" />

      <GroupLabel>Parte 1 · Tu camino</GroupLabel>
      {weeklyPlan.map((week, index) => {
        const done = week.lessons.filter((l) => progress.completed.has(l.key)).length;
        const isOpen = open.has(index);
        return (
          <div key={week.title}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(index)}
              className={`${linkBase} w-full text-white/80 hover:bg-white/[0.05]`}
            >
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
              <span className="flex-1 text-left font-semibold">{week.title}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  done === week.lessons.length ? "bg-emerald-400 font-semibold text-black" : "bg-white/10 text-white/60"
                }`}
              >
                {done}/{week.lessons.length}
              </span>
            </button>
            {isOpen && (
              <div className="ml-3 border-l border-white/10 pl-1.5">
                {week.lessons.map((lesson) => {
                  const state = stateOf(lesson);
                  return (
                    <LessonLink
                      key={lesson.key}
                      lesson={lesson}
                      locked={state === "locked"}
                      done={state === "done"}
                      current={state === "current"}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <GroupLabel>Parte 2 · Soldadura</GroupLabel>
      {canAccessPart2 ? (
        <NavLink
          to="/academia/soldadura"
          style={{ "--tone": moduleAccent("soldadura") } as CSSProperties}
          className={linkClass}
        >
          <Flame className="h-4 w-4 shrink-0 text-[rgb(var(--tone))]" />
          <span className="flex-1">Soldadura</span>
          <span className="text-[11px] text-white/50">
            {part2Module.lessons.filter((l) => progress.completed.has(l.key)).length}/{part2Module.lessons.length}
          </span>
        </NavLink>
      ) : (
        <span className={`${linkBase} cursor-not-allowed text-white/25`} title="Se abre al aprobar tu tarea final">
          <Lock className="h-4 w-4 shrink-0" />
          Soldadura
        </span>
      )}
    </nav>
  );
}

// En pantallas grandes es una barra lateral fija; en móvil se pliega en un botón.
export function AcademiaSidebar({ academy }: { academy: AcademyContext }) {
  const { pathname } = useLocation();
  // Se vuelve a montar al cambiar de página para que el menú móvil se cierre solo.
  return (
    <>
      <details key={pathname} className="group rounded-xl border border-white/10 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm text-white/80">
          <Menu className="h-4 w-4" />
          Menú del curso
          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-white/10 p-2">
          <SidebarNav academy={academy} />
        </div>
      </details>
      <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto pr-2 lg:block">
        <SidebarNav academy={academy} />
      </aside>
    </>
  );
}
