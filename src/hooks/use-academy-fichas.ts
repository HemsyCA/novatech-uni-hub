import { useEffect, useState } from "react";
import {
  createAcademyFicha,
  deleteAcademyFicha,
  listMyAcademyFichas,
  updateAcademyFicha,
  type AcademyFicha,
  type AcademyFichaInput,
} from "@/services/supabase/academia";
import { toast } from "@/hooks/use-toast";

export function useAcademyFichas(userId: string | null) {
  const [fichas, setFichas] = useState<AcademyFicha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setFichas([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    listMyAcademyFichas(userId)
      .then((data) => {
        if (active) setFichas(data);
      })
      .catch(() => {
        if (active) toast({ title: "No se pudieron cargar tus fichas", description: "Recarga la página para intentarlo de nuevo.", variant: "destructive" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const save = async (input: AcademyFichaInput, id?: string) => {
    const saved = id ? await updateAcademyFicha(id, input) : await createAcademyFicha(input);
    setFichas((current) => (id ? current.map((f) => (f.id === id ? saved : f)) : [...current, saved]));
    return saved;
  };

  const remove = async (id: string) => {
    await deleteAcademyFicha(id);
    setFichas((current) => current.filter((f) => f.id !== id));
  };

  return {
    fichas,
    loading,
    save,
    remove,
    moduleFicha: (moduleId: string) => fichas.find((f) => f.modulo === moduleId && f.es_del_modulo) ?? null,
    lessonFichas: (lessonKey: string) => fichas.filter((f) => f.lesson_key === lessonKey && !f.es_del_modulo),
  };
}

export type AcademyFichas = ReturnType<typeof useAcademyFichas>;
