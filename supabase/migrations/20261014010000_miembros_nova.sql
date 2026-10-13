-- Miembros de Nova: acceso permanente (sin fecha de vencimiento) a material
-- interno de robots, componentes y PCBs.
--
-- Igual que los convocados, se guardan por correo para poder cargar a los
-- miembros actuales aunque todavía no tengan cuenta en la web. Superadmin y
-- directiva también cuentan como miembros.

CREATE TABLE public.nova_miembros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND email LIKE '%_@_%'),
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.nova_miembros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage nova members" ON public.nova_miembros
  FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Mismo criterio que has_academy_access: el correo debe estar confirmado
-- para que nadie herede el acceso registrándose con un correo ajeno.
CREATE OR REPLACE FUNCTION public.is_member(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_staff(_user_id) OR EXISTS (
    SELECT 1
    FROM public.nova_miembros nm
    JOIN auth.users u ON lower(u.email) = nm.email
    WHERE u.id = _user_id
      AND u.email_confirmed_at IS NOT NULL
  )
$$;

-- Bosquejo del material interno. "categoria" usa los ids de
-- src/data/robots.ts (ej. 'minisumo-autonomo') o 'general'.
-- Este contenido NO debe ir en el código del frontend: cualquiera puede leerlo.
CREATE TABLE public.material_miembros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL DEFAULT 'general',
  robot TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('descripcion', 'componente', 'pcb', 'documento')),
  titulo TEXT NOT NULL CHECK (btrim(titulo) <> ''),
  descripcion TEXT,
  url TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.material_miembros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view member material" ON public.material_miembros
  FOR SELECT USING (public.is_member(auth.uid()));

CREATE POLICY "Staff can manage member material" ON public.material_miembros
  FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
