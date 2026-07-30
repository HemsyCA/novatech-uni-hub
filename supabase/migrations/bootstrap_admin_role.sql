-- Ejecuta esto UNA VEZ, después de aplicar las migraciones con fecha 20260730*,
-- para darte a ti mismo el rol de 'admin' (necesario porque solo un admin puede
-- otorgar roles a otras personas, y al inicio no existe ninguno).
--
-- Reemplaza el email por el de la cuenta que quieres hacer administradora.

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'REEMPLAZA_CON_TU_EMAIL@novatech.uni'
ON CONFLICT (user_id, role) DO NOTHING;
