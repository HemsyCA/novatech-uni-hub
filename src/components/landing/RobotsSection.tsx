import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { RobotCard } from "@/components/landing/RobotCard";
import { pcbs, robotCategories, robots, type RobotCategoryId, type RobotLevel } from "@/data/robots";

const ALL = "all";

const levels = (["Amateur", "Senior", "Máster"] as RobotLevel[]).filter((l) =>
  robots.some((r) => r.levels.includes(l))
);

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
        active ? "bg-white text-black border-white" : "border-white/20 text-white/70 hover:border-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function RobotsSection() {
  const [category, setCategory] = useState<RobotCategoryId | typeof ALL>(ALL);
  const [level, setLevel] = useState<RobotLevel | typeof ALL>(ALL);

  const filtered = robots.filter(
    (r) => (category === ALL || r.categories.includes(category)) && (level === ALL || r.levels.includes(level))
  );

  return (
    <>
      <section id="robots" className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            eyebrow="Prototipos"
            title="Nuestros robots"
            subtitle="Cada robot se diseña, fabrica y programa dentro del equipo. Estos son los que compitieron con Nova en la temporada 2026."
          />

          <div className="space-y-3 mb-10">
            <div className="flex flex-wrap gap-2 justify-center">
              <FilterChip active={category === ALL} onClick={() => setCategory(ALL)}>
                Todas las categorías
              </FilterChip>
              {robotCategories.map((c) => (
                <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.name}
                </FilterChip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <FilterChip active={level === ALL} onClick={() => setLevel(ALL)}>
                Todos los niveles
              </FilterChip>
              {levels.map((l) => (
                <FilterChip key={l} active={level === l} onClick={() => setLevel(l)}>
                  {l}
                </FilterChip>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-white/50 mb-6">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </p>

          {filtered.length === 0 ? (
            <p className="text-center text-white/60 py-12">No hay robots con esa combinación de categoría y nivel.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((robot, index) => (
                <motion.div
                  key={robot.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                >
                  <RobotCard robot={robot} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Categorías"
            title="Dónde competimos"
            subtitle="Los niveles Amateur, Senior y Máster ordenan la dificultad dentro de cada categoría."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {robotCategories.map((c) => (
              <div key={c.id} className="rounded-2xl border border-white/10 p-5">
                <h3 className="font-display text-base font-bold text-white mb-2">{c.name}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Hardware propio"
            title="PCBs universales"
            subtitle="Placas diseñadas por Nova en EasyEDA y reutilizadas entre varias categorías."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pcbs.map((pcb) => (
              <div key={pcb.name} className="rounded-2xl border border-white/10 p-5">
                <Cpu className="w-6 h-6 text-white mb-4" />
                <h3 className="font-display text-sm font-bold text-white mb-2">{pcb.name}</h3>
                <p className="text-xs text-white/60">{pcb.usedIn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
