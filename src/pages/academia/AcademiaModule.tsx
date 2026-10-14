import { Navigate, useParams } from "react-router-dom";
import { useAcademy, useCanAccessPart2, useLessonState } from "@/components/academia/academy-context";
import { Markdown } from "@/components/academia/Markdown";
import { Part2Locked } from "@/components/academia/Part2Locked";
import { Breadcrumbs, LessonRow, ProgressBar } from "@/components/academia/ui";
import { getModule } from "@/lib/academia/course";

export default function AcademiaModule() {
  const { moduleId } = useParams();
  const { progress } = useAcademy();
  const module = getModule(moduleId);
  const canAccessPart2 = useCanAccessPart2();
  const stateOf = useLessonState();

  if (!module) return <Navigate to="/academia" replace />;
  if (module.id === "soldadura" && !canAccessPart2) return <Part2Locked />;

  const required = module.lessons.filter((l) => !l.optional);
  const done = required.filter((l) => progress.completed.has(l.key)).length;
  const facts = [
    { label: "Herramienta", value: module.tool },
    { label: "Tiempo estimado", value: module.duration },
    { label: "Lo que necesitas", value: module.needs },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Academia", to: "/academia" }, { label: module.name }]} />
      <p className="text-xs uppercase tracking-widest text-white/50">Módulo</p>
      <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight mt-2">{module.name}</h1>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-xl border border-white/10 p-4">
            <dt className="text-[11px] uppercase tracking-wider text-white/40">{fact.label}</dt>
            <dd className="mt-1 text-sm text-white/85">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <Markdown>{module.intro}</Markdown>
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-xl font-bold">Lecciones</h2>
          <span className="text-sm text-white/60">
            {done} de {required.length}
          </span>
        </div>
        <ProgressBar value={Math.round((done / required.length) * 100)} label={`Progreso de ${module.name}`} />
        <div className="mt-4 rounded-2xl border border-white/10 p-2 space-y-0.5">
          {module.lessons.map((lesson) => (
            <LessonRow key={lesson.key} lesson={lesson} state={stateOf(lesson)} />
          ))}
        </div>
      </section>
    </div>
  );
}
