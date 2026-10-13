import { supabase } from "@/integrations/supabase/client";
import type { AppRole, UserRole, UserRoleWithProfile } from "@/types/domain";

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

// user_roles referencia auth.users (no profiles), así que PostgREST no puede
// hacer el join; se buscan los perfiles en una segunda consulta.
export const listAllUserRoles = async (): Promise<UserRoleWithProfile[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const roles = (data ?? []) as UserRole[];
  if (roles.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, email, full_name")
    .in("user_id", [...new Set(roles.map((r) => r.user_id))]);

  if (profilesError) throw profilesError;
  const byUserId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return roles.map((r) => ({
    ...r,
    email: byUserId.get(r.user_id)?.email ?? null,
    full_name: byUserId.get(r.user_id)?.full_name ?? null,
  }));
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
