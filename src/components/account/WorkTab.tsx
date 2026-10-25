import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export interface WorkItem {
  to: string;
  count: number;
  label: string;
}

interface Props {
  items: WorkItem[];
  total: number;
  // Solo la directiva tiene panel; el Área académica revisa desde la Comunidad.
  adminTo?: string;
}

// "Mi trabajo": lo que esperan revisar de ti como directiva o Área académica.
export function WorkTab({ items, total, adminTo }: Props) {
  const pending = items.filter((item) => item.count > 0);
  const clear = items.filter((item) => item.count === 0);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">
          {total > 0 ? `${total} pendiente(s) esperan tu revisión.` : "No tienes nada por revisar. Todo está al día."}
        </p>
        {adminTo && (
          <Link
            to={adminTo}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-white/50 hover:bg-white/5"
          >
            <ShieldCheck className="h-4 w-4" />
            Abrir panel de directiva
          </Link>
        )}
      </div>

      {pending.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="group flex flex-col rounded-xl border border-nova bg-nova/10 p-5 transition-colors hover:bg-nova/20"
            >
              <span className="font-mono text-5xl font-light">{item.count}</span>
              <span className="mt-3 text-sm text-white/85">{item.label}</span>
              <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-nova">
                Revisar
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-white/15 px-5 py-6 text-sm text-white/60">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-white/40" />
          Cuando llegue algo nuevo (un pedido, una reserva, una inscripción) aparecerá aquí.
        </div>
      )}

      {pending.length > 0 && clear.length > 0 && (
        <p className="mt-4 text-xs text-white/40">Al día: {clear.map((item) => item.label.toLowerCase()).join(", ")}.</p>
      )}
    </section>
  );
}
