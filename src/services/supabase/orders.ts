import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderItem, Product } from "@/types/domain";

export const listOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
};

export const listAllOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
};

export const listOrderItems = async (orderId: string) => {
  const { data, error } = await supabase
    .from("order_items")
    .select("*, products(name)")
    .eq("order_id", orderId);

  if (error) throw error;
  return (data ?? []) as (OrderItem & { products: { name: string } | null })[];
};

export const updateOrderStatus = async (orderId: string, status: Order["status"], paymentMethod?: string) => {
  const { error } = await supabase
    .from("orders")
    .update({ status, ...(paymentMethod ? { payment_method: paymentMethod } : {}) })
    .eq("id", orderId);
  // El mensaje de la base explica el motivo (por ejemplo, que ya no hay stock para reabrir un pedido).
  if (error) throw new Error(error.message);
};

// El pedido se crea en la base con crear_pedido(): valida el stock, toma los precios reales
// y descuenta todo de una vez. Si algo falla, no queda nada a medias.
export const createOrderWithItems = async (cart: Array<Pick<Product, "id"> & { quantity: number }>) => {
  const items = cart.map((item) => ({ product_id: item.id, quantity: item.quantity }));
  const { data, error } = await supabase.rpc("crear_pedido", { _items: items });

  if (error) throw new Error(error.message);
  return data as unknown as Order;
};
