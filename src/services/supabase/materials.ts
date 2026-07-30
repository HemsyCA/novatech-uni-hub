import { supabase } from "@/integrations/supabase/client";
import type { PrintMaterial } from "@/types/domain";

export const listMaterials = async (): Promise<PrintMaterial[]> => {
  const { data, error } = await supabase
    .from("print_materials")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PrintMaterial[];
};
