import { part2Module, recommendedOrder, requiredLessons, weeklyPlan, type Lesson } from "@/lib/academia/course";

export type LessonState = "done" | "current" | "locked" | "open";

const planKeys = new Set(recommendedOrder.map((l) => l.key));

// Mientras se cursa la Parte 1 solo se abren las lecciones hechas y la actual
// (la siguiente del plan). Al terminar la Parte 1, o para la directiva, todo queda abierto.
// La Parte 2 (soldadura) también se abre en orden. Las lecciones opcionales quedan libres.
export const nextPart2Lesson = (completed: Set<string>) => part2Module.lessons.find((l) => !completed.has(l.key)) ?? null;

// Semana en la que está el estudiante: la de su lección actual, o la última si ya terminó.
export const currentWeekIndex = (nextLesson: Lesson | null) => {
  const index = weeklyPlan.findIndex((w) => w.lessons.some((l) => l.key === nextLesson?.key));
  return index === -1 ? weeklyPlan.length - 1 : index;
};

export const lessonState = (
  lesson: Lesson,
  completed: Set<string>,
  nextLesson: Lesson | null,
  isStaff: boolean,
): LessonState => {
  if (completed.has(lesson.key)) return "done";
  if (lesson.moduleId === part2Module.id) {
    if (lesson.key === nextPart2Lesson(completed)?.key) return "current";
    return isStaff ? "open" : "locked";
  }
  if (lesson.key === nextLesson?.key) return "current";
  if (isStaff || !planKeys.has(lesson.key)) return "open";
  if (requiredLessons.every((l) => completed.has(l.key))) return "open";
  return "locked";
};
