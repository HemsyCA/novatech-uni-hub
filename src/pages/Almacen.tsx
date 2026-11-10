import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, Check, Loader2, Lock, MapPin, PackageCheck, Search, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/components/account/account-context";
import { EmptyState, PageHeader, PageTabs, StatusPill } from "@/components/account/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputClass, primaryButton, secondaryButton } from "@/lib/account/styles";
import { formatDate } from "@/lib/academy-dates";
import {
  CATEGORIAS_ALMACEN,
  HERRAMIENTA_ESTADO,
  PRESTAMO_ESTADO,
  PRESTAMO_PASOS,
  categoriaAlmacen,
  isOverdue,
  limaDatePlus,
} from "@/lib/almacen";
import {
  ACTIVE_LOAN,
  cancelarPrestamo,
  listHerramientas,
  listHerramientasPedidas,
  listMisPrestamos,
  reportarDevolucion,
  solicitarPrestamo,
  type Herramienta,
  type Prestamo,
} from "@/services/supabase/almacen";

// Almacén de Nova para los miembros: ver las herramientas del equipo, pedirlas prestadas y devolverlas.
// La devolución solo se completa cuando la directiva la confirma en el almacén.

const errorText = (error: unknown, fallback: string) => (error as { message?: string } | null)?.message || fallback;

