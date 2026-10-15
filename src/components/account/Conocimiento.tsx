import { BookOpen, Code2, Cpu, FileText, Lightbulb, Scale, Shapes, type LucideIcon } from "lucide-react";
import type { Conocimiento, ConocimientoTipo } from "@/services/supabase/conocimientos";

const TIPO_ICON: Record<ConocimientoTipo, LucideIcon> = {
  guia: BookOpen,
  codigo: Code2,
  pcb: Cpu,
  diseno3d: Shapes,
  reglamento: Scale,
  documento: FileText,
  componente: Cpu,
  descripcion: FileText,
  descubrimiento: Lightbulb,
};

export function TipoIcon({ tipo, className = "h-5 w-5" }: { tipo: ConocimientoTipo; className?: string }) {
  const Icon = TIPO_ICON[tipo] ?? FileText;
  return <Icon className={className} aria-hidden />;
}

// Quién lo hizo: es el reconocimiento de la zona de miembros, por eso va en morado.
export function AuthorCredit({ item }: { item: Pick<Conocimiento, "autor_nombre" | "aporte_id"> }) {
  return item.autor_nombre ? (
    <span className="text-nova">
      {item.aporte_id ? "Aporte de " : "Por "}
      {item.autor_nombre}
    </span>
  ) : (
    <span className="text-white/40">Equipo Nova</span>
  );
}
