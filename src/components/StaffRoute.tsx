import { Navigate, Outlet } from "react-router-dom";
import { useUserRole } from "@/hooks/use-user-role";

export const StaffRoute = () => {
  const { loading, userId, isStaff } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        Cargando...
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/auth" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
