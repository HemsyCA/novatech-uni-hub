import { Link } from "react-router-dom";
import finalTaskMd from "@/content/academia/tarea-final.md?raw";
import { useAcademy } from "@/components/academia/academy-context";
import { Markdown } from "@/components/academia/Markdown";
import { EntregaSection } from "@/components/academia/EntregaSection";
import { Breadcrumbs, StatusDot } from "@/components/academia/ui";
import { courseModules, lessonPath } from "@/lib/academia/course";

const deliverables: Record<string, string> = {
  programacion: "Link público del proyecto en Wokwi + imagen del diagrama de flujo",
  electronica: "PDF del esquemático + capturas de la PCB (2D y 3D)",
  mecanica: "Link público de Onshape + archivo STL + tabla de medidas",
};

export default function AcademiaFinalTask() {
  const { progress, fichas, entrega } = useAcademy();
  const parts = courseModules.map((module) => ({
    module,
    lesson: module.lessons.find((l) => l.isTask)!,
  }));

  return (
    <article className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Academia", to: "/academia" }, { label: "Tarea final" }]} />
      <p className="text-xs uppercase tracking-widest text-white/50">Tarea final</p>
      <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight mt-2 mb-8">
        Panel de control Nova
      </h1>

      <section className="mb-12 rounded-2xl border border-white/20 p-5">
        <h2 className="font-display text-lg font-bold mb-1">¿Qué entregas?</h2>
        <p className="text-sm text-white/60 mb-4">
          Cada parte tiene su propia página con los requisitos. Márcala como completada cuando la termines.
        </p>
        <ul className="divide-y divide-white/10">
          {parts.map(({ module, lesson }) => (
            <li key={module.id}>
              <Link to={lessonPath(lesson)} className="flex items-start gap-3 py-3 group">
                <StatusDot done={progress.completed.has(lesson.key)} />
                <span className="flex-1">
                  <span className="block font-semibold text-white group-hover:underline underline-offset-4">
                    {module.name}
                  </span>
                  <span className="block text-sm text-white/60">{deliverables[module.id]}</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="py-3">
            <Link to="/academia/bitacora" className="flex items-start gap-3 group">
              <StatusDot done={parts.every(({ module }) => fichas.moduleFicha(module.id))} />
              <span className="flex-1">
                <span className="block font-semibold text-white group-hover:underline underline-offset-4">Bitácora</span>
                <span className="block text-sm text-white/60">
                  Las tres fichas de módulo ({parts.filter(({ module }) => fichas.moduleFicha(module.id)).length} de 3 listas),
                  más una reflexión final.
                </span>
              </span>
            </Link>
          </li>
          <li className="flex items-start gap-3 py-3">
            <StatusDot done={Boolean(entrega.entrega)} />
            <span>
              <span className="block font-semibold text-white">Video</span>
              <span className="block text-sm text-white/60">De 2 a 3 minutos explicando tu proyecto.</span>
            </span>
          </li>
        </ul>
      </section>

      <EntregaSection />

      <Markdown>{finalTaskMd}</Markdown>
    </article>
  );
}
