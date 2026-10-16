import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Section } from "@/components/landing/PageSection";
import { directiva, founders, honoraryMembers, teamStats, type TeamMember } from "@/data/team";
import { fadeIn } from "@/lib/page-motion";

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
  const stats = [
    { label: "Miembros activos", value: teamStats.activeMembers },
    { label: "Carreras de ingeniería", value: teamStats.careers },
    { label: "Áreas de trabajo", value: teamStats.areas },
  ];

  return (
    <Section
      id="equipo"
      index={index}
      label="Equipo"
      title="Las personas detrás de Nova"
      subtitle="Estudiantes de distintas carreras de la UNI que comparten la pasión por construir robots."
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
      <MemberGroup title="Directiva" members={directiva} />
      <MemberGroup title="Fundadores" members={founders} />
      <MemberGroup title="Miembros honorables" members={honoraryMembers} />

      <div className="mt-6 border-t border-white/15 pt-10">
        <h3 className="font-sans text-2xl font-medium text-white">¿Quieres ser parte del equipo?</h3>
        <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-white/60">
          No necesitas experiencia previa en robótica. Buscamos gente que intente, se equivoque e investigue.
        </p>
        <Link
          to="/unete"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-nova hover:text-white"
        >
          Conoce cómo unirte
        </Link>
      </div>
    </Section>
  );
}
