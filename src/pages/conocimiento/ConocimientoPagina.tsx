import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, ChevronRight, Lock, Plus, Trophy } from "lucide-react";
import { useAccount } from "@/components/account/account-context";
import { AuthorCredit } from "@/components/account/Conocimiento";
import { EmptyState } from "@/components/account/ui";
import { Markdown } from "@/components/academia/Markdown";
import { secondaryButton } from "@/lib/account/styles";
import { robotCategories } from "@/data/robots";
import {
  CLASE_LABEL,
  DISCIPLINA_LABEL,
  PAGINAS,
  TIPOS,
  avance,
  claseDe,
  disciplinaDe,
  esTipo,
  getPagina,
  nivelesDe,
  relaciones,
  rutaDe,
  type Apartado,
  type Disciplina,
  type Pagina,
  type TipoPagina,
} from "@/lib/conocimiento/modelo";
import { ICONOS } from "@/lib/conocimiento/iconos";
import { listConocimientos, type Conocimiento } from "@/services/supabase/conocimientos";

// Conocimientos Nova · las páginas de la base de conocimiento (categorías, placas, robots, temas y componentes).
// Las categorías son el centro: explican lo esencial y enlazan a las páginas que profundizan.

function Proximamente({ guia }: { guia: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Próximamente</p>
      <p className="mt-1 text-sm text-white/55">{guia}</p>
    </div>
  );
}

