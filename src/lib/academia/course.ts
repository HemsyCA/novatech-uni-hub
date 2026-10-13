import electronicaMd from "@/content/academia/electronica.md?raw";
import mecanicaMd from "@/content/academia/mecanica.md?raw";
import programacionMd from "@/content/academia/programacion.md?raw";

export type ModuleId = "electronica" | "mecanica" | "programacion";

export interface Lesson {
  key: string;
  moduleId: ModuleId;
  slug: string;
  code: string;
  title: string;
  content: string;
  isTask: boolean;
  optional: boolean;
}

export interface CourseModule {
  id: ModuleId;
  name: string;
  tool: string;
  duration: string;
  needs: string;
  summary: string;
  intro: string;
  lessons: Lesson[];
}

interface ModuleMeta {
  id: ModuleId;
  name: string;
  tool: string;
  duration: string;
  needs: string;
  summary: string;
  markdown: string;
}

const moduleMeta: ModuleMeta[] = [
  {
    id: "electronica",
    name: "Electrónica",
    tool: "EasyEDA Pro",
    duration: "5 a 6 horas",
    needs: "Calculadora, cuaderno y una cuenta en EasyEDA",
    summary: "Electricidad básica, el ESP32 y tus primeros esquemáticos y PCBs.",
    markdown: electronicaMd,
  },
  {
    id: "mecanica",
    name: "Mecánica",
    tool: "Onshape",
    duration: "5 horas",
    needs: "Una cuenta en Onshape y un mouse con rueda",
    summary: "Diseño de piezas en 3D listas para imprimir.",
    markdown: mecanicaMd,
  },
  {
    id: "programacion",
    name: "Programación",
    tool: "Wokwi y Arduino IDE (opcional)",
    duration: "7 horas",
    needs: "Una cuenta en Wokwi",
    summary: "Programar el ESP32: LEDs, botones, sensores, servos y comandos.",
    markdown: programacionMd,
  },
];

const parseHeading = (heading: string) => {
  const [code, ...rest] = heading.split(" · ");
  const title = rest.join(" · ").trim();
  if (code === "Tarea final") return { code: "Tarea", slug: "tarea", title: `Tarea final: ${title.toLowerCase()}`, isTask: true };
  return { code, slug: code.toLowerCase(), title, isTask: false };
};

const parseModule = (meta: ModuleMeta): CourseModule => {
  const [intro, ...sections] = meta.markdown.split(/^## /m);
  const lessons = sections.map((section) => {
    const newline = section.indexOf("\n");
    const { code, slug, title, isTask } = parseHeading(section.slice(0, newline).trim());
    return {
      key: `${meta.id}/${slug}`,
      moduleId: meta.id,
      slug,
      code,
      title,
      content: section.slice(newline + 1).trim(),
      isTask,
      optional: slug === "extra",
    };
  });
  return { ...meta, intro: intro.trim(), lessons };
};

export const courseModules: CourseModule[] = moduleMeta.map(parseModule);

const lessonIndex = new Map(courseModules.flatMap((m) => m.lessons.map((l) => [l.key, l] as const)));

export const getModule = (id: string | undefined) => courseModules.find((m) => m.id === id);

export const getLesson = (moduleId: string | undefined, slug: string | undefined) =>
  lessonIndex.get(`${moduleId}/${slug}`);

const keys = (moduleId: ModuleId, slugs: string[]) => slugs.map((s) => `${moduleId}/${s}`);

export const weeklyPlan = [
  {
    title: "Semana 1",
    lessonKeys: [...keys("electronica", ["e1", "e2", "e3"]), ...keys("programacion", ["p1", "p2", "p3", "p4"])],
  },
  {
    title: "Semana 2",
    lessonKeys: [...keys("programacion", ["p5", "p6", "p7", "p8"]), ...keys("electronica", ["e4", "e5", "e6"])],
  },
  {
    title: "Semana 3",
    lessonKeys: [
      ...keys("mecanica", ["m1", "m2", "m3", "m4", "m5"]),
      "electronica/tarea",
      "programacion/tarea",
      "mecanica/tarea",
    ],
  },
].map((week) => ({ ...week, lessons: week.lessonKeys.map((k) => lessonIndex.get(k)!) }));

export const recommendedOrder = weeklyPlan.flatMap((w) => w.lessons);

export const requiredLessons = courseModules.flatMap((m) => m.lessons.filter((l) => !l.optional));

export const lessonPath = (lesson: Lesson) => `/academia/${lesson.moduleId}/${lesson.slug}`;
