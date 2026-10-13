import { useEffect, useState } from "react";
import { recommendedOrder, requiredLessons } from "@/lib/academia/course";

const storageKey = (userId: string) => `nova-academia-progreso:${userId}`;

const readProgress = (userId: string) => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
};

const writeProgress = (userId: string, completed: Set<string>) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...completed]));
  } catch {
    // Sin almacenamiento disponible el progreso solo dura la sesión.
  }
};

export function useAcademyProgress(userId: string | null) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompleted(userId ? readProgress(userId) : new Set());
  }, [userId]);

  const toggle = (key: string) => {
    const next = new Set(completed);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setCompleted(next);
    if (userId) writeProgress(userId, next);
  };

  const done = requiredLessons.filter((l) => completed.has(l.key)).length;
  const total = requiredLessons.length;

  return {
    completed,
    toggle,
    done,
    total,
    percent: Math.round((done / total) * 100),
    nextLesson: recommendedOrder.find((l) => !completed.has(l.key)) ?? null,
  };
}

export type AcademyProgress = ReturnType<typeof useAcademyProgress>;
