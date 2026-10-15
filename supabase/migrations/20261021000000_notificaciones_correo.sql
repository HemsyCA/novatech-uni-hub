-- Correos automáticos de la convocatoria, enviados por el Edge Function
-- `notify-email` desde la cuenta Gmail del equipo:
--   * inscripcion: se recibió la solicitud de /unete
--   * convocado:   la persona fue agregada a un grupo de Academia Nova
--   * miembro:     la persona pasó a ser miembro de Nova
--
-- El trigger solo manda el tipo y el id. La función vuelve a leer el registro
-- con la service role y anota el envío en notificaciones_correo antes de
-- mandarlo, así un mismo correo nunca sale dos veces y llamar a la función
-- desde afuera no permite enviar contenido arbitrario. Por eso no necesita
-- un secreto compartido como notify-whatsapp.

CREATE TABLE public.notificaciones_correo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('inscripcion', 'convocado', 'miembro')),
  ref_id UUID NOT NULL,
  email TEXT NOT NULL,
  enviado_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (tipo, ref_id)
);

ALTER TABLE public.notificaciones_correo ENABLE ROW LEVEL SECURITY;

-- Sirve para que la directiva revise si algún correo falló.
CREATE POLICY "Staff can view email notifications" ON public.notificaciones_correo
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_email_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://pftrdrnqzrrpjaxfnfts.supabase.co/functions/v1/notify-email',
    body := jsonb_build_object('tipo', TG_ARGV[0], 'id', NEW.id),
    headers := jsonb_build_object('Content-Type', 'application/json'),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS academia_inscripciones_notify_email ON public.academia_inscripciones;
CREATE TRIGGER academia_inscripciones_notify_email
  AFTER INSERT ON public.academia_inscripciones
  FOR EACH ROW EXECUTE FUNCTION public.notify_email_webhook('inscripcion');

DROP TRIGGER IF EXISTS academia_miembros_notify_email ON public.academia_miembros;
CREATE TRIGGER academia_miembros_notify_email
  AFTER INSERT ON public.academia_miembros
  FOR EACH ROW EXECUTE FUNCTION public.notify_email_webhook('convocado');

DROP TRIGGER IF EXISTS nova_miembros_notify_email ON public.nova_miembros;
CREATE TRIGGER nova_miembros_notify_email
  AFTER INSERT ON public.nova_miembros
  FOR EACH ROW EXECUTE FUNCTION public.notify_email_webhook('miembro');
