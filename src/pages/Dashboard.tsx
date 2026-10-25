import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutGrid,
  MessagesSquare,
  Printer,
  ShoppingCart,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAccount } from "@/components/account/account-context";
import { NextStepCard } from "@/components/account/Journey";
import { AuthorCredit } from "@/components/account/Conocimiento";
import { StatusPill, type StatusTone } from "@/components/account/ui";
import { ProgressBar } from "@/components/academia/ui";
import type { TrackerStep } from "@/components/StatusTracker";
import { displayNameOf } from "@/hooks/use-session";
import { daysLeft, formatDate } from "@/lib/academy-dates";
import { guideVisitedCount } from "@/lib/academia/guide-progress";
import { moduleAccent } from "@/lib/academia/modules";
import { nextStepFor } from "@/lib/account/journey";
import { urgentFor } from "@/lib/account/urgent";
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

const NOVA_TONE = "137 84 212";

// En computadora, los pendientes ocupan una sola fila sin celdas vacías.
const REVIEW_COLS: Record<number, string> = { 1: "grid-cols-1", 3: "sm:grid-cols-3", 4: "lg:grid-cols-4", 5: "sm:grid-cols-3 lg:grid-cols-5" };

// Cada zona del panel empieza igual: ícono, título y para qué sirve. Así se distinguen de un vistazo.
function Section({
  icon: Icon,
  title,
  description,
  action,
  accent = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <section>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              accent ? "border-nova/50 bg-nova/15 text-nova" : "border-white/15 text-white"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold leading-tight md:text-xl">{title}</h2>
            {description && <p className="text-sm text-white/50">{description}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function SectionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white">
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

// Un pedido o una reserva en curso: nombre, estado y en qué paso va.
function ActivityRow({
  to,
  title,
  meta,
  status,
  steps,
  currentKey,
}: {
  to: string;
  title: string;
  meta: string;
  status: { label: string; tone: StatusTone };
  steps: TrackerStep[];
  currentKey: string;
}) {
  const current = steps.findIndex((step) => step.key === currentKey);
  return (
    <li>
      <Link to={to} className="block rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.05]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="text-xs text-white/45">{meta}</p>
          </div>
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex flex-1 gap-1" aria-hidden>
            {steps.map((step, index) => (
              <span key={step.key} className={`h-1 flex-1 rounded-full ${index <= current ? "bg-white" : "bg-white/15"}`} />
            ))}
          </div>
          <span className="shrink-0 text-[11px] text-white/45">
            Paso {current + 1} de {steps.length}
          </span>
        </div>
      </Link>
    </li>
  );
}

// Un servicio: su acción principal arriba y, debajo, lo que tienes en curso con él.
function ServicePanel({
  to,
  icon: Icon,
  title,
  description,
  cta,
  historyTo,
  emptyText,
  count,
  children,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  historyTo: string;
  emptyText: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/15">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <p className="text-sm text-white/55">{description}</p>
          </div>
        </div>
        <Link
          to={to}
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black transition-colors hover:bg-white/90"
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex-1 border-t border-white/10 bg-white/[0.02] px-2 py-3">
        <div className="mb-1 flex items-center justify-between px-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/45">En curso{count > 0 ? ` · ${count}` : ""}</p>
          <Link to={historyTo} className="text-xs text-white/45 underline-offset-4 hover:text-white hover:underline">
            Ver historial
          </Link>
        </div>
        {count > 0 ? <ul>{children}</ul> : <p className="px-3 py-3 text-sm text-white/40">{emptyText}</p>}
      </div>
    </article>
  );
}

function ReviewTile({ to, count, label }: { to: string; count: number; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-white/[0.05]">
      <span className="min-w-0">
        <span className={`block font-display text-2xl font-black ${count > 0 ? "text-white" : "text-white/25"}`}>{count}</span>
        <span className={`block text-xs ${count > 0 ? "text-white/70" : "text-white/35"}`}>{label}</span>
      </span>
      {count > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-nova" aria-label="Pendiente" />}
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

  // La Academia aparece aquí solo para quien está en la convocatoria; la directiva la tiene en su pestaña.
  const academyStep =
    isConvocado && !progress.loading && !entrega.loading
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
  const academyTone = academyStep?.lesson ? moduleAccent(academyStep.lesson.moduleId) : NOVA_TONE;

  const reviews = [
    academicPending !== null && { to: "/comunidad?vista=revisar", count: academicPending, label: "Aportes de la Comunidad" },
    staffPending && { to: "/admin/entregas", count: staffPending.entregas, label: "Tareas finales" },
    staffPending && { to: "/admin/inscripciones", count: staffPending.inscripciones, label: "Inscripciones" },
    staffPending && { to: "/admin/pedidos", count: staffPending.pedidos, label: "Pedidos por confirmar" },
    staffPending && { to: "/admin/reservas", count: staffPending.reservas, label: "Reservas por aprobar" },
  ].filter(Boolean) as { to: string; count: number; label: string }[];
  const pendingTotal = reviews.reduce((total, review) => total + review.count, 0);

  return (
    <main className="container mx-auto max-w-5xl px-4 pb-20 pt-28">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">Hola{firstName ? `, ${firstName}` : ""}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/50">
          <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs font-semibold text-white/80">{role}</span>
          {isConvocado && academy.activeMembership && (
            <span>
              {academy.activeMembership.grupo_nombre} · quedan {daysLeft(academy.activeMembership.ends_at)} día(s)
            </span>
          )}
        </p>
      </motion.header>

      <div className="mt-10 space-y-14">
        {/* Ahora: solo aparece si algo pide tu acción, y va antes que todo. */}
        {urgent && <NextStepCard step={urgent} />}

        {/* Para la directiva y el Área académica, revisar es su tarea principal. */}
        {reviews.length > 0 && (
          <Section
            icon={ClipboardCheck}
            title="Por revisar"
            description={pendingTotal > 0 ? `${pendingTotal} pendiente(s) esperan tu revisión.` : "Nada pendiente por ahora."}
            action={staffPending && <SectionLink to="/admin">Panel de directiva</SectionLink>}
          >
            <div className={`grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 [&>*]:outline [&>*]:outline-1 [&>*]:outline-white/10 ${REVIEW_COLS[reviews.length] ?? ""}`}>
              {reviews.map((review) => (
                <ReviewTile key={review.label} {...review} />
              ))}
            </div>
          </Section>
        )}

        {/* Los servicios: la razón principal por la que la mayoría entra a su cuenta. */}
        <Section icon={LayoutGrid} title="Mis servicios" description="Pide una impresión o compra componentes, y sigue cómo va lo tuyo.">
          <div className="grid gap-4 md:grid-cols-2">
            <ServicePanel
              to="/print3d"
              icon={Printer}
              title="Impresión 3D"
              description="Envía los datos de tu pieza, elige el día y la imprimimos por ti."
              cta="Pedir una impresión"
              historyTo="/print3d?vista=reservas"
              emptyText="No tienes impresiones en curso."
              count={activeReservations.length}
            >
              {activeReservations.map((r) => (
                <ActivityRow
                  key={r.id}
                  to="/print3d?vista=reservas"
                  title={r.project_name}
                  meta={`Para el ${formatDate(r.scheduled_date)}`}
                  status={RESERVATION_STATUS[r.status]}
                  steps={reservationSteps}
                  currentKey={r.status}
                />
              ))}
            </ServicePanel>
            <ServicePanel
              to="/store"
              icon={ShoppingCart}
              title="Tienda Nova"
              description="Componentes electrónicos para tus proyectos, listos para recoger."
              cta="Comprar componentes"
              historyTo="/store?vista=pedidos"
              emptyText="No tienes pedidos en curso."
              count={activeOrders.length}
            >
              {activeOrders.map((o) => (
                <ActivityRow
                  key={o.id}
                  to="/store?vista=pedidos"
                  title={`Pedido · S/ ${Number(o.total).toFixed(2)}`}
                  meta={`Hecho el ${formatDate(o.created_at.slice(0, 10))}`}
                  status={ORDER_STATUS[o.status]}
                  steps={orderSteps}
                  currentKey={o.status}
                />
              ))}
            </ServicePanel>
          </div>
        </Section>

        {/* La convocatoria, con el color del módulo en que vas. */}
        {academyStep && (
          <Section
            icon={GraduationCap}
            title="Academia Nova"
            description="Tu convocatoria para entrar al equipo."
            action={<SectionLink to="/academia">Ver mi recorrido</SectionLink>}
          >
            <div
              style={{ "--tone": academyTone } as CSSProperties}
              className="flex flex-col gap-5 rounded-2xl border border-[rgb(var(--tone)/0.4)] bg-[rgb(var(--tone)/0.05)] p-5 sm:flex-row sm:items-center md:p-6"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--tone))]">{academyStep.eyebrow}</p>
                <p className="mt-1 text-lg font-semibold first-letter:uppercase">{academyStep.title}</p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={progress.percent} label="Progreso de la Parte 1" />
                  <span className="shrink-0 text-xs text-white/55">
                    Parte 1 · {progress.done}/{progress.total}
                  </span>
                </div>
              </div>
              {academyStep.cta && (
                <Link
                  to={academyStep.cta.to}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--tone))] px-5 py-3 font-semibold transition-transform hover:scale-[1.02] ${
                    academyStep.lesson ? "text-black" : "text-white"
                  }`}
                >
                  {academyStep.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </Section>
        )}

        {/* Zona de miembros: la única con identidad morada, porque es el espacio del equipo. */}
        {isTeam && (
          <Section icon={Users} title="Zona de miembros" description="El conocimiento y la comunidad del equipo." accent>
            <div className="grid gap-4 rounded-2xl border border-nova/30 bg-nova/[0.04] p-4 md:grid-cols-[minmax(0,1fr)_18rem] md:p-5">
              <div className="min-w-0">
                <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-widest text-white/45">Nuevo en Conocimientos Nova</p>
                {recent.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-white/50">Aún no hay conocimientos publicados.</p>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {recent.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/conocimientos/${item.id}`}
                          className="flex items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-white/[0.04]"
                        >
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
              </div>
              <div className="grid content-start gap-2">
                <Link
                  to="/conocimientos"
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-black px-4 py-3 text-sm font-semibold transition-colors hover:border-white/40"
                >
                  <BookOpen className="h-4 w-4 text-nova" /> Conocimientos Nova
                  <ArrowRight className="ml-auto h-4 w-4 text-white/40" />
                </Link>
                <Link
                  to="/comunidad"
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-black px-4 py-3 text-sm font-semibold transition-colors hover:border-white/40"
                >
                  <MessagesSquare className="h-4 w-4 text-nova" /> Comunidad
                  <ArrowRight className="ml-auto h-4 w-4 text-white/40" />
                </Link>
                <Link
                  to="/comunidad?vista=compartir"
                  className="flex items-center gap-3 rounded-xl bg-nova px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-nova/90"
                >
                  <Sparkles className="h-4 w-4" /> Compartir un descubrimiento
                </Link>
              </div>
            </div>
          </Section>
        )}

        {/* Solo para clientes: una invitación discreta, al final. */}
        {!academy.hasAccess && !isTeam && !academy.isStaff && (
          <Link
            to="/unete"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-dashed border-white/15 px-5 py-4 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
          >
            ¿Te gusta la robótica? Conoce cómo ser parte de Nova Tech.
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </main>
  );
}
