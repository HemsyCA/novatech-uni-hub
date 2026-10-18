import type { Lang } from "@/lib/i18n";

export const SITE_URL = "https://novatech-uni-hub.vercel.app";
export const SITE_NAME = "NovaTech";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

interface PageSeo {
  title: Record<Lang, string>;
  description: Record<Lang, string>;
}

const DEFAULT_SEO: PageSeo = {
  title: {
    es: "NovaTech | Equipo universitario de robótica",
    en: "NovaTech | University robotics team",
  },
  description: {
    es: "NovaTech es el equipo universitario de robótica de la UNI: diseñamos robots, competimos y formamos a nuevos ingenieros.",
    en: "NovaTech is the UNI university robotics team: we design robots, compete and train the next generation of engineers.",
  },
};

// Páginas públicas indexables. Las rutas que no estén aquí (cuenta, admin, auth) llevan noindex.
export const PUBLIC_PAGES: Record<string, PageSeo> = {
  "/": DEFAULT_SEO,
  "/nosotros": {
    title: { es: "Nosotros | NovaTech", en: "About us | NovaTech" },
    description: {
      es: "Conoce la historia, la misión y los valores del equipo de robótica NovaTech.",
      en: "Learn about the story, mission and values of the NovaTech robotics team.",
    },
  },
  "/robots": {
    title: { es: "Robots | NovaTech", en: "Robots | NovaTech" },
    description: {
      es: "Los robots que diseñamos y construimos en NovaTech para competencias nacionales e internacionales.",
      en: "The robots we design and build at NovaTech for national and international competitions.",
    },
  },
  "/competencias": {
    title: { es: "Competencias | NovaTech", en: "Competitions | NovaTech" },
    description: {
      es: "Las competencias de robótica en las que participa NovaTech y nuestros resultados.",
      en: "The robotics competitions NovaTech takes part in, and our results.",
    },
  },
  "/equipo": {
    title: { es: "Equipo | NovaTech", en: "Team | NovaTech" },
    description: {
      es: "Las personas detrás de NovaTech: áreas, líderes y miembros del equipo.",
      en: "The people behind NovaTech: areas, leads and team members.",
    },
  },
  "/unete": {
    title: { es: "Únete | NovaTech", en: "Join us | NovaTech" },
    description: {
      es: "Postula a la convocatoria de NovaTech y forma parte del equipo de robótica.",
      en: "Apply to the NovaTech open call and join the robotics team.",
    },
  },
  "/store": {
    title: { es: "Tienda | NovaTech", en: "Store | NovaTech" },
    description: {
      es: "Productos y componentes de NovaTech.",
      en: "NovaTech products and components.",
    },
  },
  "/print3d": {
    title: { es: "Impresión 3D | NovaTech", en: "3D printing | NovaTech" },
    description: {
      es: "Servicio de impresión 3D de NovaTech para proyectos universitarios.",
      en: "NovaTech 3D printing service for university projects.",
    },
  },
};

export const getPageSeo = (pathname: string) => {
  const key = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const page = PUBLIC_PAGES[key];
  return { seo: page ?? DEFAULT_SEO, indexable: Boolean(page), canonicalPath: key };
};
