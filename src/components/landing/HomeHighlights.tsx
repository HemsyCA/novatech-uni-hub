import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { RobotCard } from "@/components/landing/RobotCard";
import { featuredRobotNames, robots } from "@/data/robots";
import { countPlacements, formatTournamentDate, pastTournaments, tournaments, upcomingTournaments } from "@/data/tournaments";
import { useLanguage } from "@/contexts/LanguageContext";

export function HomeHighlights() {
  const { lang, t } = useLanguage();
  const h = t.highlights;
  const totals = countPlacements(pastTournaments());
  const nextTournament = upcomingTournaments()[0];
  const featured = featuredRobotNames.flatMap((name) => robots.filter((r) => r.name === name));

  const stats = [
    { label: h.firstPlaces, value: totals.first },
    { label: h.podiums, value: totals.first + totals.second + totals.third },
    { label: h.played, value: totals.played },
    { label: h.international, value: tournaments.filter((t) => t.international).length },
  ];

  return (
    <>
      <section className="py-20 bg-[#f5f5f5] text-black">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={h.badge} title={h.title} subtitle={h.subtitle} tone="light" />

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid grid-cols-2 gap-x-8 gap-y-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="border-t-2 border-black pt-5 pb-2"
                >
                  <div className="font-display text-5xl md:text-6xl font-black text-black">{stat.value}</div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-black/55">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/competencias"
              className="group rounded-2xl bg-black p-6 flex flex-col text-white shadow-[10px_10px_0_0_hsl(var(--nova))] transition-transform hover:-translate-y-0.5"
            >
              <span className="text-xs uppercase tracking-widest text-white/50">{h.nextTournament}</span>
              {nextTournament ? (
                <>
                  <h3 className="font-display text-xl font-bold text-white mt-3">{nextTournament.name}</h3>
                  <p className="mt-4 text-sm text-white/60 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {formatTournamentDate(nextTournament, lang)}
                  </p>
                  <p className="mt-1 text-sm text-white/60 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {nextTournament.venue}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-white/60">{h.announceSoon}</p>
              )}
              <span className="mt-auto pt-6 text-sm text-white flex items-center gap-2">
                {h.viewCalendar}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <SectionHeading eyebrow={h.prototypesBadge} title={h.featuredTitle} />
          <div className="grid md:grid-cols-3 gap-4">
            {featured.map((robot) => (
              <RobotCard key={robot.name} robot={robot} lang={lang} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/robots"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {h.viewAllRobots}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
