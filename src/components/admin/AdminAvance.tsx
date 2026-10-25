import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Download, Loader2, RefreshCw, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { courseModules, part2Module, weeklyPlan } from "@/lib/academia/course";
import { moduleName } from "@/lib/academia/modules";
import {
  ESTADO_LABEL,
  ESTADO_ORDEN,
  INACTIVE_DAYS,
  avanceCsv,
  buildAvance,
  weekOf,
  type AvanceConvocado,
  type AvanceEstado,
} from "@/lib/academia/avance";
import { formatDate } from "@/lib/academy-dates";
import {
  listAcademyEntregas,
  listAcademyGroups,
  listAcademyPracticas,
  listAcademyProgressForUsers,
  listModuleFichasForUsers,
  listProfilesByEmail,
} from "@/services/supabase/academia";

// La directiva ve cómo avanza cada convocado: lecciones, ritmo, fichas, tarea final y práctica.

const ESTADO_STYLE: Record<AvanceEstado, string> = {
  atrasado: "border-rose-400/60 bg-rose-400/10 text-rose-200",
  "no-empezo": "border-amber-300/60 bg-amber-300/10 text-amber-100",
  "sin-cuenta": "border-white/20 text-white/60",
  "al-dia": "border-emerald-400/60 bg-emerald-400/10 text-emerald-100",
  "parte1-completa": "border-white bg-white text-black",
  "por-empezar": "border-white/15 text-white/45",
};

const ENTREGA_LABEL = { enviada: "En revisión", observada: "Con observaciones", aprobada: "Aprobada" } as const;
const PRACTICA_LABEL = { programada: "Programada", asistio: "Asistió", no_asistio: "No asistió" } as const;

type Orden = "atencion" | "avance" | "nombre";

const relative = (days: number | null) => (days === null ? "Sin actividad" : days <= 0 ? "Hoy" : days === 1 ? "Ayer" : `Hace ${days} días`);

const errorMessage = (error: unknown, fallback: string) => (error as { message?: string } | null)?.message || fallback;

