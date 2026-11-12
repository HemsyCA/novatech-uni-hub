import { Bot, CircuitBoard, Cpu, Lightbulb, Shapes } from "lucide-react";
import type { TipoPagina } from "@/lib/conocimiento/modelo";

// El ícono de cada tipo de página de la base de conocimiento.
export const ICONOS: Record<TipoPagina, typeof Bot> = {
  categorias: Shapes,
  placas: CircuitBoard,
  robots: Bot,
  temas: Lightbulb,
  componentes: Cpu,
};
