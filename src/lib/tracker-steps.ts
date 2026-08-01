import { CheckCircle2, ClipboardList, PackageCheck, PackageSearch, Printer } from "lucide-react";
import type { TrackerStep } from "@/components/StatusTracker";

export const orderSteps: TrackerStep[] = [
  { key: "pending", label: "Pedido realizado", icon: ClipboardList },
  { key: "paid", label: "Confirmado", icon: CheckCircle2 },
  { key: "preparing", label: "Preparando", icon: PackageSearch },
  { key: "delivered", label: "Listo para recoger", icon: PackageCheck },
];

export const reservationSteps: TrackerStep[] = [
  { key: "pending", label: "Enviada", icon: ClipboardList },
  { key: "approved", label: "Aceptada", icon: CheckCircle2 },
  { key: "in_progress", label: "Imprimiendo", icon: Printer },
  { key: "completed", label: "Lista para recoger", icon: PackageCheck },
];
