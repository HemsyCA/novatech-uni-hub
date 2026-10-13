import { motion } from "framer-motion";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/landing/SectionHeading";
import {
  countPlacements,
  formatTournamentDate,
  pastTournaments,
  placementLabel,
  tournaments,
  tournamentsByYear,
  tournamentYears,
  upcomingTournaments,
  type Tournament,
} from "@/data/tournaments";

function ResultBadge({ tournament }: { tournament: Tournament }) {
  const highlighted = tournament.result === 1;
  return (
    <span
      className={`shrink-0 px-3 py-1 text-xs rounded-full border ${
        highlighted ? "bg-white text-black border-white font-bold" : "border-white/30 text-white/80"
      }`}
    >
      {placementLabel(tournament.result)}
    </span>
  );
}

function TournamentRow({ tournament }: { tournament: Tournament }) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-white/10 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-display text-sm md:text-base font-bold text-white">{tournament.name}</h4>
          {tournament.organizedByNova && (
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border border-white/40 text-white">
              Organizado por Nova
            </span>
          )}
          {tournament.international && (
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border border-white/40 text-white">
              Internacional
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatTournamentDate(tournament)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {tournament.venue}
          </span>
        </div>
      </div>
      <ResultBadge tournament={tournament} />
    </li>
  );
}

export function CompetitionsSection() {
  const totals = countPlacements(pastTournaments());
  const upcoming = upcomingTournaments();
  const novaLegacy = tournaments.filter((t) => t.organizedByNova);

  const stats = [
    { label: "Primeros puestos", value: totals.first },
    { label: "Segundos puestos", value: totals.second },
    { label: "Terceros puestos", value: totals.third },
    { label: "Torneos disputados", value: totals.played },
  ];

  return (
    <>
      <section id="competencias" className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            eyebrow="Competencias"
            title="Palmarés y calendario"
            subtitle="Competimos en torneos universitarios de todo el Perú y llevamos a Nova hasta Rumanía."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-2xl border border-white/10 p-6 text-center"
              >
                <div className="font-display text-4xl md:text-5xl font-black text-white">{stat.value}</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/20 p-6 md:p-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CalendarDays className="w-6 h-6" />
              Próximos torneos
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-white/60">Pronto anunciaremos los torneos de la siguiente temporada.</p>
            ) : (
              <ul className="grid md:grid-cols-2 gap-4">
                {upcoming.map((t) => (
                  <li key={t.name} className="rounded-xl bg-white/[0.04] border border-white/10 p-5">
                    <div className="font-display font-bold text-white">{t.name}</div>
                    <div className="mt-2 text-sm text-white/60 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {formatTournamentDate(t)}
                    </div>
                    <div className="mt-1 text-sm text-white/60 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {t.venue}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Palmarés"
            title="Resultados por temporada"
            subtitle="Para cada torneo se muestra el mejor puesto que obtuvo el equipo."
          />
          <div className="space-y-12 max-w-4xl mx-auto">
            {tournamentYears().map((year) => {
              const list = tournamentsByYear(year);
              const yearTotals = countPlacements(list);
              return (
                <div key={year}>
                  <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
                    <h3 className="font-display text-3xl font-black text-white">{year}</h3>
                    <p className="text-xs text-white/50">
                      {yearTotals.played} torneos · {yearTotals.first} primeros · {yearTotals.second} segundos ·{" "}
                      {yearTotals.third} terceros
                    </p>
                  </div>
                  <ul className="rounded-2xl border border-white/10 px-5">
                    {list.map((t) => (
                      <TournamentRow key={t.name} tournament={t} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="nova-legacy" className="py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            <SectionHeading
              align="left"
              eyebrow="Torneo propio"
              title="Nova Legacy"
              subtitle="El torneo de robótica que organiza Nova Tech en la Universidad Nacional de Ingeniería para reunir a equipos de todo el país."
            />
            <ul className="space-y-4">
              {novaLegacy.map((t) => (
                <li key={t.name} className="rounded-2xl border border-white/10 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border border-white/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-white">{t.name}</div>
                    <div className="text-xs text-white/50 mt-1">{formatTournamentDate(t)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
