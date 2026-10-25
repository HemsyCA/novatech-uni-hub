import { useCallback, useEffect, useState } from "react";
import { formatDate, formatLimaDateTime } from "@/lib/academy-dates";
import type { AccountState } from "@/components/account/account-context";

export interface AccountNotification {
  // Cambia cuando cambia el estado, así un aviso nuevo vuelve a aparecer como no leído.
  key: string;
  text: string;
  to: string;
}

// Los avisos se arman con los datos que ya tiene la cuenta; no hace falta una tabla aparte.
export const buildNotifications = (account: AccountState): AccountNotification[] => {
  const list: AccountNotification[] = [];
  const entrega = account.entrega.entrega;
  const practica = account.practica.practica;

  if (account.staffPending) {
    const { entregas, inscripciones, pedidos, reservas } = account.staffPending;
    if (entregas > 0)
      list.push({ key: `staff-entregas:${entregas}`, text: `${entregas} tarea(s) final(es) por revisar.`, to: "/admin/entregas" });
    if (inscripciones > 0)
      list.push({ key: `staff-inscripciones:${inscripciones}`, text: `${inscripciones} inscripción(es) por revisar.`, to: "/admin/inscripciones" });
    if (pedidos > 0) list.push({ key: `staff-pedidos:${pedidos}`, text: `${pedidos} pedido(s) de la tienda por confirmar.`, to: "/admin/pedidos" });
    if (reservas > 0) list.push({ key: `staff-reservas:${reservas}`, text: `${reservas} reserva(s) de impresión por aprobar.`, to: "/admin/reservas" });
  }

  if (account.academicPending)
    list.push({
      key: `academica:${account.academicPending}`,
      text: `${account.academicPending} aporte(s) de la Comunidad esperan la revisión del Área académica.`,
      to: "/comunidad?vista=revisar",
    });

  for (const aporte of account.aportes) {
    if (aporte.estado === "aprobado")
      list.push({
        key: `aporte:${aporte.id}:aprobado`,
        text: `Tu aporte “${aporte.titulo}” fue publicado en Conocimientos Nova.`,
        to: aporte.conocimiento_id ? `/conocimientos/${aporte.conocimiento_id}` : "/conocimientos",
      });
    if (aporte.estado === "observado")
      list.push({
        key: `aporte:${aporte.id}:observado:${aporte.revisado_at ?? ""}`,
        text: `El Área académica dejó observaciones en “${aporte.titulo}”.`,
        to: "/comunidad?vista=mios",
      });
  }

  if (practica?.estado === "programada")
    list.push({
      key: `practica:${practica.fecha}:${practica.lugar}`,
      text: `Tu práctica presencial es el ${formatLimaDateTime(practica.fecha)} en ${practica.lugar}.`,
      to: "/academia",
    });
  if (practica?.estado === "asistio")
    list.push({ key: "practica:asistio", text: "Registramos tu asistencia a la práctica. La directiva decidirá tu ingreso.", to: "/academia" });
  if (practica?.estado === "no_asistio")
    list.push({ key: "practica:no_asistio", text: "No registramos tu asistencia a la práctica. Escribe al encargado para reprogramarla.", to: "/academia" });

  if (entrega?.estado === "aprobada")
    list.push({ key: "entrega:aprobada", text: "Tu tarea final fue aprobada: ya puedes entrar a la Parte 2.", to: "/academia/soldadura" });
  if (entrega?.estado === "observada")
    list.push({
      key: `entrega:observada:${entrega.revisado_at ?? ""}`,
      text: "La directiva dejó observaciones en tu tarea final.",
      to: "/academia/tarea-final#entrega",
    });

  // Solo los más recientes: los pedidos y reservas terminados no deben llenar la lista para siempre.
  for (const order of account.orders.slice(0, 3)) {
    if (order.status === "delivered")
      list.push({ key: `pedido:${order.id}:delivered`, text: "Tu pedido de la tienda está listo para recoger.", to: "/store?vista=pedidos" });
    if (order.status === "paid")
      list.push({ key: `pedido:${order.id}:paid`, text: "Confirmamos el pago de tu pedido.", to: "/store?vista=pedidos" });
  }

  for (const reservation of account.reservations.slice(0, 3)) {
    if (reservation.status === "approved")
      list.push({
        key: `reserva:${reservation.id}:approved`,
        text: `Tu reserva de impresión 3D fue aprobada para el ${formatDate(reservation.scheduled_date)}.`,
        to: "/print3d?vista=reservas",
      });
    if (reservation.status === "completed")
      list.push({ key: `reserva:${reservation.id}:completed`, text: "Tu impresión 3D está lista para recoger.", to: "/print3d?vista=reservas" });
  }

  return list;
};

// Qué avisos ya vio la persona. Se guarda en este navegador: es solo para marcar lo nuevo.
export function useSeenNotifications(userId: string | null) {
  const storageKey = `nova-avisos-vistos:${userId ?? "anon"}`;
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      setSeen(new Set(Array.isArray(saved) ? saved : []));
    } catch {
      setSeen(new Set());
    }
  }, [storageKey]);

  const markSeen = useCallback(
    (keys: string[]) =>
      setSeen((current) => {
        if (keys.every((k) => current.has(k))) return current;
        // Solo se guardan los avisos que existen ahora, para que la lista no crezca sin fin.
        const next = new Set(keys);
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
          // Sin almacenamiento, los avisos se marcan como vistos solo mientras la página esté abierta.
        }
        return next;
      }),
    [storageKey],
  );

  return { seen, markSeen };
}
