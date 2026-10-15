import { lessonPath, part2Module, type Lesson } from "@/lib/academia/course";
import { formatDate, formatLimaDateTime, limaToday } from "@/lib/academy-dates";
import type { AcademyEntrega, AcademyPractica } from "@/services/supabase/academia";
import type { AcademyMembership } from "@/types/domain";

// El recorrido de un convocado: de la inscripción a ser miembro de Nova.
export type StageStatus = "done" | "current" | "pending";

export interface JourneyStage {
  id: string;
  label: string;
  detail: string;
  status: StageStatus;
  to?: string;
}

export interface NextStep {
  eyebrow: string;
  title: string;
  description?: string;
  cta?: { label: string; to: string };
  // Lección a la que lleva, para pintar la tarjeta con el color de su módulo.
  lesson?: Lesson;
}

export interface JourneyInput {
  hasAccess: boolean;
  isStaff: boolean;
  isMember: boolean;
  memberships: AcademyMembership[];
  completed: Set<string>;
  done: number;
  total: number;
  nextLesson: Lesson | null;
  entrega: AcademyEntrega | null;
  practica: AcademyPractica | null;
  staffPending?: { entregas: number; inscripciones: number } | null;
}

const part2Next = (completed: Set<string>) => part2Module.lessons.find((l) => !completed.has(l.key)) ?? null;
const part2Count = (completed: Set<string>) => part2Module.lessons.filter((l) => completed.has(l.key)).length;

export const buildJourney = (input: JourneyInput): JourneyStage[] => {
  const { completed, done, total, nextLesson, entrega, practica, isMember } = input;
  const part1Done = nextLesson === null && done >= total;
  const approved = entrega?.estado === "aprobada";
  const p2 = part2Count(completed);
  const p2Total = part2Module.lessons.length;

  const entregaDetail = !entrega
    ? part1Done
      ? "Lista para enviar"
      : "Al terminar la Parte 1"
    : { enviada: "En revisión", observada: "Con observaciones", aprobada: "Aprobada" }[entrega.estado];

  const practicaDetail = !practica
    ? approved
      ? "Esperando fecha"
      : "Con tu kit de soldadura"
    : practica.estado === "programada"
      ? formatLimaDateTime(practica.fecha)
      : practica.estado === "asistio"
        ? "Asististe"
        : "No asististe";

  return [
    { id: "inscripcion", label: "Inscripción", detail: "Aceptada", status: "done" },
    {
      id: "parte1",
      label: "Parte 1",
      detail: `${done} de ${total} lecciones`,
      status: part1Done ? "done" : "current",
      to: "/academia",
    },
    {
      id: "tarea",
      label: "Tarea final",
      detail: entregaDetail,
      status: approved ? "done" : part1Done || entrega ? "current" : "pending",
      to: "/academia/tarea-final",
    },
    {
      id: "parte2",
      label: "Parte 2",
      detail: approved ? `${p2} de ${p2Total} lecciones` : "Soldadura THT y SMD",
      status: approved ? (p2 === p2Total ? "done" : "current") : "pending",
      to: approved ? "/academia/soldadura" : undefined,
    },
    {
      id: "practica",
      label: "Práctica",
      detail: practicaDetail,
      status: practica?.estado === "asistio" ? "done" : approved && p2 === p2Total ? "current" : "pending",
      to: approved ? "/academia" : undefined,
    },
    {
      id: "miembro",
      label: "Miembro",
      detail: isMember ? "¡Bienvenido!" : "Decide la directiva",
      status: isMember ? "done" : practica?.estado === "asistio" ? "current" : "pending",
    },
  ];
};

