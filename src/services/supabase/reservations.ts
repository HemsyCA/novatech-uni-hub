import { supabase } from "@/integrations/supabase/client";
import type { Printer, Reservation } from "@/types/domain";

export const listPrinters = async () => {
  const { data, error } = await supabase
    .from("printers")
    .select("*")
    .eq("is_available", true);

  if (error) throw error;
  return (data ?? []) as Printer[];
};

export const listUserReservations = async (userId: string) => {
  const { data, error } = await supabase
    .from("print_reservations")
    .select("*, printers(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Reservation[];
};

export const createReservation = async (reservationData: Record<string, unknown>) => {
  const { data, error } = await supabase.from("print_reservations").insert(reservationData).select().single();

  if (error) throw error;
  return data;
};
