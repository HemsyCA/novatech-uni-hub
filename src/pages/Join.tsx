import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDown,
  BookOpen,
  CircuitBoard,
  Code2,
  Cog,
  FlaskConical,
  Laptop,
  Mouse,
  NotebookPen,
  Search,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { PageLayout } from "@/components/landing/PageLayout";
import { ApplicationForm } from "@/components/landing/ApplicationForm";
import { moduleInfo, type ModuleId } from "@/lib/academia/modules";

const learningCycle = [
  {
    icon: BookOpen,
    title: "Lee",
    description:
      "Todo lo que sabe el equipo se publica en esta web: las lecciones de Academia Nova, nuestros robots y su documentación. Es tu punto de partida.",
  },
  {
    icon: Search,
    title: "Investiga",
    description:
      "Cuando algo no está explicado, búscalo: hojas de datos, documentación oficial, foros. Usar inteligencia artificial para que te expliquen está permitido; copiar sin entender, no. Si sigues trabado, pregúntale al encargado de la convocatoria.",
  },
  {
    icon: FlaskConical,
    title: "Prueba",
    description:
      "Lleva lo que aprendiste a los simuladores y, más adelante, al hardware real. Equivocarte es parte del proceso.",
  },
  {
    icon: NotebookPen,
    title: "Documenta",
    description:
      "Cuando logras algo, llenas una ficha corta de bitácora: qué querías, qué hiciste, qué pasó y qué aprendiste. Así compartimos lo que sabemos.",
  },
];

const levels = [
  {
    step: "Parte 1",
    title: "Bienvenida",
    description:
      "Lees las lecciones de Academia Nova a tu ritmo, practicas en simuladores online y terminas con una tarea final. Nadie te dicta clases.",
    detail: "16 a 20 horas · 3 semanas",
  },
  {
    step: "Parte 2",
    title: "Soldadura y práctica",
    description:
      "Aprendes soldadura THT y SMD con texto y videos. Luego vienes a una práctica presencial: recibes un kit de placa y la sueldas con guía del equipo.",
    detail: "Al aprobar la tarea final de la Parte 1",
  },
  {
    step: "Final",
    title: "Miembro de Nova",
    description:
      "Accedes al material interno, al foro y a la bitácora del equipo, y te integras a una categoría de competencia o a un proyecto de investigación.",
    detail: "La directiva decide tu ingreso",
  },
];

const moduleIcons: Record<ModuleId, LucideIcon> = {
  electronica: CircuitBoard,
  mecanica: Cog,
  programacion: Code2,
};

const requirements = [
  { icon: Laptop, text: "Una computadora con internet (Windows, Mac o Linux)." },
  { icon: Mouse, text: "Un mouse con rueda, casi obligatorio para el diseño 3D." },
  { icon: UserPlus, text: "Cuentas gratuitas en Wokwi, EasyEDA y Onshape." },
  { icon: NotebookPen, text: "Un cuaderno para cálculos, dibujos y tu bitácora." },
];

