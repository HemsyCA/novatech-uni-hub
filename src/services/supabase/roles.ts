import { supabase } from "@/integrations/supabase/client";
import type { AppRole, UserRole } from "@/types/domain";

export const getMyRoles = async (userId: string): Promise<AppRole[]> => {
  // Filtro explícito por user_id: la política RLS "Staff can view all roles"
  // deja que cualquier miembro del staff vea TODAS las filas de user_roles
  // (necesario para el panel de administración), así que un select sin
  // filtro acá devolvería los roles de todo el mundo, no solo los propios.
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((r) => r.role as AppRole);
};

export const isStaff = (roles: AppRole[]) => roles.includes("superadmin") || roles.includes("directiva");

export const listAllUserRoles = async (): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserRole[];
};

export const grantRole = async (userId: string, role: AppRole) => {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  if (error) throw error;
};

export const revokeRole = async (roleRowId: string) => {
  const { error } = await supabase.from("user_roles").delete().eq("id", roleRowId);
  if (error) throw error;
};

export const findProfileByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, full_name")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data;
};
