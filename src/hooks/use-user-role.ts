import { useEffect, useState } from "react";
import { getCurrentSession, subscribeToAuth } from "@/services/supabase/auth";
import { getMyRoles, isStaff } from "@/services/supabase/roles";
import type { AppRole } from "@/types/domain";

export const useUserRole = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadRoles = async (uid: string | null) => {
      if (!uid) {
        if (active) {
          setRoles([]);
          setLoading(false);
        }
        return;
      }
      try {
        const myRoles = await getMyRoles(uid);
        if (active) setRoles(myRoles);
      } catch {
        if (active) setRoles([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    const { data: { subscription } } = subscribeToAuth((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      loadRoles(uid);
    });

    getCurrentSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      loadRoles(uid);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    roles,
    loading,
    userId,
    isStaff: isStaff(roles),
    isSuperadmin: roles.includes("superadmin"),
    isDirectiva: roles.includes("directiva"),
  };
};
