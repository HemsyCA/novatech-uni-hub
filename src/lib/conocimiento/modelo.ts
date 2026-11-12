import { robotCategories, robots, type RobotCategoryId, type RobotLevel } from "@/data/robots";

// La base de conocimiento de Nova.
//
// Cada cosa es una página y existe una sola vez: categorías, placas (PCB), robots, temas y componentes.
// Las páginas se enlazan entre sí (una categoría enlaza a su placa; la placa muestra "Se usa en"),
// así nada se copia en dos lugares.
//
// El contenido se escribe en archivos Markdown dentro de src/content/conocimiento/<tipo>/<slug>.md.
// Agregar un archivo agrega una página. Cada tipo tiene una plantilla con sus apartados: lo que se
// escribe bajo "## <apartado>" aparece en ese apartado; si está vacío, la página muestra "Próximamente"
// y lo que irá ahí. Ver src/content/conocimiento/README.md.

export type TipoPagina = "categorias" | "placas" | "robots" | "temas" | "componentes";
export type Disciplina = "electronica" | "mecanica" | "programacion";
// Qué clase de texto es (marco Diátaxis): ayuda a saber qué vas a encontrar.
export type ClaseTexto = "explicacion" | "guia" | "referencia";

export interface ApartadoPlantilla {
  key: string;
  title: string;
  // Lo que se escribirá ahí: se muestra mientras el apartado está vacío.
  guia: string;
  disciplina?: Disciplina;
}

export interface Apartado extends ApartadoPlantilla {
  body: string;
}

export interface Pagina {
  tipo: TipoPagina;
  slug: string;
  titulo: string;
  resumen: string;
  apartados: Apartado[];
  meta: Record<string, string | string[]>;
}

export const TIPOS: Record<TipoPagina, { label: string; plural: string; descripcion: string }> = {
  categorias: {
    label: "Categoría",
    plural: "Categorías",
    descripcion: "La esencia de cada tipo de robot: electrónica, mecánica y programación.",
  },
  placas: {
    label: "Placa (PCB)",
    plural: "Placas (PCB)",
    descripcion: "Las placas del equipo: esquemático, componentes, diseño y fabricación.",
  },
  robots: { label: "Robot", plural: "Robots", descripcion: "La ficha de cada robot: cómo está hecho, cómo replicarlo y mejorarlo." },
  temas: { label: "Tema", plural: "Temas", descripcion: "Conceptos explicados a fondo, con simulaciones: PID, sensores, tracción…" },
  componentes: {
    label: "Componente",
    plural: "Componentes",
    descripcion: "Las piezas que usamos: qué son, cómo se conectan y sus hojas de datos.",
  },
};

export const DISCIPLINA_LABEL: Record<Disciplina, string> = {
  electronica: "Electrónica",
  mecanica: "Mecánica",
  programacion: "Programación",
};

export const CLASE_LABEL: Record<ClaseTexto, string> = {
  explicacion: "Explicación",
  guia: "Guía práctica",
  referencia: "Referencia",
};

// ---------------------------------------------------------------- plantillas

