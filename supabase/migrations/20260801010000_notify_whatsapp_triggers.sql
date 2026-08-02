-- Dispara el Edge Function `notify-whatsapp` cada vez que se crea un pedido
-- o una reserva de impresión 3D, para avisarle a la directiva por WhatsApp.
-- Usa pg_net (HTTP asíncrono) en vez de supabase_functions.http_request
-- porque ese schema solo se aprovisiona al crear un webhook desde el
-- dashboard, y no existe todavía en este proyecto.
--
-- El header x-webhook-secret de abajo es un PLACEHOLDER a propósito: el valor
-- real solo se aplicó directo en la base de producción (no queda en git),
-- y debe coincidir con el secreto WEBHOOK_SECRET configurado en
-- Supabase Dashboard → Edge Functions → notify-whatsapp → Secrets.

create extension if not exists pg_net;

create or replace function public.notify_whatsapp_webhook()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://pftrdrnqzrrpjaxfnfts.supabase.co/functions/v1/notify-whatsapp',
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', to_jsonb(NEW)
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'REPLACE_WITH_WEBHOOK_SECRET'
    ),
    timeout_milliseconds := 5000
  );
  return NEW;
end;
$$;

drop trigger if exists orders_notify_whatsapp on public.orders;
create trigger orders_notify_whatsapp
  after insert on public.orders
  for each row execute function public.notify_whatsapp_webhook();

drop trigger if exists print_reservations_notify_whatsapp on public.print_reservations;
create trigger print_reservations_notify_whatsapp
  after insert on public.print_reservations
  for each row execute function public.notify_whatsapp_webhook();
