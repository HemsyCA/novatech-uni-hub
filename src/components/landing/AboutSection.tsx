import { motion } from "framer-motion";
import { Code2, Cog, CircuitBoard } from "lucide-react";
import { Label, PageHero, Section } from "@/components/landing/PageSection";
import { areas } from "@/data/team";
import { countPlacements, pastTournaments } from "@/data/tournaments";
import { fadeIn } from "@/lib/page-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { areasEn, fillTemplate, pageText } from "@/lib/i18n-pages";

const pillarIcons = [Cog, CircuitBoard, Code2];

// Los hitos de temporada no tienen texto fijo: se calculan con los torneos.
const seasonYears = ["2025", undefined, undefined, "2026"];

export function AboutSection() {
  const { lang } = useLanguage();
  const p = pageText[lang].about;
  const areaList = lang === "en" ? areasEn : areas;

  const seasonSummary = (year: string) => {
    const totals = countPlacements(pastTournaments().filter((t) => t.start.startsWith(year)));
    return fillTemplate(p.seasonSummary, { played: totals.played, first: totals.first });
  };

  return (
    <>
      <PageHero
        id="nosotros"
        label={p.label}
        title={
          <>
            {p.titlePrefix}
            <span className="text-nova">{p.titleAccent}</span>
          </>
        }
        subtitle={p.subtitle}
      >
        <ol className="mt-20 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {p.pillars.map((pillar, index) => {
            const Icon = pillarIcons[index];
            return (
            <motion.li
              key={pillar.title}
              {...fadeIn}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="border-t border-white/15 pt-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-light text-nova">0{index + 1}</span>
                <Icon className="h-8 w-8 text-white/70" strokeWidth={1.25} />
              </div>
              <h2 className="mt-5 font-sans text-lg font-medium text-white">{pillar.title}</h2>
              <p className="mt-2 text-[15px] font-light leading-relaxed text-white/60">{pillar.description}</p>
            </motion.li>
            );
          })}
        </ol>
      </PageHero>

      <Section index="01" label={p.historyLabel} title={p.historyTitle}>
        <ol className="relative border-l border-white/15">
          {p.milestones.map((m, index) => (
            <motion.li
              key={m.title}
              {...fadeIn}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative pl-10 pb-14 last:pb-0"
            >
              <span
                className={`absolute -left-[8px] top-0.5 h-4 w-4 rounded-full ${
                  index === p.milestones.length - 1 ? "bg-nova" : "border-2 border-white/40 bg-black"
                }`}
              />
              <Label>{m.date}</Label>
              <h3 className="mt-3 font-sans text-2xl font-medium text-white">{m.title}</h3>
              <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-white/60">
                {seasonYears[index] ? seasonSummary(seasonYears[index]!) : m.description}
              </p>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section
        index="02"
        label={p.orgLabel}
        title={p.orgTitle}
        subtitle={p.orgSubtitle}
      >
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {areaList.map((area) => (
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
