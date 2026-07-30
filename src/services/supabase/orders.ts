import { supabase } from "@/integrations/supabase/client";
import type { Order, Product } from "@/types/domain";

export const listOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
};

export const createOrderWithItems = async (userId: string, cart: Array<Product & { quantity: number }>, total: number) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: userId, total })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = cart.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) throw itemsError;

  return order as Order;
};
