-- Academia Nova: entrega de la tarea final (Panel de control Nova).
-- El convocado entrega sus enlaces y su reflexión; la directiva la revisa y
-- la aprueba o la devuelve con observaciones. Aprobar abre la Parte 2.
-- Solo se escribe mediante las funciones de abajo para que nadie pueda
-- aprobarse a sí mismo.

CREATE TYPE public.entrega_estado AS ENUM ('enviada', 'observada', 'aprobada');

CREATE TABLE public.academia_entregas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wokwi_url TEXT NOT NULL CHECK (wokwi_url ~ '^https?://'),
  diagrama_url TEXT NOT NULL CHECK (diagrama_url ~ '^https?://'),
  electronica_url TEXT NOT NULL CHECK (electronica_url ~ '^https?://'),
  onshape_url TEXT NOT NULL CHECK (onshape_url ~ '^https?://'),
  mecanica_url TEXT NOT NULL CHECK (mecanica_url ~ '^https?://'),
  video_url TEXT NOT NULL CHECK (video_url ~ '^https?://'),
  reflexion TEXT NOT NULL CHECK (char_length(btrim(reflexion)) BETWEEN 50 AND 4000),
  estado public.entrega_estado NOT NULL DEFAULT 'enviada',
  -- Observación de la directiva al revisar.
  comentario TEXT,
  revisado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revisado_at TIMESTAMP WITH TIME ZONE,
  enviado_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.academia_entregas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own academia entrega" ON public.academia_entregas
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.enviar_entrega_academia(
  _wokwi_url TEXT,
  _diagrama_url TEXT,
  _electronica_url TEXT,
  _onshape_url TEXT,
  _mecanica_url TEXT,
  _video_url TEXT,
  _reflexion TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_academy_access(auth.uid()) THEN
    RAISE EXCEPTION 'Necesitas acceso vigente a Academia Nova para entregar';
  END IF;

  IF EXISTS (SELECT 1 FROM public.academia_entregas WHERE user_id = auth.uid() AND estado = 'aprobada') THEN
    RAISE EXCEPTION 'Tu entrega ya fue aprobada';
  END IF;

  INSERT INTO public.academia_entregas
    (user_id, wokwi_url, diagrama_url, electronica_url, onshape_url, mecanica_url, video_url, reflexion, estado, enviado_at)
  VALUES
    (auth.uid(), btrim(_wokwi_url), btrim(_diagrama_url), btrim(_electronica_url), btrim(_onshape_url),
     btrim(_mecanica_url), btrim(_video_url), btrim(_reflexion), 'enviada', now())
  ON CONFLICT (user_id) DO UPDATE SET
    wokwi_url = EXCLUDED.wokwi_url,
    diagrama_url = EXCLUDED.diagrama_url,
    electronica_url = EXCLUDED.electronica_url,
    onshape_url = EXCLUDED.onshape_url,
    mecanica_url = EXCLUDED.mecanica_url,
    video_url = EXCLUDED.video_url,
    reflexion = EXCLUDED.reflexion,
    estado = 'enviada',
    enviado_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.revisar_entrega_academia(_user_id UUID, _aprobar BOOLEAN, _comentario TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Solo la directiva puede revisar entregas';
  END IF;

  IF NOT _aprobar AND btrim(COALESCE(_comentario, '')) = '' THEN
    RAISE EXCEPTION 'Escribe qué debe corregir el convocado';
  END IF;

  UPDATE public.academia_entregas
  SET estado = (CASE WHEN _aprobar THEN 'aprobada' ELSE 'observada' END)::public.entrega_estado,
      comentario = NULLIF(btrim(COALESCE(_comentario, '')), ''),
      revisado_por = auth.uid(),
      revisado_at = now()
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró la entrega';
  END IF;
END;
$$;
