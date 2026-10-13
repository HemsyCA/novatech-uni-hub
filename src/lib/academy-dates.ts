import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const ACADEMY_DURATION_DAYS = 21;

export type AcademyStatus = "proximo" | "activo" | "finalizado";

// Misma zona horaria que usa la base de datos para decidir el acceso.
export const limaToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());

// ends_at es el último día con acceso (inclusive), por eso son 20 días más.
export const defaultEndDate = (startIso: string) =>
  format(addDays(parseISO(startIso), ACADEMY_DURATION_DAYS - 1), "yyyy-MM-dd");

export const academyStatus = (startIso: string, endIso: string, today = limaToday()): AcademyStatus => {
  if (today < startIso) return "proximo";
  if (today > endIso) return "finalizado";
  return "activo";
};

export const daysLeft = (endIso: string, today = limaToday()) =>
  differenceInCalendarDays(parseISO(endIso), parseISO(today)) + 1;

export const formatDate = (iso: string) => format(parseISO(iso), "d 'de' MMMM yyyy", { locale: es });

export const statusLabel: Record<AcademyStatus, string> = {
  proximo: "Próximo",
  activo: "Activo",
  finalizado: "Finalizado",
};
