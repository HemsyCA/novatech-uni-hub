import { useState } from "react";
import { ArrowRight, Clock, ListChecks, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAcademy } from "@/components/academia/academy-context";
import { FichaCard } from "@/components/academia/Ficha";
import { FICHA_FIELDS } from "@/components/academia/ficha-fields";
import { Breadcrumbs, StatusDot } from "@/components/academia/ui";
import { courseModules, lessonPath } from "@/lib/academia/course";

interface Example {
  type: string;
  attach: string;
  title: string;
  status: string;
  values: Record<(typeof FICHA_FIELDS)[number]["key"], string>;
  sources: string;
}

const examples: Example[] = [
  {
    type: "Electrónica",
    attach: "el esquemático en PDF o imagen, con los valores de cada componente.",
    title: "Botón de inicio con pull-down",
    status: "Resuelto",
    values: {
      queria: "Que el ESP32 lea el botón de inicio sin arrancar solo.",
      hice: "Botón entre 3V3 y GPIO 21, y una resistencia de 10 kΩ del GPIO 21 a GND.",
      paso: "Al inicio arrancaba solo: había puesto la resistencia en serie con el botón. La moví a GND y funcionó.",
      aprendi: "La pull-down va del pin a GND, nunca en serie con el botón.",
    },
    sources: "Academia Nova E5 · Hoja de datos del ESP32",
  },
  {
    type: "Impresión 3D",
    attach: "el archivo (Onshape o STL), los parámetros del laminador y una foto de la pieza.",
    title: "Rampa de minisumo más resistente",
    status: "En curso",
    values: {
      queria: "Que la rampa de 25° no se agriete al primer choque.",
      hice: "La imprimí acostada de lado, con 4 paredes y 40 % de relleno giroide.",
      paso: "Apoyada sobre su base se agrietaba; de lado aguantó 5 empujes. Falta probarla en combate.",
      aprendi: "Orienta la pieza para que el golpe vaya a lo largo de las capas, no entre ellas.",
    },
    sources: "Diseño mecánico del Minisumo BT (Nova) · Academia Nova M4",
  },
  {
    type: "Programación",
    attach: "el enlace al código y la salida del Monitor Serial o un video corto.",
    title: "Arranque suave del minisumo",
    status: "Resuelto",
    values: {
      queria: "Que el robot no se levante al arrancar.",
      hice: "Una función que sube el PWM de 80 a 255, de 5 en 5, cada 10 ms.",
      paso: "Con 50 ms tardaba casi 2 s en llegar; con 10 ms llega en 0.35 s sin levantarse.",
      aprendi: "Acelerar en menos de medio segundo evita que se levante sin perder tiempo.",
    },
    sources: "Diseño mecánico del Minisumo BT (Nova) · Academia Nova P6",
  },
];

const rules = [
  "Una ficha por cada cosa que lograste o que te costó.",
  "Siempre una fuente y una evidencia (un enlace).",
  "Escríbela para que otra persona pueda repetirlo.",
];

