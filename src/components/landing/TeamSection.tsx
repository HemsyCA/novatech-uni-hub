import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { directiva, founders, honoraryMembers, teamStats, type TeamMember } from "@/data/team";

function MemberGroup({ title, members }: { title: string; members: TeamMember[] }) {
  if (members.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="font-display text-lg font-bold text-white mb-5">{title}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((member) => (
          <div key={member.name} className="rounded-2xl border border-white/10 p-5">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4">
              <UserRound className="w-6 h-6 text-white/80" />
            </div>
            <div className="font-display text-sm font-bold text-white">{member.name}</div>
            <div className="text-xs text-white/70 mt-1">{member.role}</div>
            <div className="text-xs text-white/40 mt-1">{member.career}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamSection() {
  const stats = [
    { label: "Miembros activos", value: teamStats.activeMembers },
    { label: "Carreras de ingeniería", value: teamStats.careers },
    { label: "Áreas de trabajo", value: teamStats.areas },
  ];

  return (
    <section id="equipo" className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Equipo"
          title="Las personas detrás de Nova"
          subtitle="Estudiantes de distintas carreras de la UNI que comparten la pasión por construir robots."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 p-6 text-center">
              <div className="font-display text-4xl font-black text-white">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        <MemberGroup title="Directiva" members={directiva} />
        <MemberGroup title="Fundadores" members={founders} />
        <MemberGroup title="Miembros honorables" members={honoraryMembers} />

        <div className="rounded-2xl border border-white/20 p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">¿Quieres ser parte del equipo?</h3>
          <p className="text-white/60 mb-8">
            No necesitas experiencia previa en robótica. Buscamos gente que intente, se equivoque e investigue.
          </p>
          <Link
            to="/unete"
            className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Conoce cómo unirte
          </Link>
        </div>
      </div>
    </section>
  );
}
