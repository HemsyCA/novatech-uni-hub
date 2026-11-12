import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, Bot, CircuitBoard, Loader2, Lock, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "@/components/account/account-context";
import { EmptyState, PageHeader } from "@/components/account/ui";
import { AuthorCredit, TipoIcon } from "@/components/account/Conocimiento";
import { displayNameOf } from "@/hooks/use-session";
import { inputClass, primaryButton, secondaryButton } from "@/lib/account/styles";
import { CATEGORIAS, DISCIPLINAS, TIPOS, categoriaLabel, disciplinaLabel } from "@/lib/conocimientos";
import { formatDate } from "@/lib/academy-dates";
import { PAGINAS, TIPOS as TIPOS_PAGINA, avance, relaciones, type TipoPagina } from "@/lib/conocimiento/modelo";
import { ICONOS } from "@/lib/conocimiento/iconos";
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

// Las puertas de entrada a la base de conocimiento: primero las categorías (el centro), luego el resto.
function Explora() {
  const otras: TipoPagina[] = ["placas", "robots", "temas", "componentes"];
  return (
    <section aria-labelledby="explora" className="space-y-4">
      <div>
        <h2 id="explora" className="font-display text-xl font-bold">
          Categorías
        </h2>
        <p className="text-sm text-white/55">Empieza por tu categoría: lo esencial de su electrónica, mecánica y programación, y nuestro mejor robot.</p>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {PAGINAS.categorias.map((c) => {
          const rel = relaciones(c);
          const { escritos, total } = avance(c);
          return (
            <li key={c.slug}>
              <Link
                to={`/conocimientos/categorias/${c.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 p-3 transition-colors hover:border-white/40 sm:p-4"
              >
                <span className="text-sm font-semibold leading-snug sm:text-base">{c.titulo}</span>
                <span className="mt-1 line-clamp-2 hidden flex-1 text-xs text-white/50 sm:block">{c.resumen}</span>
                <span className="flex-1 sm:hidden" />
                <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45">
                  <span className="inline-flex items-center gap-1">
                    <Bot className="h-3 w-3" /> {rel.robots.length}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CircuitBoard className="h-3 w-3" /> {rel.placas.length}
                  </span>
                  <span className="ml-auto">
                    {escritos}/{total}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {otras.map((tipo) => {
          const Icon = ICONOS[tipo];
          return (
            <li key={tipo}>
              <Link
                to={`/conocimientos/${tipo}`}
                className="group flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 transition-colors hover:border-white/40"
              >
                <Icon className="h-4 w-4 shrink-0 text-nova" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{TIPOS_PAGINA[tipo].plural}</span>
                  <span className="block text-xs text-white/40">{PAGINAS[tipo].length} páginas</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Conocimientos() {
  const { academy, member } = useAccount();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation();
  const [items, setItems] = useState<Conocimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [disciplina, setDisciplina] = useState<string>("todas");
  // Desde una categoría se llega con ?categoria=<id> para ver todo su material.
  const [categoria, setCategoria] = useState<string>(() => {
    const desdeUrl = searchParams.get("categoria");
    return desdeUrl && CATEGORIAS.some((c) => c.id === desdeUrl) ? desdeUrl : "todas";
  });
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

  useEffect(() => {
    if (!loading && hash === "#material") document.getElementById("material")?.scrollIntoView();
  }, [loading, hash]);

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
        <PageHeader title="Conocimientos Nova" description="Todo lo que el equipo sabe y fue aprendiendo, ordenado por categoría." />
      </div>

      <Explora />

      <div id="material" className="flex scroll-mt-28 flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-8">
        <div>
          <h2 className="font-display text-xl font-bold">Material y aportes</h2>
          <p className="text-sm text-white/55">Lo que el equipo fue compartiendo, con el nombre de quien lo hizo.</p>
        </div>
        {canCurate && <AddConocimiento onAdded={load} />}
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
