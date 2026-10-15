import { supabase } from "@/integrations/supabase/client";

// Conocimientos Nova: entradas de material_miembros (las de siempre y los aportes publicados).
export type Disciplina = "electronica" | "mecanica" | "programacion" | "soldadura";
export type ConocimientoTipo =
  | "descripcion"
  | "componente"
  | "pcb"
  | "documento"
  | "guia"
  | "codigo"
  | "diseno3d"
  | "reglamento"
  | "descubrimiento";

export interface Conocimiento {
  id: string;
  categoria: string;
  robot: string | null;
  tipo: ConocimientoTipo;
  titulo: string;
  descripcion: string | null;
  contenido: string | null;
  url: string | null;
  disciplina: Disciplina | null;
  autor_id: string | null;
  autor_nombre: string | null;
  aporte_id: string | null;
  publicado_at: string;
  orden: number;
}

export type ConocimientoInput = Pick<Conocimiento, "titulo" | "tipo" | "categoria" | "descripcion" | "url"> & {
  disciplina: Disciplina | null;
};

export const listConocimientos = async (): Promise<Conocimiento[]> => {
  const { data, error } = await supabase
    .from("material_miembros")
    .select("*")
    .order("publicado_at", { ascending: false })
    .order("orden", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Conocimiento[];
};

export const getConocimiento = async (id: string): Promise<Conocimiento | null> => {
  const { data, error } = await supabase.from("material_miembros").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Conocimiento | null;
};

export const createConocimiento = async (input: ConocimientoInput, autor: { id: string; nombre: string }) => {
  const { error } = await supabase.from("material_miembros").insert({
    ...input,
    descripcion: input.descripcion || null,
    url: input.url || null,
    autor_id: autor.id,
    autor_nombre: autor.nombre,
  });
  if (error) throw error;
};

// ---------- Aportes de la Comunidad

export type AporteEstado = "enviado" | "observado" | "aprobado";

export interface Aporte {
  id: string;
  autor_id: string;
  autor_nombre: string;
  titulo: string;
  disciplina: Disciplina | null;
  categoria: string;
  queria: string;
  hice: string;
  paso: string;
  aprendi: string;
  evidencia_url: string | null;
  estado: AporteEstado;
  comentario: string | null;
  revisado_at: string | null;
  conocimiento_id: string | null;
  created_at: string;
  updated_at: string;
}

export type AporteInput = Pick<Aporte, "titulo" | "categoria" | "queria" | "hice" | "paso" | "aprendi"> & {
  disciplina: Disciplina | null;
  evidencia_url: string;
};

export const listMyAportes = async (userId: string): Promise<Aporte[]> => {
  const { data, error } = await supabase
    .from("aportes")
    .select("*")
    .eq("autor_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Aporte[];
};

// Solo el Área académica ve los aportes de otros (lo controla la base de datos).
export const listAportesPorRevisar = async (): Promise<Aporte[]> => {
  const { data, error } = await supabase
    .from("aportes")
    .select("*")
    .eq("estado", "enviado")
    .order("updated_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Aporte[];
};

export const enviarAporte = async (input: AporteInput, id: string | null = null): Promise<string> => {
  const { data, error } = await supabase.rpc("enviar_aporte", {
    _id: id,
    _titulo: input.titulo.trim(),
    _disciplina: input.disciplina ?? "",
    _categoria: input.categoria,
    _queria: input.queria.trim(),
    _hice: input.hice.trim(),
    _paso: input.paso.trim(),
    _aprendi: input.aprendi.trim(),
    _evidencia_url: input.evidencia_url.trim(),
  });
  if (error) throw error;
  return data as string;
};

export const revisarAporte = async (id: string, aprobar: boolean, comentario: string) => {
  const { error } = await supabase.rpc("revisar_aporte", { _id: id, _aprobar: aprobar, _comentario: comentario.trim() || null });
  if (error) throw error;
};

export const eliminarAporte = async (id: string) => {
  const { error } = await supabase.from("aportes").delete().eq("id", id);
  if (error) throw error;
};
