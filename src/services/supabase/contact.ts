import { supabase } from "@/integrations/supabase/client";

export const createContactMessage = async (name: string, email: string, message: string) => {
  const { error } = await supabase.from("contact_messages").insert({ name, email, message });
  if (error) throw error;
};

export const listContactMessages = async () => {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};