export default function AcademiaBitacora() {
  const { fichas } = useAcademy();
  const [active, setActive] = useState(0);
  const example = examples[active];
  const moduleDone = courseModules.filter((m) => fichas.moduleFicha(m.id)).length;

  return (
    <article className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ label: "Academia", to: "/academia" }, { label: "Bitácora" }]} />
      <p className="text-xs uppercase tracking-widest text-nova">Cómo compartimos lo que aprendemos</p>
      <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight mt-2">Bitácora Nova</h1>
      <p className="mt-4 text-white/70 leading-relaxed">
        Cada vez que logras algo o resuelves un problema, llenas una <span className="text-white">ficha</span> de cuatro
        preguntas. Es corta a propósito: así cualquiera la escribe en un minuto y cualquiera la entiende al leerla.
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        {[
          { icon: ListChecks, text: "4 preguntas" },
          { icon: Clock, text: "1 minuto" },
          { icon: Sparkles, text: "Sirve a la próxima persona" },
        ].map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-1.5 rounded-full border border-nova/30 bg-nova/10 px-3 py-1 text-white/80"
          >
            <Icon className="h-3.5 w-3.5 text-nova" />
            {text}
          </span>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold mb-4">La ficha</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {FICHA_FIELDS.map((field, index) => (
            <li key={field.key} className="rounded-2xl border border-nova/25 bg-nova/[0.04] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-nova/15 text-nova">
                  <field.icon className="h-[18px] w-[18px]" />
                </span>
                <h3 className="font-display font-bold">
                  <span className="mr-2 text-nova">{index + 1}</span>
                  {field.label}
                </h3>
              </div>
              <p className="mt-3 text-sm text-white/70">{field.hint}</p>
              <p className="mt-3 border-l-2 border-nova/50 pl-3 text-xs italic text-white/50">
                Ej.: {examples[0].values[field.key]}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-white/50">
          Además lleva un <span className="text-white">título</span>, tus <span className="text-white">fuentes</span> y
          un <span className="text-white">enlace de evidencia</span> (Wokwi, Onshape, Drive…). Los "Ej." son de la ficha
          "Botón de inicio con pull-down".
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold mb-4">Cuándo llenar una ficha</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-nova/60 bg-nova/10 p-5">
            <p className="inline-block rounded-full bg-nova px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
              Obligatoria
            </p>
            <h3 className="font-display font-bold mt-1">Al cerrar cada módulo</h3>
            <p className="mt-2 text-sm text-white/60">
              En la parte de la tarea final de Electrónica, Mecánica y Programación, sobre lo que más te costó. Sin ella
              no puedes completar esa parte. Son las tres fichas que se revisan en la tarea final.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-white/20 p-5">
            <p className="inline-block rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60">
              Opcional
            </p>
            <h3 className="font-display font-bold mt-1">En cualquier lección</h3>
            <p className="mt-2 text-sm text-white/60">
              Al final de cada lección, cuando algo te tomó más de 20 minutos o encontraste una mejor explicación.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="font-display text-xl font-bold">Tus fichas</h2>
          <span className="text-sm text-white/50">{fichas.fichas.length} en total</span>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <div
            role="progressbar"
            aria-valuenow={moduleDone}
            aria-valuemin={0}
            aria-valuemax={courseModules.length}
            aria-label="Fichas de módulo"
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-nova transition-[width] duration-500"
              style={{ width: `${(moduleDone / courseModules.length) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-white/60">
            {moduleDone} de {courseModules.length} fichas de módulo
          </span>
        </div>
        <ul className="mb-6 space-y-2">
          {courseModules.map((module) => {
            const task = module.lessons.find((l) => l.isTask)!;
            const done = Boolean(fichas.moduleFicha(module.id));
            return (
              <li key={module.id}>
                <Link
                  to={`${lessonPath(task)}#ficha`}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm transition-colors hover:border-nova/60 hover:bg-nova/10"
                >
                  <StatusDot done={done} nova />
                  <span className="flex-1">Ficha del módulo de {module.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      done ? "border border-nova/40 text-nova" : "bg-nova text-white"
                    }`}
                  >
                    {done ? "Ver" : "Llenar"}{" "}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {fichas.fichas.length === 0 ? (
          <p className="text-sm text-white/50">Todavía no tienes fichas. Aparecerán aquí cuando guardes la primera.</p>
        ) : (
          <div className="space-y-4">
            {fichas.fichas.map((ficha) => (
              <FichaCard key={ficha.id} ficha={ficha} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold mb-4">Ejemplos</h2>
        <div role="tablist" aria-label="Tipo de aporte" className="flex flex-wrap gap-2 mb-4">
          {examples.map((item, index) => (
            <button
              key={item.type}
              type="button"
              role="tab"
              aria-selected={active === index}
              onClick={() => setActive(index)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                active === index
                  ? "border-nova bg-nova text-white"
                  : "border-white/20 text-white/70 hover:border-nova/60 hover:text-white"
              }`}
            >
              {item.type}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="rounded-2xl border border-nova/30 bg-nova/[0.04] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-bold">{example.title}</h3>
            <span className="text-xs text-white/50">
              {example.type} · {example.status}
            </span>
          </div>
          <dl className="mt-5 space-y-3">
            {FICHA_FIELDS.map((field) => (
              <div key={field.key} className="grid gap-1 sm:grid-cols-[110px_1fr]">
                <dt className="flex items-center gap-2 text-sm font-semibold text-white">
                  <field.icon className="h-4 w-4 text-nova" />
                  {field.label}
                </dt>
                <dd className="text-sm text-white/75">{example.values[field.key]}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 border-t border-white/10 pt-4 text-xs text-white/50">Fuentes: {example.sources}</p>
        </div>
        <p className="mt-3 rounded-xl border border-nova/30 bg-nova/10 px-4 py-3 text-sm text-white/70">
          <span className="font-semibold text-white">Evidencia en {example.type}:</span> {example.attach}
        </p>
        <p className="mt-2 text-xs text-white/40">
          Las ideas de la rampa y del arranque suave vienen de la documentación del Minisumo Bluetooth de Nova; los
          números son ilustrativos.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold mb-4">Tres reglas</h2>
        <ol className="space-y-3">
          {rules.map((rule, index) => (
            <li
              key={rule}
              className="flex items-center gap-4 rounded-xl border border-white/10 p-4 text-sm text-white/80"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nova font-display text-sm font-black text-white">
                {index + 1}
              </span>
              {rule}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
