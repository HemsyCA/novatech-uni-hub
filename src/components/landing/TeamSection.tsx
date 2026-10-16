import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Section } from "@/components/landing/PageSection";
import { directiva, founders, honoraryMembers, teamStats, type TeamMember } from "@/data/team";
import { fadeIn } from "@/lib/page-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { pageText } from "@/lib/i18n-pages";

function MemberGroup({ title, members }: { title: string; members: TeamMember[] }) {
  if (members.length === 0) return null;

  return (
    <div className="mb-14">
      <h3 className="font-sans text-xl font-medium text-white">{title}</h3>
      <ul className="mt-5 grid gap-x-10 sm:grid-cols-2">
        {members.map((member) => (
          <motion.li key={member.name} {...fadeIn} className="border-t border-white/15 py-4">
            <div className="font-sans text-base font-medium text-white">{member.name}</div>
            <div className="mt-1 text-sm font-light text-white/70">{member.role}</div>
            <div className="mt-1 font-mono text-xs text-white/50">{member.career}</div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function TeamSection({ index }: { index?: string }) {
  const { lang } = useLanguage();
  const p = pageText[lang].team;
  const stats = [
    { label: p.stats[0], value: teamStats.activeMembers },
    { label: p.stats[1], value: teamStats.careers },
    { label: p.stats[2], value: teamStats.areas },
  ];

  return (
    <Section
      id="equipo"
      index={index}
      label={p.label}
      title={p.title}
      subtitle={p.subtitle}
      aside={
        <div className="mt-10">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline justify-between gap-4 border-t border-white/15 py-4">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">{stat.label}</span>
              <span className="font-mono text-3xl font-light text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      }
    >
      <MemberGroup title={p.directiva} members={directiva} />
      <MemberGroup title={p.founders} members={founders} />
      <MemberGroup title={p.honorary} members={honoraryMembers} />

      <div className="mt-6 border-t border-white/15 pt-10">
        <h3 className="font-sans text-2xl font-medium text-white">{p.ctaTitle}</h3>
        <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-white/60">
          {p.ctaText}
        </p>
        <Link
          to="/unete"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-nova hover:text-white"
        >
          {p.ctaButton}
        </Link>
      </div>
    </Section>
  );
}
