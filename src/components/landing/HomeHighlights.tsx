import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { RobotCard } from "@/components/landing/RobotCard";
import { featuredRobotNames, robots } from "@/data/robots";
import { countPlacements, formatTournamentDate, pastTournaments, tournaments, upcomingTournaments } from "@/data/tournaments";

export function HomeHighlights() {
  const totals = countPlacements(pastTournaments());
  const nextTournament = upcomingTournaments()[0];
  const featured = robots.filter((r) => featuredRobotNames.includes(r.name));

  const stats = [
    { label: "Primeros puestos", value: totals.first },
    { label: "Podios", value: totals.first + totals.second + totals.third },
    { label: "Torneos disputados", value: totals.played },
    { label: "Torneo internacional", value: tournaments.filter((t) => t.international).length },
  ];

  return (
    <>
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Logros" title="Resultados que hablan" subtitle="Temporadas 2025 y 2026." />

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/10 p-6"
                >
                  <div className="font-display text-4xl md:text-5xl font-black text-white">{stat.value}</div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-white/50">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/competencias"
              className="group rounded-2xl border border-white/30 p-6 flex flex-col hover:border-white transition-colors"
            >
              <span className="text-xs uppercase tracking-widest text-white/50">Próximo torneo</span>
              {nextTournament ? (
                <>
                  <h3 className="font-display text-xl font-bold text-white mt-3">{nextTournament.name}</h3>
                  <p className="mt-4 text-sm text-white/60 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {formatTournamentDate(nextTournament)}
                  </p>
                  <p className="mt-1 text-sm text-white/60 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {nextTournament.venue}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-white/60">Pronto anunciaremos la siguiente temporada.</p>
              )}
              <span className="mt-auto pt-6 text-sm text-white flex items-center gap-2">
                Ver calendario
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow="Prototipos" title="Robots destacados" />
          <div className="grid md:grid-cols-3 gap-4">
            {featured.map((robot) => (
              <RobotCard key={robot.name} robot={robot} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/robots"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Ver todos los robots
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
