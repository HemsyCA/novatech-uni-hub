import { motion } from "framer-motion";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { PageHero, Section } from "@/components/landing/PageSection";
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
import { fadeIn } from "@/lib/page-motion";

const pill = "rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider";

function ResultBadge({ tournament }: { tournament: Tournament }) {
  const highlighted = tournament.result === 1;
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs ${
        highlighted ? "border-white bg-white font-bold text-black" : "border-white/30 text-white/80"
      }`}
    >
      {placementLabel(tournament.result)}
    </span>
  );
}

function TournamentMeta({ tournament }: { tournament: Tournament }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-white/50">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
        {formatTournamentDate(tournament)}
      </span>
      <span className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
        {tournament.venue}
      </span>
    </div>
  );
}

function TournamentRow({ tournament }: { tournament: Tournament }) {
  return (
    <li className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-sans text-lg font-medium text-white">{tournament.name}</h4>
          {tournament.organizedByNova && <span className={`${pill} border-white/40 text-white`}>Organizado por Nova</span>}
          {tournament.international && <span className={`${pill} border-white/40 text-white`}>Internacional</span>}
        </div>
        <TournamentMeta tournament={tournament} />
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
      <PageHero
        id="competencias"
        label="Competencias"
        title={
          <>
            Palmarés y <span className="text-nova">calendario</span>
          </>
        }
        subtitle="Competimos en torneos universitarios de todo el Perú y llevamos a Nova hasta Rumanía."
      >
        <div className="mt-20 grid grid-cols-2 gap-x-10 gap-y-12 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              {...fadeIn}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="border-t border-white/15 pt-5"
            >
              <div className="font-mono text-5xl font-light text-white md:text-6xl">{stat.value}</div>
              <div className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </PageHero>

      <Section index="01" label="Calendario" title="Próximos torneos">
        {upcoming.length === 0 ? (
          <p className="text-base font-light text-white/60">Pronto anunciaremos los torneos de la siguiente temporada.</p>
        ) : (
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {upcoming.map((t) => (
              <motion.li key={t.name} {...fadeIn} className="py-5">
                <div className="font-sans text-lg font-medium text-white">{t.name}</div>
                <TournamentMeta tournament={t} />
              </motion.li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        index="02"
        label="Palmarés"
        title="Resultados por temporada"
        subtitle="Para cada torneo se muestra el mejor puesto que obtuvo el equipo."
      >
        <div className="space-y-16">
          {tournamentYears().map((year) => {
            const list = tournamentsByYear(year);
            const yearTotals = countPlacements(list);
            return (
              <div key={year}>
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/15 pb-4">
                  <h3 className="font-mono text-4xl font-light text-white">{year}</h3>
                  <p className="font-mono text-xs text-white/50">
                    {yearTotals.played} torneos · {yearTotals.first} primeros · {yearTotals.second} segundos ·{" "}
                    {yearTotals.third} terceros
                  </p>
                </div>
                <ul className="divide-y divide-white/10">
                  {list.map((t) => (
                    <TournamentRow key={t.name} tournament={t} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        id="nova-legacy"
        index="03"
        label="Torneo propio"
        title="Nova Legacy"
        subtitle="El torneo de robótica que organiza Nova Tech en la Universidad Nacional de Ingeniería para reunir a equipos de todo el país."
      >
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {novaLegacy.map((t) => (
            <motion.li key={t.name} {...fadeIn} className="flex items-center gap-5 py-6">
              <Trophy className="h-7 w-7 shrink-0 text-nova" strokeWidth={1.25} />
              <div>
                <div className="font-sans text-lg font-medium text-white">{t.name}</div>
                <div className="mt-1 font-mono text-xs text-white/50">{formatTournamentDate(t)}</div>
              </div>
            </motion.li>
          ))}
        </ul>
      </Section>
    </>
  );
}
