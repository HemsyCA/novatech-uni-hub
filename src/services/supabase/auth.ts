import { supabase } from "@/integrations/supabase/client";

export const getFriendlyAuthErrorMessage = (message: string) => {
  if (message === "Invalid login credentials") {
    return "Credenciales inválidas. Verifica tu email y contraseña.";
  }

  if (message.includes("Email not confirmed") || message.includes("email_not_confirmed")) {
    return "Tu email no ha sido confirmado. Por favor, revisa tu correo y confirma tu cuenta antes de iniciar sesión.";
  }

  return message;
};

export const getCurrentSession = async () => {
  return supabase.auth.getSession();
};

export const subscribeToAuth = (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) => {
  return supabase.auth.onAuthStateChange(callback);
};

export const signInWithPassword = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: { full_name: fullName },
    },
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};
