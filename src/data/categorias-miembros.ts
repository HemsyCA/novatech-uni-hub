import { pcbs, robotCategories, robots, type RobotCategoryId } from "@/data/robots";

// La estructura de cada categoría para los miembros: solo los rótulos de cada apartado.
// El contenido (descripciones, PCB, archivos) se irá agregando después en cada apartado.

export interface Apartado {
  id: string;
  title: string;
  hint?: string;
  children?: Apartado[];
}

// Qué placas usa cada categoría (según la lista de PCB de la web).
const PCB_BY_CATEGORY: Record<RobotCategoryId, string[]> = {
  "minisumo-autonomo": ["PCB Universal Senior-Máster V2", "PCB Universal Senior-Máster V1"],
  "minisumo-bt": ["PCB Universal Senior-Máster V2", "PCB Universal Senior-Máster V1"],
  microsumo: ["PCB Universal Senior-Máster V2"],
  seguidor: ["PCB Universal Senior + Regleta de Sensores"],
  soccer: ["PCB Universal Senior-Máster V2", "PCB Universal Senior-Máster V1"],
  walking: ["PCB Universal Articulados"],
  bug: [],
  combate: [],
};

const slug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Cada placa tiene los mismos apartados: así todas se documentan igual.
const pcbApartados = (name: string): Apartado => ({
  id: `pcb-${slug(name)}`,
  title: name,
  children: [
    { id: `pcb-${slug(name)}-descripcion`, title: "Descripción" },
    { id: `pcb-${slug(name)}-esquematico`, title: "Esquemático" },
    { id: `pcb-${slug(name)}-componentes`, title: "Lista de componentes (BOM)" },
    { id: `pcb-${slug(name)}-diseno`, title: "Diseño de la placa" },
    { id: `pcb-${slug(name)}-fabricacion`, title: "Archivos de fabricación" },
  ],
});

// Lo que se mueve el robot cambia según la categoría: ruedas, patas o arma.
const MECANICA_EXTRA: Partial<Record<RobotCategoryId, Apartado[]>> = {
  walking: [{ id: "patas-servos", title: "Patas y servomotores" }],
  bug: [{ id: "mecanismo-avance", title: "Mecanismo de avance" }],
  combate: [{ id: "arma", title: "Arma" }, { id: "blindaje", title: "Blindaje" }],
};

export function apartadosDe(id: RobotCategoryId): Apartado[] {
  const placas = PCB_BY_CATEGORY[id].filter((name) => pcbs.some((p) => p.name === name));
  const usaRuedas = !["walking", "bug"].includes(id);
  const nuestros = robots.filter((r) => r.categories.includes(id));

  return [
    {
      id: "la-categoria",
      title: "La categoría",
      children: [
        { id: "que-es", title: "Qué es" },
        { id: "reglamento", title: "Reglamento y medidas" },
        { id: "competencias", title: "Competencias donde participamos" },
      ],
    },
    {
      id: "nuestros-robots",
      title: "Nuestros robots",
      hint: nuestros.length ? undefined : "Todavía no hay robots registrados en esta categoría.",
      children: nuestros.map((r) => ({ id: `robot-${slug(r.name)}`, title: r.name, hint: r.levels.join(" · ") })),
    },
    {
      id: "electronica",
      title: "Electrónica",
      children: [
        {
          id: "placas",
          title: "Placas (PCB)",
          hint: placas.length ? undefined : "Por definir.",
          children: placas.map(pcbApartados),
        },
        { id: "sensores", title: "Sensores" },
        { id: "motores-driver", title: id === "walking" ? "Servomotores" : "Motores y driver" },
        { id: "alimentacion", title: "Alimentación y batería" },
      ],
    },
    {
      id: "mecanica",
      title: "Mecánica",
      children: [
        { id: "chasis", title: "Chasis" },
        ...(usaRuedas ? [{ id: "ruedas", title: "Ruedas y tracción" }] : []),
        ...(MECANICA_EXTRA[id] ?? []),
        { id: "archivos-3d", title: "Archivos 3D" },
      ],
    },
    {
      id: "programacion",
      title: "Programación",
      children: [
        { id: "codigo-base", title: "Código base" },
        { id: "estrategia", title: id === "seguidor" ? "Control PID" : "Estrategia" },
        { id: "calibracion", title: "Calibración y pruebas" },
      ],
    },
    {
      id: "recursos",
      title: "Recursos",
      children: [
        { id: "documentos", title: "Documentos" },
        { id: "videos", title: "Videos" },
        { id: "aprendizajes", title: "Lo que aprendimos en competencias" },
      ],
    },
  ];
}

export const categoriasMiembros = robotCategories;

export const contarApartados = (list: Apartado[]): number =>
  list.reduce((total, a) => total + 1 + contarApartados(a.children ?? []), 0);
