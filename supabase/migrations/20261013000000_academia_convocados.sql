-- Academia Nova: acceso temporal para convocados.
--
-- Cada grupo tiene sus propias fechas, así que una persona sola es un grupo
-- de 1 y cada grupo de una convocatoria puede empezar en una fecha distinta.
-- El acceso se guarda por correo (no por cuenta) para poder agregar a alguien
-- antes de que se registre. Al vencer, la persona vuelve a ser usuario general
-- sin que nadie tenga que quitarle nada.

CREATE TABLE public.academia_grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL CHECK (btrim(nombre) <> ''),
  starts_at DATE NOT NULL,
  -- Último día con acceso (inclusive).
  ends_at DATE NOT NULL,
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT academia_grupos_fechas_validas CHECK (ends_at >= starts_at)
);

CREATE TABLE public.academia_miembros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES public.academia_grupos(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (email = lower(btrim(email)) AND email LIKE '%_@_%'),
  -- Excepción individual: si se llena, reemplaza la fecha de fin del grupo
  -- solo para esta persona.
  ends_at_override DATE,
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (grupo_id, email)
);

CREATE INDEX academia_miembros_email_idx ON public.academia_miembros (email);

ALTER TABLE public.academia_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academia_miembros ENABLE ROW LEVEL SECURITY;

-- Superadmin y directiva (staff) gestionan grupos y convocados.
CREATE POLICY "Staff can manage academia groups" ON public.academia_grupos
  FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage academia members" ON public.academia_miembros
  FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Se exige email confirmado para que nadie obtenga acceso registrándose con
-- el correo de otra persona sin haberlo verificado. La fecha se toma en hora
-- de Lima para que el acceso no se corte a las 7 p. m. (medianoche UTC).
CREATE OR REPLACE FUNCTION public.has_academy_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_staff(_user_id) OR EXISTS (
    SELECT 1
    FROM public.academia_miembros m
    JOIN public.academia_grupos g ON g.id = m.grupo_id
    JOIN auth.users u ON lower(u.email) = m.email
    WHERE u.id = _user_id
      AND u.email_confirmed_at IS NOT NULL
      AND (now() AT TIME ZONE 'America/Lima')::date
          BETWEEN g.starts_at AND COALESCE(m.ends_at_override, g.ends_at)
  )
$$;

-- Los convocados no pueden leer las tablas directamente; esta función les
-- devuelve solo sus propias membresías para mostrar fechas en la web.
CREATE OR REPLACE FUNCTION public.my_academy_memberships()
RETURNS TABLE (grupo_nombre TEXT, starts_at DATE, ends_at DATE, activo BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    g.nombre,
    g.starts_at,
    COALESCE(m.ends_at_override, g.ends_at),
    (now() AT TIME ZONE 'America/Lima')::date
      BETWEEN g.starts_at AND COALESCE(m.ends_at_override, g.ends_at)
  FROM public.academia_miembros m
  JOIN public.academia_grupos g ON g.id = m.grupo_id
  JOIN auth.users u ON lower(u.email) = m.email
  WHERE u.id = auth.uid()
    AND u.email_confirmed_at IS NOT NULL
  ORDER BY g.starts_at DESC
$$;
