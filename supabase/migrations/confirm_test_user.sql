-- Script para confirmar el email del usuario de prueba
-- Ejecuta este script si ya creaste el usuario pero no puede iniciar sesión

-- Confirmar email del usuario de prueba
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  email_change_confirm_status = 1
WHERE email = 'test@novatech.uni';

-- Verificar que se actualizó correctamente
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'test@novatech.uni';
