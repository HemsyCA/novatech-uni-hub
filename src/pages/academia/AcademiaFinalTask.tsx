import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CircuitBoard, Code2, Cog, Video, type LucideIcon } from "lucide-react";
import finalTaskMd from "@/content/academia/tarea-final.md?raw";
import { useAcademy } from "@/components/academia/academy-context";
import { Markdown } from "@/components/academia/Markdown";
import { EntregaSection } from "@/components/academia/EntregaSection";
import { Breadcrumbs } from "@/components/academia/ui";
import { courseModules, lessonPath } from "@/lib/academia/course";

const deliverables: Record<string, string> = {
  programacion: "Link público del proyecto en Wokwi + imagen del diagrama de flujo",
  electronica: "PDF del esquemático + capturas de la PCB (2D y 3D)",
  mecanica: "Link público de Onshape + archivo STL + tabla de medidas",
};

const moduleIcons: Record<string, LucideIcon> = { electronica: CircuitBoard, mecanica: Cog, programacion: Code2 };

const steps = [
  { title: "Haz las 3 partes", text: "Una por módulo, cada una con su página de requisitos." },
  { title: "Cierra tu bitácora", text: "Tres fichas de módulo y una reflexión final." },
  { title: "Entrega abajo", text: "Sube tu entrega y la directiva la revisa." },
];

function Item({
  index,
  icon: Icon,
  title,
  text,
  done,
  to,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  text: string;
  done: boolean;
  to?: string;
}) {
  const body = (
    <>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
          done ? "border-nova bg-nova text-white" : "border-nova/40 bg-nova/10 text-nova"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] uppercase tracking-widest text-nova">Requisito {index}</span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="block text-sm text-white/60">{text}</span>
      </span>
      {done ? (
        <span className="shrink-0 rounded-full border border-nova/40 px-3 py-1 text-xs font-semibold text-nova">
          Listo
        </span>
      ) : (
        to && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-nova px-3 py-1 text-xs font-semibold text-white">
            Ir <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        )
      )}
    </>
  );
  const className = `flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
    done ? "border-nova/40 bg-nova/[0.06]" : "border-white/10"
  }`;
  return to ? (
    <Link to={to} className={`group ${className} hover:border-nova/60 hover:bg-nova/10`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default function AcademiaFinalTask() {
  const { progress, fichas, entrega } = useAcademy();
  const parts = courseModules.map((module) => ({
    module,
    lesson: module.lessons.find((l) => l.isTask)!,
  }));
  const fichasListas = parts.filter(({ module }) => fichas.moduleFicha(module.id)).length;
  const checks = [
    ...parts.map(({ lesson }) => progress.completed.has(lesson.key)),
    fichasListas === parts.length,
    Boolean(entrega.entrega),
  ];
  const doneCount = checks.filter(Boolean).length;

  return (
    <article className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Academia", to: "/academia" }, { label: "Tarea final" }]} />
      <p className="text-xs uppercase tracking-widest text-nova">Tarea final</p>
      <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight mt-2 mb-6">
        Panel de control Nova
      </h1>

      <ol className="mb-8 grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-nova/25 bg-nova/[0.04] p-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nova font-display text-sm font-black text-white">
              {index + 1}
            </span>
            <p className="mt-3 font-display font-bold">{step.title}</p>
            <p className="mt-1 text-sm text-white/60">{step.text}</p>
          </li>
        ))}
      </ol>

      <section className="mb-12 rounded-2xl border border-nova/30 p-5">
        <div className="mb-1 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-bold">¿Qué entregas?</h2>
          <span className="text-xs text-white/60">
            {doneCount} de {checks.length} listos
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={checks.length}
          aria-label="Requisitos de la tarea final"
          className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-nova transition-[width] duration-500"
            style={{ width: `${(doneCount / checks.length) * 100}%` }}
          />
        </div>
        <p className="mb-4 text-sm text-white/60">
          Cada parte tiene su propia página con los requisitos. Márcala como completada cuando la termines.
        </p>
        <ul className="space-y-3">
          {parts.map(({ module, lesson }, index) => (
            <li key={module.id}>
              <Item
                index={index + 1}
                icon={moduleIcons[module.id]}
                title={module.name}
                text={deliverables[module.id]}
                done={checks[index]}
                to={lessonPath(lesson)}
              />
            </li>
          ))}
          <li>
            <Item
              index={4}
              icon={BookOpen}
              title="Bitácora"
              text={`Las tres fichas de módulo (${fichasListas} de 3 listas), más una reflexión final.`}
              done={checks[3]}
              to="/academia/bitacora"
            />
          </li>
          <li>
            <Item
              index={5}
              icon={Video}
              title="Video"
              text="De 2 a 3 minutos explicando tu proyecto."
              done={checks[4]}
            />
          </li>
        </ul>
      </section>

      <EntregaSection />

      <Markdown>{finalTaskMd}</Markdown>
    </article>
  );
}
