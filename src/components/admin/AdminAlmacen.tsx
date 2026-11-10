import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Check, Loader2, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState, StatusPill } from "@/components/account/ui";
import { inputClass, primaryButton, secondaryButton } from "@/lib/account/styles";
import { formatDate, formatLimaDateTime } from "@/lib/academy-dates";
import { CATEGORIAS_ALMACEN, HERRAMIENTA_ESTADO, PRESTAMO_ESTADO, categoriaAlmacen, isOverdue } from "@/lib/almacen";
import {
  ACTIVE_LOAN,
  confirmarDevolucion,
  createHerramienta,
  deleteHerramienta,
  listHerramientas,
  listPrestamos,
  revisarPrestamo,
  setHerramientaEstado,
  updateHerramienta,
  type Herramienta,
  type HerramientaInput,
  type Prestamo,
} from "@/services/supabase/almacen";

// Panel de directiva · Almacén. Dos vistas: los préstamos (aprobar y confirmar devoluciones) y el inventario.

const errorText = (error: unknown, fallback: string) => {
  const message = (error as { message?: string } | null)?.message ?? "";
  if (message.includes("herramientas_codigo_unico")) return "Ya existe una herramienta con ese código.";
  if (message.includes("herramientas_codigo_check")) return "El código solo puede tener letras, números y guiones (por ejemplo NOVA-001).";
  return message || fallback;
};

// ---------------------------------------------------------------- préstamos

type LoanFilter = "solicitado" | "devolucion_reportada" | "prestado" | "historial";

const FILTERS: { id: LoanFilter; label: string }[] = [
  { id: "solicitado", label: "Solicitudes" },
  { id: "devolucion_reportada", label: "Devoluciones por confirmar" },
  { id: "prestado", label: "Prestadas ahora" },
  { id: "historial", label: "Historial" },
];

const inFilter = (p: Prestamo, filter: LoanFilter) => (filter === "historial" ? !ACTIVE_LOAN.includes(p.estado) : p.estado === filter);

