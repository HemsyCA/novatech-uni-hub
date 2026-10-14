import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, CheckCircle2, Loader2, MapPin, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatLimaDateTime, limaDateTimeToIso, limaToday } from "@/lib/academy-dates";
import {
  cancelAcademyPractica,
  listAcademyEntregas,
  listAcademyPracticas,
  recordAcademyPracticaResult,
  scheduleAcademyPracticas,
  type AcademyPractica,
  type PracticaEstado,
} from "@/services/supabase/academia";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string } | null)?.message || fallback;

const estadoLabel: Record<PracticaEstado, string> = {
  programada: "Programada",
  asistio: "Asistió",
  no_asistio: "No asistió",
};

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const personName = (profile?: Profile) => profile?.full_name || profile?.email || "Convocado";

function ScheduleForm({
  approved,
  practicas,
  profiles,
  onSaved,
}: {
  approved: string[];
  practicas: Record<string, AcademyPractica>;
  profiles: Record<string, Profile>;
  onSaved: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [lugar, setLugar] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Quienes no asistieron también pueden volver a citarse.
  const pending = approved.filter((id) => !practicas[id] || practicas[id].estado === "no_asistio");
  const rescheduling = [...selected].filter((id) => practicas[id]?.estado === "programada").length;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const schedule = async () => {
    if (!date || !time || lugar.trim().length < 3) {
      toast({ title: "Completa la fecha, la hora y el lugar", variant: "destructive" });
      return;
    }
    if (selected.size === 0) {
      toast({ title: "Selecciona al menos un convocado", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await scheduleAcademyPracticas([...selected], {
        fecha: limaDateTimeToIso(date, time),
        lugar: lugar.trim(),
        indicaciones: indicaciones.trim() || null,
      });
      toast({ title: `Práctica programada para ${selected.size} convocado(s)` });
      setSelected(new Set());
      onSaved();
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudo programar la práctica"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Programar una sesión</CardTitle>
        <p className="text-sm text-muted-foreground">
          Solo aparecen quienes tienen la tarea final aprobada. Cada convocado ve su cita en su panel y en la Academia.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="practica-fecha">Fecha</Label>
            <Input id="practica-fecha" type="date" min={limaToday()} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="practica-hora">Hora (Lima)</Label>
            <Input id="practica-hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="practica-lugar">Lugar</Label>
          <Input
            id="practica-lugar"
            value={lugar}
            maxLength={200}
            onChange={(e) => setLugar(e.target.value)}
            placeholder="Ej.: Laboratorio de la FIEE, pabellón B"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="practica-indicaciones">Indicaciones (opcional)</Label>
          <Textarea
            id="practica-indicaciones"
            value={indicaciones}
            maxLength={1000}
            onChange={(e) => setIndicaciones(e.target.value)}
            placeholder="Qué llevar, a quién preguntar al llegar, duración aproximada…"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Convocados ({selected.size} seleccionados)</Label>
            {pending.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set(pending))}>
                Seleccionar los {pending.length} sin cita
              </Button>
            )}
          </div>
          {approved.length === 0 ? (
            <p className="rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
              Todavía no hay tareas finales aprobadas.
            </p>
          ) : (
            <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border/40 p-2">
              {approved.map((id) => {
                const practica = practicas[id];
                return (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted/40"
                  >
                    <Checkbox checked={selected.has(id)} onCheckedChange={() => toggle(id)} />
                    <span className="min-w-0 flex-1 truncate">
                      {personName(profiles[id])}
                      {profiles[id]?.full_name && (
                        <span className="ml-2 text-xs text-muted-foreground">{profiles[id].email}</span>
                      )}
                    </span>
                    <Badge variant={practica ? "secondary" : "outline"} className="shrink-0">
                      {practica ? estadoLabel[practica.estado] : "Sin cita"}
                    </Badge>
                  </label>
                );
              })}
            </div>
          )}
          {rescheduling > 0 && (
            <p className="text-xs text-muted-foreground">
              {rescheduling} de los seleccionados ya tienen una cita: se reprogramará a esta nueva fecha.
            </p>
          )}
        </div>

        <Button onClick={schedule} disabled={saving || selected.size === 0}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarPlus className="h-4 w-4 mr-2" />}
          Citar a {selected.size} convocado(s)
        </Button>
      </CardContent>
    </Card>
  );
}

