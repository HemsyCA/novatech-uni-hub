import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, Lock, MessageSquareWarning, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/components/account/account-context";
import { AuthorCredit } from "@/components/account/Conocimiento";
import { EmptyState, PageHeader, PageTabs, StatusPill, type StatusTone } from "@/components/account/ui";
import { FICHA_FIELDS } from "@/components/academia/ficha-fields";
import { inputClass, primaryButton, secondaryButton } from "@/lib/account/styles";
import { APORTE_ESTADO, CATEGORIAS, DISCIPLINAS, categoriaLabel, disciplinaLabel } from "@/lib/conocimientos";
import { formatDate } from "@/lib/academy-dates";
import {
  eliminarAporte,
  enviarAporte,
  listAportesPorRevisar,
  listConocimientos,
  revisarAporte,
  type Aporte,
  type AporteEstado,
  type AporteInput,
  type Conocimiento,
  type Disciplina,
} from "@/services/supabase/conocimientos";

const ESTADO_TONE: Record<AporteEstado, StatusTone> = { enviado: "neutral", observado: "attention", aprobado: "done" };
const MIN_FIELD = 10;

const emptyForm: AporteInput = { titulo: "", disciplina: null, categoria: "general", queria: "", hice: "", paso: "", aprendi: "", evidencia_url: "" };

function FichaView({ aporte }: { aporte: Pick<Aporte, "queria" | "hice" | "paso" | "aprendi"> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {FICHA_FIELDS.map((field) => (
        <div key={field.key} className="rounded-xl bg-white/[0.04] p-3">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
            <field.icon className="h-3.5 w-3.5" /> {field.label}
          </dt>
          <dd className="mt-1 whitespace-pre-line text-sm text-white/85">{aporte[field.key]}</dd>
        </div>
      ))}
    </dl>
  );
}

