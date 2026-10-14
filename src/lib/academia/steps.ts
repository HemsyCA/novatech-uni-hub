// Divide una lección en pasos cortos, uno por pantalla. Usa los mismos encabezados
// del markdown: cada "####" de la Explicación es un paso y el resto de "###" también.

export type StepKind = "intro" | "concepto" | "video" | "pasos" | "errores" | "practica" | "comprueba" | "otro";

export interface LessonStep {
  kind: StepKind;
  title: string;
  content: string;
  // Solo en el paso de introducción: el texto de "¿Para qué me sirve?" y un aviso previo (por ejemplo, "Opcional").
  why?: string;
  note?: string;
}

const splitBy = (text: string, level: "###" | "####") =>
  text.split(new RegExp(`^${level} `, "m")).map((chunk, index) => {
    if (index === 0) return { title: "", body: chunk.trim() };
    const newline = chunk.indexOf("\n");
    return newline === -1
      ? { title: chunk.trim(), body: "" }
      : { title: chunk.slice(0, newline).trim(), body: chunk.slice(newline + 1).trim() };
  });

// Un "Paso a paso" largo se divide en sus partes, marcadas con una línea en negrita
// ("**1. Crear el proyecto**", "**Parte 2: …**").
const BOLD_HEADING = /^\*\*(.+)\*\*$/;

const splitByBoldHeadings = (text: string) => {
  const parts: { title: string; lines: string[] }[] = [{ title: "", lines: [] }];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const heading = line.trim().match(BOLD_HEADING);
    const startsBlock = index === 0 || lines[index - 1].trim() === "";
    if (heading && startsBlock) parts.push({ title: heading[1].replace(/^\d+\.\s*/, ""), lines: [] });
    else parts[parts.length - 1].lines.push(line);
  });
  return parts.map((part) => ({ title: part.title, body: part.lines.join("\n").trim() }));
};

const namedSteps: Record<string, { kind: StepKind; title: string }> = {
  "videos de apoyo": { kind: "video", title: "Mira cómo se hace" },
  "paso a paso": { kind: "pasos", title: "Hazlo paso a paso" },
  "errores comunes": { kind: "errores", title: "Errores comunes" },
  "mini práctica": { kind: "practica", title: "Practica" },
  "puedo continuar si…": { kind: "comprueba", title: "Comprueba lo que aprendiste" },
};

export const lessonSteps = (content: string): LessonStep[] => {
  // Las tareas no tienen "Objetivo": su texto inicial cumple ese papel.
  const [opening, ...sections] = splitBy(content, "###");
  const find = (title: string) => sections.find((s) => s.title.toLowerCase() === title)?.body ?? "";
  const steps: LessonStep[] = [
    {
      kind: "intro",
      title: "Antes de empezar",
      content: find("objetivo") || opening.body,
      why: find("¿para qué me sirve?") || undefined,
      note: find("objetivo") && opening.body ? opening.body : undefined,
    },
  ];

  for (const section of sections) {
    const name = section.title.toLowerCase();
    if (name === "objetivo" || name === "¿para qué me sirve?") continue;

    if (name === "explicación") {
      const [preface, ...concepts] = splitBy(section.body, "####");
      if (concepts.length === 0) {
        steps.push({ kind: "concepto", title: "Explicación", content: preface.body });
        continue;
      }
      concepts.forEach((concept, index) =>
        steps.push({
          kind: "concepto",
          title: concept.title,
          content: index === 0 && preface.body ? `${preface.body}\n\n${concept.body}` : concept.body,
        }),
      );
      continue;
    }

    const named = namedSteps[name];
    if (named?.kind === "pasos") {
      const [preface, ...parts] = splitByBoldHeadings(section.body);
      if (parts.length > 1) {
        parts.forEach((part, index) =>
          steps.push({
            kind: "pasos",
            title: part.title,
            content: index === 0 && preface.body ? `${preface.body}\n\n${part.body}` : part.body,
          }),
        );
        continue;
      }
    }
    steps.push({ kind: named?.kind ?? "otro", title: named?.title ?? section.title, content: section.body });
  }

  if (!steps.some((s) => s.kind === "comprueba")) {
    // Solo las tareas llegan aquí: no tienen checklist, pero sí la ficha del módulo y el cierre.
    steps.push({ kind: "comprueba", title: "Ficha del módulo y cierre", content: "" });
  }
  // Los títulos se muestran como texto plano: sin las comillas de código del markdown.
  return steps.map((step) => ({ ...step, title: step.title.replace(/`/g, "") }));
};

// Las casillas "- [ ] …" del checklist final.
export const checklistItems = (content: string) =>
  content
    .split(/\r?\n/)
    .map((line) => line.match(/^- \[[ xX]\] (.+)$/)?.[1])
    .filter((item): item is string => Boolean(item));

// Unas 180 palabras por minuto, más un margen para hacer los ejercicios.
export const estimatedMinutes = (content: string) => Math.max(5, Math.round(content.split(/\s+/).length / 180) + 5);
