import type { ResourceStep } from "@/components/academia/ResourceOrder";
import { GUIDE_STOP_COUNT } from "@/lib/academia/guide-progress";
import type { AcademyEntrega } from "@/services/supabase/academia";

const ENTREGA_LABEL = { enviada: "en revisión", observada: "con observaciones", aprobada: "aprobada" } as const;

// Guía → Bitácora → Tarea final, con lo que le falta a cada una.
export const resourceSteps = ({
  guideVisited,
  moduleFichas,
  modules,
  part1Done,
  entrega,
}: {
  guideVisited: number;
  moduleFichas: number;
  modules: number;
  part1Done: boolean;
  entrega: AcademyEntrega | null;
}): ResourceStep[] => {
  const guideDone = guideVisited >= GUIDE_STOP_COUNT;
  const fichasDone = moduleFichas >= modules;
  const estado = entrega?.estado;
  const taskOpen = part1Done || Boolean(entrega);

  return [
    {
      to: "/academia/guia",
      when: "Antes de empezar",
      title: "Ruta de bienvenida",
      detail: guideDone ? "Completada · vuelve cuando quieras" : `${guideVisited} de ${GUIDE_STOP_COUNT} paradas`,
      status: guideDone ? "done" : "current",
    },
    {
      to: "/academia/bitacora",
      when: "Mientras avanzas",
      title: "Bitácora Nova",
      detail: `Una ficha al cerrar cada módulo · ${moduleFichas} de ${modules}`,
      status: fichasDone ? "done" : guideDone && !taskOpen ? "current" : "pending",
    },
    {
      to: "/academia/tarea-final",
      when: "Al terminar la Parte 1",
      title: "Tarea final",
      detail: estado ? `Tu entrega está ${ENTREGA_LABEL[estado]}` : "El Panel de control Nova",
      status: estado === "aprobada" ? "done" : taskOpen ? "current" : "pending",
    },
  ];
};
