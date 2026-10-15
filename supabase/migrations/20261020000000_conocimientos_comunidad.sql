-- Conocimientos Nova y Comunidad.
--
-- * Conocimientos Nova: el conocimiento del equipo. Reutiliza material_miembros (su
--   contenido actual pasa a ser el primero) y le suma disciplina, autor y contenido.
-- * Comunidad: los miembros comparten descubrimientos con la ficha de bitácora
--   (Quería, Hice, Pasó, Aprendí). El Área académica los revisa; si los aprueba,
--   se publican en Conocimientos Nova con el nombre de quien los hizo.

-- 1. Área académica -------------------------------------------------------------

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'academica';

-- Se compara como texto para poder usar el valor nuevo en esta misma migración.
CREATE OR REPLACE FUNCTION public.is_academic(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('academica', 'superadmin')
  )
$$;

-- 2. Conocimientos Nova -----------------------------------------------------------

ALTER TABLE public.material_miembros
  ADD COLUMN IF NOT EXISTS disciplina TEXT CHECK (disciplina IN ('electronica', 'mecanica', 'programacion', 'soldadura')),
  ADD COLUMN IF NOT EXISTS contenido TEXT CHECK (char_length(contenido) <= 8000),
  ADD COLUMN IF NOT EXISTS autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS autor_nombre TEXT,
  ADD COLUMN IF NOT EXISTS aporte_id UUID,
  ADD COLUMN IF NOT EXISTS publicado_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

ALTER TABLE public.material_miembros DROP CONSTRAINT IF EXISTS material_miembros_tipo_check;
ALTER TABLE public.material_miembros ADD CONSTRAINT material_miembros_tipo_check
  CHECK (tipo IN ('descripcion', 'componente', 'pcb', 'documento', 'guia', 'codigo', 'diseno3d', 'reglamento', 'descubrimiento'));

-- El Área académica también puede leer y curar el conocimiento.
DROP POLICY IF EXISTS "Members can view member material" ON public.material_miembros;
CREATE POLICY "Members can view member material" ON public.material_miembros
  FOR SELECT USING (public.is_member(auth.uid()) OR public.is_academic(auth.uid()));

CREATE POLICY "Academic area can manage member material" ON public.material_miembros
  FOR ALL USING (public.is_academic(auth.uid())) WITH CHECK (public.is_academic(auth.uid()));

-- 3. Aportes de la Comunidad -------------------------------------------------------

CREATE TYPE public.aporte_estado AS ENUM ('enviado', 'observado', 'aprobado');

