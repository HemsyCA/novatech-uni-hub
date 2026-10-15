import { formatLimaDateTime, limaToday } from "@/lib/academy-dates";
import type { AccountState } from "@/components/account/account-context";
import type { NextStep } from "@/lib/account/journey";

// "Ahora": lo único que pide tu acción o tiene fecha. Si no hay nada, el panel no muestra este bloque
// y los servicios pasan a ser lo primero. Va de lo más urgente a lo menos.
export const urgentFor = (account: AccountState): NextStep | null => {
  const entrega = account.entrega.entrega;
  const practica = account.practica.practica;

  if (entrega?.estado === "observada")
    return {
      eyebrow: "Tarea final · Academia Nova",
      title: "Corrige tu tarea final",
      description: "La directiva dejó observaciones. Revísalas y vuelve a enviarla.",
      cta: { label: "Ver observaciones", to: "/academia/tarea-final#entrega" },
    };

  if (practica?.estado === "programada")
    return {
      eyebrow: "Práctica presencial",
      title: formatLimaDateTime(practica.fecha),
      description: `${practica.lugar}. Recibirás tu kit de soldadura.`,
      cta: { label: "Ver detalles", to: "/academia" },
    };

  const observado = account.aportes.find((a) => a.estado === "observado");
  if (observado)
    return {
      eyebrow: "Comunidad",
      title: `Corrige tu aporte “${observado.titulo}”`,
      description: "El Área académica dejó observaciones antes de publicarlo.",
      cta: { label: "Corregir", to: `/comunidad?editar=${observado.id}` },
    };

  const listo = account.orders.find((o) => o.status === "delivered");
  if (listo)
    return {
      eyebrow: "Tienda Nova",
      title: "Tu pedido está listo para recoger",
      description: `Pedido de S/ ${Number(listo.total).toFixed(2)}.`,
      cta: { label: "Ver pedido", to: "/store?vista=pedidos" },
    };

  const impresa = account.reservations.find((r) => r.status === "completed");
  if (impresa)
    return {
      eyebrow: "Impresión 3D",
      title: `“${impresa.project_name}” está lista para recoger`,
      cta: { label: "Ver reserva", to: "/print3d?vista=reservas" },
    };

  const hoy = account.reservations.find((r) => r.status === "approved" && r.scheduled_date === limaToday());
  if (hoy)
    return {
      eyebrow: "Impresión 3D · hoy",
      title: `Hoy imprimimos “${hoy.project_name}”`,
      description: `A las ${hoy.scheduled_time}.`,
      cta: { label: "Ver reserva", to: "/print3d?vista=reservas" },
    };

  return null;
};
