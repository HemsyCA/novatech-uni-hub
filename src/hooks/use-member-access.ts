import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { isMember } from "@/services/supabase/miembros";

export const useMemberAccess = () => {
  const { userId, loading: rolesLoading } = useUserRole();
  const [state, setState] = useState({ loading: true, isMember: false });

  useEffect(() => {
    if (rolesLoading) return;
    if (!userId) {
      setState({ loading: false, isMember: false });
      return;
    }

    let active = true;
    isMember(userId)
      .then((result) => {
        if (active) setState({ loading: false, isMember: result });
      })
      .catch(() => {
        if (active) setState({ loading: false, isMember: false });
      });

    return () => {
      active = false;
    };
  }, [userId, rolesLoading]);

  return state;
};
