import { useCallback, useState } from "react";

// Qué paradas de la Ruta de bienvenida ya viste. Se guarda en este navegador: es solo para orientarte.
const KEY = "nova-guia-paradas";
export const GUIDE_STOP_COUNT = 10;

export const stopHref = (index: number) => `/academia/guia?parada=${index + 1}`;
export const GOAL_HREF = "/academia/guia?parada=meta";

const load = (): Set<number> => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return new Set(Array.isArray(saved) ? saved.filter((n) => typeof n === "number") : []);
  } catch {
    return new Set();
  }
};

export const guideVisitedCount = () => load().size;
export const isGuideDone = () => load().size >= GUIDE_STOP_COUNT;

export function useGuideProgress() {
  const [visited, setVisited] = useState<Set<number>>(load);

  const visit = useCallback(
    (index: number) =>
      setVisited((current) => {
        if (current.has(index)) return current;
        const next = new Set(current).add(index);
        try {
          localStorage.setItem(KEY, JSON.stringify([...next]));
        } catch {
          // Sin almacenamiento la ruta funciona igual mientras la página esté abierta.
        }
        return next;
      }),
    [],
  );

  return { visited, visit, done: visited.size >= GUIDE_STOP_COUNT };
}
