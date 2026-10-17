import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Package, Printer, ShoppingCart, type LucideIcon } from "lucide-react";
import { useAccount } from "@/components/account/account-context";
import { NextStepCard } from "@/components/account/Journey";
import { AuthorCredit } from "@/components/account/Conocimiento";
import { StatusPill, type StatusTone } from "@/components/account/ui";
import { ProgressBar } from "@/components/academia/ui";
import { StatusTracker } from "@/components/StatusTracker";
import { displayNameOf } from "@/hooks/use-session";
import { daysLeft, formatDate } from "@/lib/academy-dates";
import { guideVisitedCount } from "@/lib/academia/guide-progress";
import { nextStepFor } from "@/lib/account/journey";
import { urgentFor } from "@/lib/account/urgent";
import { secondaryButton } from "@/lib/account/styles";
import { orderSteps, reservationSteps } from "@/lib/tracker-steps";
import { listConocimientos, type Conocimiento } from "@/services/supabase/conocimientos";

const ORDER_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Pendiente", tone: "neutral" },
  paid: { label: "Confirmado", tone: "progress" },
  preparing: { label: "Preparando", tone: "progress" },
  delivered: { label: "Listo para recoger", tone: "attention" },
};
const RESERVATION_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Enviada", tone: "neutral" },
  approved: { label: "Aceptada", tone: "progress" },
  in_progress: { label: "Imprimiendo", tone: "progress" },
  completed: { label: "Lista para recoger", tone: "attention" },
};

function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">{children}</h2>
      {action}
    </div>
  );
}

// Los dos servicios: la razón principal por la que la mayoría entra a su cuenta.
function ServiceCard({
  to,
  icon: Icon,
  title,
  description,
  cta,
  active,
  activeTo,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  active: number;
  activeTo: string;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-white/15 p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-white/60">{description}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link to={to} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition-colors hover:bg-white/90">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
        {active > 0 && (
          <Link to={activeTo} className="text-sm text-white/60 underline underline-offset-4 hover:text-white">
            {active} en curso
          </Link>
        )}
      </div>
    </article>
  );
}

function ReviewTile({ to, count, label }: { to: string; count: number; label: string }) {
  return (
    <Link
      to={to}
      className={`rounded-xl border p-4 transition-colors hover:border-white/40 ${count > 0 ? "border-nova/60 bg-nova/10" : "border-white/10"}`}
    >
      <p className={`font-display text-2xl font-black ${count > 0 ? "text-white" : "text-white/30"}`}>{count}</p>
      <p className="mt-1 text-xs text-white/60">{label}</p>
    </Link>
  );
}