export const PLANTILLAS: Record<TipoPagina, ApartadoPlantilla[]> = {
  categorias: [
    { key: "esencia", title: "La esencia", guia: "Qué es la categoría, cómo se gana y las reglas que más importan." },
    {
      key: "electronica",
      title: "Electrónica: lo básico",
      disciplina: "electronica",
      guia: "Lo esencial de la electrónica de este robot. Por ejemplo, cómo se arma el esquemático de los sensores de piso.",
    },
    {
      key: "mecanica",
      title: "Mecánica: lo básico",
      disciplina: "mecanica",
      guia: "Lo esencial de su mecánica. Por ejemplo, por qué importa una estructura rígida y el coeficiente de rozamiento de las ruedas.",
    },
    {
      key: "programacion",
      title: "Programación: lo básico",
      disciplina: "programacion",
      guia: "La esencia de su programa, con una simulación para probarla. Por ejemplo, cómo funciona el PID y cómo se ve en el código.",
    },
    {
      key: "insignia",
      title: "Nuestro robot más competitivo",
      guia: "El robot más competitivo que tenemos en esta categoría, para que se pueda mejorar y replicar fácilmente.",
    },
    { key: "ideas", title: "Ideas para próximos aportes", guia: "Qué se podría investigar o mejorar a partir del diseño actual." },
    {
      key: "evaluacion",
      title: "Cómo se evalúan los aportes",
      guia: "Los criterios para evaluar los aportes de esta categoría. Por definir.",
    },
  ],
  placas: [
    { key: "descripcion", title: "Descripción", guia: "Para qué sirve la placa y qué la hace distinta." },
    { key: "esquematico", title: "Esquemático", guia: "El circuito completo, bloque por bloque." },
    { key: "bom", title: "Lista de componentes (BOM)", guia: "Cada componente con su valor, cantidad y dónde comprarlo." },
    { key: "diseno", title: "Diseño de la placa", guia: "Las capas, el ruteo y las decisiones de diseño." },
    { key: "fabricacion", title: "Archivos de fabricación", guia: "Gerber, archivos de ensamblaje y cómo pedirla." },
    { key: "versiones", title: "Versiones", guia: "Qué cambió en cada versión y por qué." },
  ],
  robots: [
    { key: "electronica", title: "Electrónica", disciplina: "electronica", guia: "Qué placa, sensores, motores y batería usa." },
    { key: "mecanica", title: "Mecánica", disciplina: "mecanica", guia: "Su chasis, ruedas o tracción, medidas y peso." },
    { key: "programacion", title: "Programación", disciplina: "programacion", guia: "Su código, su estrategia y cómo se calibra." },
    { key: "replicar", title: "Cómo replicarlo", guia: "Los archivos y los pasos para construir uno igual." },
    { key: "mejorar", title: "Cómo mejorarlo", guia: "Sus puntos débiles y las mejoras que se podrían probar." },
    { key: "competencias", title: "Competencias y resultados", guia: "Dónde compitió y cómo le fue." },
  ],
  temas: [
    { key: "explicacion", title: "Explicación", guia: "El concepto explicado desde lo más básico." },
    { key: "simulacion", title: "Simulación", guia: "Una simulación para cambiar valores y ver qué pasa." },
    { key: "codigo", title: "En el código", guia: "Cómo se ve en el programa del robot." },
    { key: "errores", title: "Errores comunes", guia: "Los problemas típicos y cómo resolverlos." },
  ],
  componentes: [
    { key: "que-es", title: "Qué es", guia: "Qué hace el componente y por qué lo usamos." },
    { key: "conexion", title: "Cómo se conecta", guia: "Sus pines y un esquema de conexión." },
    { key: "datos", title: "Hoja de datos", guia: "Los datos más importantes y el enlace a su hoja de datos." },
    { key: "errores", title: "Errores comunes", guia: "Los problemas típicos al usarlo." },
  ],
};

// ---------------------------------------------------------------- lectura de los archivos