function RequestDialog({ herramienta, onClose, onDone }: { herramienta: Herramienta | null; onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState(limaDatePlus(7));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMotivo("");
    setFecha(limaDatePlus(7));
  }, [herramienta]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!herramienta) return;
    setSaving(true);
    try {
      await solicitarPrestamo(herramienta.id, motivo, fecha);
      toast({ title: "Solicitud enviada", description: "La directiva la revisará pronto." });
      onDone();
    } catch (error) {
      toast({ title: "No se pudo pedir", description: errorText(error, "Inténtalo de nuevo."), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(herramienta)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="nova-shell border-white/15 bg-black text-white">
        <DialogHeader>
          <DialogTitle>Pedir prestada</DialogTitle>
          <DialogDescription className="text-white/60">
            {herramienta?.codigo} · {herramienta?.nombre}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">¿Para qué la necesitas?</span>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              minLength={5}
              maxLength={500}
              rows={3}
              placeholder="Por ejemplo: soldar la placa del minisumo"
              className={inputClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">¿Cuándo la devuelves?</span>
            <input
              type="date"
              value={fecha}
              min={limaDatePlus(0)}
              onChange={(e) => setFecha(e.target.value)}
              required
              className={inputClass}
            />
          </label>
          <p className="text-xs text-white/50">
            La directiva aprobará tu pedido y te entregará la herramienta. Al devolverla, avisas aquí y la directiva confirma en el almacén
            que la recibió.
          </p>
          <button type="submit" disabled={saving || motivo.trim().length < 5} className={`${primaryButton} w-full`}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Enviar solicitud
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ToolCard({
  herramienta,
  pedida,
  mine,
  onRequest,
}: {
  herramienta: Herramienta;
  pedida: boolean;
  mine: Prestamo | undefined;
  onRequest: () => void;
}) {
  const estado = HERRAMIENTA_ESTADO[herramienta.estado];
  const available = herramienta.estado === "disponible" && !pedida && !mine;
  return (
    <li className="flex flex-col rounded-2xl border border-white/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md border border-white/20 px-2 py-0.5 font-mono text-xs text-white/80">{herramienta.codigo}</span>
        {mine ? (
          <StatusPill tone={PRESTAMO_ESTADO[mine.estado].tone}>{PRESTAMO_ESTADO[mine.estado].label}</StatusPill>
        ) : pedida && herramienta.estado === "disponible" ? (
          <StatusPill tone="neutral">Pedida por otra persona</StatusPill>
        ) : (
          <StatusPill tone={estado.tone}>{estado.label}</StatusPill>
        )}
      </div>
      <p className="mt-3 font-semibold">{herramienta.nombre}</p>
      <p className="text-xs text-white/45">{categoriaAlmacen(herramienta.categoria)}</p>
      {herramienta.descripcion && <p className="mt-2 text-sm text-white/65">{herramienta.descripcion}</p>}
      {herramienta.ubicacion && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-white/45">
          <MapPin className="h-3.5 w-3.5" /> {herramienta.ubicacion}
        </p>
      )}
      <div className="mt-4 flex-1" />
      {available ? (
        <button type="button" onClick={onRequest} className={`${secondaryButton} w-full justify-center`}>
          Pedir prestada
        </button>
      ) : mine ? (
        <Link to="/almacen?vista=mios" className="text-center text-xs text-white/50 underline underline-offset-4 hover:text-white">
          Ver en mis préstamos
        </Link>
      ) : null}
    </li>
  );
}

function Steps({ estado }: { estado: Prestamo["estado"] }) {
  const index = PRESTAMO_PASOS.findIndex((p) => p.estado === estado);
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
      {PRESTAMO_PASOS.map((paso, i) => (
        <li key={paso.estado} className={`flex items-center gap-1.5 ${i <= index ? "text-white" : "text-white/35"}`}>
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full border ${
              i < index ? "border-white bg-white text-black" : i === index ? "border-white" : "border-white/25"
            }`}
          >
            {i < index && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          </span>
          {paso.label}
          {i < PRESTAMO_PASOS.length - 1 && <span className="text-white/25">→</span>}
        </li>
      ))}
    </ol>
  );
}

function LoanCard({ prestamo, onChange }: { prestamo: Prestamo; onChange: () => void }) {
  const { toast } = useToast();
  const [returning, setReturning] = useState(false);
  const [nota, setNota] = useState("");
  const [busy, setBusy] = useState(false);
  const estado = PRESTAMO_ESTADO[prestamo.estado];
  const overdue = isOverdue(prestamo);

  const run = async (action: () => Promise<void>, ok: string) => {
    setBusy(true);
    try {
      await action();
      toast({ title: ok });
      onChange();
    } catch (error) {
      toast({ title: "No se pudo completar", description: errorText(error, "Inténtalo de nuevo."), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={`space-y-3 rounded-2xl border p-5 ${overdue ? "border-nova/60" : "border-white/10"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            <span className="mr-2 font-mono text-xs text-white/60">{prestamo.herramienta?.codigo}</span>
            {prestamo.herramienta?.nombre ?? "Herramienta"}
          </p>
          <p className="mt-0.5 text-xs text-white/50">
            Pedida el {formatDate(prestamo.created_at.slice(0, 10))} · devolución acordada: {formatDate(prestamo.devolucion_estimada)}
          </p>
        </div>
        <StatusPill tone={estado.tone}>{estado.label}</StatusPill>
      </div>

      {ACTIVE_LOAN.includes(prestamo.estado) || prestamo.estado === "devuelto" ? <Steps estado={prestamo.estado} /> : null}

      {overdue && (
        <p className="flex items-center gap-2 rounded-xl bg-nova/15 px-4 py-2.5 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-nova" /> Ya pasó la fecha de devolución. Devuélvela al almacén cuanto antes.
        </p>
      )}
      {prestamo.estado === "devolucion_reportada" && (
        <p className="rounded-xl bg-white/[0.05] px-4 py-2.5 text-sm text-white/75">
          Avisaste que la devolviste. Seguirá a tu nombre hasta que alguien de la directiva revise el almacén y confirme que la recibió.
        </p>
      )}
      {prestamo.comentario_directiva &&
        (prestamo.estado === "rechazado" || prestamo.estado === "devuelto" || prestamo.estado === "prestado") && (
          <p className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/75">
            <span className="font-semibold text-white">Directiva: </span>
            {prestamo.comentario_directiva}
          </p>
        )}

      {prestamo.estado === "solicitado" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => cancelarPrestamo(prestamo.id), "Solicitud cancelada")}
          className={secondaryButton}
        >
          Cancelar solicitud
        </button>
      )}
      {prestamo.estado === "prestado" &&
        (returning ? (
          <div className="space-y-2">
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Opcional: a quién se la entregaste o en qué estado está"
              className={inputClass}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => reportarDevolucion(prestamo.id, nota), "Avisaste la devolución")}
                className={primaryButton}
              >
                <PackageCheck className="h-4 w-4" /> Confirmar que la devolví
              </button>
              <button type="button" onClick={() => setReturning(false)} className={secondaryButton}>
                Volver
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setReturning(true)} className={secondaryButton}>
            <PackageCheck className="h-4 w-4" /> Ya la devolví
          </button>
        ))}
    </li>
  );
}

