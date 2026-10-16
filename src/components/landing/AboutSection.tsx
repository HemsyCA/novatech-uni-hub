import { motion } from "framer-motion";
import { Code2, Cog, CircuitBoard } from "lucide-react";
import { Label, PageHero, Section } from "@/components/landing/PageSection";
import { areas } from "@/data/team";
import { countPlacements, pastTournaments } from "@/data/tournaments";
import { fadeIn } from "@/lib/page-motion";

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
      <PageHero
        id="nosotros"
        label="Nosotros"
        title={
          <>
            Somos Nova<span className="text-nova">Tech</span>
          </>
        }
        subtitle="Grupo de investigación, desarrollo e innovación en robótica de la Universidad Nacional de Ingeniería (UNI). Diseñamos, construimos y programamos hardware de alto rendimiento."
      >
        <ol className="mt-20 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.li
              key={pillar.title}
              {...fadeIn}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="border-t border-white/15 pt-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-light text-nova">0{index + 1}</span>
                <pillar.icon className="h-8 w-8 text-white/70" strokeWidth={1.25} />
              </div>
              <h2 className="mt-5 font-sans text-lg font-medium text-white">{pillar.title}</h2>
              <p className="mt-2 text-[15px] font-light leading-relaxed text-white/60">{pillar.description}</p>
            </motion.li>
          ))}
        </ol>
      </PageHero>

      <Section index="01" label="Trayectoria" title="Nuestra historia">
        <ol className="relative border-l border-white/15">
          {milestones.map((m, index) => (
            <motion.li
              key={m.title}
              {...fadeIn}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative pl-10 pb-14 last:pb-0"
            >
              <span
                className={`absolute -left-[8px] top-0.5 h-4 w-4 rounded-full ${
                  index === milestones.length - 1 ? "bg-nova" : "border-2 border-white/40 bg-black"
                }`}
              />
              <Label>{m.date}</Label>
              <h3 className="mt-3 font-sans text-2xl font-medium text-white">{m.title}</h3>
              <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-white/60">{m.description}</p>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section
        index="02"
        label="Organización"
        title="Nuestras áreas"
        subtitle="Nova funciona como una organización: cada área sostiene una parte del equipo."
      >
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {areas.map((area) => (
            <motion.li key={area.name} {...fadeIn} className="border-t border-white/15 py-6">
              <h3 className="font-sans text-lg font-medium text-white">{area.name}</h3>
              <p className="mt-2 text-[15px] font-light leading-relaxed text-white/60">{area.description}</p>
            </motion.li>
          ))}
        </ul>
      </Section>
    </>
  );
}
