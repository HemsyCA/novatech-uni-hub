import { motion } from "framer-motion";
import { Code2, Cog, CircuitBoard } from "lucide-react";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { areas } from "@/data/team";
import { countPlacements, pastTournaments } from "@/data/tournaments";

const pillars = [
  {
    icon: Cog,
    title: "Diseño mecánico",
    description: "Modelamos chasis y piezas en Onshape y las fabricamos con impresión 3D.",
  },
  {
    icon: CircuitBoard,
    title: "Electrónica",
    description: "Diseñamos nuestras propias PCBs en EasyEDA, con el ESP32 como cerebro de los robots.",
  },
  {
    icon: Code2,
    title: "Programación",
    description: "Escribimos el firmware y el control que hace que cada robot perciba, decida y actúe.",
  },
];

const seasonSummary = (year: string) => {
  const totals = countPlacements(pastTournaments().filter((t) => t.start.startsWith(year)));
  return `${totals.played} torneos y ${totals.first} primeros puestos`;
};

const milestones = [
  { date: "2025", title: "Temporada 2025", description: seasonSummary("2025") },
  { date: "Jun 2025", title: "Nova Legacy I", description: "Organizamos nuestro propio torneo en la UNI." },
  {
    date: "Oct 2025",
    title: "RoboChallenge Rumanía",
    description: "Primera competencia internacional, en la Universidad Politécnica de Bucarest.",
  },
  { date: "2026", title: "Temporada 2026", description: seasonSummary("2026") },
];

export function AboutSection() {
  return (
    <>
      <section id="nosotros" className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            eyebrow="Nosotros"
            title="Somos Nova Tech UNI"
            subtitle="Grupo de investigación, desarrollo e innovación en robótica de la Universidad Nacional de Ingeniería (UNI). Diseñamos, construimos y programamos hardware de alto rendimiento."
          />

          <div className="grid md:grid-cols-3 gap-4">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 p-6"
              >
                <pillar.icon className="w-8 h-8 text-white mb-4" />
                <h2 className="font-display text-lg font-bold text-white mb-2">{pillar.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Trayectoria" title="Nuestra historia" />
          <ol className="relative max-w-3xl mx-auto border-l border-white/20 pl-8 space-y-10">
            {milestones.map((m) => (
              <li key={m.title} className="relative">
                <span className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-white" />
                <div className="text-xs uppercase tracking-widest text-white/50">{m.date}</div>
                <h3 className="font-display text-xl font-bold text-white mt-1">{m.title}</h3>
                <p className="text-sm text-white/60 mt-1">{m.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Organización"
            title="Nuestras áreas"
            subtitle="Nova funciona como una organización: cada área sostiene una parte del equipo."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {areas.map((area) => (
              <div key={area.name} className="rounded-2xl border border-white/10 p-5">
                <h3 className="font-display text-sm font-bold text-white mb-2">{area.name}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
