import { supabase } from "@/integrations/supabase/client";
import type { AcademyApplication, AcademyGroup, AcademyMembership } from "@/types/domain";

interface GroupFields {
  nombre: string;
  starts_at: string;
  ends_at: string;
}

export const listAcademyGroups = async (): Promise<AcademyGroup[]> => {
  const { data, error } = await supabase
    .from("academia_grupos")
    .select("*, academia_miembros(*)")
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AcademyGroup[];
};

export const createAcademyGroup = async (fields: GroupFields, emails: string[]) => {
  const { data, error } = await supabase.from("academia_grupos").insert(fields).select("id").single();
  if (error) throw error;
  if (emails.length > 0) await addAcademyMembers(data.id, emails);
};

export const updateAcademyGroup = async (id: string, fields: Partial<GroupFields>) => {
  const { error } = await supabase.from("academia_grupos").update(fields).eq("id", id);
  if (error) throw error;
};

export const deleteAcademyGroup = async (id: string) => {
  const { error } = await supabase.from("academia_grupos").delete().eq("id", id);
  if (error) throw error;
};

export const addAcademyMembers = async (grupoId: string, emails: string[]) => {
  const { error } = await supabase
    .from("academia_miembros")
    .upsert(
      emails.map((email) => ({ grupo_id: grupoId, email })),
      { onConflict: "grupo_id,email", ignoreDuplicates: true },
    );
  if (error) throw error;
};

export const removeAcademyMember = async (id: string) => {
  const { error } = await supabase.from("academia_miembros").delete().eq("id", id);
  if (error) throw error;
};

export const setAcademyMemberEndOverride = async (id: string, endsAt: string | null) => {
  const { error } = await supabase.from("academia_miembros").update({ ends_at_override: endsAt }).eq("id", id);
  if (error) throw error;
};

export const findRegisteredEmails = async (emails: string[]): Promise<Set<string>> => {
  if (emails.length === 0) return new Set();
  const { data, error } = await supabase.from("profiles").select("email").in("email", emails);
  if (error) throw error;
  return new Set((data ?? []).map((p) => p.email?.toLowerCase()).filter((e): e is string => !!e));
};

export const hasAcademyAccess = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("has_academy_access", { _user_id: userId });
  if (error) throw error;
  return data === true;
};

export const getMyAcademyMemberships = async (): Promise<AcademyMembership[]> => {
  const { data, error } = await supabase.rpc("my_academy_memberships");
  if (error) throw error;
  return data ?? [];
};

export interface ApplicationFields {
  nombre: string;
  email: string;
  whatsapp: string;
  carrera: string;
  ciclo: number;
}

export class DuplicateApplicationError extends Error {}

// Sin .select(): quien se inscribe no tiene permiso de lectura sobre la tabla.
export const submitAcademyApplication = async (fields: ApplicationFields) => {
  const { error } = await supabase.from("academia_inscripciones").insert(fields);
  if (error?.code === "23505") throw new DuplicateApplicationError();
  if (error) throw error;
};

export const listPendingApplications = async (): Promise<AcademyApplication[]> => {
  const { data, error } = await supabase
    .from("academia_inscripciones")
    .select("*")
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AcademyApplication[];
};

export const reviewApplication = async (id: string, approve: boolean, grupoId?: string) => {
  const { error } = await supabase.rpc("revisar_inscripcion", {
    _id: id,
    _aprobar: approve,
    _grupo_id: grupoId,
  });
  if (error) throw error;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Acepta correos separados por comas, punto y coma, espacios o saltos de línea.
export const parseEmailList = (text: string) => {
  const tokens = text.split(/[\s,;]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
  const valid = [...new Set(tokens.filter((t) => EMAIL_RE.test(t)))];
  const invalid = tokens.filter((t) => !EMAIL_RE.test(t));
  return { valid, invalid };
};

export const listMyAcademyProgress = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase.from("academia_progreso").select("lesson_key").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.lesson_key);
};

export const addAcademyProgress = async (userId: string, lessonKeys: string[]) => {
  const { error } = await supabase
    .from("academia_progreso")
    .upsert(
      lessonKeys.map((lesson_key) => ({ user_id: userId, lesson_key })),
      { onConflict: "user_id,lesson_key", ignoreDuplicates: true },
    );
  if (error) throw error;
};

export const removeAcademyProgress = async (userId: string, lessonKey: string) => {
  const { error } = await supabase.from("academia_progreso").delete().eq("user_id", userId).eq("lesson_key", lessonKey);
  if (error) throw error;
};

export interface AcademyFicha {
  id: string;
  user_id: string;
  modulo: string;
  lesson_key: string;
  es_del_modulo: boolean;
  titulo: string;
  queria: string;
  hice: string;
  paso: string;
  aprendi: string;
  fuentes: string;
  evidencia_url: string;
  created_at: string;
  updated_at: string;
}