const steps = [
  { title: "Te inscribes", description: "Llenas el formulario de abajo con el Gmail con el que iniciarás sesión." },
  { title: "Te asignamos a un grupo", description: "La directiva revisa tu inscripción y te avisa la fecha en que empieza tu grupo." },
  {
    title: "Investigas durante 3 semanas",
    description: "Desde esa fecha entras a Academia Nova con tu cuenta y avanzas a tu ritmo.",
  },
  {
    title: "Entregas la tarea final",
    description: "El Panel de control Nova, con un video y tu bitácora. Si la directiva la aprueba, sigues con la Parte 2.",
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

function Label({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
      {index && <span className="text-nova">{index} · </span>}
      {children}
    </p>
  );
}

interface SectionProps {
  id?: string;
  index: string;
  label: string;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  children: ReactNode;
}

// Título fijo a la izquierda y contenido a la derecha en pantallas grandes.
function Section({ id, index, label, title, subtitle, aside, children }: SectionProps) {
  return (
    <section id={id} className="border-t border-white/10 py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-6xl grid gap-10 lg:grid-cols-12 lg:gap-16">
        <motion.header {...fadeIn} className="lg:col-span-4 lg:sticky lg:top-28 self-start">
          <Label index={index}>{label}</Label>
          <h2 className="mt-4 font-sans text-3xl md:text-4xl font-semibold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="mt-4 text-base font-light leading-relaxed text-white/60">{subtitle}</p>}
          {aside}
        </motion.header>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

const Join = () => (
  <PageLayout>
    <div className="font-sans">
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div {...fadeIn} className="max-w-3xl">
            <Label>Únete · Convocatoria</Label>
            <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold uppercase leading-[1.05] text-white">
              Forma parte de <span className="text-nova">Nova</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl font-light leading-relaxed text-white/70">
              En Nova se aprende investigando. No necesitas saber de robótica antes de empezar: buscamos gente que
              intente, se equivoque, investigue y busque soluciones, con el apoyo del encargado de la convocatoria.
            </p>
            <a
              href="#inscripcion"
              className="mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
            >
              Ir a la inscripción
              <ArrowDown className="h-3.5 w-3.5" />
            </a>
          </motion.div>

          <ol className="mt-20 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {learningCycle.map((item, index) => (
              <motion.li
                key={item.title}
                {...fadeIn}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="border-t border-white/15 pt-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-nova">0{index + 1}</span>
                  <item.icon className="h-4 w-4 text-white/50" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-sans text-lg font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-[15px] font-light leading-relaxed text-white/60">{item.description}</p>
              </motion.li>
            ))}
          </ol>

          <motion.p
            {...fadeIn}
            className="mt-20 max-w-3xl border-l border-nova/60 pl-6 text-lg font-light leading-relaxed text-white/80"
          >
            Por eso Academia Nova no tiene clases dictadas: es una guía escrita para que investigues a tu ritmo. Pero no
            estás solo: un encargado de la convocatoria resuelve tus dudas y, según su disponibilidad, organiza reuniones
            de refuerzo o algún compartir con el equipo.
          </motion.p>
        </div>
      </section>

      <Section
        index="01"
        label="Ruta"
        title="Cómo avanzas en Nova"
        subtitle="Cada nivel se gana demostrando lo que aprendiste en el anterior."
      >
        <ol className="relative border-l border-white/15">
          {levels.map((level, index) => (
            <motion.li
              key={level.step}
              {...fadeIn}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative pl-8 pb-12 last:pb-0"
            >
              <span
                className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                  index === 0 ? "bg-nova" : "border border-white/40 bg-black"
                }`}
              />
              <Label>{level.step}</Label>
              <h3 className="mt-3 font-sans text-xl font-medium text-white">{level.title}</h3>
              <p className="mt-2 max-w-xl text-[15px] font-light leading-relaxed text-white/60">{level.description}</p>
              <p className="mt-4 font-mono text-xs text-white/50">{level.detail}</p>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section
        index="02"
        label="Academia Nova · Parte 1"
        title="Qué vas a investigar"
        subtitle="Todos los robots del equipo, del minisumo al OTTO, están hechos de las mismas piezas básicas. Al final las unes en tu propio Panel de control Nova con un ESP32."
      >
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {moduleInfo.map((module) => {
            const Icon = moduleIcons[module.id];
            return (
              <motion.li key={module.id} {...fadeIn} className="grid gap-4 py-8 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                <Icon className="h-5 w-5 text-white/60" strokeWidth={1.5} />
                <div>
                  <h3 className="font-sans text-lg font-medium text-white">{module.name}</h3>
                  <p className="mt-1 text-[15px] font-light leading-relaxed text-white/60">{module.summary}</p>
                </div>
                <p className="font-mono text-xs text-white/50 sm:text-right">
                  {module.tool}
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> · </span>
                  {module.duration}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </Section>

      <Section index="03" label="Requisitos" title="Lo que necesitas">
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {requirements.map((item) => (
            <li key={item.text} className="flex items-start gap-4 py-5 text-[15px] font-light text-white/80">
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" strokeWidth={1.5} />
              {item.text}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[15px] text-white">
          No necesitas comprar componentes: el kit de práctica te lo da el equipo en la Parte 2.
        </p>
      </Section>

      <Section index="04" label="Convocatoria" title="Cómo funciona">
        <ol className="divide-y divide-white/10 border-y border-white/10">
          {steps.map((step, index) => (
            <motion.li key={step.title} {...fadeIn} className="flex gap-6 py-6">
              <span className="font-mono text-sm text-nova pt-0.5">0{index + 1}</span>
              <div>
                <h3 className="font-sans text-lg font-medium text-white">{step.title}</h3>
                <p className="mt-1 text-[15px] font-light leading-relaxed text-white/60">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section
        id="inscripcion"
        index="05"
        label="Inscripción"
        title="¿Listo para empezar?"
        subtitle="Déjanos tus datos y la directiva te asignará a un grupo de la convocatoria."
        aside={
          <p className="mt-8 text-sm font-light text-white/50">
            ¿Tienes dudas?{" "}
            <Link to="/#contacto" className="text-white underline-offset-4 hover:underline">
              Escríbenos
            </Link>
          </p>
        }
      >
        <ApplicationForm />
      </Section>
    </div>
  </PageLayout>
);

export default Join;
