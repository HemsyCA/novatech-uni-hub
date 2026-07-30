import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentSession, subscribeToAuth } from "@/services/supabase/auth";

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = subscribeToAuth((_event, session) => {
      if (active) {
        setIsAuthenticated(Boolean(session?.user));
      }
    });

    getCurrentSession().then(({ data: { session } }) => {
      if (active) {
        setIsAuthenticated(Boolean(session?.user));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        Cargando...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};
