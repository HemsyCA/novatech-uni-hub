import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { getMyAcademyMemberships, hasAcademyAccess } from "@/services/supabase/academia";
import type { AcademyMembership } from "@/types/domain";

interface AcademyAccessState {
  loading: boolean;
  hasAccess: boolean;
  memberships: AcademyMembership[];
}

export const useAcademyAccess = () => {
  const { userId, loading: rolesLoading, isStaff, isSuperadmin, isAcademic } = useUserRole();
  const [state, setState] = useState<AcademyAccessState>({ loading: true, hasAccess: false, memberships: [] });

  useEffect(() => {
    if (rolesLoading) return;
    if (!userId) {
      setState({ loading: false, hasAccess: false, memberships: [] });
      return;
    }

    let active = true;
    Promise.all([hasAcademyAccess(userId), getMyAcademyMemberships()])
      .then(([hasAccess, memberships]) => {
        if (active) setState({ loading: false, hasAccess, memberships });
      })
      .catch(() => {
        if (active) setState({ loading: false, hasAccess: false, memberships: [] });
      });

    return () => {
      active = false;
    };
  }, [userId, rolesLoading]);

  return {
    ...state,
    userId,
    isStaff,
    isSuperadmin,
    isAcademic,
    activeMembership: state.memberships.find((m) => m.activo) ?? null,
  };
};

export type AcademyAccess = ReturnType<typeof useAcademyAccess>;
