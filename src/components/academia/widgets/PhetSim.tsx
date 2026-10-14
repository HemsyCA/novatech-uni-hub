import { useState } from "react";
import { ExternalLink, MousePointerClick, Play } from "lucide-react";

// Simulaciones de PhET (Universidad de Colorado): gratuitas y en español.
const phetUrl = (slug: string) => `https://phet.colorado.edu/sims/html/${slug}/latest/${slug}_es.html`;

export function PhetSim({ slug, title, instructions }: { slug: string; title: string; instructions?: string }) {
  // Se carga al tocar: la simulación pesa varios MB y no todos la abren.
  const [started, setStarted] = useState(false);
  const url = phetUrl(slug);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-[rgb(var(--accent,255_255_255)/0.4)]">
      <figcaption className="flex items-start gap-3 bg-[rgb(var(--accent,255_255_255)/0.08)] px-5 py-4">
        <MousePointerClick className="mt-0.5 h-5 w-5 shrink-0 text-[rgb(var(--accent,255_255_255))]" aria-hidden />
        <div className="min-w-0 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--accent,255_255_255))]">
            Simulación · pruébalo tú
          </p>
          <p className="mt-1 font-semibold text-white">{title}</p>
          {instructions && <p className="mt-1 leading-relaxed text-white/70">{instructions}</p>}
        </div>
      </figcaption>
      <div className="relative aspect-[16/11] bg-white/[0.03] sm:aspect-[16/10]">
        {started ? (
          <iframe src={url} title={title} allowFullScreen className="absolute inset-0 h-full w-full" />
        ) : (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--accent,255_255_255))] text-black transition-transform group-hover:scale-110">
              <Play className="ml-1 h-7 w-7" fill="currentColor" />
            </span>
            <span className="text-sm">Iniciar simulación</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/50">
        <span>Simulación de PhET · Universidad de Colorado</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white underline underline-offset-4">
          Abrir en pantalla completa <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </figure>
  );
}
