import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Cpu,
  GraduationCap,
  LogOut,
  Package,
  Printer,
  ShieldCheck,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import novatechLogo from "@/assets/novatech-logo.png";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useAcademyAccess } from "@/hooks/use-academy-access";
import { useMemberAccess } from "@/hooks/use-member-access";
import { useAcademyProgress } from "@/hooks/use-academy-progress";
import { daysLeft, formatDate, limaToday } from "@/lib/academy-dates";
import { lessonPath } from "@/lib/academia/course";
import { ProgressBar } from "@/components/academia/ui";
import { listOrders } from "@/services/supabase/orders";
import { listUserReservations } from "@/services/supabase/reservations";

const ACTIVE_ORDER_STATUSES = ["pending", "paid", "preparing"];
const ACTIVE_RESERVATION_STATUSES = ["pending", "approved", "in_progress"];

interface Activity {
  orders: number;
  reservations: number;
}

function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-bold">{children}</h2>
      {hint && <p className="text-sm text-white/50 mt-1">{hint}</p>}
    </div>
  );
}

function ServiceCard({
  to,
  icon: Icon,
  title,
  description,
  badge,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      to={to}
      className="group flex h-full items-start gap-4 rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold">{title}</h3>
          {badge && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-black">{badge}</span>}
        </div>
        <p className="mt-1 text-sm text-white/60">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 self-center text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
    </Link>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const navigate = useNavigate();
  const academy = useAcademyAccess();
  const progress = useAcademyProgress(academy.userId);
  const member = useMemberAccess();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([listOrders(user.id), listUserReservations(user.id)])
      .then(([orders, reservations]) => {
        if (!active) return;
        setActivity({
          orders: orders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status)).length,
          reservations: reservations.filter((r) => ACTIVE_RESERVATION_STATUSES.includes(r.status)).length,
        });
      })
      .catch(() => {
        if (active) setActivity(null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="font-mono min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-white/60">Cargando…</div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const firstName = displayName.split(" ")[0];
  const inProgress = (count: number | undefined) => (count ? `${count} en curso` : undefined);

  const today = limaToday();
  const upcomingMembership = academy.memberships
    .filter((m) => m.starts_at > today)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
  const expiredMembership = academy.memberships.find((m) => m.ends_at < today);
  const next = progress.nextLesson;

  const academySection = academy.loading || progress.loading ? null : academy.hasAccess ? (
    <section>
      <SectionTitle>Academia Nova</SectionTitle>
      <div className="rounded-2xl border border-white/25 p-6 md:p-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-white/50">Nivel 0 · Bienvenida</p>
            <p className="mt-1 text-sm text-white/70">
              {academy.activeMembership
                ? `Acceso hasta el ${formatDate(academy.activeMembership.ends_at)} · quedan ${daysLeft(academy.activeMembership.ends_at)} día(s)`
                : "Acceso permanente como parte de la directiva"}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <ProgressBar value={progress.percent} label="Progreso en Academia Nova" />
              <span className="shrink-0 text-xs text-white/60">
                {progress.done}/{progress.total}
              </span>
            </div>
            <p className="mt-3 text-sm text-white/80">
              {next
                ? progress.done > 0
                  ? `Siguiente: ${next.code} · ${next.title}`
                  : "Empieza por la guía de inicio."
                : "Completaste todas las lecciones. Prepara tu entrega."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          <Link
            to={next ? (progress.done > 0 ? lessonPath(next) : "/academia/guia") : "/academia/tarea-final"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 transition-colors"
          >
            {next ? (progress.done > 0 ? "Continuar" : "Empezar") : "Ver tarea final"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/academia"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 px-6 py-3 text-sm text-white hover:bg-white/10 transition-colors"
          >
            Ver el curso
          </Link>
        </div>
      </div>
    </section>
  ) : (
    <section>
      <SectionTitle>Academia Nova</SectionTitle>
      <div className="rounded-2xl border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <GraduationCap className="h-6 w-6 shrink-0 text-white/60" />
        <p className="flex-1 text-sm text-white/70">
          {upcomingMembership
            ? `Formas parte de ${upcomingMembership.grupo_nombre}. Tu acceso empieza el ${formatDate(upcomingMembership.starts_at)}.`
            : expiredMembership
              ? `Tu periodo en la convocatoria terminó el ${formatDate(expiredMembership.ends_at)}.`
              : "Academia Nova se abre para los convocados de cada convocatoria."}
        </p>
        {!upcomingMembership && !expiredMembership && (
          <Link to="/unete" className="text-sm text-white underline underline-offset-4 shrink-0">
            Conoce cómo unirte
          </Link>
        )}
      </div>
    </section>
  );

  const servicesSection = (
    <section>
      <SectionTitle hint="Pide una impresión o compra componentes, y sigue el estado de tus solicitudes.">
        Servicios
      </SectionTitle>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-widest text-white/50">Solicitar</h3>
          <div className="grid gap-3">
            <ServiceCard to="/print3d" icon={Printer} title="Impresión 3D" description="Reserva un turno en nuestras impresoras." />
            <ServiceCard to="/store" icon={ShoppingCart} title="Tienda Nova" description="Componentes electrónicos para tus proyectos." />
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-widest text-white/50">Mi historial</h3>
          <div className="grid gap-3">
            <ServiceCard
              to="/print3d#mis-reservas"
              icon={Calendar}
              title="Mis reservas"
              description="Estado e historial de tus impresiones 3D."
              badge={inProgress(activity?.reservations)}
            />
            <ServiceCard
              to="/store?pedidos=1"
              icon={Package}
              title="Mis pedidos"
              description="Estado e historial de tus compras en la tienda."
              badge={inProgress(activity?.orders)}
            />
          </div>
        </div>
      </div>
    </section>
  );

  const membersSection = member.isMember ? (
    <section>
      <SectionTitle>Miembros</SectionTitle>
      <ServiceCard
        to="/miembros"
        icon={Cpu}
        title="Zona de miembros"
        description="Material interno de robots, componentes y PCBs."
      />
    </section>
  ) : null;

  // A un miembro sin acceso a Academia no le sirve el aviso de "conoce cómo unirte".
  const showAcademyNotice = !academy.hasAccess && !member.loading && !member.isMember;

  return (
    <div className="font-mono min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={novatechLogo} alt="NovaTech" className="h-9 w-9" />
            <span className="font-display font-bold hidden sm:block">NOVATECH</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 hidden md:block">{user?.email}</span>
            {academy.isStaff && (
              <Link
                to="/admin"
                title="Panel de directiva"
                aria-label="Panel de directiva"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                <ShieldCheck className="h-5 w-5" />
              </Link>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-5xl space-y-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">
            Hola{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-2 text-white/60">Tu panel de Nova Tech: aprendizaje y servicios en un solo lugar.</p>
        </motion.div>

        {academy.hasAccess && academySection}
        {membersSection}
        {servicesSection}
        {showAcademyNotice && academySection}
      </main>
    </div>
  );
}
