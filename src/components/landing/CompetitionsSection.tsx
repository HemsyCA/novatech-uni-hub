import { motion } from "framer-motion";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { PageHero, Section } from "@/components/landing/PageSection";
import {
  countPlacements,
  formatTournamentDate,
  pastTournaments,
  tournaments,
  tournamentsByYear,
  tournamentYears,
  upcomingTournaments,
  type Tournament,
} from "@/data/tournaments";
import { fadeIn } from "@/lib/page-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { fillTemplate, pageText, type PageText } from "@/lib/i18n-pages";
import type { Lang } from "@/lib/i18n";

const pill = "rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider";

function ResultBadge({ tournament, p }: { tournament: Tournament; p: PageText["competitions"] }) {
  const highlighted = tournament.result === 1;
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs ${
        highlighted ? "border-white bg-white font-bold text-black" : "border-white/30 text-white/80"
      }`}
    >
      {tournament.result ? p.placements[tournament.result - 1] : p.participation}
    </span>
  );
}

function TournamentMeta({ tournament, lang }: { tournament: Tournament; lang: Lang }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-white/50">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
        {formatTournamentDate(tournament, lang)}
      </span>
      <span className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
        {tournament.venue}
      </span>
    </div>
  );
}

function TournamentRow({ tournament, lang, p }: { tournament: Tournament; lang: Lang; p: PageText["competitions"] }) {
  return (
    <li className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-sans text-lg font-medium text-white">{tournament.name}</h4>
          {tournament.organizedByNova && <span className={`${pill} border-white/40 text-white`}>{p.organizedByNova}</span>}
          {tournament.international && <span className={`${pill} border-white/40 text-white`}>{p.international}</span>}
        </div>
        <TournamentMeta tournament={tournament} lang={lang} />
      </div>
      <ResultBadge tournament={tournament} p={p} />
    </li>
  );
}

export function CompetitionsSection() {
  const { lang } = useLanguage();
  const p = pageText[lang].competitions;
  const totals = countPlacements(pastTournaments());
  const upcoming = upcomingTournaments();
  const novaLegacy = tournaments.filter((t) => t.organizedByNova);

  const stats = [
    { label: p.statFirst, value: totals.first },
    { label: p.statSecond, value: totals.second },
    { label: p.statThird, value: totals.third },
    { label: p.statPlayed, value: totals.played },
  ];

  return (
    <>
      <PageHero
        id="competencias"
        label={p.label}
        title={
          <>
            {p.titlePrefix}
            <span className="text-nova">{p.titleAccent}</span>
          </>
        }
        subtitle={p.subtitle}
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

      <Section index="01" label={p.upcomingLabel} title={p.upcomingTitle}>
        {upcoming.length === 0 ? (
          <p className="text-base font-light text-white/60">{p.upcomingEmpty}</p>
        ) : (
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {upcoming.map((t) => (
              <motion.li key={t.name} {...fadeIn} className="py-5">
                <div className="font-sans text-lg font-medium text-white">{t.name}</div>
                <TournamentMeta tournament={t} lang={lang} />
              </motion.li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        index="02"
        label={p.recordLabel}
        title={p.recordTitle}
        subtitle={p.recordSubtitle}
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
                    {fillTemplate(p.yearSummary, yearTotals)}
                  </p>
                </div>
                <ul className="divide-y divide-white/10">
                  {list.map((t) => (
                    <TournamentRow key={t.name} tournament={t} lang={lang} p={p} />
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
        label={p.legacyLabel}
        title={p.legacyTitle}
        subtitle={p.legacySubtitle}
      >
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {novaLegacy.map((t) => (
            <motion.li key={t.name} {...fadeIn} className="flex items-center gap-5 py-6">
              <Trophy className="h-7 w-7 shrink-0 text-nova" strokeWidth={1.25} />
              <div>
                <div className="font-sans text-lg font-medium text-white">{t.name}</div>
                <div className="mt-1 font-mono text-xs text-white/50">{formatTournamentDate(t, lang)}</div>
              </div>
            </motion.li>
          ))}
        </ul>
      </Section>
    </>
  );
}
