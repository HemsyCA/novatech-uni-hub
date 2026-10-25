import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { AccountContext, type AccountState } from "@/components/account/account-context";
import { AccountHeader, AccountTabBar } from "@/components/account/AccountHeader";
import { useSession } from "@/hooks/use-session";
import { useAcademyAccess } from "@/hooks/use-academy-access";
import { useAcademyProgress } from "@/hooks/use-academy-progress";
import { useAcademyEntrega } from "@/hooks/use-academy-entrega";
import { useAcademyPractica } from "@/hooks/use-academy-practica";
import { useMemberAccess } from "@/hooks/use-member-access";
import { signOut as signOutSession, signOutEverywhere } from "@/services/supabase/auth";
import { useIdleSignOut } from "@/hooks/use-idle-sign-out";
import { toast } from "@/hooks/use-toast";
import { listAllOrders, listOrders } from "@/services/supabase/orders";
import { listAllReservations, listUserReservations } from "@/services/supabase/reservations";
import { listAcademyEntregas, listPendingApplications } from "@/services/supabase/academia";
import { listAportesPorRevisar, listMyAportes, type Aporte } from "@/services/supabase/conocimientos";
import type { Order, Reservation } from "@/types/domain";

const STAFF_IDLE_LIMIT_MS = 8 * 60 * 60 * 1000;

// Marco común de todas las páginas de la cuenta: un solo encabezado, la barra inferior en el celular
// y los datos que comparten.
export default function AccountLayout() {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const academy = useAcademyAccess();
  // Los datos de la Academia solo se cargan para quien tiene acceso: un cliente no tiene progreso,
  // y consultarlo solo producía avisos de error.
  const academyUser = academy.loading ? undefined : academy.hasAccess || academy.isStaff ? academy.userId : null;
  const progress = useAcademyProgress(academyUser);
  const entrega = useAcademyEntrega(academyUser);
  const practica = useAcademyPractica(academyUser);
  const member = useMemberAccess();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staffPending, setStaffPending] = useState<AccountState["staffPending"]>(null);
  const [academicPending, setAcademicPending] = useState<number | null>(null);
  const [aportes, setAportes] = useState<Aporte[]>([]);

  // Dentro de una lección se ocultan las pestañas de abajo: ahí va la navegación entre pasos.
  const inLesson = useMatch("/academia/:moduleId/:lessonId");

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([listOrders(user.id), listUserReservations(user.id)])
      .then(([o, r]) => {
        if (!active) return;
        setOrders(o);
        setReservations(r);
      })
      .catch(() => {
        // Sin pedidos ni reservas el panel sigue funcionando; solo no habrá avisos de servicios.
      });
    return () => {
      active = false;
    };
  }, [user]);

  const reloadStaffPending = useCallback(() => {
    if (!academy.isStaff) return;
    Promise.all([listAcademyEntregas(), listPendingApplications(), listAllOrders(), listAllReservations()])
      .then(([entregas, inscripciones, allOrders, allReservations]) =>
        setStaffPending({
          entregas: entregas.filter((e) => e.estado === "enviada").length,
          inscripciones: inscripciones.length,
          pedidos: allOrders.filter((o) => o.status === "pending").length,
          reservas: allReservations.filter((r) => r.status === "pending").length,
        }),
      )
      .catch(() => {
        // Si un recuento falla se conservan los números anteriores en vez de borrarlos.
      });
  }, [academy.isStaff]);

  useEffect(() => {
    if (!academy.isStaff) {
      setStaffPending(null);
      return;
    }
    reloadStaffPending();
  }, [academy.isStaff, reloadStaffPending]);

  const reloadAportes = useCallback(() => {
    if (!user) return;
    listMyAportes(user.id)
      .then(setAportes)
      .catch(() => setAportes([]));
    if (academy.isAcademic)
      listAportesPorRevisar()
        .then((list) => setAcademicPending(list.length))
        .catch(() => setAcademicPending(null));
  }, [user, academy.isAcademic]);

  // Los aportes son de la Comunidad: solo para miembros y el Área académica.
  useEffect(() => {
    if (member.isMember || academy.isAcademic) reloadAportes();
    if (!academy.isAcademic) setAcademicPending(null);
  }, [member.isMember, academy.isAcademic, reloadAportes]);

  // La directiva maneja pagos, entregas y roles: su sesión se cierra tras 8 horas sin actividad.
  const expireIdleSession = useCallback(async () => {
    await signOutSession();
    navigate("/auth", { replace: true });
    toast({ title: "Cerramos tu sesión", description: "Por seguridad, tras 8 horas sin actividad. Vuelve a ingresar para continuar." });
  }, [navigate]);
  const signedInAt = user?.last_sign_in_at ? Date.parse(user.last_sign_in_at) : null;
  useIdleSignOut(user?.id ?? null, academy.isStaff, STAFF_IDLE_LIMIT_MS, signedInAt, expireIdleSession);

  const account: AccountState = {
    user,
    sessionLoading,
    academy,
    progress,
    entrega,
    practica,
    member,
    orders,
    reservations,
    staffPending,
    reloadStaffPending,
    academicPending,
    aportes,
    reloadAportes,
    signOutEverywhere: async () => {
      await signOutEverywhere();
      navigate("/");
      toast({ title: "Cerraste sesión en todos tus dispositivos" });
    },
    signOut: async () => {
      await signOutSession();
      navigate("/");
    },
  };

  return (
    <AccountContext.Provider value={account}>
      <div className="nova-shell font-mono min-h-screen bg-black text-white">
        <AccountHeader />
        <div className={inLesson ? "" : "pb-20 md:pb-0"}>
          <Suspense fallback={<div className="container mx-auto px-4 pt-28 text-white/60 animate-pulse">Cargando…</div>}>
            <Outlet />
          </Suspense>
        </div>
        {!inLesson && <AccountTabBar />}
      </div>
    </AccountContext.Provider>
  );
}