export type AcademyFichaInput = Pick<
  AcademyFicha,
  "modulo" | "lesson_key" | "es_del_modulo" | "titulo" | "queria" | "hice" | "paso" | "aprendi" | "fuentes" | "evidencia_url"
>;

export const listMyAcademyFichas = async (userId: string): Promise<AcademyFicha[]> => {
  const { data, error } = await supabase
    .from("academia_fichas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const createAcademyFicha = async (ficha: AcademyFichaInput): Promise<AcademyFicha> => {
  const { data, error } = await supabase.from("academia_fichas").insert(ficha).select().single();
  if (error) throw error;
  return data;
};

export const updateAcademyFicha = async (id: string, ficha: AcademyFichaInput): Promise<AcademyFicha> => {
  const { data, error } = await supabase
    .from("academia_fichas")
    .update({ ...ficha, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAcademyFicha = async (id: string) => {
  const { error } = await supabase.from("academia_fichas").delete().eq("id", id);
  if (error) throw error;
};

export type EntregaEstado = "enviada" | "observada" | "aprobada";

export interface AcademyEntrega {
  user_id: string;
  wokwi_url: string;
  diagrama_url: string;
  electronica_url: string;
  onshape_url: string;
  mecanica_url: string;
  video_url: string;
  reflexion: string;
  estado: EntregaEstado;
  comentario: string | null;
  revisado_por: string | null;
  revisado_at: string | null;
  enviado_at: string;
  created_at: string;
}

export type AcademyEntregaInput = Pick<
  AcademyEntrega,
  "wokwi_url" | "diagrama_url" | "electronica_url" | "onshape_url" | "mecanica_url" | "video_url" | "reflexion"
>;

export const getMyAcademyEntrega = async (userId: string): Promise<AcademyEntrega | null> => {
  const { data, error } = await supabase.from("academia_entregas").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
};

export const submitAcademyEntrega = async (input: AcademyEntregaInput) => {
  const { error } = await supabase.rpc("enviar_entrega_academia", {
    _wokwi_url: input.wokwi_url,
    _diagrama_url: input.diagrama_url,
    _electronica_url: input.electronica_url,
    _onshape_url: input.onshape_url,
    _mecanica_url: input.mecanica_url,
    _video_url: input.video_url,
    _reflexion: input.reflexion,
  });
  if (error) throw error;
};

export const listAcademyEntregas = async (): Promise<AcademyEntrega[]> => {
  const { data, error } = await supabase.from("academia_entregas").select("*").order("enviado_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const reviewAcademyEntrega = async (userId: string, approve: boolean, comment?: string) => {
  const { error } = await supabase.rpc("revisar_entrega_academia", {
    _user_id: userId,
    _aprobar: approve,
    _comentario: comment,
  });
  if (error) throw error;
};

export const listModuleFichasForUsers = async (userIds: string[]): Promise<AcademyFicha[]> => {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from("academia_fichas")
    .select("*")
    .in("user_id", userIds)
    .eq("es_del_modulo", true);
  if (error) throw error;
  return data ?? [];
};

export type PracticaEstado = "programada" | "asistio" | "no_asistio";

export interface AcademyPractica {
  user_id: string;
  fecha: string;
  lugar: string;
  indicaciones: string | null;
  estado: PracticaEstado;
  comentario: string | null;
  asignado_por: string | null;
  created_at: string;
  updated_at: string;
}

export type AcademyPracticaInput = Pick<AcademyPractica, "fecha" | "lugar" | "indicaciones">;

export const getMyAcademyPractica = async (userId: string): Promise<AcademyPractica | null> => {
  const { data, error } = await supabase.from("academia_practicas").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
};

export const listAcademyPracticas = async (): Promise<AcademyPractica[]> => {
  const { data, error } = await supabase.from("academia_practicas").select("*").order("fecha", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

// Citar o reprogramar: la cita vuelve a quedar "programada" y sin comentario.
export const scheduleAcademyPracticas = async (userIds: string[], input: AcademyPracticaInput) => {
  const { error } = await supabase.from("academia_practicas").upsert(
    userIds.map((user_id) => ({
      user_id,
      ...input,
      estado: "programada" as const,
      comentario: null,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "user_id" },
  );
  if (error) throw error;
};

export const recordAcademyPracticaResult = async (userId: string, estado: PracticaEstado, comentario: string | null) => {
  const { error } = await supabase
    .from("academia_practicas")
    .update({ estado, comentario, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
};

export const cancelAcademyPractica = async (userId: string) => {
  const { error } = await supabase.from("academia_practicas").delete().eq("user_id", userId);
  if (error) throw error;
};
