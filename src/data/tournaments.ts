export type Placement = 1 | 2 | 3;

export interface Tournament {
  name: string;
  venue: string;
  start: string;
  end?: string;
  result?: Placement;
  organizedByNova?: boolean;
  international?: boolean;
}

// Solo torneos con participación confirmada de Nova (fuente: Notion "Torneos - Calendario 2025/2026").
export const tournaments: Tournament[] = [
  { name: "X-Robo7s V Edición", venue: "Sechura, Piura", start: "2025-02-20", end: "2025-02-22", result: 1 },
  { name: "Fight, Girls and Robots II Edición", venue: "UTP Sede Norte, Lima", start: "2025-03-08", result: 1 },
  { name: "Ragnabot URP Vol. II", venue: "Universidad Ricardo Palma, Lima", start: "2025-04-25", end: "2025-04-26", result: 1 },
  { name: "Nova Legacy I Edición", venue: "Universidad Nacional de Ingeniería, Lima", start: "2025-06-06", end: "2025-06-07", result: 2, organizedByNova: true },
  { name: "Inka Challenge IV Edición (CONEIMERA)", venue: "Universidad Nacional de Trujillo", start: "2025-08-06", end: "2025-08-08", result: 2 },
  { name: "Intercon Robot Contest", venue: "Universidad Católica de Santa María, Arequipa", start: "2025-08-21", end: "2025-08-22", result: 3 },
  { name: "XI Villatrónica UNFV", venue: "Universidad Federico Villarreal, Lima", start: "2025-09-12", end: "2025-09-13", result: 2 },
  { name: "Robótica UNAC", venue: "Universidad Nacional del Callao", start: "2025-10-03", end: "2025-10-04", result: 1 },
  { name: "Decanatrón IEEE RAS UNMSM", venue: "Universidad Nacional Mayor de San Marcos, Lima", start: "2025-10-24", end: "2025-10-25", result: 2 },
  { name: "RoboChallenge Rumanía", venue: "Universidad Politécnica de Bucarest, Rumanía", start: "2025-10-31", end: "2025-11-02", international: true },
  { name: "Perú HUB Digital: Torneo Robot Soccer", venue: "Escuela Naval del Perú", start: "2025-11-14", result: 1 },
  { name: "Tech Games International", venue: "Universidad ESAN, Lima", start: "2025-11-27", end: "2025-11-29", result: 1 },
  { name: "Fight, Girls and Robots III Edición", venue: "UTP Sede Norte, Lima", start: "2026-03-07", result: 1 },
  { name: "Ragnabot URP Vol. III", venue: "Universidad Ricardo Palma, Lima", start: "2026-04-17", end: "2026-04-18", result: 1 },
  { name: "Nova Legacy II Edición", venue: "Universidad Nacional de Ingeniería, Lima", start: "2026-06-19", end: "2026-06-20", result: 1, organizedByNova: true },
  { name: "Mundialito Multitronics", venue: "Universidad Nacional Mayor de San Marcos, Lima", start: "2026-07-25", result: 2 },
  { name: "Tech Games - CONEIMERA", venue: "Universidad Nacional de Ucayali, Pucallpa", start: "2026-08-13", end: "2026-08-15", result: 1 },
  { name: "XII Villatrónica UNFV", venue: "Universidad Federico Villarreal, Lima", start: "2026-09-11", end: "2026-09-12", result: 1 },
  { name: "Robotmanía IV UPC", venue: "UPC Sede Monterrico, Lima", start: "2026-10-02", end: "2026-10-03", result: 1 },
  { name: "Decanatrón II UNMSM", venue: "Universidad Nacional Mayor de San Marcos, Lima", start: "2026-10-30", end: "2026-10-31" },
  { name: "VI Concurso Nacional de Robótica (CNR)", venue: "Universidad Nacional de Ingeniería, Lima", start: "2026-11-27", end: "2026-11-28" },
];

const parseDay = (iso: string) => new Date(`${iso}T23:59:59`);

const todayStart = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const isUpcoming = (t: Tournament) => parseDay(t.end ?? t.start) >= todayStart();

export const upcomingTournaments = () =>
  tournaments.filter(isUpcoming).sort((a, b) => a.start.localeCompare(b.start));

export const pastTournaments = () => tournaments.filter((t) => !isUpcoming(t));

export const tournamentYears = () =>
  [...new Set(pastTournaments().map((t) => t.start.slice(0, 4)))].sort().reverse();

export const tournamentsByYear = (year: string) =>
  pastTournaments()
    .filter((t) => t.start.startsWith(year))
    .sort((a, b) => b.start.localeCompare(a.start));

export const countPlacements = (list: Tournament[]) => ({
  first: list.filter((t) => t.result === 1).length,
  second: list.filter((t) => t.result === 2).length,
  third: list.filter((t) => t.result === 3).length,
  played: list.length,
});

const monthFormatter = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" });
const fullFormatter = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" });

export const formatTournamentDate = (t: Tournament) => {
  const start = new Date(`${t.start}T12:00:00`);
  if (!t.end) return fullFormatter.format(start);
  const end = new Date(`${t.end}T12:00:00`);
  return `${monthFormatter.format(start)} – ${fullFormatter.format(end)}`;
};

export const placementLabel = (result?: Placement) =>
  result ? `${result}° puesto` : "Participación";
