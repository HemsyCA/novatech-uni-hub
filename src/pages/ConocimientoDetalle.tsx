import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useAccount } from "@/components/account/account-context";
import { AuthorCredit, TipoIcon } from "@/components/account/Conocimiento";
import { EmptyState } from "@/components/account/ui";
import { Markdown } from "@/components/academia/Markdown";
import { secondaryButton } from "@/lib/account/styles";
import { TIPOS, categoriaLabel, disciplinaLabel } from "@/lib/conocimientos";
import { formatDate } from "@/lib/academy-dates";
import { getConocimiento, type Conocimiento } from "@/services/supabase/conocimientos";

export default function ConocimientoDetalle() {
  const { id } = useParams();
  const { academy, member } = useAccount();
  const [item, setItem] = useState<Conocimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const canAccess = member.isMember || academy.isAcademic;

  useEffect(() => {
    if (!id || !canAccess) {
      setLoading(false);
      return;
    }
    getConocimiento(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id, canAccess]);

  const back = (
    <Link to="/conocimientos" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
      <ArrowLeft className="h-4 w-4" /> Conocimientos Nova
    </Link>
  );

  if (loading || member.loading)
    return (
      <div className="flex justify-center pt-32">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );

  if (!item)
    return (
      <main className="container mx-auto max-w-3xl space-y-6 px-4 pt-28">
        {back}
        <EmptyState>No encontramos este conocimiento, o no tienes acceso a él.</EmptyState>
      </main>
    );

  const meta = [TIPOS[item.tipo], categoriaLabel(item.categoria), disciplinaLabel(item.disciplina)].filter(Boolean).join(" · ");

  return (
    <main className="container mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-28">
      {back}
      <header className="space-y-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
          <TipoIcon tipo={item.tipo} className="h-4 w-4" /> {meta}
        </p>
        <h1 className="font-display text-2xl font-black leading-tight md:text-3xl">{item.titulo}</h1>
        <p className="text-sm">
          <AuthorCredit item={item} />
          {item.aporte_id && <span className="text-white/40"> · publicado el {formatDate(item.publicado_at.slice(0, 10))} desde la Comunidad</span>}
        </p>
      </header>

      {item.descripcion && <p className="text-lg leading-relaxed text-white/80">{item.descripcion}</p>}

      {item.contenido && (
        <section className="rounded-2xl border border-white/10 p-5">
          <Markdown>{item.contenido}</Markdown>
        </section>
      )}

      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
          Abrir el recurso <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </main>
  );
}