function Summary({ rows }: { rows: AvanceConvocado[] }) {
  const active = rows.filter((r) => r.estado !== "por-empezar");
  const withAccount = active.filter((r) => r.userId);
  const average = withAccount.length ? Math.round(withAccount.reduce((t, r) => t + r.percent, 0) / withAccount.length) : 0;
  const attention = active.filter(
    (r) => r.estado === "atrasado" || r.estado === "no-empezo" || (r.estado === "al-dia" && (r.daysInactive ?? 0) >= INACTIVE_DAYS),
  ).length;
  const entregas = rows.filter((r) => r.entrega).length;
  const aprobadas = rows.filter((r) => r.entrega?.estado === "aprobada").length;

  const tiles = [
    { value: `${withAccount.length}/${active.length}`, label: "Convocados con cuenta" },
    { value: `${average} %`, label: "Avance promedio de la Parte 1" },
    { value: String(attention), label: "Necesitan atención", alert: attention > 0 },
    { value: `${entregas} · ${aprobadas}`, label: "Tareas enviadas · aprobadas" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label} className={t.alert ? "border-rose-400/50" : undefined}>
          <CardContent className="p-4">
            <p className="font-display text-2xl font-bold">{t.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// En qué semana del plan está cada uno: muestra de un vistazo cómo va el grupo.
function WeekDistribution({ rows }: { rows: AvanceConvocado[] }) {
  const started = rows.filter((r) => r.userId && r.estado !== "por-empezar");
  if (started.length === 0) return null;
  const buckets = [
    ...weeklyPlan.map((w, i) => ({ label: w.title, count: started.filter((r) => r.done > 0 && weekOf(r.nextLesson) === i + 1).length })),
    { label: "Terminaron", count: started.filter((r) => r.estado === "parte1-completa").length },
  ];
  const notStarted = started.filter((r) => r.done === 0).length;
  const max = Math.max(1, ...buckets.map((b) => b.count), notStarted);
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-sm font-semibold">¿En qué parte del plan van?</p>
        {[{ label: "Sin empezar", count: notStarted }, ...buckets].map((b) => (
          <div key={b.label} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 text-muted-foreground">{b.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(b.count / max) * 100}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right tabular-nums">{b.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Detail({ row }: { row: AvanceConvocado }) {
  return (
    <div className="space-y-5 pt-2">
      {weeklyPlan.map((week) => (
        <div key={week.title}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{week.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {week.lessons.map((lesson) => {
              const date = row.completed.get(lesson.key);
              const isNext = row.nextLesson?.key === lesson.key;
              return (
                <span
                  key={lesson.key}
                  title={`${lesson.code} · ${lesson.title}${date ? ` · completada el ${formatDate(date.slice(0, 10))}` : ""}`}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${
                    date ? "border-emerald-400/50 bg-emerald-400/10" : isNext ? "border-white/60" : "border-white/10 text-muted-foreground"
                  }`}
                >
                  {date && <Check className="h-3 w-3 text-emerald-400" />}
                  {lesson.isTask ? `Tarea ${moduleName(lesson.moduleId)}` : lesson.code}
                  {date && <span className="text-muted-foreground">{date.slice(5, 10).split("-").reverse().join("/")}</span>}
                </span>
              );
            })}
          </div>
        </div>
      ))}

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 p-3">
          <p className="text-xs text-muted-foreground">Fichas de módulo</p>
          <p className="mt-1">
            {courseModules.map((m) => (
              <span key={m.id} className={`mr-2 ${row.moduleFichas.includes(m.id) ? "" : "text-muted-foreground line-through"}`}>
                {m.name}
              </span>
            ))}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <p className="text-xs text-muted-foreground">Tarea final</p>
          <p className="mt-1">
            {row.entrega
              ? `${ENTREGA_LABEL[row.entrega.estado]} · enviada el ${formatDate(row.entrega.enviado_at.slice(0, 10))}`
              : "Sin enviar"}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <p className="text-xs text-muted-foreground">Parte 2 y práctica</p>
          <p className="mt-1">
            {row.entrega?.estado === "aprobada"
              ? `Soldadura ${row.part2Done}/${part2Module.lessons.length}${row.practica ? ` · práctica: ${PRACTICA_LABEL[row.practica.estado]}` : ""}`
              : "Se abre al aprobar la tarea final"}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdminAvance() {
  const [rows, setRows] = useState<AvanceConvocado[]>([]);
  const [groups, setGroups] = useState<{ id: string; nombre: string; status: string }[]>([]);
  const [group, setGroup] = useState<string>("activos");
  const [estado, setEstado] = useState<AvanceEstado | "todos">("todos");
  const [query, setQuery] = useState("");
  const [orden, setOrden] = useState<Orden>("atencion");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const academyGroups = await listAcademyGroups();
      const emails = [...new Set(academyGroups.flatMap((g) => g.academia_miembros.map((m) => m.email.toLowerCase())))];
      const profiles = await listProfilesByEmail(emails);
      const ids = profiles.map((p) => p.user_id);
      const [progress, fichas, entregas, practicas] = await Promise.all([
        listAcademyProgressForUsers(ids),
        listModuleFichasForUsers(ids),
        listAcademyEntregas(),
        listAcademyPracticas(),
      ]);
      const built = buildAvance({ groups: academyGroups, profiles, progress, fichas, entregas, practicas });
      setRows(built);
      setGroups(
        academyGroups.map((g) => ({ id: g.id, nombre: g.nombre, status: built.find((r) => r.grupo.id === g.id)?.grupo.status ?? "" })),
      );
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudo cargar el avance"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const inGroup = useMemo(
    () => rows.filter((r) => (group === "activos" ? r.grupo.status === "activo" : group === "todos" ? true : r.grupo.id === group)),
    [rows, group],
  );

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    const filtered = inGroup.filter(
      (r) => (estado === "todos" || r.estado === estado) && (!text || `${r.name ?? ""} ${r.email}`.toLowerCase().includes(text)),
    );
    const byName = (a: AvanceConvocado, b: AvanceConvocado) => (a.name ?? a.email).localeCompare(b.name ?? b.email);
    return [...filtered].sort((a, b) =>
      orden === "nombre"
        ? byName(a, b)
        : orden === "avance"
          ? b.done - a.done || byName(a, b)
          : ESTADO_ORDEN.indexOf(a.estado) - ESTADO_ORDEN.indexOf(b.estado) ||
            (b.daysInactive ?? 99) - (a.daysInactive ?? 99) ||
            a.done - b.done,
    );
  }, [inGroup, estado, query, orden]);

  const download = () => {
    const blob = new Blob(["﻿" + avanceCsv(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avance-convocados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />;

  if (rows.length === 0)
    return <p className="py-8 text-center text-muted-foreground">Todavía no hay convocados. Agrégalos en la pestaña Convocados.</p>;

  const counts = (e: AvanceEstado) => inGroup.filter((r) => r.estado === e).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Button size="sm" variant={group === "activos" ? "default" : "outline"} onClick={() => setGroup("activos")}>
          Grupos activos
        </Button>
        {groups.map((g) => (
          <Button key={g.id} size="sm" variant={group === g.id ? "default" : "outline"} onClick={() => setGroup(g.id)}>
            {g.nombre}
          </Button>
        ))}
        <Button size="sm" variant={group === "todos" ? "default" : "outline"} onClick={() => setGroup("todos")}>
          Todos
        </Button>
        <Button size="sm" variant="ghost" onClick={load} className="ml-auto" title="Actualizar">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {inGroup.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No hay convocados en esta selección.</p>
      ) : (
        <>
          <Summary rows={inGroup} />
          <WeekDistribution rows={inGroup} />

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={estado === "todos" ? "default" : "outline"} onClick={() => setEstado("todos")}>
              Todos ({inGroup.length})
            </Button>
            {ESTADO_ORDEN.filter((e) => counts(e) > 0).map((e) => (
              <Button key={e} size="sm" variant={estado === e ? "default" : "outline"} onClick={() => setEstado(e)}>
                {ESTADO_LABEL[e]} ({counts(e)})
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o correo" className="pl-9" />
            </div>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Ordenar"
            >
              <option value="atencion">Primero quien necesita atención</option>
              <option value="avance">Más avance primero</option>
              <option value="nombre">Por nombre</option>
            </select>
            <Button variant="outline" onClick={download} disabled={visible.length === 0}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            "Atrasado": lleva 3 lecciones o más por debajo de lo que el plan de 3 semanas espera a esta altura. Se marca la falta de
            actividad desde {INACTIVE_DAYS} días.
          </p>

          <Accordion type="multiple" className="space-y-2">
            {visible.map((row) => {
              const inactive =
                row.userId && row.estado !== "parte1-completa" && row.estado !== "por-empezar" && (row.daysInactive ?? 0) >= INACTIVE_DAYS;
              return (
                <AccordionItem key={row.key} value={row.key} className="rounded-lg border border-white/10 px-4">
                  <AccordionTrigger className="gap-3 py-3 font-sans hover:no-underline">
                    <div className="grid min-w-0 flex-1 gap-2 text-left sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{row.name ?? row.email}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.name ? `${row.email} · ` : ""}
                          {row.grupo.nombre}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${row.percent}%` }} />
                          </div>
                          <span className="shrink-0 text-xs tabular-nums">
                            {row.done}/{row.total}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {row.userId
                            ? row.nextLesson
                              ? `Va en ${row.nextLesson.code} · ${relative(row.daysInactive)}`
                              : `Parte 1 completa · ${relative(row.daysInactive)}`
                            : "Aún no crea su cuenta con este correo"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={ESTADO_STYLE[row.estado]}>
                          {ESTADO_LABEL[row.estado]}
                        </Badge>
                        {inactive && (
                          <Badge variant="outline" className="border-amber-300/60 text-amber-100">
                            <AlertTriangle className="mr-1 h-3 w-3" /> {row.daysInactive} días sin actividad
                          </Badge>
                        )}
                        {row.entrega && <Badge variant="secondary">Tarea: {ENTREGA_LABEL[row.entrega.estado]}</Badge>}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {row.userId ? (
                      <Detail row={row} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Este correo está convocado, pero todavía no hay una cuenta registrada con él. Pídele que se registre con {row.email}
                        .
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </>
      )}
    </div>
  );
}