function Seccion({ id, numero, title, children }: { id: string; numero: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-3 flex items-baseline gap-3 font-display text-xl font-bold">
        <span className="font-mono text-sm text-nova">{numero}</span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Contenido({ apartado }: { apartado: Apartado }) {
  return apartado.body ? <Markdown>{apartado.body}</Markdown> : <Proximamente guia={apartado.guia} />;
}

// Tarjeta pequeña que lleva a otra página de la base.
function Enlace({ pagina, detalle }: { pagina: Pagina; detalle?: string }) {
  const Icon = ICONOS[pagina.tipo];
  const { escritos, total } = avance(pagina);
  return (
    <Link
      to={rutaDe(pagina)}
      className="group flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 transition-colors hover:border-white/35"
    >
      <Icon className="h-4 w-4 shrink-0 text-white/50" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{pagina.titulo}</span>
        <span className="block text-xs text-white/40">
          {detalle ?? TIPOS[pagina.tipo].label} · {escritos}/{total} apartados
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white" />
    </Link>
  );
}

// Un grupo de enlaces con su rótulo ("Placas que usa", "Para profundizar"…).
function Enlaces({ rotulo, paginas, columnas = "sm:grid-cols-2" }: { rotulo?: string; paginas: Pagina[]; columnas?: string }) {
  if (paginas.length === 0) return null;
  return (
    <div>
      {rotulo && <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">{rotulo}</p>}
      <div className={`grid grid-cols-1 gap-2 ${columnas}`}>
        {paginas.map((p) => (
          <Enlace
            key={`${p.tipo}-${p.slug}`}
            pagina={p}
            detalle={p.tipo === "robots" ? nivelesDe(p).join(" · ") || undefined : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// Lo publicado en la base de datos para esta categoría: los aportes aprobados de la Comunidad.
function AportesDeCategoria({ categoria }: { categoria: string }) {
  const [items, setItems] = useState<Conocimiento[] | null>(null);
  useEffect(() => {
    listConocimientos()
      .then((all) => setItems(all.filter((c) => c.categoria === categoria && c.aporte_id)))
      .catch(() => setItems([]));
  }, [categoria]);

  return (
    <div className="space-y-3">
      {items === null ? (
        <p className="text-sm text-white/40">Cargando aportes…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-white/55">
          Todavía no hay aportes publicados en esta categoría. ¿Mejoraste algo del diseño actual? El primero puede ser el tuyo.
        </p>
      ) : (
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={`/conocimientos/${item.id}`} className="block px-4 py-3 transition-colors hover:bg-white/[0.04]">
                <span className="block text-sm font-semibold">{item.titulo}</span>
                <span className="text-xs">
                  <AuthorCredit item={item} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Link to={`/comunidad?vista=compartir&categoria=${categoria}`} className={secondaryButton}>
          <Plus className="h-4 w-4" /> Proponer un aporte
        </Link>
        <Link
          to={`/conocimientos?categoria=${categoria}#material`}
          className="inline-flex items-center gap-1.5 px-2 py-2 text-sm text-white/55 hover:text-white"
        >
          Todo el material de la categoría <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- plantilla de categoría

// El orden sigue el camino de quien llega: lo esencial → el mejor robot → cómo aportar.
function PaginaCategoria({ pagina }: { pagina: Pagina }) {
  const rel = relaciones(pagina);
  const ap = (key: string) => pagina.apartados.find((a) => a.key === key)!;
  const por = (d: Disciplina) => [...rel.temas, ...rel.componentes].filter((p) => disciplinaDe(p) === d);
  const otrosRobots = rel.robots.filter((r) => r.slug !== rel.insignia?.slug);

  const disciplina = (key: Disciplina, extra?: ReactNode) => ({
    id: key,
    title: ap(key).title,
    body: (
      <>
        <Contenido apartado={ap(key)} />
        {extra}
        <Enlaces rotulo="Para profundizar" paginas={por(key)} />
      </>
    ),
  });

  const secciones: { id: string; title: string; body: ReactNode }[] = [
    { id: "esencia", title: ap("esencia").title, body: <Contenido apartado={ap("esencia")} /> },
    disciplina(
      "electronica",
      rel.placas.length ? (
        <Enlaces rotulo={rel.placas.length > 1 ? "Placas que usa" : "Placa que usa"} paginas={rel.placas} />
      ) : (
        <p className="text-xs text-white/40">Placa: por definir.</p>
      ),
    ),
    disciplina("mecanica"),
    disciplina("programacion"),
    {
      id: "insignia",
      title: ap("insignia").title,
      body: (
        <>
          {rel.insignia ? (
            <Link
              to={rutaDe(rel.insignia)}
              className="group flex items-center gap-4 rounded-2xl border border-nova/50 bg-nova/10 p-5 transition-colors hover:bg-nova/15"
            >
              <Trophy className="h-8 w-8 shrink-0 text-nova" />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-bold">{rel.insignia.titulo}</span>
                <span className="block text-sm text-white/60">Su ficha completa: cómo está hecho, cómo replicarlo y cómo mejorarlo.</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <Proximamente guia="Por definir: cuál es nuestro robot más competitivo en esta categoría, para que se pueda replicar y mejorar." />
          )}
          {ap("insignia").body && <Markdown>{ap("insignia").body}</Markdown>}
          {otrosRobots.length > 0 ? (
            <Enlaces
              rotulo={rel.insignia ? "Otros robots del equipo" : "Robots del equipo"}
              paginas={otrosRobots}
              columnas="sm:grid-cols-2 lg:grid-cols-3"
            />
          ) : (
            !rel.insignia && <p className="text-xs text-white/40">Todavía no hay robots registrados en esta categoría.</p>
          )}
        </>
      ),
    },
    {
      id: "ideas",
      title: ap("ideas").title,
      body: (
        <>
          <Contenido apartado={ap("ideas")} />
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">{ap("evaluacion").title}</p>
            <Contenido apartado={ap("evaluacion")} />
          </div>
        </>
      ),
    },
    { id: "aportes", title: "Aportes de la comunidad", body: <AportesDeCategoria categoria={pagina.slug} /> },
  ];
  return <Estructura pagina={pagina} secciones={secciones} />;
}

// ---------------------------------------------------------------- plantilla del resto

function PaginaGeneral({ pagina }: { pagina: Pagina }) {
  const rel = relaciones(pagina);
  const secciones: { id: string; title: string; body: ReactNode }[] = pagina.apartados.map((a) => ({
    id: a.key,
    title: a.title,
    body: <Contenido apartado={a} />,
  }));

  // "Se usa en": las páginas que la enlazan (se calcula solo, nadie lo escribe dos veces).
  if (pagina.tipo !== "robots") {
    const usadoEn = [...rel.categorias, ...rel.placas, ...rel.robots];
    secciones.push({
      id: "se-usa-en",
      title: "Se usa en",
      body: usadoEn.length ? (
        <Enlaces paginas={usadoEn} />
      ) : (
        <p className="text-sm text-white/45">Todavía no se enlazó con ninguna categoría.</p>
      ),
    });
  }
  const relacionadas = [...(pagina.tipo === "robots" ? [...rel.categorias, ...rel.placas] : []), ...rel.componentes, ...rel.temas];
  if (relacionadas.length) secciones.push({ id: "relacionado", title: "Relacionado", body: <Enlaces paginas={relacionadas} /> });
  return <Estructura pagina={pagina} secciones={secciones} />;
}

// ---------------------------------------------------------------- marco común

function Estructura({ pagina, secciones }: { pagina: Pagina; secciones: { id: string; title: string; body: ReactNode }[] }) {
  const Icon = ICONOS[pagina.tipo];
  const disciplina = disciplinaDe(pagina);
  const clase = claseDe(pagina);
  const { escritos, total } = avance(pagina);
  const etiquetas = [
    TIPOS[pagina.tipo].label,
    disciplina && DISCIPLINA_LABEL[disciplina],
    clase && CLASE_LABEL[clase],
    ...(pagina.tipo === "robots" ? nivelesDe(pagina) : []),
  ].filter(Boolean) as string[];

  return (
    <main className="container mx-auto max-w-6xl px-4 pb-20 pt-28">
      <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-white/50">
        <Link to="/conocimientos" className="hover:text-white">
          Conocimientos
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/conocimientos/${pagina.tipo}`} className="hover:text-white">
          {TIPOS[pagina.tipo].plural}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white/80">{pagina.titulo}</span>
      </nav>

      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="h-4 w-4 text-nova" />
          {etiquetas.map((e) => (
            <span key={e} className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-white/70">
              {e}
            </span>
          ))}
        </div>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tight md:text-4xl">{pagina.titulo}</h1>
        {pagina.resumen && <p className="mt-2 text-white/60">{pagina.resumen}</p>}
        <p className="mt-3 text-xs text-white/40">
          {escritos === 0 ? "En construcción: por ahora verás su estructura." : `${escritos} de ${total} apartados escritos.`}
        </p>
      </header>

      {/* En el celular, el índice va arriba como una fila que se desliza. */}
      <nav aria-label="En esta página" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {secciones.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70">
            <span className="mr-1.5 font-mono text-white/35">{i + 1}</span>
            {s.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden self-start lg:sticky lg:top-28 lg:block">
          <p className="px-3 pb-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/40">En esta página</p>
          <ol className="space-y-0.5">
            {secciones.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex gap-2 rounded-lg px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span className="font-mono text-xs text-white/35">{i + 1}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>
        <div className="min-w-0 space-y-10">
          {secciones.map((s, i) => (
            <Seccion key={s.id} id={s.id} numero={i + 1} title={s.title}>
              {s.body}
            </Seccion>
          ))}
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------- índices

function Indice({ tipo }: { tipo: TipoPagina }) {
  const paginas = PAGINAS[tipo];
  const Icon = ICONOS[tipo];

  // Los robots se agrupan por categoría; los temas y componentes, por disciplina.
  const grupos: { titulo: string; paginas: Pagina[] }[] =
    tipo === "robots"
      ? robotCategories
          .map((c) => ({ titulo: c.name, paginas: paginas.filter((p) => relaciones(p).categorias.some((x) => x.slug === c.id)) }))
          .filter((g) => g.paginas.length)
      : tipo === "temas" || tipo === "componentes"
        ? (["electronica", "mecanica", "programacion"] as Disciplina[])
            .map((d) => ({ titulo: DISCIPLINA_LABEL[d], paginas: paginas.filter((p) => disciplinaDe(p) === d) }))
            .filter((g) => g.paginas.length)
        : [{ titulo: "", paginas }];

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 pb-20 pt-28">
      <nav aria-label="Ruta" className="flex items-center gap-1 text-xs text-white/50">
        <Link to="/conocimientos" className="hover:text-white">
          Conocimientos
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white/80">{TIPOS[tipo].plural}</span>
      </nav>
      <header>
        <h1 className="flex items-center gap-3 font-display text-3xl font-black tracking-tight">
          <Icon className="h-7 w-7 text-nova" /> {TIPOS[tipo].plural}
        </h1>
        <p className="mt-2 text-white/60">{TIPOS[tipo].descripcion}</p>
      </header>
      {paginas.length === 0 ? (
        <EmptyState>Todavía no hay páginas de este tipo.</EmptyState>
      ) : (
        grupos.map((g) => (
          <section key={g.titulo || "todas"} className="space-y-2">
            {g.titulo && <h2 className="text-xs font-semibold uppercase tracking-widest text-white/45">{g.titulo}</h2>}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {g.paginas.map((p) => (
                <Enlace
                  key={p.slug}
                  pagina={p}
                  detalle={
                    tipo === "robots"
                      ? nivelesDe(p).join(" · ")
                      : tipo === "placas"
                        ? relaciones(p)
                            .categorias.map((c) => c.titulo)
                            .join(", ") || "Sin categoría"
                        : undefined
                  }
                />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}

export default function ConocimientoPagina({ tipo: tipoFijo }: { tipo?: TipoPagina }) {
  const { member, academy } = useAccount();
  const params = useParams();
  const tipo = tipoFijo ?? params.tipo ?? "";
  const canAccess = member.isMember || academy.isAcademic;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tipo, params.slug]);

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
          Conocimientos Nova es la zona de los miembros del equipo.
        </EmptyState>
      </main>
    );

  if (!esTipo(tipo)) return <Navigate to="/conocimientos" replace />;
  if (!params.slug) return <Indice tipo={tipo} />;
  const pagina = getPagina(tipo, params.slug);
  if (!pagina) return <Navigate to={`/conocimientos/${tipo}`} replace />;
  return pagina.tipo === "categorias" ? <PaginaCategoria pagina={pagina} /> : <PaginaGeneral pagina={pagina} />;
}
