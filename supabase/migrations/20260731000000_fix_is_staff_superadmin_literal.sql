-- Al renombrar el valor del enum 'admin' -> 'superadmin', esta función SQL
-- quedó con el literal viejo 'admin' en su cuerpo, que ya no existe como
-- etiqueta del enum. Eso rompía CUALQUIER consulta que dependiera de
-- is_staff() (productos, pedidos, reservas) con:
--   invalid input value for enum app_role: "admin"
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'superadmin') OR public.has_role(_user_id, 'directiva')
$$;
