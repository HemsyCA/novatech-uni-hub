import { Suspense, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAccount } from "@/components/account/account-context";
import { useAcademyFichas } from "@/hooks/use-academy-fichas";
import { getCurrentSession } from "@/services/supabase/auth";
import { formatDate, limaToday } from "@/lib/academy-dates";
import type { AcademyContext } from "@/components/academia/academy-context";
import type { AcademyMembership } from "@/types/domain";

function LockedState({ memberships }: { memberships: AcademyMembership[] }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getCurrentSession().then(({ data: { session } }) => setEmail(session?.user?.email ?? null));
  }, []);

  const today = limaToday();
  const upcoming = memberships
    .filter((m) => m.starts_at > today)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
  const expired = memberships.find((m) => m.ends_at < today);

  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-white/15 p-8">
      <Lock className="h-8 w-8 text-white/60 mb-5" />
      <h1 className="font-display text-2xl font-bold text-white mb-3">
        {upcoming
          ? `Tu acceso empieza el ${formatDate(upcoming.starts_at)}`
          : expired
            ? `Tu acceso terminó el ${formatDate(expired.ends_at)}`
            : "No tienes acceso a Academia Nova"}
      </h1>
      <p className="text-white/60 leading-relaxed">
        {upcoming
          ? `Formas parte de ${upcoming.grupo_nombre}. Vuelve ese día para empezar el curso.`
          : expired
            ? "Tu periodo de 3 semanas en la convocatoria ya finalizó. Sigues teniendo acceso a la tienda y a la impresión 3D."
            : "Academia Nova está disponible para los convocados durante su periodo de convocatoria."}
      </p>
      {!upcoming && !expired && (
        <div className="mt-6 space-y-2 text-sm text-white/60">
          {email && (
            <p>
              Si te convocaron, asegúrate de haber entrado con el mismo correo con el que te inscribieron. Ahora estás
              usando <span className="text-white">{email}</span>.
            </p>
          )}
          <p>
            Conoce cómo unirte en{" "}
            <Link to="/unete" className="text-white underline underline-offset-4">
              Únete
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

export default function Academia() {
  const { academy, progress, entrega, practica } = useAccount();
  const { loading, hasAccess, isStaff, activeMembership, memberships, userId } = academy;
  const fichas = useAcademyFichas(userId);
  const context: AcademyContext = { progress, fichas, entrega, practica, activeMembership, isStaff };

  return (
    <div className="font-mono text-white">
      <main className="container mx-auto px-4 pt-28 pb-16">
        {loading || progress.loading || fichas.loading || entrega.loading || practica.loading ? (
          <div className="text-white/60 animate-pulse">Cargando…</div>
        ) : hasAccess ? (
          <Suspense fallback={<div className="text-white/60 animate-pulse">Cargando…</div>}>
            <Outlet context={context} />
          </Suspense>
        ) : (
          <LockedState memberships={memberships} />
        )}
      </main>
    </div>
  );
}
