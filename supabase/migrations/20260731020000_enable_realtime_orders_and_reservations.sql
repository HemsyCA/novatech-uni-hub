-- Necesario para que el tracker de pedidos/reservas se actualice en vivo
-- en el front sin recargar, vía supabase.channel(...).on('postgres_changes', ...).
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.print_reservations;
