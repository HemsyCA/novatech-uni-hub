import { useOutletContext } from "react-router-dom";
import type { AcademyProgress } from "@/hooks/use-academy-progress";
import type { AcademyMembership } from "@/types/domain";

export interface AcademyContext {
  progress: AcademyProgress;
  activeMembership: AcademyMembership | null;
  isStaff: boolean;
}

export const useAcademy = () => useOutletContext<AcademyContext>();
