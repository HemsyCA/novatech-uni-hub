import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getCurrentSession, subscribeToAuth } from "@/services/supabase/auth";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = subscribeToAuth(async (_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    getCurrentSession().then(({ data: { session } }) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export const displayNameOf = (user: User | null) =>
  (user?.user_metadata?.full_name as string | undefined) || user?.email?.split("@")[0] || "";

export const initialsOf = (user: User | null) => {
  const words = displayNameOf(user).trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
};
