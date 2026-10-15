import { Fragment, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  GraduationCap,
  Home,
  LogOut,
  MessagesSquare,
  Printer,
  ShieldCheck,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import novatechLogo from "@/assets/novatech-logo.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAccount } from "@/components/account/account-context";
import { displayNameOf, initialsOf } from "@/hooks/use-session";
import { buildNotifications, useSeenNotifications } from "@/lib/account/notifications";

const menuContent = "bg-black border-white/20 text-white font-mono";
const menuItem = "focus:bg-white/10 focus:text-white cursor-pointer";

// En el celular caben 5 pestañas; lo que sobra va al menú de la cuenta.
const MAX_TABS = 5;

type Group = "servicios" | "academia" | "equipo";

interface Section {
  id: string;
  to: string;
  label: string;
  short: string;
  icon: LucideIcon;
  group: Group | "panel";
  active: (path: string) => boolean;
  badge?: string;
  // Algo espera a esta persona: el número va en morado.
  alert?: number;
}

// Las secciones de la cuenta, en orden de importancia: primero los servicios (los usa todo el mundo),
// después la Academia (convocados) y al final la zona de miembros.
function useSections(): Section[] {
  const { academy, progress, entrega, member, academicPending } = useAccount();
  const sections: Section[] = [
    { id: "panel", to: "/dashboard", label: "Mi panel", short: "Panel", icon: Home, group: "panel", active: (p) => p === "/dashboard" },
    { id: "imprimir", to: "/print3d", label: "Impresión 3D", short: "Imprimir", icon: Printer, group: "servicios", active: (p) => p.startsWith("/print3d") },
    { id: "tienda", to: "/store", label: "Tienda", short: "Tienda", icon: ShoppingCart, group: "servicios", active: (p) => p.startsWith("/store") },
  ];
  if (academy.hasAccess)
    sections.push({
      id: "academia",
      to: "/academia",
      label: "Academia",
      short: "Academia",
      icon: GraduationCap,
      group: "academia",
      active: (p) => p.startsWith("/academia"),
      badge: entrega.entrega?.estado === "aprobada" ? "Parte 2" : progress.loading ? undefined : `${progress.done}/${progress.total}`,
    });
  if (member.isMember || academy.isAcademic) {
    sections.push({
      id: "conocimientos",
      to: "/conocimientos",
      label: "Conocimientos",
      short: "Conocimientos",
      icon: BookOpen,
      group: "equipo",
      active: (p) => p.startsWith("/conocimientos"),
    });
    sections.push({
      id: "comunidad",
      to: "/comunidad",
      label: "Comunidad",
      short: "Comunidad",
      icon: MessagesSquare,
      group: "equipo",
      active: (p) => p.startsWith("/comunidad"),
      alert: academicPending || undefined,
    });
  }
  return sections;
}

// Si no caben todas abajo, la Academia (la menos frecuente para quien también es miembro) pasa al menú.
const splitTabs = (sections: Section[]) => {
  if (sections.length <= MAX_TABS) return { tabs: sections, overflow: [] as Section[] };
  const overflow = sections.filter((s) => s.id === "academia");
  return { tabs: sections.filter((s) => s.id !== "academia"), overflow };
};

const roleLabel = (account: ReturnType<typeof useAccount>) => {
  if (account.academy.isSuperadmin) return "Superadmin";
  if (account.academy.isStaff) return "Directiva";
  if (account.academy.isAcademic) return "Área académica";
  if (account.member.isMember) return "Miembro";
  if (account.academy.hasAccess || account.academy.memberships.length > 0) return "Convocado";
  return "Cliente";
};

function AlertCount({ value }: { value: number }) {
  return (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-nova px-1 text-[10px] font-bold text-white">{value}</span>
  );
}

function NotificationsMenu() {
  const account = useAccount();
  const notifications = buildNotifications(account);
  const { seen, markSeen } = useSeenNotifications(account.user?.id ?? null);
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !seen.has(n.key)).length;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Al cerrar la lista, lo que se vio deja de contar como nuevo.
        if (!next) markSeen(notifications.map((n) => n.key));
      }}
    >
      <PopoverTrigger
        aria-label={unread ? `Avisos: ${unread} nuevos` : "Avisos"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5">
            <AlertCount value={unread} />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] border-white/20 bg-black p-0 font-mono text-white">
        <p className="border-b border-white/10 px-4 py-3 text-sm font-semibold">Avisos</p>
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-white/50">No tienes avisos por ahora.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.key}>
                <Link
                  to={n.to}
                  onClick={() => {
                    setOpen(false);
                    markSeen(notifications.map((x) => x.key));
                  }}
                  className="flex gap-3 border-b border-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06]"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${seen.has(n.key) ? "bg-transparent" : "bg-nova"}`} />
                  {n.text}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

function AccountMenu({ overflow }: { overflow: Section[] }) {
  const account = useAccount();
  const name = displayNameOf(account.user);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Mi cuenta"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-black outline-none ring-offset-black focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
      >
        {initialsOf(account.user)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`${menuContent} w-64`}>
        <div className="px-3 py-3">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-white/50">{account.user?.email}</p>
          <span className="mt-2 inline-block rounded-full border border-white/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
            {roleLabel(account)}
          </span>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild className={menuItem}>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" /> Mi panel
          </Link>
        </DropdownMenuItem>
        {/* Secciones que no caben en la barra inferior del celular. */}
        {overflow.map((section) => (
          <DropdownMenuItem key={section.id} asChild className={`${menuItem} md:hidden`}>
            <Link to={section.to} className="flex items-center gap-2">
              <section.icon className="h-4 w-4" /> {section.label}
              {section.badge && <span className="ml-auto text-[10px] text-white/50">{section.badge}</span>}
            </Link>
          </DropdownMenuItem>
        ))}
        <div className="flex items-center justify-between px-2 py-2 text-sm">
          <span className="text-white/60">Idioma</span>
          <LanguageToggle />
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onSelect={() => account.signOut()} className={menuItem}>
          <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AccountHeader() {
  const { pathname } = useLocation();
  const { academy } = useAccount();
  const sections = useSections();
  const { overflow } = splitTabs(sections);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4">
        {/* Igual que en el sitio público: el logo siempre lleva al inicio del sitio. */}
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Inicio del sitio NovaTech">
          <img src={novatechLogo} alt="NovaTech" className="h-12 w-12 object-contain" />
          <span className="hidden font-display text-xl font-bold sm:block">NOVATECH</span>
        </Link>

        <nav aria-label="Secciones de tu cuenta" className="hidden items-center gap-1 md:flex">
          {sections.map((section, index) => {
            const active = section.active(pathname);
            // Una línea fina separa servicios, Academia y zona de miembros.
            const newGroup = index > 1 && sections[index - 1].group !== section.group;
            return (
              <Fragment key={section.id}>
                {newGroup && <span aria-hidden className="mx-1 h-5 w-px bg-white/15" />}
                <Link
                  to={section.to}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {section.label}
                  {section.badge && <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] text-white">{section.badge}</span>}
                  {section.alert && <AlertCount value={section.alert} />}
                </Link>
              </Fragment>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
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
          <NotificationsMenu />
          <AccountMenu overflow={overflow} />
        </div>
      </div>
    </header>
  );
}

// En el celular, las secciones van abajo, al alcance del pulgar.
export function AccountTabBar() {
  const { pathname } = useLocation();
  const { tabs } = splitTabs(useSections());

  return (
    <nav
      aria-label="Secciones de tu cuenta"
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-black/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      {tabs.map((section) => {
        const active = section.active(pathname);
        const Icon = section.icon;
        return (
          <Link
            key={section.id}
            to={section.to}
            aria-current={active ? "page" : undefined}
            className="flex min-w-0 flex-1 items-center justify-center py-2"
          >
            <span className={`relative flex min-w-0 flex-col items-center gap-0.5 text-[10px] ${active ? "text-white" : "text-white/50"}`}>
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{section.short}</span>
              {section.badge && (
                <span className="absolute -right-3 -top-1 rounded-full bg-white px-1 text-[9px] font-bold text-black">{section.badge}</span>
              )}
              {section.alert && (
                <span className="absolute -right-2 -top-1">
                  <AlertCount value={section.alert} />
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
