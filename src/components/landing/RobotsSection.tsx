import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { PageHero, Section } from "@/components/landing/PageSection";
import { RobotCard } from "@/components/landing/RobotCard";
import { pcbs, robotCategories, robots, type RobotCategoryId, type RobotLevel } from "@/data/robots";
import { fadeIn } from "@/lib/page-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { pageText, pcbsEn, robotCategoryDescriptionsEn } from "@/lib/i18n-pages";
import { robotCategoryNamesEn, robotLevelNamesEn } from "@/lib/i18n";

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
      className={`rounded-full border px-3.5 py-1.5 font-mono text-[13px] transition-colors ${
        active
          ? "border-white bg-white text-black"
          : "border-white/20 text-white/70 hover:border-nova hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function RobotsSection() {
  const { lang } = useLanguage();
  const p = pageText[lang].robots;
  const categoryLabel = (id: RobotCategoryId, name: string) => (lang === "en" ? robotCategoryNamesEn[id] ?? name : name);
  const levelLabel = (level: RobotLevel) => (lang === "en" ? robotLevelNamesEn[level] ?? level : level);
  const [category, setCategory] = useState<RobotCategoryId | typeof ALL>(ALL);
  const [level, setLevel] = useState<RobotLevel | typeof ALL>(ALL);

  const filtered = robots.filter(
    (r) => (category === ALL || r.categories.includes(category)) && (level === ALL || r.levels.includes(level))
  );

  return (
    <>
      <PageHero
        id="robots"
        label={p.label}
        title={
          <>
            {p.titlePrefix}
            <span className="text-nova">{p.titleAccent}</span>
          </>
        }
        subtitle={p.subtitle}
      >
        <div className="mt-16 space-y-3">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={category === ALL} onClick={() => setCategory(ALL)}>
              {p.allCategories}
            </FilterChip>
            {robotCategories.map((c) => (
              <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {categoryLabel(c.id, c.name)}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={level === ALL} onClick={() => setLevel(ALL)}>
              {p.allLevels}
            </FilterChip>
            {levels.map((l) => (
              <FilterChip key={l} active={level === l} onClick={() => setLevel(l)}>
                {levelLabel(l)}
              </FilterChip>
            ))}
          </div>
        </div>

        <p className="mt-8 mb-10 font-mono text-xs uppercase tracking-[0.2em] text-white/50">
          {filtered.length} {filtered.length === 1 ? p.result : p.results}
        </p>

        {filtered.length === 0 ? (
          <p className="py-12 text-white/60">{p.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((robot, index) => (
              <motion.div
                key={robot.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
              >
                <RobotCard robot={robot} lang={lang} />
              </motion.div>
            ))}
          </div>
        )}
      </PageHero>

      <Section
        index="01"
        label={p.categoriesLabel}
        title={p.categoriesTitle}
        subtitle={p.categoriesSubtitle}
      >
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {robotCategories.map((c) => (
            <motion.li key={c.id} {...fadeIn} className="border-t border-white/15 py-6">
              <h3 className="font-sans text-lg font-medium text-white">{categoryLabel(c.id, c.name)}</h3>
              <p className="mt-2 text-[15px] font-light leading-relaxed text-white/60">
                {lang === "en" ? robotCategoryDescriptionsEn[c.id] ?? c.description : c.description}
              </p>
            </motion.li>
          ))}
        </ul>
      </Section>

      <Section
        index="02"
        label={p.pcbLabel}
        title={p.pcbTitle}
        subtitle={p.pcbSubtitle}
      >
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {pcbs.map((pcbData) => {
            const pcb = lang === "en" ? pcbsEn[pcbData.name] ?? pcbData : pcbData;
            return (
            <motion.li
              key={pcbData.name}
              {...fadeIn}
              className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="flex items-center gap-4">
                <Cpu className="h-5 w-5 shrink-0 text-white/60" strokeWidth={1.25} />
                <h3 className="font-sans text-lg font-medium text-white">{pcb.name}</h3>
              </div>
              <p className="pl-9 font-mono text-xs text-white/60 sm:pl-0 sm:text-right">{pcb.usedIn}</p>
            </motion.li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