const archivos = import.meta.glob("/src/content/conocimiento/*/*.md", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;

export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Encabezado "--- clave: valor ---" muy simple: valores de texto o listas [a, b].
function leerEncabezado(raw: string): { meta: Record<string, string | string[]>; cuerpo: string } {
  const texto = raw.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(texto);
  if (!match) return { meta: {}, cuerpo: texto };
  const meta: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const value = kv[2].trim();
    meta[kv[1]] = value.startsWith("[")
      ? value
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : value.replace(/^["']|["']$/g, "");
  }
  return { meta, cuerpo: texto.slice(match[0].length) };
}

// Separa el texto por "## Apartado". Los comentarios <!-- --> son notas para quien redacta: no se muestran.
function leerApartados(cuerpo: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const parte of cuerpo.split(/^## /m).slice(1)) {
    const salto = parte.indexOf("\n");
    const titulo = (salto === -1 ? parte : parte.slice(0, salto)).trim().toLowerCase();
    const body = (salto === -1 ? "" : parte.slice(salto + 1)).replace(/<!--[\s\S]*?-->/g, "").trim();
    map.set(titulo, body);
  }
  return map;
}

const texto = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : (v ?? ""));
export const lista = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

function armar(tipo: TipoPagina, slug: string, raw: string | undefined, porDefecto: { titulo: string; resumen?: string }): Pagina {
  const { meta, cuerpo } = raw ? leerEncabezado(raw) : { meta: {}, cuerpo: "" };
  const escritos = leerApartados(cuerpo);
  return {
    tipo,
    slug,
    titulo: texto(meta.titulo) || porDefecto.titulo,
    resumen: texto(meta.resumen) || porDefecto.resumen || "",
    meta,
    apartados: PLANTILLAS[tipo].map((p) => ({ ...p, body: escritos.get(p.title.toLowerCase()) ?? "" })),
  };
}

const delTipo = (tipo: TipoPagina) =>
  Object.entries(archivos)
    .filter(([path]) => path.includes(`/conocimiento/${tipo}/`))
    .map(([path, raw]) => ({ slug: path.split("/").pop()!.replace(/\.md$/, ""), raw }));

const crudo = (tipo: TipoPagina, slug: string) => delTipo(tipo).find((f) => f.slug === slug)?.raw;

// ---------------------------------------------------------------- las páginas

// Las categorías y los robots salen de la lista de la web; su archivo .md es opcional.
const categorias: Pagina[] = robotCategories.map((c) =>
  armar("categorias", c.id, crudo("categorias", c.id), { titulo: c.name, resumen: c.description }),
);

const robotPaginas: (Pagina & { categorias: RobotCategoryId[]; niveles: RobotLevel[] })[] = robots.map((r) => ({
  ...armar("robots", slugify(r.name), crudo("robots", slugify(r.name)), { titulo: r.name }),
  categorias: r.categories,
  niveles: r.levels,
}));

// Placas, temas y componentes existen solo si tienen su archivo.
const desdeArchivos = (tipo: TipoPagina) =>
  delTipo(tipo)
    .filter((f) => !f.slug.startsWith("_"))
    .map((f) => armar(tipo, f.slug, f.raw, { titulo: f.slug }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo));

const placas = desdeArchivos("placas");
const temas = desdeArchivos("temas");
const componentes = desdeArchivos("componentes");

export const PAGINAS: Record<TipoPagina, Pagina[]> = {
  categorias,
  placas,
  robots: robotPaginas,
  temas,
  componentes,
};

export const getPagina = (tipo: TipoPagina, slug: string) => PAGINAS[tipo].find((p) => p.slug === slug) ?? null;

export const esTipo = (value: string): value is TipoPagina => value in TIPOS;

export const rutaDe = (p: Pick<Pagina, "tipo" | "slug">) => `/conocimientos/${p.tipo}/${p.slug}`;

// Cuántos apartados ya tienen contenido.
export const avance = (p: Pagina) => ({ escritos: p.apartados.filter((a) => a.body).length, total: p.apartados.length });

// ---------------------------------------------------------------- relaciones

const categoriasDe = (p: Pagina) => lista(p.meta.categorias);

export function relaciones(p: Pagina) {
  if (p.tipo === "categorias") {
    const id = p.slug;
    const insignia = texto(p.meta.robot_insignia);
    return {
      placas: placas.filter((x) => categoriasDe(x).includes(id)),
      robots: robotPaginas.filter((r) => r.categorias.includes(id as RobotCategoryId)),
      insignia: insignia ? (robotPaginas.find((r) => r.slug === insignia) ?? null) : null,
      temas: temas.filter((x) => categoriasDe(x).includes(id)),
      componentes: componentes.filter((x) => categoriasDe(x).includes(id)),
      categorias: [] as Pagina[],
    };
  }
  if (p.tipo === "robots") {
    const robot = robotPaginas.find((r) => r.slug === p.slug)!;
    const placa = texto(p.meta.placa);
    return {
      categorias: categorias.filter((c) => robot.categorias.includes(c.slug as RobotCategoryId)),
      placas: placa
        ? placas.filter((x) => x.slug === placa)
        : placas.filter((x) => categoriasDe(x).some((c) => robot.categorias.includes(c as RobotCategoryId))),
      robots: [] as Pagina[],
      insignia: null,
      temas: [] as Pagina[],
      componentes: componentes.filter((x) => lista(p.meta.componentes).includes(x.slug)),
    };
  }
  // Placas, temas y componentes: dónde se usan.
  const cats = categoriasDe(p);
  return {
    categorias: categorias.filter((c) => cats.includes(c.slug)),
    placas: p.tipo === "componentes" ? placas.filter((x) => lista(x.meta.componentes).includes(p.slug)) : ([] as Pagina[]),
    robots: p.tipo === "placas" ? robotPaginas.filter((r) => texto(r.meta.placa) === p.slug) : ([] as Pagina[]),
    insignia: null,
    temas: p.tipo === "componentes" ? temas.filter((t) => lista(t.meta.componentes).includes(p.slug)) : ([] as Pagina[]),
    componentes:
      p.tipo === "placas" || p.tipo === "temas" ? componentes.filter((x) => lista(p.meta.componentes).includes(x.slug)) : ([] as Pagina[]),
  };
}

export const disciplinaDe = (p: Pagina): Disciplina | null => {
  const d = texto(p.meta.disciplina);
  return d === "electronica" || d === "mecanica" || d === "programacion" ? d : null;
};

export const claseDe = (p: Pagina): ClaseTexto | null => {
  const c = texto(p.meta.clase);
  return c === "explicacion" || c === "guia" || c === "referencia" ? c : null;
};

export const nivelesDe = (p: Pagina) => robotPaginas.find((r) => r.slug === p.slug)?.niveles ?? [];