function PracticaRow({ practica, profile, onChanged }: { practica: AcademyPractica; profile?: Profile; onChanged: () => void }) {
  const [comment, setComment] = useState(practica.comentario ?? "");
  const [saving, setSaving] = useState<PracticaEstado | "cancel" | null>(null);
  const { toast } = useToast();

  const record = async (estado: PracticaEstado) => {
    setSaving(estado);
    try {
      await recordAcademyPracticaResult(practica.user_id, estado, comment.trim() || null);
      toast({ title: estado === "asistio" ? "Asistencia registrada" : "Inasistencia registrada" });
      onChanged();
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudo guardar"), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const cancel = async () => {
    if (!window.confirm(`¿Quitar la cita de ${personName(profile)}?`)) return;
    setSaving("cancel");
    try {
      await cancelAcademyPractica(practica.user_id);
      toast({ title: "Cita quitada" });
      onChanged();
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudo quitar la cita"), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-border/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{personName(profile)}</p>
          {profile?.full_name && <p className="truncate text-xs text-muted-foreground">{profile.email}</p>}
        </div>
        <Badge variant={practica.estado === "asistio" ? "default" : "secondary"}>{estadoLabel[practica.estado]}</Badge>
      </div>
      <Input
        value={comment}
        maxLength={1000}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentario para el convocado (opcional)"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => record("asistio")} disabled={saving !== null}>
          {saving === "asistio" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          Asistió
        </Button>
        <Button size="sm" variant="outline" onClick={() => record("no_asistio")} disabled={saving !== null}>
          {saving === "no_asistio" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
          No asistió
        </Button>
        <Button size="sm" variant="ghost" onClick={cancel} disabled={saving !== null} className="text-destructive">
          {saving === "cancel" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
          Quitar cita
        </Button>
      </div>
    </div>
  );
}

export function AdminPracticas() {
  const [approved, setApproved] = useState<string[]>([]);
  const [practicas, setPracticas] = useState<AcademyPractica[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [entregas, practicaRows] = await Promise.all([listAcademyEntregas(), listAcademyPracticas()]);
      const approvedIds = entregas.filter((e) => e.estado === "aprobada").map((e) => e.user_id);
      const ids = [...new Set([...approvedIds, ...practicaRows.map((p) => p.user_id)])];
      const profileRows = ids.length
        ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids)
        : { data: [] as Profile[], error: null };
      if (profileRows.error) throw profileRows.error;
      setApproved(approvedIds);
      setPracticas(practicaRows);
      setProfiles(Object.fromEntries((profileRows.data ?? []).map((p) => [p.user_id, p])));
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudieron cargar las prácticas"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  // Una sesión = misma fecha, hora y lugar.
  const sessions = new Map<string, AcademyPractica[]>();
  for (const practica of practicas) {
    const key = `${practica.fecha}|${practica.lugar}`;
    sessions.set(key, [...(sessions.get(key) ?? []), practica]);
  }

  return (
    <div className="space-y-6">
      <ScheduleForm
        approved={approved}
        practicas={Object.fromEntries(practicas.map((p) => [p.user_id, p]))}
        profiles={profiles}
        onSaved={fetchData}
      />

      <div className="space-y-4">
        <h3 className="font-semibold">Sesiones programadas</h3>
        {sessions.size === 0 ? (
          <p className="text-center text-muted-foreground py-8">Todavía no hay prácticas programadas</p>
        ) : (
          [...sessions.values()].map((group) => {
            const { fecha, lugar, indicaciones } = group[0];
            const attended = group.filter((p) => p.estado === "asistio").length;
            return (
              <Card key={`${fecha}|${lugar}`} className="glass-card border-border/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base first-letter:uppercase">{formatLimaDateTime(fecha)}</CardTitle>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {lugar}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {group.length} citado(s) · {attended} asistieron
                    </p>
                  </div>
                  {indicaciones && <p className="text-sm text-muted-foreground whitespace-pre-line">{indicaciones}</p>}
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.map((practica) => (
                    <PracticaRow
                      key={`${practica.user_id}-${practica.updated_at}`}
                      practica={practica}
                      profile={profiles[practica.user_id]}
                      onChanged={fetchData}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
