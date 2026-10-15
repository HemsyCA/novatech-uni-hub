import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import AccountLayout from "@/components/account/AccountLayout";
import { useSession } from "@/hooks/use-session";

// Tienda e Impresión 3D son públicas, pero con sesión iniciada se abren dentro de la cuenta:
// misma barra, mismas pestañas y tus pedidos a la mano, sin sentir que sales a otro sitio.
export default function SessionShell() {
  const { user, loading } = useSession();

  if (loading) return <div className="min-h-screen bg-black" />;
  if (user) return <AccountLayout />;

  return (
    <div className="nova-shell font-mono min-h-screen bg-black text-white">
      <Navbar />
      <Outlet />
    </div>
  );
}
