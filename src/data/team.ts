export interface Area {
  name: string;
  description: string;
}

export interface TeamMember {
  name: string;
  career: string;
  role: string;
}

export const areas: Area[] = [
  { name: "Dirección General", description: "Coordina las áreas y define la planificación anual del equipo." },
  { name: "Área Académica", description: "Organiza la formación interna, los talleres y la Academia Nova." },
  { name: "Área de Investigación", description: "Impulsa proyectos de robótica junto al Vicerrectorado de Investigación de la UNI." },
  { name: "Talento Humano", description: "Lleva las convocatorias y acompaña a cada integrante del equipo." },
  { name: "Finanzas y Logística", description: "Gestiona importaciones, inventario de materiales y herramientas." },
  { name: "Marketing", description: "Maneja la identidad de Nova, las redes sociales y la difusión de eventos." },
  { name: "Relaciones Exteriores", description: "Construye vínculos con otras universidades, equipos y organizaciones." },
];

export const teamStats = {
  activeMembers: 30,
  careers: 6,
  areas: areas.length,
};

export const directiva: TeamMember[] = [];

export const founders: TeamMember[] = [];

export const honoraryMembers: TeamMember[] = [];
