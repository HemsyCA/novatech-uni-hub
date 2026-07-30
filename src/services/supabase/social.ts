import { supabase } from "@/integrations/supabase/client";
import type { SocialLink } from "@/types/domain";

export const listActiveSocialLinks = async (): Promise<SocialLink[]> => {
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SocialLink[];
};

export const listAllSocialLinks = async (): Promise<SocialLink[]> => {
  const { data, error } = await supabase.from("social_links").select("*").order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SocialLink[];
};

export const createSocialLink = async (link: Partial<SocialLink>) => {
  const { error } = await supabase.from("social_links").insert(link);
  if (error) throw error;
};

export const updateSocialLink = async (id: string, link: Partial<SocialLink>) => {
  const { error } = await supabase.from("social_links").update(link).eq("id", id);
  if (error) throw error;
};

export const deleteSocialLink = async (id: string) => {
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) throw error;
};