// Compartir un descubrimiento con la misma ficha de la bitácora de Academia Nova.
function AporteForm({ initial, onDone }: { initial: Aporte | null; onDone: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<AporteInput>(
    initial
      ? {
          titulo: initial.titulo,
          disciplina: initial.disciplina,
          categoria: initial.categoria,
          queria: initial.queria,
          hice: initial.hice,
          paso: initial.paso,
          aprendi: initial.aprendi,
          evidencia_url: initial.evidencia_url ?? "",
        }
      : emptyForm,
  );
  const [sending, setSending] = useState(false);
  const set = <K extends keyof AporteInput>(key: K, value: AporteInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.titulo.trim().length < 5) return toast({ title: "Ponle un título de al menos 5 letras", variant: "destructive" });
    const short = FICHA_FIELDS.find((f) => form[f.key].trim().length < MIN_FIELD);
    if (short) return toast({ title: `Cuéntanos un poco más en “${short.label}”`, variant: "destructive" });
    if (form.evidencia_url && !/^https?:\/\//i.test(form.evidencia_url.trim()))
      return toast({ title: "La evidencia debe ser un enlace que empiece con http:// o https://", variant: "destructive" });

    setSending(true);
    try {
      await enviarAporte(form, initial?.id ?? null);
      toast({ title: "¡Enviado al Área académica!", description: "Te avisaremos cuando lo revisen." });
      onDone();
    } catch (error) {
      toast({ title: "No se pudo enviar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-white/10 p-5 md:p-6">
      {initial?.estado === "observado" && initial.comentario && (
        <p className="rounded-xl border border-nova/50 bg-nova/10 px-4 py-3 text-sm">
          <span className="font-semibold">Observaciones del Área académica:</span> {initial.comentario}
        </p>
      )}
      <label className="block space-y-1.5">
        <span className="text-xs text-white/60">Título</span>
        <input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} maxLength={120} placeholder="Ej.: Calibrar los sensores QTR sin perder la línea" className={inputClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs text-white/60">Disciplina</span>
          <select value={form.disciplina ?? ""} onChange={(e) => set("disciplina", (e.target.value || null) as Disciplina | null)} className={inputClass}>
            <option value="">Sin disciplina</option>
            {DISCIPLINAS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-white/60">Robot o categoría</span>
          <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)} className={inputClass}>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {FICHA_FIELDS.map((field) => (
        <label key={field.key} className="block space-y-1.5">
          <span className="flex items-center justify-between gap-2 text-xs text-white/60">
            <span className="flex items-center gap-2 font-semibold text-white">
              <field.icon className="h-4 w-4" /> {field.label}
            </span>
            <span>
              {form[field.key].length}/{field.max}
            </span>
          </span>
          <textarea
            value={form[field.key]}
            onChange={(e) => set(field.key, e.target.value)}
            maxLength={field.max}
            rows={field.max > 300 ? 3 : 2}
            placeholder={field.hint}
            className={inputClass}
          />
        </label>
      ))}
      <label className="block space-y-1.5">
        <span className="text-xs text-white/60">Evidencia (opcional): foto, video, Wokwi, Onshape…</span>
        <input value={form.evidencia_url} onChange={(e) => set("evidencia_url", e.target.value)} placeholder="https://…" className={inputClass} />
      </label>
      <button type="submit" disabled={sending} className={`${primaryButton} w-full sm:w-auto`}>
        {sending && <Loader2 className="h-4 w-4 animate-spin" />}
        {initial ? "Corregir y reenviar" : "Enviar al Área académica"}
      </button>
    </form>
  );
}

function ReviewCard({ aporte, onReviewed }: { aporte: Aporte; onReviewed: () => void }) {
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState<"aprobar" | "observar" | null>(null);

  const review = async (aprobar: boolean) => {
    if (!aprobar && !comment.trim()) return toast({ title: "Escribe qué debe corregir", variant: "destructive" });
    setSaving(aprobar ? "aprobar" : "observar");
    try {
      await revisarAporte(aporte.id, aprobar, comment);
      toast({ title: aprobar ? "Publicado en Conocimientos Nova" : "Devuelto con observaciones" });
      onReviewed();
    } catch (error) {
      toast({ title: "No se pudo guardar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const meta = [categoriaLabel(aporte.categoria), disciplinaLabel(aporte.disciplina)].filter(Boolean).join(" · ");
  return (
    <article className="space-y-4 rounded-2xl border border-white/10 p-5">
      <header>
        <h3 className="font-semibold">{aporte.titulo}</h3>
        <p className="mt-0.5 text-xs text-white/50">
          {aporte.autor_nombre} · {meta} · enviado el {formatDate(aporte.updated_at.slice(0, 10))}
        </p>
      </header>
      <FichaView aporte={aporte} />
      {aporte.evidencia_url && (
        <a href={aporte.evidencia_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm underline underline-offset-4">
          Ver evidencia <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      <div className="space-y-3 border-t border-white/10 pt-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Comentario para el autor (obligatorio si lo devuelves)"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => review(true)} disabled={saving !== null} className={primaryButton}>
            {saving === "aprobar" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Aprobar y publicar
          </button>
          <button type="button" onClick={() => review(false)} disabled={saving !== null} className={secondaryButton}>
            {saving === "observar" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareWarning className="h-4 w-4" />}
            Devolver con observaciones
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Comunidad() {
  const { academy, member, aportes, reloadAportes, academicPending } = useAccount();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recientes, setRecientes] = useState<Conocimiento[]>([]);
  const [porRevisar, setPorRevisar] = useState<Aporte[]>([]);
  const [loading, setLoading] = useState(true);
  const canAccess = member.isMember || academy.isAcademic;
  const view = searchParams.get("vista") ?? "recientes";
  const editing = aportes.find((a) => a.id === searchParams.get("editar")) ?? null;

  const load = useCallback(() => {
    if (!canAccess) return;
    Promise.all([listConocimientos(), academy.isAcademic ? listAportesPorRevisar() : Promise.resolve([] as Aporte[])])
      .then(([conocimientos, pendientes]) => {
        setRecientes(conocimientos.filter((c) => c.aporte_id).slice(0, 20));
        setPorRevisar(pendientes);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [canAccess, academy.isAcademic]);

  useEffect(() => {
    load();
  }, [load]);

  if (member.loading) return <div className="container mx-auto px-4 pt-28 text-white/60 animate-pulse">Cargando…</div>;

  if (!canAccess)
    return (
      <main className="container mx-auto max-w-2xl px-4 pt-28">
        <EmptyState action={<Link to="/unete" className={secondaryButton}>Conoce cómo unirte</Link>}>
          <Lock className="mx-auto mb-3 h-6 w-6" />
          La Comunidad es la zona de los miembros del equipo.
        </EmptyState>
      </main>
    );

  const mine = aportes.length;
  const pendingCount = academicPending ?? porRevisar.length;

  const remove = async (aporte: Aporte) => {
    if (!window.confirm(`¿Eliminar “${aporte.titulo}”?`)) return;
    try {
      await eliminarAporte(aporte.id);
      reloadAportes();
    } catch {
      toast({ title: "No se pudo eliminar", variant: "destructive" });
    }
  };

  const content =
    view === "compartir" || editing ? (
      <div className="space-y-4">
        <Link to="/comunidad?vista=mios" replace className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <AporteForm
          key={editing?.id ?? "nuevo"}
          initial={editing}
          onDone={() => {
            reloadAportes();
            navigate("/comunidad?vista=mios", { replace: true });
          }}
        />
      </div>
    ) : view === "mios" ? (
      mine === 0 ? (
        <EmptyState action={<Link to="/comunidad?vista=compartir" className={secondaryButton}>Compartir mi primer descubrimiento</Link>}>
          Todavía no compartiste ningún descubrimiento.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {aportes.map((aporte) => (
            <li key={aporte.id} className="space-y-3 rounded-2xl border border-white/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{aporte.titulo}</p>
                  <p className="mt-0.5 text-xs text-white/50">Actualizado el {formatDate(aporte.updated_at.slice(0, 10))}</p>
                </div>
                <StatusPill tone={ESTADO_TONE[aporte.estado]}>{APORTE_ESTADO[aporte.estado]}</StatusPill>
              </div>
              {aporte.estado === "observado" && aporte.comentario && (
                <p className="rounded-xl border border-nova/50 bg-nova/10 px-4 py-3 text-sm">{aporte.comentario}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {aporte.estado === "aprobado" && aporte.conocimiento_id ? (
                  <Link to={`/conocimientos/${aporte.conocimiento_id}`} className={secondaryButton}>
                    Ver publicado
                  </Link>
                ) : (
                  <>
                    <Link to={`/comunidad?editar=${aporte.id}`} className={secondaryButton}>
                      <Pencil className="h-4 w-4" /> {aporte.estado === "observado" ? "Corregir" : "Editar"}
                    </Link>
                    <button type="button" onClick={() => remove(aporte)} className={`${secondaryButton} text-white/60`}>
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )
    ) : view === "revisar" && academy.isAcademic ? (
      porRevisar.length === 0 ? (
        <EmptyState>No hay aportes esperando revisión. ¡Todo al día!</EmptyState>
      ) : (
        <div className="space-y-4">
          {porRevisar.map((aporte) => (
            <ReviewCard
              key={aporte.id}
              aporte={aporte}
              onReviewed={() => {
                load();
                reloadAportes();
              }}
            />
          ))}
        </div>
      )
    ) : recientes.length === 0 ? (
      <EmptyState action={<Link to="/comunidad?vista=compartir" className={secondaryButton}>Compartir un descubrimiento</Link>}>
        Aún no hay descubrimientos publicados. ¡El primero puede ser el tuyo!
      </EmptyState>
    ) : (
      <ul className="grid gap-3 sm:grid-cols-2">
        {recientes.map((item) => (
          <li key={item.id}>
            <Link to={`/conocimientos/${item.id}`} className="flex h-full flex-col rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/30">
              <p className="text-xs text-white/40">
                {[categoriaLabel(item.categoria), disciplinaLabel(item.disciplina)].filter(Boolean).join(" · ")}
              </p>
              <h3 className="mt-1 font-semibold">{item.titulo}</h3>
              {item.descripcion && <p className="mt-2 line-clamp-3 flex-1 text-sm text-white/60">“{item.descripcion}”</p>}
              <p className="mt-3 text-xs">
                <AuthorCredit item={item} />
                <span className="text-white/40"> · {formatDate(item.publicado_at.slice(0, 10))}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    );

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-28">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-nova">Zona de miembros</p>
        <PageHeader
          title="Comunidad"
          description="Comparte lo que descubres. Si el Área académica lo aprueba, se publica en Conocimientos Nova con tu nombre."
          actions={
            view !== "compartir" && !editing ? (
              <Link to="/comunidad?vista=compartir" className={primaryButton}>
                <Plus className="h-4 w-4" /> Compartir un descubrimiento
              </Link>
            ) : undefined
          }
        />
      </div>

      {view !== "compartir" && !editing && (
        <PageTabs
          active={view}
          tabs={[
            { id: "recientes", label: "Recientes", to: "/comunidad" },
            { id: "mios", label: "Mis aportes", to: "/comunidad?vista=mios", count: mine },
            ...(academy.isAcademic ? [{ id: "revisar", label: "Por revisar", to: "/comunidad?vista=revisar", count: pendingCount }] : []),
          ]}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      ) : (
        content
      )}
    </main>
  );
}
