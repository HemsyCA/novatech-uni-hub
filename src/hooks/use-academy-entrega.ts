import { useEffect, useState } from "react";
import {
  getMyAcademyEntrega,
  submitAcademyEntrega,
  type AcademyEntrega,
  type AcademyEntregaInput,
} from "@/services/supabase/academia";
import { toast } from "@/hooks/use-toast";

// userId: null si la cuenta no usa la Academia; undefined mientras se averigua.
export function useAcademyEntrega(userId: string | null | undefined) {
  const [entrega, setEntrega] = useState<AcademyEntrega | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId === undefined) {
      setLoading(true);
      return;
    }
    if (!userId) {
      setEntrega(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getMyAcademyEntrega(userId)
      .then((data) => {
        if (active) setEntrega(data);
      })
      .catch(() => {
        if (active) toast({ title: "No se pudo cargar tu entrega", description: "Recarga la página para intentarlo de nuevo.", variant: "destructive" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const submit = async (input: AcademyEntregaInput) => {
    if (!userId) return;
    await submitAcademyEntrega(input);
    setEntrega(await getMyAcademyEntrega(userId));
  };

  return { entrega, loading, submit };
}

export type AcademyEntregaState = ReturnType<typeof useAcademyEntrega>;