export default function Almacen() {
  const { user, member, academy } = useAccount();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("vista") === "mios" ? "mios" : "herramientas";
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [pedidas, setPedidas] = useState<Set<string>>(new Set());
  const [mios, setMios] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [requesting, setRequesting] = useState<Herramienta | null>(null);
  const canAccess = member.isMember || academy.isStaff;

  const load = useCallback(() => {
    if (!canAccess || !user) return;
    Promise.all([listHerramientas(), listHerramientasPedidas(), listMisPrestamos(user.id)])
      .then(([tools, requested, loans]) => {
        setHerramientas(tools);
        setPedidas(requested);
        setMios(loans);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [canAccess, user]);

  useEffect(() => {
    load();
  }, [load]);

  const myActive = useMemo(() => new Map(mios.filter((p) => ACTIVE_LOAN.includes(p.estado)).map((p) => [p.herramienta_id, p])), [mios]);

  if (member.loading) return <div className="container mx-auto px-4 pt-28 text-white/60 animate-pulse">Cargando…</div>;

  if (!canAccess)
    return (
      <main className="container mx-auto max-w-2xl px-4 pt-28">
        <EmptyState
          action={
            <Link to="/unete" className={secondaryButton}>
              Conoce cómo unirte
            </Link>
          }
        >
          <Lock className="mx-auto mb-3 h-6 w-6" />
          El Almacén es para los miembros del equipo.
        </EmptyState>
      </main>
    );

  const visible = herramientas
    .filter((h) => h.estado !== "baja")
    .filter((h) => categoria === "todas" || h.categoria === categoria)
    .filter((h) => {
      const text = query.trim().toLowerCase();
      return !text || `${h.codigo} ${h.nombre} ${h.descripcion ?? ""}`.toLowerCase().includes(text);
    });
  const activeCount = myActive.size;
  const usedCategories = CATEGORIAS_ALMACEN.filter((c) => herramientas.some((h) => h.categoria === c.id && h.estado !== "baja"));

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 pb-20 pt-28">
      <PageHeader title="Almacén" description="Las herramientas del equipo. Pídelas prestadas y devuélvelas cuando termines." />
      <PageTabs
        active={view}
        tabs={[
          { id: "herramientas", label: "Herramientas", to: "/almacen" },
          { id: "mios", label: "Mis préstamos", to: "/almacen?vista=mios", count: activeCount },
        ]}
      />

      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-white/60" />
      ) : view === "mios" ? (
        mios.length === 0 ? (
          <EmptyState
            action={
              <Link to="/almacen" className={secondaryButton}>
                Ver herramientas
              </Link>
            }
          >
            Todavía no pediste ninguna herramienta.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {mios.map((p) => (
              <LoanCard key={p.id} prestamo={p} onChange={load} />
            ))}
          </ul>
        )
      ) : herramientas.length === 0 ? (
        <EmptyState>
          <Wrench className="mx-auto mb-3 h-6 w-6" />
          La directiva todavía no registró herramientas.
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o código"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ id: "todas", label: "Todas" }, ...usedCategories].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoria(c.id)}
                aria-pressed={categoria === c.id}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  categoria === c.id ? "border-white bg-white text-black" : "border-white/15 text-white/70 hover:border-white/40"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {visible.length === 0 ? (
            <EmptyState>No hay herramientas con ese filtro.</EmptyState>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((h) => (
                <ToolCard
                  key={h.id}
                  herramienta={h}
                  pedida={pedidas.has(h.id)}
                  mine={myActive.get(h.id)}
                  onRequest={() => setRequesting(h)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <RequestDialog
        herramienta={requesting}
        onClose={() => setRequesting(null)}
        onDone={() => {
          setRequesting(null);
          load();
        }}
      />
    </main>
  );
}