function LoanReview({ prestamo, onDone }: { prestamo: Prestamo; onDone: () => void }) {
  const { toast } = useToast();
  const [comentario, setComentario] = useState("");
  const [queda, setQueda] = useState<"disponible" | "mantenimiento">("disponible");
  const [busy, setBusy] = useState(false);
  const overdue = isOverdue(prestamo);
  const pendingReturn = prestamo.estado === "prestado" || prestamo.estado === "devolucion_reportada";

  const run = async (action: () => Promise<void>, ok: string) => {
    setBusy(true);
    try {
      await action();
      toast({ title: ok });
      onDone();
    } catch (error) {
      toast({ title: "No se pudo completar", description: errorText(error, "Inténtalo de nuevo."), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <li
      className={`space-y-3 rounded-2xl border p-5 ${prestamo.estado === "devolucion_reportada" || overdue ? "border-nova/60" : "border-white/10"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            <span className="mr-2 font-mono text-xs text-white/60">{prestamo.herramienta?.codigo}</span>
            {prestamo.herramienta?.nombre ?? "Herramienta"}
          </p>
          <p className="mt-0.5 text-sm text-white/70">{prestamo.solicitante_nombre}</p>
          <p className="mt-0.5 text-xs text-white/45">
            Pedida el {formatDate(prestamo.created_at.slice(0, 10))} · devolverá el {formatDate(prestamo.devolucion_estimada)}
          </p>
        </div>
        <StatusPill tone={PRESTAMO_ESTADO[prestamo.estado].tone}>
          {prestamo.estado === "prestado" ? "Prestada" : PRESTAMO_ESTADO[prestamo.estado].label}
        </StatusPill>
      </div>
      <p className="rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm text-white/80">
        <span className="text-white/50">Para: </span>
        {prestamo.motivo}
      </p>
      {overdue && (
        <p className="flex items-center gap-2 text-sm text-nova">
          <AlertTriangle className="h-4 w-4" /> Pasó la fecha de devolución.
        </p>
      )}
      {prestamo.estado === "devolucion_reportada" && (
        <p className="rounded-xl bg-nova/10 px-4 py-2.5 text-sm">
          {prestamo.devolucion_reportada_at
            ? `Avisó que la devolvió el ${formatLimaDateTime(prestamo.devolucion_reportada_at)}`
            : "Avisó que la devolvió."}
          {prestamo.nota_devolucion && <span className="mt-1 block text-white/75">“{prestamo.nota_devolucion}”</span>}
          <span className="mt-1 block text-white/60">Revisa el almacén: confirma solo si la herramienta está ahí.</span>
        </p>
      )}
      {!ACTIVE_LOAN.includes(prestamo.estado) && (
        <p className="text-xs text-white/45">
          {prestamo.devuelto_at && `Devuelta el ${formatLimaDateTime(prestamo.devuelto_at)}. `}
          {prestamo.comentario_directiva && `Comentario: ${prestamo.comentario_directiva}`}
        </p>
      )}

      {prestamo.estado === "solicitado" && (
        <div className="space-y-2">
          <input
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            placeholder="Comentario (obligatorio si rechazas): dónde recogerla, por qué no…"
            className={inputClass}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => revisarPrestamo(prestamo.id, true, comentario), "Préstamo aprobado")}
              className={primaryButton}
            >
              <Check className="h-4 w-4" /> Aprobar y entregar
            </button>
            <button
              type="button"
              disabled={busy || !comentario.trim()}
              onClick={() => run(() => revisarPrestamo(prestamo.id, false, comentario), "Solicitud rechazada")}
              className={secondaryButton}
            >
              <X className="h-4 w-4" /> Rechazar
            </button>
          </div>
        </div>
      )}

      {pendingReturn && (
        <div className="space-y-2 border-t border-white/10 pt-3">
          <p className="text-xs text-white/50">Al recibirla en el almacén, la herramienta queda:</p>
          <div className="flex flex-wrap gap-2">
            {(["disponible", "mantenimiento"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setQueda(option)}
                aria-pressed={queda === option}
                className={`rounded-lg border px-3 py-1.5 text-xs ${queda === option ? "border-white bg-white text-black" : "border-white/20 text-white/70"}`}
              >
                {option === "disponible" ? "En buen estado: disponible" : "Dañada: en mantenimiento"}
              </button>
            ))}
          </div>
          <input
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            placeholder="Comentario (opcional)"
            className={inputClass}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => confirmarDevolucion(prestamo.id, queda, comentario), "Devolución confirmada")}
            className={prestamo.estado === "devolucion_reportada" ? primaryButton : secondaryButton}
          >
            <Check className="h-4 w-4" /> {prestamo.estado === "devolucion_reportada" ? "Confirmar devolución" : "Recibí la herramienta"}
          </button>
        </div>
      )}
    </li>
  );
}

function LoansView() {
  const { toast } = useToast();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LoanFilter | null>(null);

  const load = useCallback(() => {
    listPrestamos()
      .then(setPrestamos)
      .catch((error) => toast({ title: "No se pudieron cargar los préstamos", description: errorText(error, ""), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.id, prestamos.filter((p) => inFilter(p, f.id)).length])),
    [prestamos],
  );
  // Se abre en lo primero que tenga pendientes.
  const active = filter ?? FILTERS.find((f) => f.id !== "historial" && counts[f.id] > 0)?.id ?? "solicitado";
  const visible = prestamos.filter((p) => inFilter(p, active));

  if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-white/60" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={active === f.id}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
              active === f.id ? "border-white bg-white text-black" : "border-white/20 text-white/70 hover:border-white/40"
            }`}
          >
            {f.label}
            {f.id !== "historial" && counts[f.id] > 0 && (
              <span className={`rounded-full px-1.5 text-[11px] ${active === f.id ? "bg-black text-white" : "bg-nova text-white"}`}>
                {counts[f.id]}
              </span>
            )}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState>{active === "historial" ? "Todavía no hay préstamos terminados." : "Nada por aquí. Todo al día."}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {visible.map((p) => (
            <LoanReview key={p.id} prestamo={p} onDone={load} />
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- inventario

const emptyTool: HerramientaInput = { codigo: "", nombre: "", categoria: "herramientas", descripcion: "", ubicacion: "" };

// Sugiere el siguiente código NOVA-### libre.
const nextCode = (tools: Herramienta[]) => {
  const numbers = tools
    .map((t) => /^NOVA-(\d+)$/.exec(t.codigo)?.[1])
    .filter(Boolean)
    .map(Number);
  return `NOVA-${String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(3, "0")}`;
};

function ToolForm({
  initial,
  suggested,
  onDone,
  onCancel,
}: {
  initial: Herramienta | null;
  suggested: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<HerramientaInput>(
    initial
      ? {
          codigo: initial.codigo,
          nombre: initial.nombre,
          categoria: initial.categoria,
          descripcion: initial.descripcion ?? "",
          ubicacion: initial.ubicacion ?? "",
        }
      : { ...emptyTool, codigo: suggested },
  );
  const [saving, setSaving] = useState(false);
  const set = (key: keyof HerramientaInput, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (initial) await updateHerramienta(initial.id, form);
      else await createHerramienta(form);
      toast({ title: initial ? "Herramienta actualizada" : "Herramienta agregada" });
      onDone();
    } catch (error) {
      toast({ title: "No se pudo guardar", description: errorText(error, "Revisa los datos."), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-white/15 p-5">
      <p className="font-semibold">{initial ? `Editar ${initial.codigo}` : "Nueva herramienta"}</p>
      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
        <label className="space-y-1">
          <span className="text-xs text-white/60">Código</span>
          <input
            value={form.codigo}
            onChange={(e) => set("codigo", e.target.value.toUpperCase())}
            required
            maxLength={24}
            className={`${inputClass} font-mono`}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-white/60">Nombre</span>
          <input
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            required
            maxLength={120}
            placeholder="Cautín 60 W"
            className={inputClass}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-white/60">Categoría</span>
          <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)} className={inputClass}>
            {CATEGORIAS_ALMACEN.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-white/60">Ubicación (opcional)</span>
          <input
            value={form.ubicacion ?? ""}
            onChange={(e) => set("ubicacion", e.target.value)}
            maxLength={120}
            placeholder="Estante 2, caja azul"
            className={inputClass}
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-white/60">Descripción (opcional)</span>
        <textarea
          value={form.descripcion ?? ""}
          onChange={(e) => set("descripcion", e.target.value)}
          maxLength={1000}
          rows={2}
          className={inputClass}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function InventoryView() {
  const { toast } = useToast();
  const [tools, setTools] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Herramienta | "nueva" | null>(null);

  const load = useCallback(() => {
    listHerramientas()
      .then(setTools)
      .catch((error) => toast({ title: "No se pudo cargar el inventario", description: errorText(error, ""), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const change = async (tool: Herramienta, estado: "disponible" | "mantenimiento" | "baja") => {
    try {
      await setHerramientaEstado(tool.id, estado);
      load();
    } catch (error) {
      toast({ title: "No se pudo cambiar", description: errorText(error, ""), variant: "destructive" });
    }
  };

  const remove = async (tool: Herramienta) => {
    if (
      !window.confirm(
        `¿Eliminar ${tool.codigo} · ${tool.nombre}? También se borra su historial de préstamos. Si solo ya no se usa, mejor dala de baja.`,
      )
    )
      return;
    try {
      await deleteHerramienta(tool.id);
      load();
    } catch (error) {
      toast({ title: "No se pudo eliminar", description: errorText(error, ""), variant: "destructive" });
    }
  };

  if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-white/60" />;

  const summary = (["disponible", "prestada", "mantenimiento", "baja"] as const).map((e) => ({
    e,
    n: tools.filter((t) => t.estado === e).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">
          {tools.length} herramienta(s) ·{" "}
          {summary
            .filter((s) => s.n > 0)
            .map((s) => `${s.n} ${HERRAMIENTA_ESTADO[s.e].label.toLowerCase()}`)
            .join(" · ")}
        </p>
        {editing === null && (
          <button type="button" onClick={() => setEditing("nueva")} className={primaryButton}>
            <Plus className="h-4 w-4" /> Agregar herramienta
          </button>
        )}
      </div>

      {editing !== null && (
        <ToolForm
          key={editing === "nueva" ? "nueva" : editing.id}
          initial={editing === "nueva" ? null : editing}
          suggested={nextCode(tools)}
          onCancel={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {tools.length === 0 ? (
        <EmptyState>Todavía no hay herramientas. Agrega la primera con su código.</EmptyState>
      ) : (
        <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
          {tools.map((tool) => (
            <li key={tool.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="w-24 shrink-0 font-mono text-xs text-white/80">{tool.codigo}</span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${tool.estado === "baja" ? "text-white/40 line-through" : ""}`}>
                  {tool.nombre}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-white/45">
                  {categoriaAlmacen(tool.categoria)}
                  {tool.ubicacion && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {tool.ubicacion}
                    </span>
                  )}
                </p>
              </div>
              <StatusPill tone={HERRAMIENTA_ESTADO[tool.estado].tone}>{HERRAMIENTA_ESTADO[tool.estado].label}</StatusPill>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing(tool)}
                  className="rounded-lg border border-white/15 p-2 text-white/70 hover:text-white"
                  title="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {tool.estado === "disponible" && (
                  <button
                    type="button"
                    onClick={() => change(tool, "mantenimiento")}
                    className="rounded-lg border border-white/15 px-2 py-1 text-xs text-white/70 hover:text-white"
                  >
                    A mantenimiento
                  </button>
                )}
                {(tool.estado === "mantenimiento" || tool.estado === "baja") && (
                  <button
                    type="button"
                    onClick={() => change(tool, "disponible")}
                    className="rounded-lg border border-white/15 px-2 py-1 text-xs text-white/70 hover:text-white"
                  >
                    Marcar disponible
                  </button>
                )}
                {tool.estado !== "baja" && tool.estado !== "prestada" && (
                  <button
                    type="button"
                    onClick={() => change(tool, "baja")}
                    className="rounded-lg border border-white/15 px-2 py-1 text-xs text-white/70 hover:text-white"
                  >
                    Dar de baja
                  </button>
                )}
                {tool.estado !== "prestada" && (
                  <button
                    type="button"
                    onClick={() => remove(tool)}
                    className="rounded-lg border border-white/15 p-2 text-white/50 hover:text-rose-300"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-white/40">
        Una herramienta prestada no se puede editar de estado ni eliminar: primero confirma su devolución en Préstamos.
      </p>
    </div>
  );
}

export function AdminAlmacen({ view }: { view: "prestamos" | "herramientas" }) {
  return view === "prestamos" ? <LoansView /> : <InventoryView />;
}
