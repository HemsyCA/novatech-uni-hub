import { robotCategories } from "@/data/robots";
import type { AporteEstado, ConocimientoTipo, Disciplina } from "@/services/supabase/conocimientos";

export const DISCIPLINAS: { id: Disciplina; label: string }[] = [
  { id: "electronica", label: "Electrónica" },
  { id: "mecanica", label: "Mecánica" },
  { id: "programacion", label: "Programación" },
  { id: "soldadura", label: "Soldadura" },
];

export const TIPOS: Record<ConocimientoTipo, string> = {
  guia: "Guía",
  codigo: "Código",
  pcb: "PCB",
  diseno3d: "Diseño 3D",
  reglamento: "Reglamento",
  documento: "Documento",
  componente: "Componente",
  descripcion: "Descripción",
  descubrimiento: "Descubrimiento",
};

// "general" o la categoría de robot de src/data/robots.ts.
export const CATEGORIAS = [{ id: "general", name: "General" }, ...robotCategories.map((c) => ({ id: c.id, name: c.name }))];

export const disciplinaLabel = (id: string | null) => DISCIPLINAS.find((d) => d.id === id)?.label ?? null;
export const categoriaLabel = (id: string) => CATEGORIAS.find((c) => c.id === id)?.name ?? id;

export const APORTE_ESTADO: Record<AporteEstado, string> = {
  enviado: "En revisión",
  observado: "Con observaciones",
  aprobado: "Publicado",
};
