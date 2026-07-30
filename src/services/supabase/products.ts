import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/domain";

export const listProducts = async () => {
  const { data, error } = await supabase.from("products").select("*").eq("is_active", true);

  if (error) throw error;
  return (data ?? []) as Product[];
};

export const listAllProducts = async () => {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
};

export const createProduct = async (product: Partial<Product>) => {
  const { error } = await supabase.from("products").insert(product);
  if (error) throw error;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const { error } = await supabase.from("products").update(product).eq("id", id);
  if (error) throw error;
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};