export default function Dashboard() {
  const account = useAccount();
  const { user, sessionLoading, academy, progress, entrega, practica, member, orders, reservations, staffPending, academicPending } = account;
  const isTeam = member.isMember || academy.isAcademic;
  const [recent, setRecent] = useState<Conocimiento[]>([]);

  useEffect(() => {
    if (!isTeam) return;
    listConocimientos()
      .then((items) => setRecent(items.slice(0, 3)))
      .catch(() => setRecent([]));
  }, [isTeam]);

  if (sessionLoading || academy.loading || member.loading) {
    return <div className="container mx-auto px-4 pt-32 text-white/60 animate-pulse">Cargando…</div>;
  }

  const firstName = displayNameOf(user).split(" ")[0];
  const role = academy.isStaff
    ? "Directiva"
    : academy.isAcademic
      ? "Área académica"
      : member.isMember
        ? "Miembro"
        : academy.hasAccess
          ? "Convocado"
          : "Cliente";
  const isConvocado = academy.hasAccess && !academy.isStaff && !member.isMember;
  const urgent = urgentFor(account);

  const activeOrders = orders.filter((o) => o.status in ORDER_STATUS);
  const activeReservations = reservations.filter((r) => r.status in RESERVATION_STATUS);
  const academyStep =
    academy.hasAccess && !progress.loading && !entrega.loading
      ? nextStepFor({
          hasAccess: true,
          isStaff: false,
          isMember: false,
          memberships: academy.memberships,
          completed: progress.completed,
          done: progress.done,
          total: progress.total,
          nextLesson: progress.nextLesson,
          entrega: entrega.entrega,
          practica: practica.practica,
          guideVisited: guideVisitedCount(),
        })
      : null;

  const showReviews = staffPending !== null || academicPending !== null;

  return (
    <main className="container mx-auto max-w-5xl space-y-10 px-4 pb-16 pt-28">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-black tracking-tight md:text-3xl">Hola{firstName ? `, ${firstName}` : ""}</h1>
        <p className="mt-1 text-sm text-white/50">
          {role}
          {isConvocado && academy.activeMembership && ` · ${academy.activeMembership.grupo_nombre} · quedan ${daysLeft(academy.activeMembership.ends_at)} día(s)`}
        </p>
      </motion.header>

      {/* 1. Ahora: solo si algo pide tu acción. */}
      {urgent && <NextStepCard step={urgent} />}

      {/* Para la directiva y el Área académica, revisar es su tarea principal. */}
      {showReviews && (
        <section>
          <SectionLabel>Por revisar</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {academicPending !== null && <ReviewTile to="/comunidad?vista=revisar" count={academicPending} label="Aportes de la Comunidad" />}
            {staffPending && (
              <>
                <ReviewTile to="/admin" count={staffPending.entregas} label="Tareas finales" />
                <ReviewTile to="/admin" count={staffPending.inscripciones} label="Inscripciones" />
                <ReviewTile to="/admin" count={staffPending.pedidos} label="Pedidos por confirmar" />
                <ReviewTile to="/admin" count={staffPending.reservas} label="Reservas por aprobar" />
              </>
            )}
          </div>
        </section>
      )}

      {/* 2. Los servicios. */}
      <section>
        <SectionLabel>Servicios</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2">
          <ServiceCard
            to="/print3d"
            icon={Printer}
            title="Impresión 3D"
            description="Envía los datos de tu pieza, elige el día y la imprimimos por ti."
            cta="Pedir una impresión"
            active={activeReservations.length}
            activeTo="/print3d?vista=reservas"
          />
          <ServiceCard
            to="/store"
            icon={ShoppingCart}
            title="Tienda Nova"
            description="Componentes electrónicos para tus proyectos, listos para recoger."
            cta="Comprar componentes"
            active={activeOrders.length}
            activeTo="/store?vista=pedidos"
          />
        </div>
      </section>

      {/* 3. En curso: cómo va lo tuyo, sin entrar a otra página. */}
      {activeOrders.length + activeReservations.length > 0 && (
        <section>
          <SectionLabel>En curso</SectionLabel>
          <div className="space-y-3">
            {activeReservations.map((r) => (
              <Link key={r.id} to="/print3d?vista=reservas" className="block space-y-4 rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold">
                      <Printer className="h-4 w-4 text-white/60" /> {r.project_name}
                    </p>
                    <p className="mt-0.5 text-xs text-white/50">Impresión 3D · {formatDate(r.scheduled_date)}</p>
                  </div>
                  <StatusPill tone={RESERVATION_STATUS[r.status].tone}>{RESERVATION_STATUS[r.status].label}</StatusPill>
                </div>
                <StatusTracker steps={reservationSteps} currentKey={r.status} />
              </Link>
            ))}
            {activeOrders.map((o) => (
              <Link key={o.id} to="/store?vista=pedidos" className="block space-y-4 rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold">
                      <Package className="h-4 w-4 text-white/60" /> Pedido · S/ {Number(o.total).toFixed(2)}
                    </p>
                    <p className="mt-0.5 text-xs text-white/50">Tienda Nova · {formatDate(o.created_at.slice(0, 10))}</p>
                  </div>
                  <StatusPill tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</StatusPill>
                </div>
                <StatusTracker steps={orderSteps} currentKey={o.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Según tu rol. */}
      {academyStep && (
        <section>
          <SectionLabel
            action={
              <Link to="/academia" className="text-xs text-white/50 underline underline-offset-4 hover:text-white">
                Ver mi recorrido
              </Link>
            }
          >
            Academia Nova
          </SectionLabel>
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/50">{academyStep.eyebrow}</p>
              <p className="mt-0.5 font-semibold first-letter:uppercase">{academyStep.title}</p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={progress.percent} label="Progreso de la Parte 1" />
                <span className="shrink-0 text-xs text-white/50">
                  Parte 1 · {progress.done}/{progress.total}
                </span>
              </div>
            </div>
            {academyStep.cta && (
              <Link to={academyStep.cta.to} className={secondaryButton}>
                {academyStep.cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      )}

      {isTeam && (
        <section>
          <SectionLabel
            action={
              <Link to="/comunidad?vista=compartir" className="text-xs text-white/50 underline underline-offset-4 hover:text-white">
                Compartir un descubrimiento
              </Link>
            }
          >
            <span className="text-nova">Zona de miembros</span> · Nuevo en Conocimientos
          </SectionLabel>
          {recent.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 px-5 py-6 text-sm text-white/50">
              Aún no hay conocimientos publicados.{" "}
              <Link to="/conocimientos" className="text-white underline underline-offset-4">
                Ir a Conocimientos Nova
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
              {recent.map((item) => (
                <li key={item.id}>
                  <Link to={`/conocimientos/${item.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]">
                    <BookOpen className="h-4 w-4 shrink-0 text-white/50" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.titulo}</span>
                      <span className="block text-xs">
                        <AuthorCredit item={item} />
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/30" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 5. Solo para clientes: una invitación discreta, al final. */}
      {!academy.hasAccess && !isTeam && !academy.isStaff && (
        <Link
          to="/unete"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-5 py-4 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          ¿Te gusta la robótica? Conoce cómo ser parte de Nova Tech.
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </main>
  );
}
