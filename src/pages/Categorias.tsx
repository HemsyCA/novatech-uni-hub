import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bot, ChevronRight, CircuitBoard, Lock } from "lucide-react";
import { useAccount } from "@/components/account/account-context";
import { EmptyState, PageHeader } from "@/components/account/ui";
import { secondaryButton } from "@/lib/account/styles";
import { apartadosDe, categoriasMiembros, contarApartados, type Apartado } from "@/data/categorias-miembros";
import { robots, type RobotCategoryId } from "@/data/robots";

// Zona de miembros · Categorías: todo lo de cada tipo de robot en un solo lugar.
// Por ahora solo está la estructura (los rótulos); el contenido se irá agregando en cada apartado.

function Pendiente() {
  return <span className="shrink-0 rounded-full border border-dashed border-white/20 px-2 py-0.5 text-[10px] text-white/40">Próximamente</span>;
}

// Un apartado y sus subapartados, numerados como un índice: 3, 3.1, 3.1.1…
function ApartadoItem({ apartado, number, depth }: { apartado: Apartado; number: string; depth: number }) {
  const children = apartado.children ?? [];
  return (
    <li id={apartado.id} className="scroll-mt-28">
      <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${depth === 1 ? "bg-white/[0.03]" : ""}`}>
        <span className="min-w-[2rem] shrink-0 font-mono text-xs text-white/40 sm:w-12">{number}</span>
        <span className="min-w-0 flex-1">
          <span className={`block ${depth === 1 ? "font-semibold" : "text-sm text-white/85"}`}>{apartado.title}</span>
          {apartado.hint && <span className="block text-xs text-white/40">{apartado.hint}</span>}
        </span>
        {children.length === 0 && !apartado.hint?.startsWith("Todavía") && <Pendiente />}
      </div>
      {children.length > 0 && (
        <ol className="ml-3 border-l border-white/10 pl-2 sm:ml-6 sm:pl-3">
          {children.map((child, i) => (
            <ApartadoItem key={child.id} apartado={child} number={`${number}.${i + 1}`} depth={depth + 1} />
          ))}
        </ol>
      )}
    </li>
  );
}

function CategoriaDetalle({ id }: { id: RobotCategoryId }) {
  const categoria = categoriasMiembros.find((c) => c.id === id)!;
  const apartados = apartadosDe(id);

  return (
    <main className="container mx-auto max-w-6xl px-4 pb-20 pt-28">
      <nav aria-label="Ruta" className="mb-6 flex items-center gap-1 text-xs text-white/50">
        <Link to="/categorias" className="hover:text-white">
          Categorías
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white/80">{categoria.name}</span>
      </nav>

      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Zona de miembros · Categoría</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">{categoria.name}</h1>
        <p className="mt-2 text-white/60">{categoria.description}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Índice de la categoría */}
        <aside className="hidden self-start lg:sticky lg:top-28 lg:block">
          <p className="px-3 pb-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/40">En esta categoría</p>
          <ol className="space-y-0.5">
            {apartados.map((a, i) => (
              <li key={a.id}>
                <a href={`#${a.id}`} className="flex gap-2 rounded-lg px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white">
                  <span className="font-mono text-xs text-white/35">{i + 1}</span>
                  {a.title}
                </a>
              </li>
            ))}
          </ol>
          <Link to="/categorias" className="mt-6 inline-flex items-center gap-1.5 px-3 text-xs text-white/50 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Todas las categorías
          </Link>
        </aside>

        <div className="min-w-0 space-y-8">
          <p className="rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-white/55">
            Estamos preparando el contenido de esta categoría. Por ahora verás la estructura: cada apartado se irá completando.
          </p>
          {apartados.map((apartado, i) => (
            <section key={apartado.id} id={apartado.id} className="scroll-mt-28">
              <h2 className="mb-3 flex items-baseline gap-3 font-display text-xl font-bold">
                <span className="font-mono text-sm text-nova">{i + 1}</span>
                {apartado.title}
              </h2>
              {apartado.hint && (apartado.children ?? []).length === 0 ? (
                <p className="rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-white/45">{apartado.hint}</p>
              ) : (
                <ol className="space-y-1">
                  {(apartado.children ?? []).map((child, j) => (
                    <ApartadoItem key={child.id} apartado={child} number={`${i + 1}.${j + 1}`} depth={1} />
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function CategoriasHub() {
  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 pb-20 pt-28">
      <PageHeader title="Categorías" description="Todo lo de cada tipo de robot del equipo: la categoría, nuestros robots, sus placas, su mecánica y su código." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categoriasMiembros.map((categoria) => {
          const apartados = apartadosDe(categoria.id);
          const nuestros = robots.filter((r) => r.categories.includes(categoria.id)).length;
          const placas = apartados.find((a) => a.id === "electronica")?.children?.find((c) => c.id === "placas")?.children?.length ?? 0;
          return (
            <li key={categoria.id}>
              <Link
                to={`/categorias/${categoria.id}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/40"
              >
                <p className="font-semibold">{categoria.name}</p>
                <p className="mt-1 flex-1 text-sm text-white/55">{categoria.description}</p>
                <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                  <span className="inline-flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5" /> {nuestros} robot(s)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CircuitBoard className="h-3.5 w-3.5" /> {placas} placa(s)
                  </span>
                  <span>{contarApartados(apartados)} apartados</span>
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 group-hover:text-white">
                  Abrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default function Categorias() {
  const { member } = useAccount();
  const { id } = useParams();

  if (member.loading) return <div className="container mx-auto px-4 pt-28 text-white/60 animate-pulse">Cargando…</div>;

  if (!member.isMember)
    return (
      <main className="container mx-auto max-w-2xl px-4 pt-28">
        <EmptyState action={<Link to="/unete" className={secondaryButton}>Conoce cómo unirte</Link>}>
          <Lock className="mx-auto mb-3 h-6 w-6" />
          Las categorías son para los miembros del equipo.
        </EmptyState>
      </main>
    );

  if (id) {
    if (!categoriasMiembros.some((c) => c.id === id)) return <Navigate to="/categorias" replace />;
    return <CategoriaDetalle id={id as RobotCategoryId} />;
  }
  return <CategoriasHub />;
}
