import { useEffect, useState } from "react";
import { getMyAcademyPractica, type AcademyPractica } from "@/services/supabase/academia";
import { toast } from "@/hooks/use-toast";

// userId: null si la cuenta no usa la Academia; undefined mientras se averigua.
export function useAcademyPractica(userId: string | null | undefined) {
  const [practica, setPractica] = useState<AcademyPractica | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId === undefined) {
      setLoading(true);
      return;
    }
    if (!userId) {
      setPractica(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getMyAcademyPractica(userId)
      .then((data) => {
        if (active) setPractica(data);
      })
      .catch(() => {
        if (active) toast({ title: "No se pudo cargar tu práctica", description: "Recarga la página para intentarlo de nuevo.", variant: "destructive" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return { practica, loading };
}

export type AcademyPracticaState = ReturnType<typeof useAcademyPractica>;
