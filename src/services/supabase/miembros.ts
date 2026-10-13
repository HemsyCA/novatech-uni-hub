import { supabase } from "@/integrations/supabase/client";
import type { MemberMaterial, NovaMember } from "@/types/domain";

export const listNovaMembers = async (): Promise<NovaMember[]> => {
  const { data, error } = await supabase
    .from("nova_miembros")
    .select("id, email, created_at")
    .order("email", { ascending: true });

  if (error) throw error;
  const members = data ?? [];
  if (members.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("email, full_name")
    .in("email", members.map((m) => m.email));

  if (profilesError) throw profilesError;
  const byEmail = new Map((profiles ?? []).map((p) => [p.email?.toLowerCase(), p]));

  return members.map((m) => ({
    ...m,
    full_name: byEmail.get(m.email)?.full_name ?? null,
    registered: byEmail.has(m.email),
  }));
};

export const listNovaMemberEmails = async (): Promise<Set<string>> => {
  const { data, error } = await supabase.from("nova_miembros").select("email");
  if (error) throw error;
  return new Set((data ?? []).map((m) => m.email));
};

export const addNovaMembers = async (emails: string[]) => {
  const { error } = await supabase
    .from("nova_miembros")
    .upsert(
      emails.map((email) => ({ email })),
      { onConflict: "email", ignoreDuplicates: true },
    );
  if (error) throw error;
};

export const removeNovaMember = async (id: string) => {
  const { error } = await supabase.from("nova_miembros").delete().eq("id", id);
  if (error) throw error;
};

export const isMember = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("is_member", { _user_id: userId });
  if (error) throw error;
  return data === true;
};

export const listMemberMaterial = async (): Promise<MemberMaterial[]> => {
  const { data, error } = await supabase
    .from("material_miembros")
    .select("*")
    .order("orden", { ascending: true })
    .order("titulo", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MemberMaterial[];
};
