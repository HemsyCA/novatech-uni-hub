import { supabase } from "@/integrations/supabase/client";
import type { PrintMaterial } from "@/types/domain";

export interface Indicadores {
  ventas_mes: number;
  pedidos_mes: number;
  pedidos_por_estado: Record<string, number>;
  reservas_por_estado: Record<string, number>;
  horas_promedio_entrega: number | null;
  ventas_por_mes: { mes: string; total: number }[];
  stock_bajo: { id: string; name: string; stock: number; min_stock: number }[];
  material_bajo: { id: string; name: string; stock_kg: number; min_stock_kg: number }[];
  top_productos: { name: string; unidades: number }[];
}

export const getIndicadores = async () => {
  const { data, error } = await supabase.rpc("indicadores_negocio");
  if (error) throw new Error(error.message);
  return data as unknown as Indicadores;
};

export const listMaterialesInventario = async () => {
  const { data, error } = await supabase.from("print_materials").select("*").order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PrintMaterial[];
};

export const updateMaterialStock = async (id: string, values: { stock_kg: number; min_stock_kg: number }) => {
  const { error } = await supabase.from("print_materials").update(values).eq("id", id);
  if (error) throw error;
};
