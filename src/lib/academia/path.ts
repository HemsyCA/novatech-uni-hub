import { recommendedOrder, requiredLessons, type Lesson } from "@/lib/academia/course";

export type LessonState = "done" | "current" | "locked" | "open";

const planKeys = new Set(recommendedOrder.map((l) => l.key));

// Mientras se cursa la Parte 1 solo se abren las lecciones hechas y la actual
// (la siguiente del plan). Al terminar la Parte 1, o para la directiva, todo queda abierto.
// Las lecciones opcionales y las de la Parte 2 no siguen el camino.
export const lessonState = (
  lesson: Lesson,
  completed: Set<string>,
  nextLesson: Lesson | null,
  isStaff: boolean,
): LessonState => {
  if (completed.has(lesson.key)) return "done";
  if (lesson.key === nextLesson?.key) return "current";
  if (isStaff || !planKeys.has(lesson.key)) return "open";
  if (requiredLessons.every((l) => completed.has(l.key))) return "open";
  return "locked";
};
