import { useOutletContext } from "react-router-dom";
import type { AcademyProgress } from "@/hooks/use-academy-progress";
import type { AcademyFichas } from "@/hooks/use-academy-fichas";
import type { AcademyEntregaState } from "@/hooks/use-academy-entrega";
import type { AcademyPracticaState } from "@/hooks/use-academy-practica";
import type { AcademyMembership } from "@/types/domain";

export interface AcademyContext {
  progress: AcademyProgress;
  fichas: AcademyFichas;
  entrega: AcademyEntregaState;
  practica: AcademyPracticaState;
  activeMembership: AcademyMembership | null;
  isStaff: boolean;
}

export const useAcademy = () => useOutletContext<AcademyContext>();

export const useCanAccessPart2 = () => {
  const { entrega, isStaff } = useAcademy();
  return isStaff || entrega.entrega?.estado === "aprobada";
};
