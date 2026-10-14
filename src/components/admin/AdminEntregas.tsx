import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { moduleInfo } from "@/lib/academia/modules";
import {
  listAcademyEntregas,
  listModuleFichasForUsers,
  reviewAcademyEntrega,
  type AcademyEntrega,
  type AcademyFicha,
  type EntregaEstado,
} from "@/services/supabase/academia";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string } | null)?.message || fallback;

const estadoLabel: Record<EntregaEstado, string> = {
  enviada: "Por revisar",
  observada: "Con observaciones",
  aprobada: "Aprobada",
};

const links: { key: keyof AcademyEntrega; label: string }[] = [
  { key: "wokwi_url", label: "Wokwi" },
  { key: "diagrama_url", label: "Diagrama de flujo" },
  { key: "electronica_url", label: "Esquemático y PCB" },
  { key: "onshape_url", label: "Onshape" },
  { key: "mecanica_url", label: "STL y medidas" },
  { key: "video_url", label: "Video" },
];

const dateFormatter = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

function EntregaCard({
  entrega,
  profile,
  fichas,
  onReviewed,
}: {
  entrega: AcademyEntrega;
  profile?: Profile;
  fichas: AcademyFicha[];
  onReviewed: () => void;
}) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState<"aprobar" | "observar" | null>(null);
  const { toast } = useToast();

  const review = async (approve: boolean) => {
    if (!approve && !comment.trim()) {
      toast({ title: "Escribe qué debe corregir", variant: "destructive" });
      return;
    }
    setSaving(approve ? "aprobar" : "observar");
    try {
      await reviewAcademyEntrega(entrega.user_id, approve, comment.trim() || undefined);
      toast({ title: approve ? "Entrega aprobada" : "Observaciones enviadas" });
      setComment("");
      onReviewed();
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudo guardar la revisión"), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{profile?.full_name || profile?.email || "Convocado"}</CardTitle>
            {profile?.full_name && <p className="text-xs text-muted-foreground truncate">{profile.email}</p>}
          </div>
          <div className="text-right">
            <Badge variant={entrega.estado === "aprobada" ? "default" : "secondary"}>{estadoLabel[entrega.estado]}</Badge>
            <p className="mt-1 text-xs text-muted-foreground">Enviada {dateFormatter.format(new Date(entrega.enviado_at))}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.key}
              href={entrega[link.key] as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2.5 py-1 text-xs hover:bg-muted/50"
            >
              {link.label} <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>

        <details className="rounded-lg bg-muted/30 p-3 text-sm">
          <summary className="cursor-pointer font-medium">Reflexión final</summary>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">{entrega.reflexion}</p>
        </details>

        <details className="rounded-lg bg-muted/30 p-3 text-sm">
          <summary className="cursor-pointer font-medium">Fichas de módulo ({fichas.length} de 3)</summary>
          <div className="mt-3 space-y-3">
            {moduleInfo.map((module) => {
              const ficha = fichas.find((f) => f.modulo === module.id);
              return (
                <div key={module.id} className="rounded-md border border-border/40 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{module.name}</p>
                  {ficha ? (
                    <div className="mt-1 space-y-1">
                      <p className="font-medium">{ficha.titulo}</p>
                      <p><span className="font-medium">Quería:</span> {ficha.queria}</p>
                      <p><span className="font-medium">Hice:</span> {ficha.hice}</p>
                      <p><span className="font-medium">Pasó:</span> {ficha.paso}</p>
                      <p><span className="font-medium">Aprendí:</span> {ficha.aprendi}</p>
                      <p className="text-xs text-muted-foreground">
                        Fuentes: {ficha.fuentes} ·{" "}
                        <a href={ficha.evidencia_url} target="_blank" rel="noopener noreferrer" className="underline">
                          evidencia
                        </a>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-muted-foreground">Sin ficha</p>
                  )}
                </div>
              );
            })}
          </div>
        </details>

        {entrega.comentario && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Último comentario:</span> {entrega.comentario}
          </p>
        )}

        {entrega.estado !== "aprobada" && (
          <div className="space-y-2 border-t border-border/30 pt-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario para el convocado (obligatorio si lo devuelves con observaciones)"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => review(true)} disabled={saving !== null}>
                {saving === "aprobar" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Aprobar
              </Button>
              <Button variant="outline" onClick={() => review(false)} disabled={saving !== null}>
                {saving === "observar" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MessageSquareWarning className="h-4 w-4 mr-2" />
                )}
                Devolver con observaciones
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminEntregas() {
  const [entregas, setEntregas] = useState<AcademyEntrega[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [fichas, setFichas] = useState<AcademyFicha[]>([]);
  const [filter, setFilter] = useState<EntregaEstado>("enviada");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEntregas = useCallback(async () => {
    try {
      const data = await listAcademyEntregas();
      const ids = data.map((e) => e.user_id);
      const [moduleFichas, profileRows] = await Promise.all([
        listModuleFichasForUsers(ids),
        ids.length
          ? supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids)
          : Promise.resolve({ data: [] as Profile[], error: null }),
      ]);
      if (profileRows.error) throw profileRows.error;
      setEntregas(data);
      setFichas(moduleFichas);
      setProfiles(Object.fromEntries((profileRows.data ?? []).map((p) => [p.user_id, p])));
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudieron cargar las entregas"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEntregas();
  }, [fetchEntregas]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  const visible = entregas.filter((e) => e.estado === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(estadoLabel) as EntregaEstado[]).map((estado) => (
          <Button
            key={estado}
            size="sm"
            variant={filter === estado ? "default" : "outline"}
            onClick={() => setFilter(estado)}
          >
            {estadoLabel[estado]} ({entregas.filter((e) => e.estado === estado).length})
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay entregas en este estado</p>
      ) : (
        visible.map((entrega) => (
          <EntregaCard
            key={entrega.user_id}
            entrega={entrega}
            profile={profiles[entrega.user_id]}
            fichas={fichas.filter((f) => f.user_id === entrega.user_id)}
            onReviewed={fetchEntregas}
          />
        ))
      )}
    </div>
  );
}
