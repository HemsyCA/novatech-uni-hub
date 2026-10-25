import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export interface HoyCard {
  slug: string;
  // Por defecto abre la sección del panel; algunas viven en otra pantalla.
  to?: string;
  label: string;
  // null mientras se cuentan o si el recuento falló.
  count: number | null;
}

export interface HoyGroup {
  title: string;
  links: { slug: string; label: string; to?: string }[];
}

interface Props {
  cards: HoyCard[];
  groups: HoyGroup[];
}

export function AdminHoy({ cards, groups }: Props) {
  const allClear = cards.every((c) => c.count === 0);

  return (
    <div className="space-y-12">
      <div>
        {allClear && <p className="mb-4 text-sm text-white/60">No tienes nada por revisar. Todo está al día.</p>}
        <div className={`grid grid-cols-2 gap-3 ${cards.length > 4 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {cards.map((card) => {
            const hot = (card.count ?? 0) > 0;
            return (
              <Link
                key={card.slug}
                to={card.to ?? `/admin/${card.slug}`}
                className={`group flex flex-col rounded-xl border p-4 transition-colors ${
                  hot ? "border-nova bg-nova/10 hover:bg-nova/20" : "border-white/15 hover:border-white/40"
                }`}
              >
                <span className={`font-mono text-4xl font-light ${hot ? "text-white" : "text-white/40"}`}>
                  {card.count ?? "–"}
                </span>
                <span className="mt-3 text-sm text-white/80">{card.label}</span>
                <span
                  className={`mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] ${
                    hot ? "text-nova" : "text-white/40"
                  }`}
                >
                  {hot ? "Revisar" : "Abrir"}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Todas las secciones</h2>
        <div className="mt-4 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title} className="border-t border-white/15 pt-4">
              <h3 className="font-sans text-sm font-medium text-white">{group.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {group.links.map((link) => (
                  <li key={link.slug}>
                    <Link to={link.to ?? `/admin/${link.slug}`} className="text-sm text-white/60 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
