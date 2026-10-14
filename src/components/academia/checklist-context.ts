import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Casillas "- [ ]" que el convocado puede marcar, por ejemplo los requisitos de una tarea.
// Se guardan en este navegador: son una ayuda personal, no parte de la entrega.
export interface ChecklistState {
  checked: Set<string>;
  toggle: (item: string) => void;
}

export const ChecklistContext = createContext<ChecklistState | null>(null);

export const useChecklist = () => useContext(ChecklistContext);

const storageKey = (key: string) => `academia-checklist:${key}`;

const load = (key: string) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(key)) ?? "[]");
    return new Set<string>(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set<string>();
  }
};

export function useChecklistState(key: string): ChecklistState {
  const [checked, setChecked] = useState(() => load(key));

  useEffect(() => {
    setChecked(load(key));
  }, [key]);

  const toggle = useCallback(
    (item: string) =>
      setChecked((current) => {
        const next = new Set(current);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        try {
          localStorage.setItem(storageKey(key), JSON.stringify([...next]));
        } catch {
          // Sin almacenamiento (modo privado): la casilla funciona igual mientras la página esté abierta.
        }
        return next;
      }),
    [key],
  );

  return { checked, toggle };
}
