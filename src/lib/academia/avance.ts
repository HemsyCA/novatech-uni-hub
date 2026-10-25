import { part2Module, recommendedOrder, requiredLessons, weeklyPlan, type Lesson } from "@/lib/academia/course";
import { ACADEMY_DURATION_DAYS, academyStatus, limaToday, type AcademyStatus } from "@/lib/academy-dates";
import type { AcademyEntrega, AcademyFicha, AcademyPractica } from "@/services/supabase/academia";
import type { AcademyGroup } from "@/types/domain";

// El avance de cada convocado, para la directiva: qué lecciones hizo, dónde está y si va al ritmo del plan.

export interface ProgressRow {
  user_id: string;
  lesson_key: string;
  completed_at: string;
}

export interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

export type AvanceEstado = "sin-cuenta" | "por-empezar" | "no-empezo" | "atrasado" | "al-dia" | "parte1-completa";

export interface AvanceConvocado {
  key: string;
  email: string;
  name: string | null;
  userId: string | null;
  grupo: { id: string; nombre: string; startsAt: string; endsAt: string; status: AcademyStatus };
  done: number;
  total: number;
  percent: number;
  expected: number;
  completed: Map<string, string>; // lección → fecha en que la completó
  nextLesson: Lesson | null;
  lastActivity: string | null;
  daysInactive: number | null;
  moduleFichas: string[];
  entrega: AcademyEntrega | null;
  part2Done: number;
  practica: AcademyPractica | null;
  estado: AvanceEstado;
}

const DAY = 24 * 60 * 60 * 1000;
const daysBetween = (fromIso: string, toIso: string) => Math.floor((Date.parse(toIso) - Date.parse(fromIso)) / DAY);

// Cuántas lecciones debería llevar según los días que pasaron desde que empezó su grupo (3 semanas en total).
export const expectedLessons = (startsAt: string, today = limaToday()) => {
  const elapsed = daysBetween(startsAt, today) + 1;
  if (elapsed <= 0) return 0;
  return Math.min(requiredLessons.length, Math.round((requiredLessons.length * elapsed) / ACADEMY_DURATION_DAYS));
};

// La semana del plan en la que está su siguiente lección.
export const weekOf = (lesson: Lesson | null) =>
  lesson ? weeklyPlan.findIndex((w) => w.lessons.some((l) => l.key === lesson.key)) + 1 : null;

export const ESTADO_LABEL: Record<AvanceEstado, string> = {
  "sin-cuenta": "Sin cuenta",
  "por-empezar": "Su grupo aún no empieza",
  "no-empezo": "No empezó",
  atrasado: "Atrasado",
  "al-dia": "Al día",
  "parte1-completa": "Terminó la Parte 1",
};

// Primero lo que necesita atención.
export const ESTADO_ORDEN: AvanceEstado[] = ["atrasado", "no-empezo", "sin-cuenta", "al-dia", "parte1-completa", "por-empezar"];

export const INACTIVE_DAYS = 5;

export function buildAvance({
  groups,
  profiles,
  progress,
  fichas,
  entregas,
  practicas,
  today = limaToday(),
}: {
  groups: AcademyGroup[];
  profiles: Profile[];
  progress: ProgressRow[];
  fichas: AcademyFicha[];
  entregas: AcademyEntrega[];
  practicas: AcademyPractica[];
  today?: string;
}): AvanceConvocado[] {
  const profileByEmail = new Map(profiles.filter((p) => p.email).map((p) => [p.email!.toLowerCase(), p]));
  const progressByUser = new Map<string, Map<string, string>>();
  progress.forEach((row) => {
    const map = progressByUser.get(row.user_id) ?? new Map<string, string>();
    map.set(row.lesson_key, row.completed_at);
    progressByUser.set(row.user_id, map);
  });

  return groups.flatMap((group) =>
    group.academia_miembros.map((member) => {
      const endsAt = member.ends_at_override ?? group.ends_at;
      const status = academyStatus(group.starts_at, endsAt, today);
      const profile = profileByEmail.get(member.email.toLowerCase()) ?? null;
      const userId = profile?.user_id ?? null;
      const completed = (userId && progressByUser.get(userId)) || new Map<string, string>();
      const done = requiredLessons.filter((l) => completed.has(l.key)).length;
      const total = requiredLessons.length;
      const nextLesson = recommendedOrder.find((l) => !completed.has(l.key)) ?? null;
      const userFichas = userId ? fichas.filter((f) => f.user_id === userId) : [];
      const entrega = (userId && entregas.find((e) => e.user_id === userId)) || null;
      const practica = (userId && practicas.find((p) => p.user_id === userId)) || null;

      const dates = [
        ...completed.values(),
        ...userFichas.map((f) => f.updated_at ?? f.created_at),
        ...(entrega ? [entrega.enviado_at] : []),
      ].filter(Boolean);
      const lastActivity = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : null;
      const daysInactive = lastActivity ? daysBetween(lastActivity, `${today}T23:59:59-05:00`) : null;
      const expected = status === "proximo" ? 0 : expectedLessons(group.starts_at, today);

      const estado: AvanceEstado = !userId
        ? "sin-cuenta"
        : status === "proximo"
          ? "por-empezar"
          : done >= total
            ? "parte1-completa"
            : done === 0 && expected > 1
              ? "no-empezo"
              : done < expected - 2
                ? "atrasado"
                : "al-dia";

      return {
        key: member.id,
        email: member.email,
        name: profile?.full_name || null,
        userId,
        grupo: { id: group.id, nombre: group.nombre, startsAt: group.starts_at, endsAt, status },
        done,
        total,
        percent: Math.round((done / total) * 100),
        expected,
        completed,
        nextLesson,
        lastActivity,
        daysInactive,
        moduleFichas: userFichas.filter((f) => f.es_del_modulo).map((f) => f.modulo),
        entrega,
        part2Done: part2Module.lessons.filter((l) => completed.has(l.key)).length,
        practica,
        estado,
      };
    }),
  );
}

const csvCell = (value: string | number | null) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export function avanceCsv(rows: AvanceConvocado[]) {
  const header = [
    "Nombre",
    "Correo",
    "Grupo",
    "Estado",
    "Lecciones",
    "Avance %",
    "Debería llevar",
    "Siguiente lección",
    "Última actividad",
    "Fichas de módulo",
    "Tarea final",
    "Parte 2",
    "Práctica",
  ];
  const lines = rows.map((r) =>
    [
      r.name,
      r.email,
      r.grupo.nombre,
      ESTADO_LABEL[r.estado],
      `${r.done}/${r.total}`,
      r.percent,
      r.expected,
      r.nextLesson ? `${r.nextLesson.code} · ${r.nextLesson.title}` : "—",
      r.lastActivity ? r.lastActivity.slice(0, 10) : "—",
      r.moduleFichas.length,
      r.entrega?.estado ?? "—",
      `${r.part2Done}/${part2Module.lessons.length}`,
      r.practica?.estado ?? "—",
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.map(csvCell).join(","), ...lines].join("\n");
}
