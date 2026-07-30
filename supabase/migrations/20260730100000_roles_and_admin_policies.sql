-- Roles de plataforma: 'admin' (control total) y 'directiva' (junta que gestiona tienda e impresión 3D)
CREATE TYPE public.app_role AS ENUM ('admin', 'directiva');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función security definer para evitar recursión en políticas RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- "Staff" = admin o directiva, quienes pueden gestionar tienda, impresiones 3D y contenidos públicos
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'directiva')
$$;

-- Policies de user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_staff(auth.uid()));
-- Solo un admin puede otorgar o quitar roles (evita escalado de privilegios por usuarios de directiva)
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Staff necesita poder ubicar usuarios por email para otorgarles el rol de directiva
CREATE POLICY "Staff can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_staff(auth.uid()));

-- ===== Productos: la directiva gestiona el catálogo =====
CREATE POLICY "Staff can view all products" ON public.products
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update products" ON public.products
  FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete products" ON public.products
  FOR DELETE USING (public.is_staff(auth.uid()));

-- ===== Órdenes: la directiva ve y actualiza todos los pedidos =====
CREATE POLICY "Staff can view all orders" ON public.orders
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update orders" ON public.orders
  FOR UPDATE USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can view all order items" ON public.order_items
  FOR SELECT USING (public.is_staff(auth.uid()));

-- ===== Impresoras 3D: la directiva las administra =====
CREATE POLICY "Staff can insert printers" ON public.printers
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update printers" ON public.printers
  FOR UPDATE USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete printers" ON public.printers
  FOR DELETE USING (public.is_staff(auth.uid()));

-- ===== Reservas de impresión 3D: la directiva ve y gestiona todas =====
CREATE POLICY "Staff can view all reservations" ON public.print_reservations
  FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update reservations" ON public.print_reservations
  FOR UPDATE USING (public.is_staff(auth.uid()));
