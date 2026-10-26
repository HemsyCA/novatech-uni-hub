import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminRoles } from "@/components/admin/AdminRoles";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminReservations } from "@/components/admin/AdminReservations";
import { AdminContactMessages } from "@/components/admin/AdminContactMessages";
import { AdminAcademia } from "@/components/admin/AdminAcademia";
import { AdminAvance } from "@/components/admin/AdminAvance";
import { AdminMiembros } from "@/components/admin/AdminMiembros";
import { AdminEntregas } from "@/components/admin/AdminEntregas";
import { AdminPracticas } from "@/components/admin/AdminPracticas";
import { AdminHoy } from "@/components/admin/AdminHoy";
import { useAccount } from "@/components/account/account-context";

type StaffKey = "entregas" | "inscripciones" | "pedidos" | "reservas";
type PendingKey = StaffKey | "aportes";

interface Section {
  slug: string;
  label: string;
  description: string;
  // Qué contador del recuento de pendientes corresponde a esta sección.
  pending?: PendingKey;
  superadminOnly?: boolean;
  // Solo para quien revisa los aportes de la Comunidad (Área académica y superadmin).
  academicOnly?: boolean;
  // Si existe, la sección vive en otra pantalla: el menú enlaza allí en vez de abrir una sección del panel.
  href?: string;
  note?: string;
  element?: ReactNode;
}

interface Area {
  title: string;
  sections: Section[];
}

const AREAS: Area[] = [
  {
    title: "Servicios",
    sections: [
      { slug: "pedidos", label: "Pedidos", description: "Pedidos de la Tienda Nova.", pending: "pedidos", element: <AdminOrders /> },
      {
        slug: "reservas",
        label: "Reservas",
        description: "Reservas de impresión 3D.",
        pending: "reservas",
        element: <AdminReservations />,
      },
      { slug: "productos", label: "Productos", description: "Catálogo de la Tienda Nova.", element: <AdminProducts /> },
    ],
  },
  {
    title: "Convocatoria",
    sections: [
      {
        slug: "inscripciones",
        label: "Inscripciones",
        description: "Solicitudes recibidas desde Únete: apruébalas y asígnalas a un grupo.",
        pending: "inscripciones",
        element: <AdminAcademia view="inscripciones" />,
      },
      {
        slug: "grupos",
        label: "Grupos",
        description: "Crea grupos con sus fechas y gestiona a los convocados de cada uno.",
        element: <AdminAcademia view="grupos" />,
      },
      { slug: "avance", label: "Avance", description: "Cómo va cada convocado en el curso.", element: <AdminAvance /> },
      {
        slug: "entregas",
        label: "Entregas",
        description: "Tareas finales por revisar.",
        pending: "entregas",
        element: <AdminEntregas />,
      },
      {
        slug: "practicas",
        label: "Prácticas",
        description: "Sesiones presenciales de soldadura.",
        element: <AdminPracticas />,
      },
    ],
  },
  {
    title: "Personas",
    sections: [
      { slug: "miembros", label: "Miembros", description: "Acceso permanente al material interno.", element: <AdminMiembros /> },
      {
        slug: "roles",
        label: "Roles",
        description: "Quién es superadmin, directiva o Área académica.",
        superadminOnly: true,
        element: <AdminRoles />,
      },
    ],
  },
  {
    title: "Comunicación",
    sections: [
      {
        slug: "mensajes",
        label: "Mensajes",
        description: "Mensajes recibidos desde el formulario de contacto.",
        element: <AdminContactMessages />,
      },
      {
        slug: "aportes",
        label: "Aportes",
        description: "Aportes de la Comunidad por revisar.",
        pending: "aportes",
        academicOnly: true,
        href: "/comunidad?vista=revisar",
        note: "Comunidad",
      },
    ],
  },
];

const HOY_TITLE = "Hoy";
const HOY_DESCRIPTION = "Esto es lo que espera tu revisión.";

const pathFor = (slug: string) => (slug ? `/admin/${slug}` : "/admin");

function Badge({ count }: { count: number }) {
  return (
    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-nova px-1.5 text-[11px] font-semibold text-white">
      {count}
    </span>
  );
}

function MenuLink({ to, active, label, count, note }: { to: string; active: boolean; label: string; count?: number; note?: string }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-nova/15 text-white shadow-[inset_2px_0_0_0_hsl(var(--nova))]"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
      {count ? <Badge count={count} /> : note ? <span className="font-mono text-[10px] text-white/30">{note}</span> : null}
    </Link>
  );
}

