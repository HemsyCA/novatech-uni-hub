import { useEffect, useRef } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Flag, Map as MapIcon, Sparkles } from "lucide-react";
import { useAcademy } from "@/components/academia/academy-context";
import { SnakeMap, StopsBar, type StopState } from "@/components/academia/GuideRoute";
import { ResourceOrder } from "@/components/academia/ResourceOrder";
import { Breadcrumbs, ProgressBar } from "@/components/academia/ui";
import { NextStepCard } from "@/components/account/Journey";
import { guideMinutes, guideStops, type GuideStop } from "@/content/academia/guia-ruta";
import { lessonPath, courseModules, recommendedOrder } from "@/lib/academia/course";
import { GOAL_HREF, stopHref, useGuideProgress } from "@/lib/academia/guide-progress";
import { resourceSteps } from "@/lib/academia/resources";
import { primaryButton } from "@/lib/account/styles";

// La guía de inicio como una ruta de videojuego: un mapa con paradas que se abren en orden.
// Cada parada es corta, deja una idea para llevar y termina con un reto rápido.

const TOTAL = guideStops.length;

function useResources(guideVisited: number) {
  const { progress, fichas, entrega } = useAcademy();
  return resourceSteps({
    guideVisited,
    moduleFichas: courseModules.filter((m) => fichas.moduleFicha(m.id)).length,
    modules: courseModules.length,
    part1Done: progress.nextLesson === null && progress.done >= progress.total,
    entrega: entrega.entrega,
  });
}

function Intro({ visited, next, goalOpen }: { visited: number; next: number; goalOpen: boolean }) {
  const resources = useResources(visited);
  const started = visited > 0;
  const cta =
    next >= 0
      ? {
          to: stopHref(next),
          label: started ? `Continuar · parada ${next + 1}` : "Empezar la ruta",
        }
      : { to: GOAL_HREF, label: "Ver la meta" };

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/15 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Guía de inicio</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">Ruta de bienvenida</h1>
        <p className="mt-3 max-w-xl text-white/70">
          Antes de tu primera lección, recorre estas {TOTAL} paradas cortas: cada una deja una idea para llevar y algo para explorar. Así
          sabrás cómo funciona esta etapa, a quién preguntar y qué necesitas.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">
          <li className="rounded-full border border-white/15 px-3 py-1">{TOTAL} paradas</li>
          <li className="rounded-full border border-white/15 px-3 py-1">Unos {guideMinutes} minutos</li>
          <li className="rounded-full border border-white/15 px-3 py-1">Para tocar y explorar</li>
        </ul>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link to={cta.to} className={primaryButton}>
            {cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex flex-1 items-center gap-3">
            <ProgressBar value={Math.round((visited / TOTAL) * 100)} label="Progreso de la ruta" />
            <span className="shrink-0 text-xs text-white/60">
              {visited}/{TOTAL}
            </span>
          </div>
        </div>
        {goalOpen && next >= 0 && <p className="mt-4 text-xs text-white/40">Como parte de la directiva, puedes abrir cualquier parada.</p>}
      </section>

      <div className="hidden lg:block">
        <ResourceOrder steps={resources} title="Los recursos de la Academia, en orden" />
      </div>
    </div>
  );
}

// En el celular los recursos van debajo del mapa, para que el mapa se vea apenas entras.
function MobileResources({ visited }: { visited: number }) {
  return (
    <div className="lg:hidden">
      <ResourceOrder steps={useResources(visited)} title="Los recursos de la Academia, en orden" />
    </div>
  );
}

