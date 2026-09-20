import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import novatechLogo from "@/assets/novatech-logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminRoles } from "@/components/admin/AdminRoles";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminReservations } from "@/components/admin/AdminReservations";
import { AdminContactMessages } from "@/components/admin/AdminContactMessages";
import { useUserRole } from "@/hooks/use-user-role";

export default function Admin() {
  const { isSuperadmin, isDirectiva } = useUserRole();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={novatechLogo} alt="NovaTech" className="h-10 w-10" />
            <span className="font-display font-bold text-gradient-primary hidden sm:block">
              NOVATECH
            </span>
          </Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            Volver al panel
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Panel de <span className="text-gradient-primary">Directiva</span>
          </h1>
          <p className="text-muted-foreground">
            {isSuperadmin
              ? "Como superadmin puedes gestionar la tienda, las reservas y los roles."
              : isDirectiva
                ? "Tienes acceso de staff para gestionar la tienda y las reservas. La gestión de roles queda reservada al superadmin."
                : ""}
          </p>
        </motion.div>

        <Tabs defaultValue="products">
          <TabsList className={`grid w-full bg-muted/50 mb-6 ${isSuperadmin ? "grid-cols-5" : "grid-cols-4"}`}>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            {isSuperadmin && <TabsTrigger value="roles">Roles</TabsTrigger>}
          </TabsList>
          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>
          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>
          <TabsContent value="reservations">
            <AdminReservations />
          </TabsContent>
          <TabsContent value="messages">
            <AdminContactMessages />
          </TabsContent>
          {isSuperadmin && (
            <TabsContent value="roles">
              <AdminRoles />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
