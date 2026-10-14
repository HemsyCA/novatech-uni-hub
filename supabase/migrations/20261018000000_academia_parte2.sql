-- Academia Nova · Parte 2 (soldadura).
-- Quien tiene la tarea final aprobada conserva el acceso a la Academia aunque
-- su periodo de 3 semanas haya vencido, para poder estudiar la Parte 2 y
-- registrar su progreso y sus fichas.

CREATE OR REPLACE FUNCTION public.has_academy_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_staff(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.academia_miembros m
      JOIN public.academia_grupos g ON g.id = m.grupo_id
      JOIN auth.users u ON lower(u.email) = m.email
      WHERE u.id = _user_id
        AND u.email_confirmed_at IS NOT NULL
        AND (now() AT TIME ZONE 'America/Lima')::date
            BETWEEN g.starts_at AND COALESCE(m.ends_at_override, g.ends_at)
    )
    OR EXISTS (
      SELECT 1
      FROM public.academia_entregas e
      WHERE e.user_id = _user_id
        AND e.estado = 'aprobada'
    )
$$;

-- Las fichas también pueden ser de las lecciones de soldadura.
ALTER TABLE public.academia_fichas DROP CONSTRAINT academia_fichas_modulo_check;
ALTER TABLE public.academia_fichas ADD CONSTRAINT academia_fichas_modulo_check
  CHECK (modulo IN ('electronica', 'mecanica', 'programacion', 'soldadura'));
