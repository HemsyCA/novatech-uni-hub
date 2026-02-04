-- Crear usuario de prueba en Supabase
-- Este script crea un usuario con email y contraseña

DO $$
DECLARE
  new_user_id UUID;
  user_email TEXT := 'test@novatech.uni';
  user_password TEXT := 'Test123456';
  user_full_name TEXT := 'Usuario de Prueba';
BEGIN
  -- Crear el usuario en auth.users
  -- Nota: En Supabase, normalmente se crea el usuario a través de la API o dashboard
  -- Este es un método alternativo usando extensiones de Supabase
  
  -- Insertar en auth.users (requiere permisos de superusuario)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', user_full_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- El trigger automáticamente creará el perfil
  -- Pero por si acaso, verificamos y creamos manualmente si no existe
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new_user_id, user_email, user_full_name)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Usuario creado con ID: %', new_user_id;
END $$;
-- Método alternativo: usar la función de Supabase para crear usuarios
-- Esto requiere que tengas habilitada la extensión pgcrypto

-- Primero, asegúrate de tener la extensión
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear usuario directamente (método directo)
-- NOTA: Esto puede no funcionar dependiendo de la configuración de tu Supabase
-- La mejor opción es usar el Dashboard o la API de Supabase Admin