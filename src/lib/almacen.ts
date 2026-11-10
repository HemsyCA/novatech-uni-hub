import type { StatusTone } from "@/components/account/ui";
import type { HerramientaEstado, Prestamo, PrestamoEstado } from "@/services/supabase/almacen";
import { limaToday } from "@/lib/academy-dates";

// Textos y colores del Almacén, compartidos por la página de miembros y el panel de directiva.

export const CATEGORIAS_ALMACEN = [
  { id: "herramientas", label: "Herramientas manuales" },
  { id: "medicion", label: "Medición" },
  { id: "soldadura", label: "Soldadura" },
  { id: "electronica", label: "Electrónica" },
  { id: "impresion", label: "Impresión 3D" },
  { id: "mecanica", label: "Mecánica" },
  { id: "general", label: "Otros" },
];

export const categoriaAlmacen = (id: string) => CATEGORIAS_ALMACEN.find((c) => c.id === id)?.label ?? id;

export const HERRAMIENTA_ESTADO: Record<HerramientaEstado, { label: string; tone: StatusTone }> = {
  disponible: { label: "Disponible", tone: "done" },
  prestada: { label: "Prestada", tone: "neutral" },
  mantenimiento: { label: "En mantenimiento", tone: "attention" },
  baja: { label: "De baja", tone: "off" },
};

export const PRESTAMO_ESTADO: Record<PrestamoEstado, { label: string; tone: StatusTone }> = {
  solicitado: { label: "Esperando aprobación", tone: "neutral" },
  rechazado: { label: "Rechazado", tone: "off" },
  cancelado: { label: "Cancelado", tone: "off" },
  prestado: { label: "La tienes tú", tone: "progress" },
  devolucion_reportada: { label: "Devolución por confirmar", tone: "attention" },
  devuelto: { label: "Devuelta", tone: "done" },
};

// Los pasos del préstamo, para mostrar en cuál va.
export const PRESTAMO_PASOS: { estado: PrestamoEstado; label: string }[] = [
  { estado: "solicitado", label: "Pedida" },
  { estado: "prestado", label: "Prestada" },
  { estado: "devolucion_reportada", label: "Avisaste la devolución" },
  { estado: "devuelto", label: "Devuelta" },
];

// Si ya pasó la fecha en que dijo que la devolvería y aún la tiene.
export const isOverdue = (prestamo: Pick<Prestamo, "estado" | "devolucion_estimada">) =>
  prestamo.estado === "prestado" && prestamo.devolucion_estimada < limaToday();

// Fecha de hoy + días, en formato AAAA-MM-DD (hora de Lima).
export const limaDatePlus = (days: number) => {
  const [y, m, d] = limaToday().split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
};