export default function Admin() {
  const { academy, staffPending, academicPending, reloadStaffPending: reloadFromAccount, reloadAportes } = useAccount();
  const navigate = useNavigate();
  const params = useParams();
  const slug = (params["*"] ?? "").replace(/\/+$/, "");
  const isSuperadmin = academy.isSuperadmin;

  // Referencia estable: si la función del contexto cambiara de identidad, los efectos de abajo
  // no se repetirían en bucle consultando la base de datos sin parar.
  const latestReload = useRef<() => void>(() => {});
  latestReload.current = () => {
    reloadFromAccount();
    if (academy.isAcademic) reloadAportes();
  };
  const reloadStaffPending = useCallback(() => latestReload.current(), []);

  // Los contadores se vuelven a calcular al cambiar de sección, al volver a la pestaña,
  // cada minuto y poco después de pulsar un botón dentro de una sección (aprobar, rechazar…).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    reloadStaffPending();
  }, [slug, reloadStaffPending]);

  useEffect(() => {
    const interval = window.setInterval(reloadStaffPending, 60_000);
    window.addEventListener("focus", reloadStaffPending);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", reloadStaffPending);
    };
  }, [reloadStaffPending]);

  const refreshTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(refreshTimer.current), []);
  const refreshSoon = (event: React.MouseEvent) => {
    if (!(event.target as HTMLElement).closest("button")) return;
    window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(reloadStaffPending, 1500);
  };

  if (academy.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-28">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  const areas = AREAS.map((area) => ({
    ...area,
    sections: area.sections.filter((s) => (!s.superadminOnly || isSuperadmin) && (!s.academicOnly || academy.isAcademic)),
  })).filter((area) => area.sections.length > 0);

  const allSections = areas.flatMap((a) => a.sections);
  // Las secciones con enlace a otra pantalla no tienen dirección propia dentro del panel.
  const current = allSections.filter((s) => !s.href).find((s) => s.slug === slug);
  if (slug && !current) return <Navigate to="/admin" replace />;

  const countOf = (section: Section) => {
    if (section.pending === "aportes") return academicPending ?? 0;
    return section.pending && staffPending ? staffPending[section.pending] : 0;
  };
  const staffTotal = staffPending ? staffPending.entregas + staffPending.inscripciones + staffPending.pedidos + staffPending.reservas : 0;
  const totalPending = staffTotal + (academy.isAcademic ? academicPending ?? 0 : 0);

  const title = current ? current.label : HOY_TITLE;
  const description = current ? current.description : HOY_DESCRIPTION;

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-16 pt-28">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <aside className="hidden self-start lg:sticky lg:top-28 lg:block">
          <nav aria-label="Secciones del panel de directiva">
            <p className="px-3 pb-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/40">Resumen</p>
            <MenuLink to="/admin" active={!current} label={HOY_TITLE} count={totalPending} />
            {areas.map((area) => (
              <div key={area.title}>
                <p className="px-3 pb-1.5 pt-5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/40">{area.title}</p>
                {area.sections.map((section) => (
                  <MenuLink
                    key={section.slug}
                    to={section.href ?? pathFor(section.slug)}
                    active={current?.slug === section.slug}
                    label={section.label}
                    count={countOf(section)}
                    note={section.note ?? (section.superadminOnly ? "superadmin" : undefined)}
                  />
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 lg:hidden">
            <Select value={current?.slug ?? "hoy"} onValueChange={(value) =>
                navigate(value === "hoy" ? "/admin" : allSections.find((s) => s.slug === value)?.href ?? pathFor(value))
              }>
              <SelectTrigger aria-label="Sección del panel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Resumen</SelectLabel>
                  <SelectItem value="hoy">{totalPending ? `${HOY_TITLE} (${totalPending})` : HOY_TITLE}</SelectItem>
                </SelectGroup>
                {areas.map((area) => (
                  <SelectGroup key={area.title}>
                    <SelectLabel>{area.title}</SelectLabel>
                    {area.sections.map((section) => (
                      <SelectItem key={section.slug} value={section.slug}>
                        {countOf(section) ? `${section.label} (${countOf(section)})` : section.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <motion.div key={slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Panel de directiva</p>
            <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">{title}</h1>
            <p className="mb-8 mt-2 max-w-2xl text-sm text-white/60">{description}</p>

            <div onClick={refreshSoon}>
              {current ? (
                current.element
              ) : (
                <AdminHoy
                  cards={[
                    { slug: "inscripciones", label: "Inscripciones por revisar", count: staffPending?.inscripciones ?? null },
                    { slug: "pedidos", label: "Pedidos por confirmar", count: staffPending?.pedidos ?? null },
                    { slug: "reservas", label: "Reservas de impresión por aprobar", count: staffPending?.reservas ?? null },
                    { slug: "entregas", label: "Tareas finales por calificar", count: staffPending?.entregas ?? null },
                    ...(academy.isAcademic
                      ? [{ slug: "aportes", to: "/comunidad?vista=revisar", label: "Aportes de la Comunidad por revisar", count: academicPending }]
                      : []),
                  ]}
                  groups={areas.map((area) => ({
                    title: area.title,
                    links: area.sections.map((s) => ({ slug: s.slug, label: s.label, to: s.href })),
                  }))}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
