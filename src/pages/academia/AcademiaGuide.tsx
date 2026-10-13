import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import guideMd from "@/content/academia/guia.md?raw";
import { Markdown } from "@/components/academia/Markdown";
import { Breadcrumbs } from "@/components/academia/ui";
import { lessonPath, recommendedOrder } from "@/lib/academia/course";

export default function AcademiaGuide() {
  const first = recommendedOrder[0];

  return (
    <article className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Academia", to: "/academia" }, { label: "Guía de inicio" }]} />
      <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight mb-8">Guía de inicio</h1>
      <Markdown>{guideMd}</Markdown>
      <div className="mt-12 rounded-2xl border border-white/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-white/70">
          ¿Listo? El plan recomienda empezar por <span className="text-white">{first.code} · {first.title}</span>.
        </p>
        <Link
          to={lessonPath(first)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-black hover:bg-white/90 transition-colors"
        >
          Empezar
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
