import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/domain";

export const listProducts = async () => {
  const { data, error } = await supabase.from("products").select("*").eq("is_active", true);

  if (error) throw error;
  return (data ?? []) as Product[];
};