function StopView({ stop, stateOf, onDone }: { stop: GuideStop; stateOf: (index: number) => StopState; onDone: () => void }) {
  const { Scene, icon: Icon } = stop;
  const isLast = stop.index === TOTAL - 1;
  const nextHref = isLast ? GOAL_HREF : stopHref(stop.index + 1);

  return (
    <article>
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-white/50">
        <Link to="/academia/guia" className="inline-flex items-center gap-1.5 hover:text-white lg:hidden">
          <MapIcon className="h-3.5 w-3.5" /> Mapa
        </Link>
        <span>
          Parada {stop.index + 1} de {TOTAL} · {stop.minutes} min
        </span>
      </div>
      <StopsBar stops={guideStops} stateOf={stateOf} selected={stop.index} />

      <header className="mt-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.04]">
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Parada {stop.index + 1} · {stop.label}
          </p>
          <h1 className="mt-1 font-display text-2xl font-black leading-tight md:text-3xl">{stop.title}</h1>
        </div>
      </header>

      <div className="mt-6 flex gap-3 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-nova" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">Para llevar</p>
          <p className="mt-1 font-semibold">{stop.takeaway}</p>
        </div>
      </div>

      <div className="mt-10">
        <Scene />
      </div>

      <nav
        aria-label="Paradas de la ruta"
        className="sticky bottom-0 z-10 -mx-4 mt-10 flex items-center gap-3 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none"
      >
        {stop.index > 0 ? (
          <Link
            to={stopHref(stop.index - 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Link>
        ) : (
          <Link
            to="/academia/guia"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            <MapIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Mapa</span>
          </Link>
        )}
        <Link
          to={nextHref}
          onClick={onDone}
          className="inline-flex flex-1 items-center justify-between gap-3 rounded-xl bg-nova px-5 py-3 font-semibold text-white transition-transform hover:scale-[1.01] md:ml-auto md:min-w-[260px] md:flex-none"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-normal uppercase tracking-widest text-white/70">
              {isLast ? "Último paso" : "Siguiente parada"}
            </span>
            <span className="block truncate text-sm">{isLast ? "Llegar a la meta" : guideStops[stop.index + 1].label}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </nav>
    </article>
  );
}

function Goal() {
  const { progress } = useAcademy();
  const resources = useResources(TOTAL);
  const reduceMotion = useReducedMotion();
  const lesson = progress.nextLesson ?? recommendedOrder[0];
  const started = progress.done > 0;

  return (
    <div className="space-y-10">
      <section className="text-center">
        <motion.span
          initial={reduceMotion ? false : { scale: 0.6, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-black"
        >
          <Flag className="h-10 w-10" />
        </motion.span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-white/50">Meta</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">¡Completaste la ruta!</h1>
        <p className="mx-auto mt-3 max-w-lg text-white/70">Ya sabes cómo funciona la Parte 1. Esto es lo que te llevas de cada parada:</p>
      </section>

      <ol className="grid gap-2 sm:grid-cols-2">
        {guideStops.map((stop) => (
          <li key={stop.title}>
            <Link
              to={stopHref(stop.index)}
              className="flex h-full gap-3 rounded-xl border border-white/10 px-4 py-3 transition-colors hover:border-white/30"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-widest text-white/40">{stop.label}</span>
                <span className="block text-sm text-white/85">{stop.takeaway}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <NextStepCard
        step={{
          eyebrow: started ? "Continúa donde te quedaste" : "Tu primera lección",
          title: `${lesson.code} · ${lesson.title}`,
          cta: {
            label: started ? "Continuar" : "Empezar",
            to: lessonPath(lesson),
          },
          lesson,
        }}
      />

      <ResourceOrder steps={resources} title="Y desde aquí, en este orden" />
    </div>
  );
}

export default function AcademiaGuide() {
  const { isStaff } = useAcademy();
  const [params] = useSearchParams();
  const { visited, visit, done } = useGuideProgress();
  const mapRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const next = guideStops.findIndex((stop) => !visited.has(stop.index));
  const stateOf = (index: number): StopState => (visited.has(index) ? "done" : index === next ? "current" : isStaff ? "open" : "locked");
  const goalOpen = done || isStaff;

  const param = params.get("parada");
  const isGoal = param === "meta";
  const number = param && !isGoal ? Number(param) - 1 : null;
  const stop = number !== null && Number.isInteger(number) ? guideStops[number] : undefined;
  const selected = stop ? stop.index : null;

  // Centra en el mapa la parada que estás leyendo (o la siguiente por hacer).
  useEffect(() => {
    const map = mapRef.current;
    const target = map?.querySelector<HTMLElement>(`[data-stop="${isGoal ? "meta" : (selected ?? Math.max(next, 0))}"]`);
    if (map && target) map.scrollTop = target.offsetTop - map.clientHeight / 2;
  }, [selected, isGoal, next]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [param]);

  if (param !== null) {
    if (isGoal && !goalOpen) return <Navigate to={stopHref(Math.max(next, 0))} replace />;
    if (!isGoal && !stop) return <Navigate to="/academia/guia" replace />;
    if (stop && stateOf(stop.index) === "locked") return <Navigate to={stopHref(next)} replace />;
  }

  const view = isGoal ? "meta" : stop ? `parada-${stop.index}` : "inicio";

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumbs
        items={[
          { label: "Academia", to: "/academia" },
          param === null ? { label: "Ruta de bienvenida" } : { label: "Ruta de bienvenida", to: "/academia/guia" },
          ...(stop ? [{ label: `Parada ${stop.index + 1}` }] : isGoal ? [{ label: "Meta" }] : []),
        ]}
      />

      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-12">
        <aside aria-label="Mapa de la ruta" className={param === null ? "" : "hidden lg:block"}>
          <div
            ref={mapRef}
            className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:20px_20px] px-2 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
          >
            <SnakeMap stops={guideStops} stateOf={stateOf} selected={selected} goalOpen={goalOpen} goalSelected={isGoal} />
          </div>
        </aside>

        <div className="order-first min-w-0 lg:order-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {isGoal ? (
                <Goal />
              ) : stop ? (
                <StopView key={stop.index} stop={stop} stateOf={stateOf} onDone={() => visit(stop.index)} />
              ) : (
                <Intro visited={visited.size} next={next} goalOpen={goalOpen} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {param === null && <MobileResources visited={visited.size} />}
      </div>
    </div>
  );
}