CREATE TABLE public.aportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Se guarda al enviar: quien revisa no tiene acceso a los perfiles.
  autor_nombre TEXT NOT NULL,
  titulo TEXT NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 5 AND 120),
  disciplina TEXT CHECK (disciplina IN ('electronica', 'mecanica', 'programacion', 'soldadura')),
  categoria TEXT NOT NULL DEFAULT 'general',
  queria TEXT NOT NULL CHECK (char_length(btrim(queria)) BETWEEN 10 AND 1000),
  hice TEXT NOT NULL CHECK (char_length(btrim(hice)) BETWEEN 10 AND 1500),
  paso TEXT NOT NULL CHECK (char_length(btrim(paso)) BETWEEN 10 AND 1500),
  aprendi TEXT NOT NULL CHECK (char_length(btrim(aprendi)) BETWEEN 10 AND 1000),
  evidencia_url TEXT CHECK (evidencia_url IS NULL OR evidencia_url ~* '^https?://'),
  estado public.aporte_estado NOT NULL DEFAULT 'enviado',
  comentario TEXT CHECK (char_length(comentario) <= 1000),
  revisado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revisado_at TIMESTAMP WITH TIME ZONE,
  conocimiento_id UUID REFERENCES public.material_miembros(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.material_miembros
  ADD CONSTRAINT material_miembros_aporte_fk FOREIGN KEY (aporte_id) REFERENCES public.aportes(id) ON DELETE SET NULL;

ALTER TABLE public.aportes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors and academic area can view aportes" ON public.aportes
  FOR SELECT USING (auth.uid() = autor_id OR public.is_academic(auth.uid()));

-- Quien lo escribió puede borrarlo mientras no esté publicado.
CREATE POLICY "Authors can delete unpublished aportes" ON public.aportes
  FOR DELETE USING (auth.uid() = autor_id AND estado <> 'aprobado');

-- Enviar un aporte nuevo, o corregir y reenviar uno con observaciones.
-- Solo por esta función: así nadie puede marcarse un aporte como aprobado.
CREATE OR REPLACE FUNCTION public.enviar_aporte(
  _id UUID,
  _titulo TEXT,
  _disciplina TEXT,
  _categoria TEXT,
  _queria TEXT,
  _hice TEXT,
  _paso TEXT,
  _aprendi TEXT,
  _evidencia_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _nombre TEXT;
  _result UUID;
BEGIN
  IF _uid IS NULL OR NOT public.is_member(_uid) THEN
    RAISE EXCEPTION 'Solo los miembros de Nova pueden compartir aportes';
  END IF;

  SELECT COALESCE(NULLIF(btrim(full_name), ''), split_part(email, '@', 1)) INTO _nombre
  FROM public.profiles WHERE user_id = _uid;

  IF _id IS NULL THEN
    INSERT INTO public.aportes (autor_id, autor_nombre, titulo, disciplina, categoria, queria, hice, paso, aprendi, evidencia_url)
    VALUES (_uid, COALESCE(_nombre, 'Miembro de Nova'), _titulo, NULLIF(_disciplina, ''), COALESCE(NULLIF(_categoria, ''), 'general'),
            _queria, _hice, _paso, _aprendi, NULLIF(btrim(_evidencia_url), ''))
    RETURNING id INTO _result;
  ELSE
    UPDATE public.aportes
    SET titulo = _titulo,
        disciplina = NULLIF(_disciplina, ''),
        categoria = COALESCE(NULLIF(_categoria, ''), 'general'),
        queria = _queria,
        hice = _hice,
        paso = _paso,
        aprendi = _aprendi,
        evidencia_url = NULLIF(btrim(_evidencia_url), ''),
        estado = 'enviado',
        updated_at = now()
    WHERE id = _id AND autor_id = _uid AND estado <> 'aprobado'
    RETURNING id INTO _result;

    IF _result IS NULL THEN
      RAISE EXCEPTION 'No puedes editar este aporte';
    END IF;
  END IF;

  RETURN _result;
END;
$$;

-- El Área académica aprueba (y publica en Conocimientos Nova) o devuelve con observaciones.
CREATE OR REPLACE FUNCTION public.revisar_aporte(_id UUID, _aprobar BOOLEAN, _comentario TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _aporte public.aportes;
  _conocimiento UUID;
BEGIN
  IF _uid IS NULL OR NOT public.is_academic(_uid) THEN
    RAISE EXCEPTION 'Solo el Área académica puede revisar aportes';
  END IF;

  SELECT * INTO _aporte FROM public.aportes WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El aporte no existe';
  END IF;
  IF _aporte.estado = 'aprobado' THEN
    RAISE EXCEPTION 'Este aporte ya fue aprobado';
  END IF;

  IF NOT _aprobar THEN
    IF _comentario IS NULL OR btrim(_comentario) = '' THEN
      RAISE EXCEPTION 'Escribe qué debe corregir el autor';
    END IF;
    UPDATE public.aportes
    SET estado = 'observado', comentario = btrim(_comentario), revisado_por = _uid, revisado_at = now(), updated_at = now()
    WHERE id = _id;
    RETURN;
  END IF;

  INSERT INTO public.material_miembros (categoria, tipo, titulo, descripcion, contenido, url, disciplina, autor_id, autor_nombre, aporte_id)
  VALUES (
    _aporte.categoria,
    'descubrimiento',
    _aporte.titulo,
    _aporte.aprendi,
    '**Quería:** ' || _aporte.queria || E'\n\n**Hice:** ' || _aporte.hice || E'\n\n**Pasó:** ' || _aporte.paso || E'\n\n**Aprendí:** ' || _aporte.aprendi,
    _aporte.evidencia_url,
    _aporte.disciplina,
    _aporte.autor_id,
    _aporte.autor_nombre,
    _aporte.id
  )
  RETURNING id INTO _conocimiento;

  UPDATE public.aportes
  SET estado = 'aprobado', comentario = NULLIF(btrim(COALESCE(_comentario, '')), ''), revisado_por = _uid,
      revisado_at = now(), conocimiento_id = _conocimiento, updated_at = now()
  WHERE id = _id;
END;
$$;
