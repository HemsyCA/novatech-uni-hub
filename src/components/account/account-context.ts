import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { AcademyAccess } from "@/hooks/use-academy-access";
import type { AcademyProgress } from "@/hooks/use-academy-progress";
import type { AcademyEntregaState } from "@/hooks/use-academy-entrega";
import type { AcademyPracticaState } from "@/hooks/use-academy-practica";
import type { Order, Reservation } from "@/types/domain";
import type { Aporte } from "@/services/supabase/conocimientos";

// Datos de la cuenta que comparten el encabezado, el panel y la Academia.
// Se cargan una sola vez para que, por ejemplo, el avance de arriba cambie al completar una lección.
export interface AccountState {
  user: User | null;
  sessionLoading: boolean;
  academy: AcademyAccess;
  progress: AcademyProgress;
  entrega: AcademyEntregaState;
  practica: AcademyPracticaState;
  member: { loading: boolean; isMember: boolean };
  orders: Order[];
  reservations: Reservation[];
  // Lo que la directiva tiene por revisar o atender (null si no es directiva).
  staffPending: { entregas: number; inscripciones: number; pedidos: number; reservas: number } | null;
  // Aportes que esperan al Área académica (null si no es del Área académica).
  academicPending: number | null;
  // Los aportes que compartiste en la Comunidad.
  aportes: Aporte[];
  reloadAportes: () => void;
  signOut: () => Promise<void>;
  signOutEverywhere: () => Promise<void>;
}

export const AccountContext = createContext<AccountState | null>(null);

export const useAccount = () => {
  const account = useContext(AccountContext);
  if (!account) throw new Error("useAccount debe usarse dentro de AccountLayout");
  return account;
};
