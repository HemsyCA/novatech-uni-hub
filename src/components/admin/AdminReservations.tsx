import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listAllReservations, updateReservationStatus } from "@/services/supabase/reservations";
import { getPrintDesignFileUrl } from "@/services/supabase/storage";
import type { Reservation } from "@/types/domain";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-cyan-500/20 text-cyan-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  in_progress: "En Progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReservations = async () => {
    try {
      setReservations(await listAllReservations());
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las reservas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateReservationStatus(id, status as Reservation["status"]);
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: "Reserva actualizada" });
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" });
    }
  };

  const handleDownload = async (path: string) => {
    try {
      const url = await getPrintDesignFileUrl(path);
      window.open(url, "_blank");
    } catch {
      toast({ title: "Error", description: "No se pudo abrir el archivo", variant: "destructive" });
    }
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  if (reservations.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No hay reservas todavía</p>;
  }

  return (
    <div className="space-y-3">
      {reservations.map((res) => (
        <Card key={res.id} className="glass-card border-border/30">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold">{res.project_name}</h4>
                <p className="text-xs text-muted-foreground">
                  {res.user_id ? "Usuario registrado" : `${res.contact_name} · ${res.contact_email} · ${res.contact_phone}`}
                </p>
              </div>
              <Select value={res.status} onValueChange={(v) => handleStatusChange(res.id, v)}>
                <SelectTrigger className="w-36 h-8">
                  <SelectValue>
                    <Badge className={statusColors[res.status]}>{statusLabels[res.status]}</Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground mt-3">
              <span>📅 {res.scheduled_date}</span>
              <span>🕐 {res.scheduled_time}</span>
              <span>⚖️ {res.estimated_grams}g</span>
              <span>⏱️ {res.estimated_hours}h</span>
            </div>
            {res.description && <p className="text-sm text-muted-foreground mt-2">{res.description}</p>}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <span className="text-xs text-muted-foreground">
                {res.printers?.name} · {res.print_materials?.name ?? "PLA"}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-cyan-400">S/ {Number(res.estimated_cost).toFixed(2)}</span>
                {res.design_file_path && (
                  <Button size="sm" variant="outline" onClick={() => handleDownload(res.design_file_path!)}>
                    <FileDown className="h-3.5 w-3.5 mr-1" /> Archivo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
