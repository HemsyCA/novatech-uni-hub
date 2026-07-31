-- 'superadmin' = cuenta oficial de NovaTech con control total.
-- El valor interno del enum no cambia (mismo OID), solo la etiqueta,
-- por lo que las policies y funciones existentes que referencian 'admin' siguen
-- apuntando al mismo valor y no se rompen.
ALTER TYPE public.app_role RENAME VALUE 'admin' TO 'superadmin';

-- Renombramos las policies para que el nombre refleje la semántica real
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Superadmin can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Superadmin can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'superadmin'));

-- Refuerzo a nivel de datos (no solo RLS): el rol 'directiva' solo puede
-- otorgarse a cuentas con correo @uni.pe, incluso si algún día se inserta
-- con la service role saltándose RLS.
CREATE OR REPLACE FUNCTION public.enforce_directiva_domain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target_email TEXT;
BEGIN
  IF NEW.role = 'directiva' THEN
    SELECT email INTO target_email FROM auth.users WHERE id = NEW.user_id;
    IF target_email IS NULL OR target_email NOT ILIKE '%@uni.pe' THEN
      RAISE EXCEPTION 'El rol de directiva solo puede otorgarse a correos @uni.pe';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_directiva_domain_trigger ON public.user_roles;
CREATE TRIGGER enforce_directiva_domain_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_directiva_domain();
