import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  FileText,
  ListChecks,
  PencilLine,
  PlayCircle,
  Target,
  TriangleAlert,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useAcademy } from "@/components/academia/academy-context";
import { Markdown } from "@/components/academia/Markdown";
import { LessonFichas } from "@/components/academia/LessonFichas";
import { Quiz } from "@/components/academia/Quiz";
import { ChecklistContext, useChecklistState } from "@/components/academia/checklist-context";
import { ProgressBar } from "@/components/academia/ui";
import { lessonQuizzes } from "@/content/academia/preguntas";
import { lessonPath, part2Module, type Lesson } from "@/lib/academia/course";
import { moduleAccent, moduleName } from "@/lib/academia/modules";
import { checklistItems, estimatedMinutes, lessonSteps, type LessonStep, type StepKind } from "@/lib/academia/steps";

const stepIcons: Record<StepKind, LucideIcon> = {
  intro: Target,
  concepto: BookOpen,
  video: PlayCircle,
  pasos: ListChecks,
  errores: TriangleAlert,
  practica: PencilLine,
  comprueba: Trophy,
  otro: FileText,
};

function StepProgress({ steps, current, onSelect }: { steps: LessonStep[]; current: number; onSelect: (index: number) => void }) {
  return (
    <div className="flex gap-1" role="list" aria-label="Pasos de la lección">
      {steps.map((step, index) => (
        <button
          key={`${step.kind}-${step.title}`}
          type="button"
          role="listitem"
          onClick={() => onSelect(index)}
          aria-label={`Paso ${index + 1}: ${step.title}`}
          aria-current={index === current ? "step" : undefined}
          className="group flex-1 py-2"
        >
          <span
            className={`block h-1.5 rounded-full transition-colors ${
              index < current
                ? "bg-[rgb(var(--tone))]"
                : index === current
                  ? "bg-[rgb(var(--tone)/0.6)]"
                  : "bg-white/10 group-hover:bg-white/25"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function IntroStep({
  step,
  steps,
  minutes,
  isTask,
  aside,
  onStart,
}: {
  step: LessonStep;
  steps: LessonStep[];
  minutes: number;
  isTask: boolean;
  aside?: ReactNode;
  onStart: () => void;
}) {
  return (
    <div className="space-y-4">
      {step.note && <Markdown>{step.note}</Markdown>}
      {aside}
      <div className="rounded-2xl border border-[rgb(var(--tone)/0.4)] bg-[rgb(var(--tone)/0.08)] p-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--tone))]">
          <Target className="h-4 w-4" /> {isTask ? "Tu objetivo" : "Al terminar podrás"}
        </p>
        <p className="mt-3 text-lg leading-relaxed text-white">{step.content.replace(/\*\*/g, "")}</p>
      </div>
      {step.why && (
        <div className="rounded-2xl border border-white/15 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">¿Para qué me sirve?</p>
          <div className="mt-2">
            <Markdown>{step.why}</Markdown>
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-white/15 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{isTask ? "En esta tarea" : "En esta lección"}</p>
          {!isTask && (
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <Clock className="h-3.5 w-3.5" /> unos {minutes} min
            </span>
          )}
        </div>
        <ol className="mt-4 space-y-2">
          {steps.slice(1).map((s, index) => {
            const Icon = stepIcons[s.kind];
            return (
              <li key={`${s.kind}-${s.title}`} className="flex items-center gap-3 text-sm text-white/75">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/60">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-white/35">{index + 1}.</span>
                {s.title}
              </li>
            );
          })}
        </ol>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[rgb(var(--tone))] px-6 py-3.5 font-semibold text-black transition-transform hover:scale-[1.01] sm:w-auto"
      >
        Empezar <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/15 p-5">
      <h3 className="font-semibold">Antes de seguir, ¿puedes hacer esto?</h3>
      <p className="mt-1 text-sm text-white/50">Márcalo para ti. Si algo no te sale, vuelve al paso que lo explica.</p>
      <div className="mt-4 space-y-2">
        {items.map((item, index) => {
          const isChecked = checked.has(index);
          return (
            <button
              key={item}
              type="button"
              aria-pressed={isChecked}
              onClick={() =>
                setChecked((current) => {
                  const next = new Set(current);
                  if (next.has(index)) next.delete(index);
                  else next.add(index);
                  return next;
                })
              }
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                isChecked ? "border-[rgb(var(--tone)/0.5)] bg-[rgb(var(--tone)/0.08)] text-white" : "border-white/15 text-white/75 hover:border-white/30"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  isChecked ? "border-[rgb(var(--tone))] bg-[rgb(var(--tone))] text-black" : "border-white/40"
                }`}
              >
                {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              {item}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// La Parte 1 sigue el camino del plan; la Parte 2 (soldadura) va en el orden de sus lecciones.
function useTrack(lesson: Lesson) {
  const { progress } = useAcademy();
  if (lesson.moduleId === "soldadura") {
    const lessons = part2Module.lessons;
    const done = lessons.filter((l) => progress.completed.has(l.key)).length;
    return {
      summary: `Llevas ${done} de ${lessons.length} lecciones de la Parte 2.`,
      percent: Math.round((done / lessons.length) * 100),
      next: lessons.find((l) => !progress.completed.has(l.key)) ?? null,
      nextLabel: "Siguiente",
      finished: { text: "Completaste la Parte 2. Ya estás listo para la práctica presencial.", to: "/academia", label: "Ver mi práctica" },
    };
  }
  return {
    summary: `Llevas ${progress.done} de ${progress.total} lecciones de la Parte 1.`,
    percent: progress.percent,
    next: progress.nextLesson,
    nextLabel: "Se desbloqueó",
    finished: { text: "Completaste todas las lecciones. Ya puedes preparar tu tarea final.", to: "/academia/tarea-final", label: "Ir a la tarea final" },
  };
}

const CONFETTI_COLORS = ["251 191 36", "34 211 238", "74 222 128", "251 146 60", "244 114 182"];

function Celebration({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const track = useTrack(lesson);
  const reduceMotion = useReducedMotion();
  const next = track.next;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        angle: (i / 28) * Math.PI * 2 + Math.random() * 0.3,
        distance: 120 + Math.random() * 120,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full max-w-md rounded-3xl border border-[rgb(var(--tone)/0.5)] bg-black p-8 text-center"
      >
        {!reduceMotion &&
          pieces.map((piece, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(piece.angle) * piece.distance, y: Math.sin(piece.angle) * piece.distance, opacity: 0, scale: 0.5 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              className="pointer-events-none absolute left-1/2 top-16 rounded-sm"
              style={{ width: piece.size, height: piece.size, background: `rgb(${piece.color})` }}
            />
          ))}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--tone))] text-black"
        >
          <Check className="h-8 w-8" strokeWidth={3} />
        </motion.div>
        <h2 id="celebration-title" className="mt-5 font-display text-2xl font-black">
          ¡{lesson.code} completada!
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {track.summary}
        </p>
        <div className="mt-4">
          <ProgressBar value={track.percent} label="Progreso del curso" />
        </div>

        {next ? (
          <div
            style={{ "--tone": moduleAccent(next.moduleId) } as CSSProperties}
            className="mt-6 rounded-2xl border border-[rgb(var(--tone)/0.4)] bg-[rgb(var(--tone)/0.08)] p-4 text-left"
          >
            <p className="text-xs uppercase tracking-widest text-[rgb(var(--tone))]">
              {track.nextLabel} · {moduleName(next.moduleId)}
            </p>
            <p className="mt-1 font-semibold">
              {next.code} · {next.title}
            </p>
          </div>
        ) : (
          <p className="mt-6 text-sm text-white/70">{track.finished.text}</p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to={next ? lessonPath(next) : track.finished.to}
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 transition-colors"
          >
            {next ? `Ir a ${next.code}` : track.finished.label} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/academia" onClick={onClose} className="rounded-xl px-6 py-3 text-sm text-white/70 hover:text-white transition-colors">
            Volver a mi camino
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckStep({ lesson, step }: { lesson: Lesson; step: LessonStep }) {
  const { progress, fichas } = useAcademy();
  const track = useTrack(lesson);
  const questions = lessonQuizzes[lesson.key];
  const [quizPassed, setQuizPassed] = useState(!questions);
  const [celebrating, setCelebrating] = useState(false);
  const isDone = progress.completed.has(lesson.key);
  const needsModuleFicha = lesson.isTask && !fichas.moduleFicha(lesson.moduleId);
  const canComplete = quizPassed && !needsModuleFicha;
  const onPassedChange = useCallback((passed: boolean) => setQuizPassed(passed), []);

  const complete = async () => {
    setCelebrating(true);
    await progress.toggle(lesson.key);
  };

  return (
    <div className="space-y-6">
      {questions && <Quiz questions={questions} onPassedChange={onPassedChange} />}
      <Checklist items={checklistItems(step.content)} />
      <LessonFichas lesson={lesson} />

      <div
        className={`rounded-2xl border p-5 ${
          isDone ? "border-[rgb(var(--tone)/0.5)] bg-[rgb(var(--tone)/0.08)]" : "border-white/20"
        }`}
      >
        {isDone ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 font-semibold">
              <Check className="h-5 w-5 text-[rgb(var(--tone))]" /> Lección completada
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => progress.toggle(lesson.key)} className="text-xs text-white/50 underline underline-offset-4 hover:text-white">
                Desmarcar
              </button>
              {track.next && (
                <Link
                  to={lessonPath(track.next)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-black hover:bg-white/90 transition-colors"
                >
                  Siguiente: {track.next.code} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/60">
              {needsModuleFicha
                ? "Guarda la ficha del módulo para completar esta parte."
                : quizPassed
                  ? `¡Todo listo! Completa ${lesson.isTask ? "esta parte" : "la lección"} para abrir la siguiente.`
                  : "Responde bien las preguntas de arriba para completar la lección."}
            </p>
            <button
              type="button"
              onClick={complete}
              disabled={!canComplete}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--tone))] px-6 py-3 font-semibold text-black transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 disabled:hover:scale-100"
            >
              <Trophy className="h-4 w-4" /> {lesson.isTask ? "Completar esta parte" : "Completar lección"}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>{celebrating && <Celebration lesson={lesson} onClose={() => setCelebrating(false)} />}</AnimatePresence>
    </div>
  );
}

function StepBody({ lesson, step }: { lesson: Lesson; step: LessonStep }) {
  if (step.kind === "comprueba") return <CheckStep lesson={lesson} step={step} />;
  if (step.kind === "errores") {
    return (
      <div className="rounded-2xl border border-rose-400/30 bg-rose-400/[0.05] px-5 py-1">
        <Markdown>{step.content}</Markdown>
      </div>
    );
  }
  if (step.kind === "practica") {
    return (
      <>
        <p className="mb-2 rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-white/70">
          ✏️ Resuélvelo en tu cuaderno antes de abrir las respuestas. Equivocarse aquí es parte de aprender.
        </p>
        <Markdown>{step.content}</Markdown>
      </>
    );
  }
  return <Markdown>{step.content}</Markdown>;
}

// "aside" se muestra en el primer paso: por ejemplo, la cita de la práctica presencial en S5.
export function SteppedLesson({ lesson, aside }: { lesson: Lesson; aside?: ReactNode }) {
  const steps = useMemo(() => lessonSteps(lesson.content), [lesson.content]);
  const minutes = useMemo(() => estimatedMinutes(lesson.content), [lesson.content]);
  const checklist = useChecklistState(lesson.key);
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = Number(searchParams.get("paso")) - 1;
  const current = Number.isInteger(requested) && requested >= 0 && requested < steps.length ? requested : 0;
  const step = steps[current];
  const Icon = stepIcons[step.kind];
  const conceptIndex = steps.filter((s, i) => s.kind === "concepto" && i <= current).length;
  const conceptCount = steps.filter((s) => s.kind === "concepto").length;

  const goTo = useCallback(
    (index: number) => {
      const target = Math.min(Math.max(index, 0), steps.length - 1);
      setSearchParams(target === 0 ? {} : { paso: String(target + 1) });
    },
    [setSearchParams, steps.length],
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [current]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]") || document.querySelector("[role=dialog]")) return;
      if (event.key === "ArrowRight") goTo(current + 1);
      if (event.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  const previous = steps[current - 1];
  const following = steps[current + 1];

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[rgb(var(--tone))]">
        {lesson.isTask ? `Tarea final · ${moduleName(lesson.moduleId)}` : `${moduleName(lesson.moduleId)} · ${lesson.code}`}
        {lesson.optional && " · Opcional"}
      </p>
      <h1 className="mt-1 font-display text-xl font-black tracking-tight md:text-2xl">{lesson.title}</h1>

      <div className="mt-5">
        <StepProgress steps={steps} current={current} onSelect={goTo} />
        <p className="mt-1 text-xs text-white/50">
          Paso {current + 1} de {steps.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={current}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          {step.kind !== "intro" && (
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--tone)/0.15)] text-[rgb(var(--tone))]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                {step.kind === "concepto" && conceptCount > 1 && (
                  <p className="text-[11px] uppercase tracking-widest text-white/40">
                    Concepto {conceptIndex} de {conceptCount}
                  </p>
                )}
                <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">{step.title}</h2>
              </div>
            </div>
          )}

          {step.kind === "intro" ? (
            <IntroStep step={step} steps={steps} minutes={minutes} isTask={lesson.isTask} aside={aside} onStart={() => goTo(1)} />
          ) : (
            <ChecklistContext.Provider value={checklist}>
              <StepBody lesson={lesson} step={step} />
            </ChecklistContext.Provider>
          )}
        </motion.section>
      </AnimatePresence>

      {step.kind !== "intro" && (
        <nav
          aria-label="Pasos de la lección"
          className="sticky bottom-0 z-10 -mx-4 mt-10 flex items-center gap-3 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none"
        >
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={!previous}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Atrás</span>
          </button>
          {following && (
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              className="inline-flex flex-1 items-center justify-between gap-3 rounded-xl bg-[rgb(var(--tone))] px-5 py-3 text-left font-semibold text-black transition-transform hover:scale-[1.01] md:flex-none md:min-w-[260px] md:ml-auto"
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-normal uppercase tracking-widest text-black/60">Siguiente</span>
                <span className="block truncate text-sm">{following.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
