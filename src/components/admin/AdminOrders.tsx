import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listAllOrders, listOrderItems, updateOrderStatus } from "@/services/supabase/orders";
import type { Order, OrderItem } from "@/types/domain";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  delivered: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<(OrderItem & { products: { name: string } | null })[]>([]);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setOrders(await listAllOrders());
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los pedidos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = async (orderId: string) => {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);
    try {
      setItems(await listOrderItems(orderId));
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los items", variant: "destructive" });
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status as Order["status"]);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast({ title: "Pedido actualizado" });
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el pedido", variant: "destructive" });
    }
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No hay pedidos todavía</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="glass-card border-border/30">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <code className="text-xs font-mono text-emerald-400">{order.transaction_code}</code>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">S/ {Number(order.total).toFixed(2)}</span>
                <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                  <SelectTrigger className="w-36 h-8">
                    <SelectValue>
                      <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Package className="h-3 w-3" />
                  {expanded === order.id ? "Ocultar" : "Ver items"}
                </button>
              </div>
            </div>
            {expanded === order.id && (
              <div className="mt-3 pt-3 border-t border-border/30 space-y-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {item.quantity}x {item.products?.name ?? "Producto eliminado"}
                    </span>
                    <span>S/ {(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
