import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
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
import { SectionHeading } from "@/components/landing/SectionHeading";
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
      "Cuando algo no está explicado, búscalo: hojas de datos, documentación oficial, foros. Usar inteligencia artificial para que te expliquen está permitido; copiar sin entender, no.",
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

const Join = () => (
  <PageLayout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          as="h1"
          eyebrow="Únete"
          title="Forma parte de Nova"
          subtitle="En Nova se aprende investigando. No necesitas saber de robótica antes de empezar: buscamos gente que intente, se equivoque, investigue y encuentre soluciones por su cuenta."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {learningCycle.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-white/40">0{index + 1}</span>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-lg font-bold text-white mb-2">{item.title}</h2>
              <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-white/70 max-w-2xl mx-auto">
          Por eso Academia Nova no tiene clases: es una guía escrita para que investigues por tu cuenta. Acostúmbrate a
          leer esta web, porque aquí vamos publicando todo lo que el equipo aprende.
        </p>
      </div>
    </section>

    <section className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Ruta"
          title="Cómo avanzas en Nova"
          subtitle="Cada nivel se gana demostrando lo que aprendiste en el anterior."
        />
        <ol className="grid md:grid-cols-3 gap-4">
          {levels.map((level) => (
            <li key={level.step} className="rounded-2xl border border-white/10 p-6 flex flex-col">
              <span className="text-xs uppercase tracking-widest text-white/50">{level.step}</span>
              <h3 className="font-display text-xl font-bold text-white mt-2 mb-3">{level.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed flex-1">{level.description}</p>
              <p className="mt-5 pt-4 border-t border-white/10 text-xs text-white/80">{level.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Academia Nova · Parte 1"
          title="Qué vas a investigar"
          subtitle="Todos los robots del equipo, del minisumo al OTTO, están hechos de las mismas piezas básicas. Al final las unes en tu propio Panel de control Nova con un ESP32."
        />
        <div className="grid md:grid-cols-3 gap-4">
          {moduleInfo.map((module) => {
            const Icon = moduleIcons[module.id];
            return (
              <div key={module.id} className="rounded-2xl border border-white/10 p-6 flex flex-col">
                <Icon className="w-8 h-8 text-white mb-4" />
                <h3 className="font-display text-lg font-bold text-white mb-2">{module.name}</h3>
                <p className="text-sm text-white/60 leading-relaxed flex-1">{module.summary}</p>
                <p className="mt-5 pt-4 border-t border-white/10 text-xs text-white/80">
                  {module.tool} · {module.duration}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <section className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12">
        <div>
          <SectionHeading align="left" eyebrow="Requisitos" title="Lo que necesitas" />
          <ul className="space-y-4">
            {requirements.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm text-white/80">
                <item.icon className="w-5 h-5 mt-0.5 shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-white">No necesitas comprar componentes: el kit de práctica te lo da el equipo en la Parte 2.</p>
        </div>
        <div>
          <SectionHeading align="left" eyebrow="Convocatoria" title="Cómo funciona" />
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-white/10 p-5 flex gap-4">
                <span className="font-display text-2xl font-black text-white/30">{index + 1}</span>
                <div>
                  <h3 className="font-display font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-white/60 mt-1">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>

    <section id="inscripcion" className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4 max-w-xl">
        <SectionHeading
          eyebrow="Inscripción"
          title="¿Listo para empezar?"
          subtitle="Déjanos tus datos y la directiva te asignará a un grupo de la convocatoria."
        />
        <ApplicationForm />
        <p className="mt-6 text-center text-sm text-white/50">
          ¿Tienes dudas?{" "}
          <Link to="/#contacto" className="text-white hover:underline">
            Escríbenos
          </Link>
        </p>
      </div>
    </section>
  </PageLayout>
);

export default Join;
