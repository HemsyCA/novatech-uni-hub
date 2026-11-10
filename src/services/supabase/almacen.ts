import { supabase } from "@/integrations/supabase/client";

// Almacén de Nova: herramientas con código y sus préstamos.
// Los cambios de estado de un préstamo pasan por funciones de la base de datos (no se editan directo),
// así nadie puede marcar una devolución sin que la directiva la confirme.

export type HerramientaEstado = "disponible" | "prestada" | "mantenimiento" | "baja";
export type PrestamoEstado = "solicitado" | "rechazado" | "cancelado" | "prestado" | "devolucion_reportada" | "devuelto";

export interface Herramienta {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  ubicacion: string | null;
  estado: HerramientaEstado;
  created_at: string;
  updated_at: string;
}

export type HerramientaInput = Pick<Herramienta, "codigo" | "nombre" | "categoria" | "descripcion" | "ubicacion">;

export interface Prestamo {
  id: string;
  herramienta_id: string;
  solicitante_id: string;
  solicitante_nombre: string;
  motivo: string;
  devolucion_estimada: string;
  estado: PrestamoEstado;
  comentario_directiva: string | null;
  nota_devolucion: string | null;
  aprobado_at: string | null;
  devolucion_reportada_at: string | null;
  devuelto_at: string | null;
  created_at: string;
  updated_at: string;
  herramienta?: Pick<Herramienta, "codigo" | "nombre" | "categoria"> | null;
}

// Los préstamos que todavía ocupan la herramienta.
export const ACTIVE_LOAN: PrestamoEstado[] = ["solicitado", "prestado", "devolucion_reportada"];

const LOAN_SELECT = "*, herramienta:herramientas(codigo, nombre, categoria)";

// ---------------------------------------------------------------- herramientas

export const listHerramientas = async (): Promise<Herramienta[]> => {
  const { data, error } = await supabase.from("herramientas").select("*").order("codigo", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Herramienta[];
};

const clean = (input: HerramientaInput) => ({
  codigo: input.codigo.trim().toUpperCase(),
  nombre: input.nombre.trim(),
  categoria: input.categoria || "general",
  descripcion: input.descripcion?.trim() || null,
  ubicacion: input.ubicacion?.trim() || null,
});

export const createHerramienta = async (input: HerramientaInput) => {
  const { error } = await supabase.from("herramientas").insert(clean(input));
  if (error) throw error;
};

export const updateHerramienta = async (id: string, input: HerramientaInput) => {
  const { error } = await supabase
    .from("herramientas")
    .update({ ...clean(input), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
};

// Mantenimiento, baja o vuelta a disponible. Prestada solo la pone el flujo de préstamos.
export const setHerramientaEstado = async (id: string, estado: Exclude<HerramientaEstado, "prestada">) => {
  const { error } = await supabase.from("herramientas").update({ estado, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
};

export const deleteHerramienta = async (id: string) => {
  const { error } = await supabase.from("herramientas").delete().eq("id", id);
  if (error) throw error;
};

// ---------------------------------------------------------------- préstamos

export const listMisPrestamos = async (userId: string): Promise<Prestamo[]> => {
  const { data, error } = await supabase
    .from("prestamos")
    .select(LOAN_SELECT)
    .eq("solicitante_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Prestamo[];
};

// Para la directiva (la base de datos solo deja ver todos a quien es directiva).
export const listPrestamos = async (): Promise<Prestamo[]> => {
  const { data, error } = await supabase.from("prestamos").select(LOAN_SELECT).order("created_at", { ascending: false }).limit(300);
  if (error) throw error;
  return (data ?? []) as Prestamo[];
};

// Herramientas que alguien ya pidió y esperan aprobación (sin decir quién).
export const listHerramientasPedidas = async (): Promise<Set<string>> => {
  const { data, error } = await supabase.rpc("herramientas_pedidas");
  if (error) throw error;
  return new Set((data ?? []) as string[]);
};

export const solicitarPrestamo = async (herramientaId: string, motivo: string, devolucion: string) => {
  const { error } = await supabase.rpc("solicitar_prestamo", {
    _herramienta: herramientaId,
    _motivo: motivo.trim(),
    _devolucion: devolucion,
  });
  if (error) throw error;
};

export const cancelarPrestamo = async (id: string) => {
  const { error } = await supabase.rpc("cancelar_prestamo", { _id: id });
  if (error) throw error;
};

export const revisarPrestamo = async (id: string, aprobar: boolean, comentario: string) => {
  const { error } = await supabase.rpc("revisar_prestamo", { _id: id, _aprobar: aprobar, _comentario: comentario.trim() || null });
  if (error) throw error;
};

export const reportarDevolucion = async (id: string, nota: string) => {
  const { error } = await supabase.rpc("reportar_devolucion", { _id: id, _nota: nota.trim() || null });
  if (error) throw error;
};

export const confirmarDevolucion = async (id: string, queda: "disponible" | "mantenimiento", comentario: string) => {
  const { error } = await supabase.rpc("confirmar_devolucion", { _id: id, _queda: queda, _comentario: comentario.trim() || null });
  if (error) throw error;
};
