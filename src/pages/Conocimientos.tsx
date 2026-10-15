import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/components/account/account-context";
import { EmptyState, PageHeader } from "@/components/account/ui";
import { AuthorCredit, TipoIcon } from "@/components/account/Conocimiento";
import { displayNameOf } from "@/hooks/use-session";
import { inputClass, primaryButton, secondaryButton } from "@/lib/account/styles";
import { CATEGORIAS, DISCIPLINAS, TIPOS, categoriaLabel, disciplinaLabel } from "@/lib/conocimientos";
import { formatDate } from "@/lib/academy-dates";
import {
  createConocimiento,
  listConocimientos,
  type Conocimiento,
  type ConocimientoInput,
  type ConocimientoTipo,
  type Disciplina,
} from "@/services/supabase/conocimientos";

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        selected ? "border-white bg-white text-black" : "border-white/15 text-white/70 hover:border-white/40"
      }`}
    >
      {children}
    </button>
  );
}

function AddConocimiento({ onAdded }: { onAdded: () => void }) {
  const { user } = useAccount();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ConocimientoInput>({ titulo: "", tipo: "guia", categoria: "general", disciplina: null, descripcion: "", url: "" });
  const set = <K extends keyof ConocimientoInput>(key: K, value: ConocimientoInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (form.url && !/^https?:\/\//i.test(form.url)) {
      toast({ title: "El enlace debe empezar con http:// o https://", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createConocimiento(form, { id: user.id, nombre: displayNameOf(user) });
      toast({ title: "Publicado en Conocimientos Nova" });
      setOpen(false);
      setForm({ titulo: "", tipo: "guia", categoria: "general", disciplina: null, descripcion: "", url: "" });
      onAdded();
    } catch (error) {
      toast({ title: "No se pudo publicar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={secondaryButton}>
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </DialogTrigger>
      <DialogContent className="nova-shell border-white/15 bg-black font-mono text-white">
        <DialogHeader>
          <DialogTitle className="font-display">Agregar a Conocimientos Nova</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Título" required minLength={4} className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.tipo} onChange={(e) => set("tipo", e.target.value as ConocimientoTipo)} className={inputClass} aria-label="Tipo">
              {(Object.keys(TIPOS) as ConocimientoTipo[])
                .filter((t) => t !== "descubrimiento")
                .map((t) => (
                  <option key={t} value={t}>
                    {TIPOS[t]}
                  </option>
                ))}
            </select>
            <select
              value={form.disciplina ?? ""}
              onChange={(e) => set("disciplina", (e.target.value || null) as Disciplina | null)}
              className={inputClass}
              aria-label="Disciplina"
            >
              <option value="">Sin disciplina</option>
              {DISCIPLINAS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)} className={inputClass} aria-label="Robot o categoría">
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            value={form.descripcion ?? ""}
            onChange={(e) => set("descripcion", e.target.value)}
            placeholder="¿De qué trata y para qué sirve?"
            rows={3}
            className={inputClass}
          />
          <input value={form.url ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="Enlace (Drive, GitHub, Onshape…)" className={inputClass} />
          <button type="submit" disabled={saving} className={`${primaryButton} w-full`}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Publicar
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Conocimientos() {
  const { academy, member } = useAccount();
  const [items, setItems] = useState<Conocimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [disciplina, setDisciplina] = useState<string>("todas");
  const [categoria, setCategoria] = useState<string>("todas");
  const canAccess = member.isMember || academy.isAcademic;
  const canCurate = academy.isStaff || academy.isAcademic;

  const load = () =>
    listConocimientos()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (canAccess) load();
    else setLoading(false);
  }, [canAccess]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        (disciplina === "todas" || item.disciplina === disciplina) &&
        (categoria === "todas" || item.categoria === categoria) &&
        (!q || `${item.titulo} ${item.descripcion ?? ""} ${item.autor_nombre ?? ""}`.toLowerCase().includes(q)),
    );
  }, [items, search, disciplina, categoria]);

  if (member.loading) return <div className="container mx-auto px-4 pt-28 text-white/60 animate-pulse">Cargando…</div>;

  if (!canAccess)
    return (
      <main className="container mx-auto max-w-2xl px-4 pt-28">
        <EmptyState action={<Link to="/unete" className={secondaryButton}>Conoce cómo unirte</Link>}>
          <Lock className="mx-auto mb-3 h-6 w-6" />
          Conocimientos Nova es la zona de los miembros del equipo.
        </EmptyState>
      </main>
    );

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-28">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-nova">Zona de miembros</p>
        <PageHeader
          title="Conocimientos Nova"
          description="Todo lo que el equipo fue aprendiendo, con el nombre de quien lo hizo."
          actions={canCurate ? <AddConocimiento onAdded={load} /> : undefined}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar: puente H, PID, sensores…"
          className={`${inputClass} pl-10`}
          aria-label="Buscar en Conocimientos Nova"
        />
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Disciplina">
          <Chip selected={disciplina === "todas"} onClick={() => setDisciplina("todas")}>
            Todas
          </Chip>
          {DISCIPLINAS.map((d) => (
            <Chip key={d.id} selected={disciplina === d.id} onClick={() => setDisciplina(d.id)}>
              {d.label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Robot o categoría">
          <Chip selected={categoria === "todas"} onClick={() => setCategoria("todas")}>
            Todos los robots
          </Chip>
          {CATEGORIAS.map((c) => (
            <Chip key={c.id} selected={categoria === c.id} onClick={() => setCategoria(c.id)}>
              {c.name}
            </Chip>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState action={<Link to="/comunidad?vista=compartir" className={secondaryButton}>Compartir un descubrimiento</Link>}>
          {items.length === 0 ? "Todavía no hay conocimientos publicados." : "No encontramos nada con esos filtros."}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
          {filtered.map((item) => {
            const meta = [TIPOS[item.tipo], categoriaLabel(item.categoria), disciplinaLabel(item.disciplina)].filter(Boolean).join(" · ");
            return (
              <li key={item.id}>
                <Link to={`/conocimientos/${item.id}`} className="flex gap-4 px-4 py-4 transition-colors hover:bg-white/[0.04]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15">
                    <TipoIcon tipo={item.tipo} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.titulo}</span>
                    {item.descripcion && <span className="mt-0.5 block line-clamp-1 text-sm text-white/50">{item.descripcion}</span>}
                    <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-white/40">
                      <span>{meta}</span>
                      <AuthorCredit item={item} />
                      {item.aporte_id && <span>{formatDate(item.publicado_at.slice(0, 10))}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
