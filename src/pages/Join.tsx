import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CircuitBoard, Code2, Cog, Laptop, Mouse, NotebookPen, UserPlus } from "lucide-react";
import { PageLayout } from "@/components/landing/PageLayout";
import { SectionHeading } from "@/components/landing/SectionHeading";

const levels = [
  {
    step: "Nivel 0",
    title: "Bienvenida",
    description:
      "Aprendes a tu ritmo con lecciones escritas y videos de apoyo, todo en simuladores online. Termina con una tarea final.",
    detail: "16 a 20 horas · unas 3 semanas",
  },
  {
    step: "Nivel 1",
    title: "Formación guiada",
    description:
      "Entras al grupo del equipo y trabajas con hardware real: drivers de motores, fuentes, soldadura, impresión 3D y ensamble.",
    detail: "Al aprobar la tarea del Nivel 0",
  },
  {
    step: "Nivel 2",
    title: "Competencia o investigación",
    description: "Te integras a una categoría de competencia o a un proyecto de investigación del equipo.",
    detail: "Según tu desempeño en el Nivel 1",
  },
];

const topics = [
  {
    icon: CircuitBoard,
    title: "Electrónica",
    description: "Circuitos, divisores de voltaje, alimentación de servos y diseño de esquemáticos y PCBs en EasyEDA.",
  },
  {
    icon: Cog,
    title: "Mecánica",
    description: "Diseño de piezas en 3D con Onshape, listas para fabricarse con impresión 3D.",
  },
  {
    icon: Code2,
    title: "Programación",
    description: "Programación del ESP32 en C++: LEDs, botones, sensores, servos y comandos, simulado en Wokwi.",
  },
];

const requirements = [
  { icon: Laptop, text: "Una computadora con internet (Windows, Mac o Linux)." },
  { icon: Mouse, text: "Un mouse con rueda, casi obligatorio para el diseño 3D." },
  { icon: UserPlus, text: "Cuentas gratuitas en Wokwi, EasyEDA y Onshape." },
  { icon: NotebookPen, text: "Un cuaderno para cálculos, dibujos y tu bitácora." },
];

const workshops = [
  { day: "Día 1", title: "Electrónica", description: "Circuitos básicos, control de servomotores y drivers de motores." },
  { day: "Día 2", title: "Programación", description: "C++ en Arduino IDE, lógica de sensores y un reto para programar un robot." },
  { day: "Día 3", title: "Diseño 3D", description: "Modelado en vivo de un minisumo o un seguidor de línea en Onshape." },
];

const Join = () => (
  <PageLayout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          as="h1"
          eyebrow="Únete"
          title="Forma parte de Nova"
          subtitle="No esperamos que sepas de robótica antes de empezar. Buscamos gente que intente, se equivoque, investigue y encuentre soluciones por su cuenta."
        />

        <ol className="grid md:grid-cols-3 gap-4">
          {levels.map((level, index) => (
            <motion.li
              key={level.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 p-6 flex flex-col"
            >
              <span className="text-xs uppercase tracking-widest text-white/50">{level.step}</span>
              <h2 className="font-display text-xl font-bold text-white mt-2 mb-3">{level.title}</h2>
              <p className="text-sm text-white/60 leading-relaxed flex-1">{level.description}</p>
              <p className="mt-5 pt-4 border-t border-white/10 text-xs text-white/80">{level.detail}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>

    <section className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Academia Nova"
          title="Qué vas a aprender"
          subtitle="Todos los robots del equipo, del minisumo al OTTO, están hechos de las mismas piezas básicas. Al final armas tu propio panel de control con un ESP32."
        />
        <div className="grid md:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <div key={topic.title} className="rounded-2xl border border-white/10 p-6">
              <topic.icon className="w-8 h-8 text-white mb-4" />
              <h3 className="font-display text-lg font-bold text-white mb-2">{topic.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{topic.description}</p>
            </div>
          ))}
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
          <p className="mt-6 text-sm text-white">No necesitas comprar componentes: el hardware real llega en el Nivel 1.</p>
        </div>
        <div>
          <SectionHeading align="left" eyebrow="Convocatoria" title="Talleres presenciales" />
          <ol className="space-y-4">
            {workshops.map((w) => (
              <li key={w.day} className="rounded-2xl border border-white/10 p-5">
                <span className="text-xs uppercase tracking-widest text-white/50">{w.day}</span>
                <h3 className="font-display font-bold text-white mt-1">{w.title}</h3>
                <p className="text-sm text-white/60 mt-1">{w.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>

    <section className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-white/20 p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">¿Listo para empezar?</h2>
          <p className="text-white/60 mb-8">
            Anunciamos cada convocatoria en nuestras redes. Escríbenos y te avisamos cuando abran las inscripciones.
          </p>
          <Link
            to="/#contacto"
            className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Escríbenos
          </Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Join;
