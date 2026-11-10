-- Almacén de Nova: las herramientas del equipo y sus préstamos.
--
-- * La directiva registra cada herramienta con un código único (por ejemplo NOVA-001).
-- * Un miembro pide prestada una herramienta; la directiva aprueba o rechaza.
-- * Cuando el miembro la devuelve, solo "avisa" que la entregó: el préstamo NO queda devuelto
--   hasta que alguien de la directiva revisa el almacén y confirma la devolución.
-- Todos los cambios de estado pasan por funciones, para que nadie pueda saltarse un paso.

-- 1. Herramientas -----------------------------------------------------------------------

CREATE TYPE public.herramienta_estado AS ENUM ('disponible', 'prestada', 'mantenimiento', 'baja');

CREATE TABLE public.herramientas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL CHECK (codigo ~ '^[A-Z0-9][A-Z0-9-]{1,23}$'),
  nombre TEXT NOT NULL CHECK (char_length(btrim(nombre)) BETWEEN 2 AND 120),
  categoria TEXT NOT NULL DEFAULT 'general' CHECK (char_length(categoria) <= 40),
  descripcion TEXT CHECK (char_length(descripcion) <= 1000),
  ubicacion TEXT CHECK (char_length(ubicacion) <= 120),
  estado public.herramienta_estado NOT NULL DEFAULT 'disponible',
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX herramientas_codigo_unico ON public.herramientas (upper(codigo));

ALTER TABLE public.herramientas ENABLE ROW LEVEL SECURITY;

-- Los miembros (y la directiva) ven el catálogo.
CREATE POLICY "Members can view tools" ON public.herramientas
  FOR SELECT USING (public.is_member(auth.uid()));

-- Solo la directiva agrega, edita o elimina herramientas.
CREATE POLICY "Staff can manage tools" ON public.herramientas
  FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 2. Préstamos --------------------------------------------------------------------------

-- solicitado → (aprobado) prestado → devolucion_reportada → devuelto
-- solicitado → rechazado | cancelado
CREATE TYPE public.prestamo_estado AS ENUM ('solicitado', 'rechazado', 'cancelado', 'prestado', 'devolucion_reportada', 'devuelto');

CREATE TABLE public.prestamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  herramienta_id UUID NOT NULL REFERENCES public.herramientas(id) ON DELETE CASCADE,
  solicitante_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Se guarda al pedir: así la directiva ve el nombre sin depender de otros permisos.
  solicitante_nombre TEXT NOT NULL,
  motivo TEXT NOT NULL CHECK (char_length(btrim(motivo)) BETWEEN 5 AND 500),
  devolucion_estimada DATE NOT NULL,
  estado public.prestamo_estado NOT NULL DEFAULT 'solicitado',
  comentario_directiva TEXT CHECK (char_length(comentario_directiva) <= 500),
  nota_devolucion TEXT CHECK (char_length(nota_devolucion) <= 500),
  aprobado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  aprobado_at TIMESTAMP WITH TIME ZONE,
  devolucion_reportada_at TIMESTAMP WITH TIME ZONE,
  recibido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  devuelto_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Una herramienta solo puede tener un préstamo activo a la vez.
CREATE UNIQUE INDEX prestamos_uno_activo_por_herramienta ON public.prestamos (herramienta_id)
  WHERE estado IN ('solicitado', 'prestado', 'devolucion_reportada');

CREATE INDEX prestamos_solicitante_idx ON public.prestamos (solicitante_id);

ALTER TABLE public.prestamos ENABLE ROW LEVEL SECURITY;

-- Cada miembro ve sus préstamos; la directiva ve todos. No hay INSERT ni UPDATE directos:
-- todo pasa por las funciones de abajo.
CREATE POLICY "Members view own loans" ON public.prestamos
  FOR SELECT USING (auth.uid() = solicitante_id OR public.is_staff(auth.uid()));

-- 3. Funciones del flujo -------------------------------------------------------------------

-- Un miembro pide prestada una herramienta disponible.
CREATE OR REPLACE FUNCTION public.solicitar_prestamo(_herramienta UUID, _motivo TEXT, _devolucion DATE)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _nombre TEXT;
  _id UUID;
