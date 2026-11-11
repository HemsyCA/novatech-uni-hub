import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listAllOrders, listOrderItems, updateOrderStatus } from "@/services/supabase/orders";
import type { Order, OrderItem } from "@/types/domain";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  preparing: "bg-cyan-500/20 text-cyan-400",
  delivered: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Confirmado",
  preparing: "Preparando",
  delivered: "Listo para recoger",
  cancelled: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  yape: "Yape",
  efectivo: "Efectivo",
  transferencia: "Transferencia",
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<(OrderItem & { products: { name: string } | null })[]>([]);
  const [payFor, setPayFor] = useState<Order | null>(null);
  const [method, setMethod] = useState("yape");
  const [savingPayment, setSavingPayment] = useState(false);
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

  const applyStatus = async (orderId: string, status: string, paymentMethod?: string) => {
    try {
      await updateOrderStatus(orderId, status as Order["status"], paymentMethod);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, ...(paymentMethod ? { payment_method: paymentMethod } : {}) } : o)),
      );
      toast({ title: "Pedido actualizado" });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el pedido",
        variant: "destructive",
      });
      return false;
    }
  };

  // Al confirmar el pago se pregunta cómo pagó, para que quede registrado.
  const handleStatusChange = (order: Order, status: string) => {
    if (status === "paid" && !order.payment_method) {
      setMethod("yape");
      setPayFor(order);
      return;
    }
    applyStatus(order.id, status);
  };

  const confirmPayment = async () => {
    if (!payFor) return;
    setSavingPayment(true);
    const ok = await applyStatus(payFor.id, "paid", method);
    setSavingPayment(false);
    if (ok) setPayFor(null);
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
                  {order.payment_method && <> · Pago: {paymentLabels[order.payment_method] ?? order.payment_method}</>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">S/ {Number(order.total).toFixed(2)}</span>
                <Select value={order.status} onValueChange={(v) => handleStatusChange(order, v)}>
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

      <Dialog open={payFor !== null} onOpenChange={(open) => !open && setPayFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cómo pagó?</DialogTitle>
            <DialogDescription>
              Pedido {payFor?.transaction_code} · S/ {Number(payFor?.total ?? 0).toFixed(2)}. Queda registrado junto con la fecha.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(paymentLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMethod(value)}
                aria-pressed={method === value}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  method === value ? "border-nova bg-nova text-white" : "border-white/20 hover:border-nova/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayFor(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmPayment} disabled={savingPayment}>
              {savingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