// La única acción que más importa ahora. Va de lo más urgente a lo más rutinario.
export const nextStepFor = (input: JourneyInput): NextStep => {
  const { completed, done, nextLesson, entrega, practica, staffPending } = input;

  if (input.isStaff && staffPending && staffPending.entregas + staffPending.inscripciones > 0) {
    const parts = [
      staffPending.entregas && `${staffPending.entregas} tarea(s) final(es)`,
      staffPending.inscripciones && `${staffPending.inscripciones} inscripción(es)`,
    ].filter(Boolean);
    return {
      eyebrow: "Directiva · pendiente",
      title: `Tienes ${parts.join(" y ")} por revisar`,
      description: "Los convocados esperan tu revisión para seguir avanzando.",
      cta: { label: "Revisar ahora", to: "/admin" },
    };
  }

  if (!input.hasAccess) {
    const today = limaToday();
    const upcoming = input.memberships.filter((m) => m.starts_at > today).sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
    if (upcoming)
      return {
        eyebrow: "Academia Nova",
        title: `Tu acceso empieza el ${formatDate(upcoming.starts_at)}`,
        description: `Formas parte de ${upcoming.grupo_nombre}. Mientras tanto, conoce cómo funciona la convocatoria.`,
        cta: { label: "Cómo funciona", to: "/unete" },
      };
    if (input.isMember)
      return {
        eyebrow: "Zona de miembros",
        title: "Explora Conocimientos Nova",
        description: "Todo lo que el equipo fue aprendiendo.",
        cta: { label: "Ir a Conocimientos", to: "/conocimientos" },
      };
    const expired = input.memberships.find((m) => m.ends_at < today);
    if (expired)
      return {
        eyebrow: "Academia Nova",
        title: "Tu periodo en la convocatoria terminó",
        description: "Sigues teniendo acceso a la tienda y a la impresión 3D.",
        cta: { label: "Ir a la tienda", to: "/store" },
      };
    return {
      eyebrow: "Nova Tech",
      title: "¿Quieres ser parte del equipo?",
      description: "Conoce cómo es la convocatoria y qué aprenderás en Academia Nova.",
      cta: { label: "Conoce cómo unirte", to: "/unete" },
    };
  }

  if (entrega?.estado === "observada")
    return {
      eyebrow: "Tarea final",
      title: "Corrige tu tarea final",
      description: "La directiva dejó observaciones. Revísalas, corrige y vuelve a enviarla.",
      cta: { label: "Ver observaciones", to: "/academia/tarea-final#entrega" },
    };

  if (practica?.estado === "programada")
    return {
      eyebrow: "Práctica presencial",
      title: formatLimaDateTime(practica.fecha),
      description: `${practica.lugar}. Recibirás tu kit de soldadura.`,
      cta: { label: "Ver detalles", to: "/academia" },
    };

  if (practica?.estado === "asistio")
    return {
      eyebrow: "Último paso",
      title: "La directiva decidirá tu ingreso",
      description: "Completaste la práctica presencial. Te avisaremos aquí.",
    };

  if (entrega?.estado === "aprobada") {
    const next = part2Next(completed);
    return next
      ? {
          eyebrow: "Parte 2 · Soldadura",
          title: `${next.code} · ${next.title}`,
          description: "Prepárate para la práctica presencial.",
          cta: { label: part2Count(completed) > 0 ? "Continuar" : "Empezar la Parte 2", to: lessonPath(next) },
          lesson: next,
        }
      : {
          eyebrow: "Práctica presencial",
          title: "Espera tu fecha de práctica",
          description: "Completaste la Parte 2. El encargado te asignará una fecha y la verás aquí.",
          cta: { label: "Repasar soldadura", to: "/academia/soldadura" },
        };
  }

  if (entrega?.estado === "enviada")
    return {
      eyebrow: "Tarea final",
      title: "Tu tarea final está en revisión",
      description: "Mientras tanto, puedes repasar cualquier lección.",
      cta: { label: "Ver la Academia", to: "/academia" },
    };

  if (nextLesson)
    return done > 0
      ? {
          eyebrow: "Continúa donde te quedaste",
          title: `${nextLesson.code} · ${nextLesson.title}`,
          cta: { label: "Continuar", to: lessonPath(nextLesson) },
          lesson: nextLesson,
        }
      : {
          eyebrow: "Bienvenido a Academia Nova",
          title: "Empieza por la guía de inicio",
          description: "Te explica cómo funciona esta etapa y qué necesitas.",
          cta: { label: "Empezar", to: "/academia/guia" },
        };

  return {
    eyebrow: "Tarea final",
    title: "Envía tu tarea final",
    description: "Completaste todas las lecciones de la Parte 1.",
    cta: { label: "Ir a la tarea final", to: "/academia/tarea-final#entrega" },
  };
};
