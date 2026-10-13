import { useEffect, useState } from "react";
import { recommendedOrder, requiredLessons } from "@/lib/academia/course";
import { addAcademyProgress, listMyAcademyProgress, removeAcademyProgress } from "@/services/supabase/academia";
import { toast } from "@/hooks/use-toast";

// Antes el progreso se guardaba solo en el navegador; se sube a la cuenta la
// primera vez que la persona entra desde ese dispositivo.
const legacyStorageKey = (userId: string) => `nova-academia-progreso:${userId}`;

const takeLegacyProgress = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(legacyStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const clearLegacyProgress = (userId: string) => {
  try {
    localStorage.removeItem(legacyStorageKey(userId));
  } catch {
    // Si no hay almacenamiento disponible no queda nada que limpiar.
  }
};

export function useAcademyProgress(userId: string | null) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCompleted(new Set());
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    const load = async () => {
      const saved = new Set(await listMyAcademyProgress(userId));
      const legacy = takeLegacyProgress(userId).filter((key) => !saved.has(key));
      if (legacy.length > 0) {
        await addAcademyProgress(userId, legacy);
        legacy.forEach((key) => saved.add(key));
      }
      clearLegacyProgress(userId);
      return saved;
    };

    load()
      .then((saved) => {
        if (active) setCompleted(saved);
      })
      .catch(() => {
        if (active) toast({ title: "No se pudo cargar tu progreso", description: "Recarga la página para intentarlo de nuevo.", variant: "destructive" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const toggle = async (key: string) => {
    if (!userId) return;
    const wasDone = completed.has(key);
    const next = new Set(completed);
    if (wasDone) next.delete(key);
    else next.add(key);
    setCompleted(next);

    try {
      if (wasDone) await removeAcademyProgress(userId, key);
      else await addAcademyProgress(userId, [key]);
    } catch {
      setCompleted((current) => {
        const reverted = new Set(current);
        if (wasDone) reverted.add(key);
        else reverted.delete(key);
        return reverted;
      });
      toast({ title: "No se pudo guardar tu progreso", description: "Revisa tu conexión e inténtalo de nuevo.", variant: "destructive" });
    }
  };

  const done = requiredLessons.filter((l) => completed.has(l.key)).length;
  const total = requiredLessons.length;

  return {
    completed,
    toggle,
    loading,
    done,
    total,
    percent: Math.round((done / total) * 100),
    nextLesson: recommendedOrder.find((l) => !completed.has(l.key)) ?? null,
  };
}

export type AcademyProgress = ReturnType<typeof useAcademyProgress>;
