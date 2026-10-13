import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { listPendingApplications, reviewApplication } from "@/services/supabase/academia";
import { academyStatus, formatDate } from "@/lib/academy-dates";
import type { AcademyApplication, AcademyGroup } from "@/types/domain";

// Números peruanos de 9 dígitos se guardan sin código de país.
const whatsappLink = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return `https://wa.me/${digits.length === 9 ? `51${digits}` : digits}`;
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string } | null)?.message || fallback;

interface Props {
  groups: AcademyGroup[];
  onReviewed: () => Promise<void>;
}

export function AdminInscripciones({ groups, onReviewed }: Props) {
  const [applications, setApplications] = useState<AcademyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const openGroups = groups.filter((g) => academyStatus(g.starts_at, g.ends_at) !== "finalizado");

  const fetchApplications = useCallback(async () => {
    try {
      setApplications(await listPendingApplications());
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudieron cargar las solicitudes"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleReview = async (application: AcademyApplication, approve: boolean, grupoId?: string) => {
    try {
      await reviewApplication(application.id, approve, grupoId);
      setApplications((prev) => prev.filter((a) => a.id !== application.id));
      toast({ title: approve ? `${application.nombre} fue agregado al grupo` : "Solicitud rechazada" });
      if (approve) await onReviewed();
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudo revisar la solicitud"), variant: "destructive" });
    }
  };

  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          Solicitudes pendientes {!loading && <span className="text-muted-foreground">({applications.length})</span>}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Inscripciones recibidas desde el formulario de /unete.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
        ) : applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay solicitudes por revisar.</p>
        ) : (
          <>
            {openGroups.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Crea un grupo (abajo) que no haya finalizado para poder aprobar solicitudes.
              </p>
            )}
            {applications.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                groups={openGroups}
                onApprove={(grupoId) => handleReview(application, true, grupoId)}
                onReject={() => handleReview(application, false)}
              />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface RowProps {
  application: AcademyApplication;
  groups: AcademyGroup[];
  onApprove: (grupoId: string) => Promise<void>;
  onReject: () => Promise<void>;
}

function ApplicationRow({ application, groups, onApprove, onReject }: RowProps) {
  const [grupoId, setGrupoId] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium">{application.nombre}</p>
        <p className="text-xs text-muted-foreground truncate">{application.email}</p>
        <p className="text-xs text-muted-foreground">
          {application.carrera} · {application.ciclo}.º ciclo · {formatDate(application.created_at)}
        </p>
        <a
          href={whatsappLink(application.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <MessageCircle className="h-3 w-3" />
          {application.whatsapp}
        </a>
      </div>
      <div className="flex items-center gap-2">
        <Select value={grupoId} onValueChange={setGrupoId} disabled={groups.length === 0}>
          <SelectTrigger className="h-8 w-48">
            <SelectValue placeholder="Elige un grupo" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" disabled={busy || !grupoId} onClick={() => run(() => onApprove(grupoId))}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Aprobar
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8" disabled={busy} title="Rechazar">
              <X className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Rechazar la solicitud de {application.nombre}?</AlertDialogTitle>
              <AlertDialogDescription>
                Desaparecerá de esta lista. Podrá volver a inscribirse más adelante.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => run(onReject)}>Rechazar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
