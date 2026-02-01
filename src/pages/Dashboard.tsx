import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, ShoppingCart, LogOut, User, Package, Calendar } from "lucide-react";
import novatechLogo from "@/assets/novatech-logo.png";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Dashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  const modules = [
    {
      title: "Impresión 3D",
      description: "Reserva tu turno para impresión 3D",
      icon: Printer,
      href: "/print3d",
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Tienda Nova",
      description: "Componentes electrónicos para tus proyectos",
      icon: ShoppingCart,
      href: "/store",
      color: "from-violet-500 to-purple-500",
    },
    {
      title: "Mis Reservas",
      description: "Historial de impresiones 3D",
      icon: Calendar,
      href: "/print3d",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Mis Pedidos",
      description: "Historial de compras en la tienda",
      icon: Package,
      href: "/store",
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={novatechLogo} alt="NovaTech" className="h-10 w-10" />
            <span className="font-display font-bold text-gradient-primary hidden sm:block">
              NOVATECH UNI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">
            ¡Bienvenido, <span className="text-gradient-primary">{user?.user_metadata?.full_name || "Competidor"}</span>!
          </h1>
          <p className="text-muted-foreground">
            Accede a los módulos del sistema NovaTech UNI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={module.href}>
                <Card className="glass-card border-border/30 hover:border-primary/50 transition-all duration-300 group cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
