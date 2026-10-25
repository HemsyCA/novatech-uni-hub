import { useCallback, useState } from "react";

// Hasta qué paso de cada lección llegó la persona. Los pasos se abren uno por uno:
// solo puedes ir a los que ya viste y al siguiente. Se guarda en este navegador
// (y en memoria, por si el navegador no deja guardar).
const memory = new Map<string, number>();

const storageKey = (userId: string | null, lessonKey: string) => `nova-pasos:${userId ?? "anon"}:${lessonKey}`;

const read = (key: string) => {
  let saved = 0;
  try {
    const value = Number(localStorage.getItem(key));
    if (Number.isInteger(value) && value > 0) saved = value;
  } catch {
    // Sin almacenamiento queda lo que haya en memoria.
  }
  return Math.max(saved, memory.get(key) ?? 0);
};

export function useStepGate(userId: string | null, lessonKey: string, total: number, allOpen: boolean) {
  const key = storageKey(userId, lessonKey);
  const [, rerender] = useState(0);
  const reached = allOpen ? total - 1 : Math.min(read(key), total - 1);

  const unlock = useCallback(
    (index: number) => {
      if (index <= read(key)) return;
      memory.set(key, index);
      try {
        localStorage.setItem(key, String(index));
      } catch {
        // Ya quedó en memoria.
      }
      rerender((n) => n + 1);
    },
    [key],
  );

  return { reached, unlock };
}
