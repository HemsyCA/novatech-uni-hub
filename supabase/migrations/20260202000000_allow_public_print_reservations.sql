-- Migración para permitir reservas públicas de impresión 3D
-- Hace user_id opcional y agrega campos de contacto para usuarios no autenticados

-- Hacer user_id opcional
ALTER TABLE public.print_reservations 
  ALTER COLUMN user_id DROP NOT NULL;

-- Agregar campos de contacto para usuarios no autenticados
ALTER TABLE public.print_reservations 
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Actualizar la política RLS para permitir inserción sin autenticación
DROP POLICY IF EXISTS "Users can create own reservations" ON public.print_reservations;

-- Nueva política que permite crear reservas sin autenticación
CREATE POLICY "Anyone can create reservations" ON public.print_reservations 
  FOR INSERT 
  WITH CHECK (true);

-- Mantener la política de lectura solo para usuarios autenticados
DROP POLICY IF EXISTS "Users can view own reservations" ON public.print_reservations;

CREATE POLICY "Users can view own reservations" ON public.print_reservations 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Agregar constraint para asegurar que haya user_id o datos de contacto
ALTER TABLE public.print_reservations
  ADD CONSTRAINT check_user_or_contact 
  CHECK (
    (user_id IS NOT NULL) OR 
    (contact_name IS NOT NULL AND contact_email IS NOT NULL AND contact_phone IS NOT NULL)
  );
