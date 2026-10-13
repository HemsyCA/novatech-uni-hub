-- Inscripciones a Academia Nova desde el formulario público de /unete.
-- La directiva las revisa: al aprobar, el correo se agrega al grupo elegido
-- y desde ahí aplica el acceso temporal de academia_miembros.

CREATE TYPE public.inscripcion_estado AS ENUM ('pendiente', 'aprobada', 'rechazada');

CREATE TABLE public.academia_inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL CHECK (btrim(nombre) <> '' AND length(nombre) <= 120),
  email TEXT NOT NULL CHECK (email = lower(btrim(email)) AND email LIKE '%_@_%' AND length(email) <= 254),
  whatsapp TEXT NOT NULL CHECK (whatsapp ~ '^\+?[0-9]{9,15}$'),
  carrera TEXT NOT NULL CHECK (btrim(carrera) <> '' AND length(carrera) <= 120),
  ciclo SMALLINT NOT NULL CHECK (ciclo BETWEEN 1 AND 10),
  estado public.inscripcion_estado NOT NULL DEFAULT 'pendiente',
  grupo_id UUID REFERENCES public.academia_grupos(id) ON DELETE SET NULL,
  revisado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revisado_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Evita solicitudes duplicadas mientras una sigue pendiente.
CREATE UNIQUE INDEX academia_inscripciones_pendiente_email_idx
  ON public.academia_inscripciones (email) WHERE estado = 'pendiente';

ALTER TABLE public.academia_inscripciones ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede inscribirse, pero no puede autoaprobarse.
CREATE POLICY "Anyone can apply to academia" ON public.academia_inscripciones
  FOR INSERT WITH CHECK (
    estado = 'pendiente' AND grupo_id IS NULL AND revisado_por IS NULL AND revisado_at IS NULL
  );

CREATE POLICY "Staff can view academia applications" ON public.academia_inscripciones
  FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete academia applications" ON public.academia_inscripciones
  FOR DELETE USING (public.is_staff(auth.uid()));

-- Aprobar o rechazar en una sola transacción, para que nunca quede una
-- solicitud "aprobada" sin que la persona esté en el grupo.
CREATE OR REPLACE FUNCTION public.revisar_inscripcion(_id UUID, _aprobar BOOLEAN, _grupo_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _email TEXT;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Solo la directiva puede revisar inscripciones';
  END IF;

  SELECT email INTO _email
  FROM public.academia_inscripciones
  WHERE id = _id AND estado = 'pendiente'
  FOR UPDATE;

  IF _email IS NULL THEN
    RAISE EXCEPTION 'La inscripción no existe o ya fue revisada';
  END IF;

  IF _aprobar THEN
    IF _grupo_id IS NULL THEN
      RAISE EXCEPTION 'Elige un grupo para aprobar la inscripción';
    END IF;
    INSERT INTO public.academia_miembros (grupo_id, email)
    VALUES (_grupo_id, _email)
    ON CONFLICT (grupo_id, email) DO NOTHING;
  END IF;

  UPDATE public.academia_inscripciones
  SET estado = (CASE WHEN _aprobar THEN 'aprobada' ELSE 'rechazada' END)::public.inscripcion_estado,
      grupo_id = CASE WHEN _aprobar THEN _grupo_id END,
      revisado_por = auth.uid(),
      revisado_at = now()
  WHERE id = _id;
END;
$$;