BEGIN
  IF _uid IS NULL OR NOT public.is_member(_uid) THEN
    RAISE EXCEPTION 'Solo los miembros de Nova pueden pedir herramientas';
  END IF;
  IF _devolucion < (now() AT TIME ZONE 'America/Lima')::date THEN
    RAISE EXCEPTION 'La fecha de devolución no puede ser pasada';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.herramientas WHERE id = _herramienta AND estado = 'disponible') THEN
    RAISE EXCEPTION 'Esta herramienta no está disponible';
  END IF;
  IF EXISTS (SELECT 1 FROM public.prestamos WHERE herramienta_id = _herramienta AND estado IN ('solicitado', 'prestado', 'devolucion_reportada')) THEN
    RAISE EXCEPTION 'Alguien más ya pidió esta herramienta';
  END IF;

  SELECT COALESCE(NULLIF(btrim(full_name), ''), split_part(email, '@', 1)) INTO _nombre
  FROM public.profiles WHERE user_id = _uid;

  INSERT INTO public.prestamos (herramienta_id, solicitante_id, solicitante_nombre, motivo, devolucion_estimada)
  VALUES (_herramienta, _uid, COALESCE(_nombre, 'Miembro de Nova'), btrim(_motivo), _devolucion)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- El miembro cancela su solicitud mientras nadie la haya aprobado.
CREATE OR REPLACE FUNCTION public.cancelar_prestamo(_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.prestamos SET estado = 'cancelado', updated_at = now()
  WHERE id = _id AND solicitante_id = auth.uid() AND estado = 'solicitado';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Esta solicitud ya no se puede cancelar';
  END IF;
END;
$$;

-- La directiva aprueba (la herramienta queda prestada) o rechaza una solicitud.
CREATE OR REPLACE FUNCTION public.revisar_prestamo(_id UUID, _aprobar BOOLEAN, _comentario TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _prestamo public.prestamos;
BEGIN
  IF _uid IS NULL OR NOT public.is_staff(_uid) THEN
    RAISE EXCEPTION 'Solo la directiva puede revisar préstamos';
  END IF;
  SELECT * INTO _prestamo FROM public.prestamos WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR _prestamo.estado <> 'solicitado' THEN
    RAISE EXCEPTION 'Esta solicitud ya fue revisada';
  END IF;

  IF _aprobar THEN
    UPDATE public.prestamos
    SET estado = 'prestado', aprobado_por = _uid, aprobado_at = now(),
        comentario_directiva = NULLIF(btrim(COALESCE(_comentario, '')), ''), updated_at = now()
    WHERE id = _id;
    UPDATE public.herramientas SET estado = 'prestada', updated_at = now() WHERE id = _prestamo.herramienta_id;
  ELSE
    IF _comentario IS NULL OR btrim(_comentario) = '' THEN
      RAISE EXCEPTION 'Escribe por qué se rechaza';
    END IF;
    UPDATE public.prestamos
    SET estado = 'rechazado', aprobado_por = _uid, aprobado_at = now(), comentario_directiva = btrim(_comentario), updated_at = now()
    WHERE id = _id;
  END IF;
END;
$$;

-- El miembro avisa que ya la entregó. Todavía NO cuenta como devuelta.
CREATE OR REPLACE FUNCTION public.reportar_devolucion(_id UUID, _nota TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.prestamos
  SET estado = 'devolucion_reportada', devolucion_reportada_at = now(),
      nota_devolucion = NULLIF(btrim(COALESCE(_nota, '')), ''), updated_at = now()
  WHERE id = _id AND solicitante_id = auth.uid() AND estado = 'prestado';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Este préstamo no está activo';
  END IF;
END;
$$;

-- La directiva revisa el almacén y confirma que la herramienta volvió.
-- También puede confirmarla aunque el miembro no haya avisado. Si volvió dañada, queda en mantenimiento.
CREATE OR REPLACE FUNCTION public.confirmar_devolucion(_id UUID, _queda public.herramienta_estado, _comentario TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _prestamo public.prestamos;
BEGIN
  IF _uid IS NULL OR NOT public.is_staff(_uid) THEN
    RAISE EXCEPTION 'Solo la directiva puede confirmar devoluciones';
  END IF;
  IF _queda NOT IN ('disponible', 'mantenimiento') THEN
    RAISE EXCEPTION 'Al volver, la herramienta queda disponible o en mantenimiento';
  END IF;
  SELECT * INTO _prestamo FROM public.prestamos WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR _prestamo.estado NOT IN ('prestado', 'devolucion_reportada') THEN
    RAISE EXCEPTION 'Este préstamo no está pendiente de devolución';
  END IF;

  UPDATE public.prestamos
  SET estado = 'devuelto', recibido_por = _uid, devuelto_at = now(),
      comentario_directiva = COALESCE(NULLIF(btrim(COALESCE(_comentario, '')), ''), comentario_directiva), updated_at = now()
  WHERE id = _id;
  UPDATE public.herramientas SET estado = _queda, updated_at = now() WHERE id = _prestamo.herramienta_id;
END;
$$;

-- Qué herramientas ya tienen una solicitud en curso, sin decir quién la hizo:
-- así el catálogo muestra "Pedida" y nadie intenta pedir algo que ya está apartado.
CREATE OR REPLACE FUNCTION public.herramientas_pedidas()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT herramienta_id FROM public.prestamos
  WHERE estado = 'solicitado' AND public.is_member(auth.uid())
$$;
