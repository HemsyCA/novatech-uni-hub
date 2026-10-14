import electronicaMd from "@/content/academia/electronica.md?raw";
import mecanicaMd from "@/content/academia/mecanica.md?raw";
import programacionMd from "@/content/academia/programacion.md?raw";
import soldaduraMd from "@/content/academia/soldadura.md?raw";
import { moduleInfo, part2Info, type CourseModuleId, type ModuleId, type ModuleInfo } from "@/lib/academia/modules";

export type { CourseModuleId, ModuleId };

const markdownByModule: Record<CourseModuleId, string> = {
  electronica: electronicaMd,
  mecanica: mecanicaMd,
  programacion: programacionMd,
  soldadura: soldaduraMd,
};

export interface Lesson {
  key: string;
  moduleId: CourseModuleId;
  slug: string;
  code: string;
  title: string;
  content: string;
  isTask: boolean;
  optional: boolean;
}

export interface CourseModule extends ModuleInfo<CourseModuleId> {
  intro: string;
  lessons: Lesson[];
}

const parseHeading = (heading: string) => {
  const [code, ...rest] = heading.split(" · ");
  const title = rest.join(" · ").trim();
  if (code === "Tarea final") return { code: "Tarea", slug: "tarea", title: `Tarea final: ${title.toLowerCase()}`, isTask: true };
  return { code, slug: code.toLowerCase(), title, isTask: false };
};

const parseModule = (meta: ModuleInfo<CourseModuleId>): CourseModule => {
  const [intro, ...sections] = markdownByModule[meta.id].split(/^## /m);
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

export const courseModules: CourseModule[] = moduleInfo.map(parseModule);

export const part2Module: CourseModule = parseModule(part2Info);

const allModules = [...courseModules, part2Module];

const lessonIndex = new Map(allModules.flatMap((m) => m.lessons.map((l) => [l.key, l] as const)));

export const getModule = (id: string | undefined) => allModules.find((m) => m.id === id);

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
