import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getIndicadores, type Indicadores } from "@/services/supabase/inventario";

const orderLabels: Record<string, string> = {
  pending: "Pendientes",
  paid: "Confirmados",
  preparing: "Preparando",
  delivered: "Entregados",
  cancelled: "Cancelados",
};

const reservationLabels: Record<string, string> = {
  pending: "Pendientes",
  approved: "Aprobadas",
  in_progress: "En curso",
  completed: "Completadas",
  cancelled: "Canceladas",
};

const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const monthLabel = (key: string) => monthNames[Number(key.slice(5, 7)) - 1] ?? key;
const soles = (value: number) => `S/ ${Number(value).toFixed(2)}`;

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="font-display text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-white/60">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-white/40">{hint}</p>}
    </div>
  );
}

function Panel({ title, children, to, toLabel }: { title: string; children: ReactNode; to?: string; toLabel?: string }) {
  return (
    <section className="rounded-xl border border-white/10 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest">{title}</h3>
        {to && (
          <Link to={to} className="text-xs text-nova hover:underline">
            {toLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Counts({ data, labels }: { data: Record<string, number>; labels: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(labels).map(([key, label]) => (
        <span key={key} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75">
          {label} <span className="font-semibold text-white">{data[key] ?? 0}</span>
        </span>
      ))}
    </div>
  );
}

export function AdminIndicadores() {
  const [data, setData] = useState<Indicadores | null>(null);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getIndicadores()
      .then(setData)
      .catch(() => {
        setError(true);
        toast({ title: "Error", description: "No se pudieron cargar los indicadores", variant: "destructive" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p className="py-8 text-center text-muted-foreground">No se pudieron cargar los indicadores.</p>;
  if (!data) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />;

  const maxSales = Math.max(1, ...data.ventas_por_mes.map((m) => Number(m.total)));
  const alerts = data.stock_bajo.length + data.material_bajo.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ventas del mes" value={soles(data.ventas_mes)} hint="Pedidos confirmados, en preparación o entregados" />
        <Stat label="Pedidos del mes" value={String(data.pedidos_mes)} hint="Sin contar los cancelados" />
        <Stat
          label="Tiempo de entrega"
          value={data.horas_promedio_entrega === null ? "—" : `${data.horas_promedio_entrega} h`}
          hint="Promedio desde el pedido hasta su entrega"
        />
        <Stat label="Alertas de stock" value={String(alerts)} hint={alerts === 0 ? "Todo en orden" : "Productos o materiales bajos"} />
      </div>

      <Panel title="Ventas de los últimos 6 meses">
        <div className="flex h-36 items-end gap-3">
          {data.ventas_por_mes.map((month) => {
            const total = Number(month.total);
            return (
              <div key={month.mes} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[11px] text-white/60">{total > 0 ? soles(total) : ""}</span>
                <div
                  className="w-full rounded-t-md bg-nova"
                  style={{ height: `${Math.max(total > 0 ? 6 : 2, (total / maxSales) * 100)}px`, opacity: total > 0 ? 1 : 0.25 }}
                />
                <span className="text-[11px] uppercase text-white/50">{monthLabel(month.mes)}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Pedidos de la tienda" to="/admin/pedidos" toLabel="Ver pedidos">
          <Counts data={data.pedidos_por_estado} labels={orderLabels} />
        </Panel>
        <Panel title="Reservas de impresión 3D" to="/admin/reservas" toLabel="Ver reservas">
          <Counts data={data.reservas_por_estado} labels={reservationLabels} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Productos con stock bajo" to="/admin/productos" toLabel="Ir a productos">
          {data.stock_bajo.length === 0 ? (
            <p className="text-sm text-white/50">Ningún producto está por agotarse.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {data.stock_bajo.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${product.stock === 0 ? "text-red-400" : "text-amber-400"}`} />
                    {product.name}
                  </span>
                  <span className="text-white/60">
                    {product.stock === 0 ? "Agotado" : `${product.stock} (mín. ${product.min_stock})`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Material de impresión bajo" to="/admin/materiales" toLabel="Ir a materiales">
          {data.material_bajo.length === 0 ? (
            <p className="text-sm text-white/50">Hay material suficiente.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {data.material_bajo.map((material) => (
                <li key={material.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${Number(material.stock_kg) === 0 ? "text-red-400" : "text-amber-400"}`} />
                    {material.name}
                  </span>
                  <span className="text-white/60">
                    {Number(material.stock_kg)} kg (mín. {Number(material.min_stock_kg)})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Lo más vendido (últimos 90 días)">
        {data.top_productos.length === 0 ? (
          <p className="text-sm text-white/50">Todavía no hay ventas en este periodo.</p>
        ) : (
          <ol className="divide-y divide-white/10">
            {data.top_productos.map((product, index) => (
              <li key={product.name} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  <span className="mr-3 font-display font-black text-nova">{index + 1}</span>
                  {product.name}
                </span>
                <span className="text-white/60">{product.unidades} u.</span>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}
