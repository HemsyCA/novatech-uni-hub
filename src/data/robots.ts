export type RobotLevel = "Amateur" | "Senior" | "Máster";

export type RobotCategoryId =
  | "minisumo-autonomo"
  | "minisumo-bt"
  | "microsumo"
  | "seguidor"
  | "soccer"
  | "walking"
  | "bug"
  | "combate";

export interface RobotCategory {
  id: RobotCategoryId;
  name: string;
  description: string;
}

export interface Robot {
  name: string;
  categories: RobotCategoryId[];
  levels: RobotLevel[];
  isTeam?: boolean;
}

export interface Pcb {
  name: string;
  usedIn: string;
}

export const robotCategories: RobotCategory[] = [
  {
    id: "minisumo-autonomo",
    name: "Minisumo Autónomo",
    description: "Robots de 10 × 10 cm y 500 g que detectan al rival y lo empujan fuera del dohyo sin control humano.",
  },
  {
    id: "minisumo-bt",
    name: "Minisumo Bluetooth",
    description: "El mismo formato del minisumo, pero manejado a distancia por Bluetooth.",
  },
  {
    id: "microsumo",
    name: "Microsumo Autónomo",
    description: "La versión más pequeña del sumo robótico: combates autónomos en un cubo de 5 cm.",
  },
  {
    id: "seguidor",
    name: "Seguidor de Línea Velocista",
    description: "Recorren una pista marcada por una línea en el menor tiempo posible, con sensores y control PID.",
  },
  {
    id: "soccer",
    name: "Robot Soccer",
    description: "Equipos de robots que disputan partidos de fútbol en una cancha reducida.",
  },
  {
    id: "walking",
    name: "Walking Race (OTTO)",
    description: "Carrera de robots bípedos tipo OTTO que caminan con servomotores en lugar de ruedas.",
  },
  {
    id: "bug",
    name: "Bug Race",
    description: "Carrera de pequeños robots tipo insecto que avanzan sin ruedas.",
  },
  {
    id: "combate",
    name: "Combate 1 lb",
    description: "Combate de robots de hasta una libra dentro de una arena cerrada.",
  },
];

// Robots inscritos por Nova en los torneos de 2026 (fuente: Notion, bases "Robots - Competidores").
export const robots: Robot[] = [
  { name: "Haniel", categories: ["minisumo-bt", "minisumo-autonomo", "microsumo", "walking", "bug", "combate"], levels: ["Senior", "Máster"] },
  { name: "Morroponus", categories: ["minisumo-bt", "minisumo-autonomo", "bug"], levels: ["Máster"] },
  { name: "Nova I", categories: ["seguidor"], levels: ["Máster"] },
  { name: "Nova II", categories: ["seguidor"], levels: ["Máster"] },
  { name: "Nova IV", categories: ["seguidor"], levels: ["Máster"] },
  { name: "Ajoloyork GT", categories: ["minisumo-autonomo"], levels: ["Máster"] },
  { name: "El Señor de la Noche", categories: ["minisumo-bt"], levels: ["Máster"] },
  { name: "Fuzzy Bot", categories: ["minisumo-autonomo"], levels: ["Máster"] },
  { name: "Rigoberto", categories: ["minisumo-bt"], levels: ["Máster"] },
  { name: "TitanNova", categories: ["minisumo-bt"], levels: ["Máster"] },
  { name: "216", categories: ["minisumo-bt"], levels: ["Máster"] },
  { name: "505", categories: ["minisumo-bt"], levels: ["Máster"] },
  { name: "Zwebao", categories: ["microsumo"], levels: ["Máster"] },
  { name: "Venom II", categories: ["bug"], levels: ["Máster"] },
  { name: "Yonel", categories: ["minisumo-bt", "minisumo-autonomo", "walking", "combate"], levels: ["Senior"] },
  { name: "Undertale", categories: ["minisumo-bt", "minisumo-autonomo"], levels: ["Senior"] },
  { name: "Wasaberto de la Noche", categories: ["minisumo-bt"], levels: ["Senior"] },
  { name: "AKA Wasaberto II", categories: ["minisumo-autonomo"], levels: ["Senior"] },
  { name: "Mini Morroponus", categories: ["minisumo-bt"], levels: ["Senior"] },
  { name: "Papoi", categories: ["minisumo-bt"], levels: ["Senior"] },
  { name: "Solaris", categories: ["minisumo-bt"], levels: ["Senior"] },
  { name: "Spectre", categories: ["minisumo-bt"], levels: ["Senior"] },
  { name: "Sandwichito", categories: ["minisumo-bt"], levels: ["Senior"] },
  { name: "The Ironfist", categories: ["minisumo-bt"], levels: ["Senior"] },
  { name: "Padrino", categories: ["minisumo-autonomo"], levels: ["Senior"] },
  { name: "Neurobot II", categories: ["minisumo-autonomo"], levels: ["Senior"] },
  { name: "Vaguito", categories: ["seguidor"], levels: ["Senior"] },
  { name: "Jugador 456", categories: ["walking"], levels: ["Senior"] },
  { name: "Pastruloso", categories: ["bug"], levels: ["Senior"] },
  { name: "Team Nova", categories: ["soccer"], levels: ["Máster"], isTeam: true },
  { name: "Los Chankas", categories: ["soccer"], levels: ["Máster"], isTeam: true },
  { name: "Supernova y Morropón", categories: ["soccer"], levels: ["Senior"], isTeam: true },
  { name: "Los Chankitas", categories: ["soccer"], levels: ["Senior"], isTeam: true },
  { name: "Los Ragnagol", categories: ["soccer"], levels: ["Senior"], isTeam: true },
  { name: "NovaForce", categories: ["soccer"], levels: ["Senior"], isTeam: true },
  { name: "Medrabots", categories: ["soccer"], levels: ["Senior"], isTeam: true },
  { name: "Los Robonel", categories: ["soccer"], levels: ["Senior"], isTeam: true },
  { name: "Los Vaguitos", categories: ["soccer"], levels: ["Senior"], isTeam: true },
];

export const featuredRobotNames = ["Haniel", "Nova II", "Morroponus"];

export const pcbs: Pcb[] = [
  { name: "PCB Universal Senior-Máster V2", usedIn: "Minisumo, Microsumo y Robot Soccer" },
  { name: "PCB Universal Senior-Máster V1", usedIn: "Minisumo y Robot Soccer" },
  { name: "PCB Universal Senior + Regleta de Sensores", usedIn: "Seguidor de Línea Velocista" },
  { name: "PCB Universal Articulados", usedIn: "Robots con servomotores (OTTO, humanoides)" },
];

export const categoryName = (id: RobotCategoryId) =>
  robotCategories.find((c) => c.id === id)?.name ?? id;
