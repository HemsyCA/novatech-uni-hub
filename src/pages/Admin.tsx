import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminRoles } from "@/components/admin/AdminRoles";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminReservations } from "@/components/admin/AdminReservations";
import { AdminContactMessages } from "@/components/admin/AdminContactMessages";
import { AdminAcademia } from "@/components/admin/AdminAcademia";
import { AdminMiembros } from "@/components/admin/AdminMiembros";
import { AdminEntregas } from "@/components/admin/AdminEntregas";
import { AdminPracticas } from "@/components/admin/AdminPracticas";
import { useUserRole } from "@/hooks/use-user-role";

export default function Admin() {
  const { isSuperadmin, isDirectiva } = useUserRole();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Panel de <span className="text-gradient-primary">Directiva</span>
          </h1>
          <p className="text-muted-foreground">
            {isSuperadmin
              ? "Como superadmin puedes gestionar la tienda, las reservas, los convocados de Academia Nova, los miembros y los roles."
              : isDirectiva
                ? "Tienes acceso de staff para gestionar la tienda, las reservas, los convocados de Academia Nova y los miembros. La gestión de roles queda reservada al superadmin."
                : ""}
          </p>
        </motion.div>

        <Tabs defaultValue="products">
          <TabsList
            className={`grid w-full h-auto bg-muted/50 mb-6 grid-cols-3 ${isSuperadmin ? "sm:grid-cols-9" : "sm:grid-cols-8"}`}
          >
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="academia">Convocados</TabsTrigger>
            <TabsTrigger value="entregas">Entregas</TabsTrigger>
            <TabsTrigger value="practicas">Prácticas</TabsTrigger>
            <TabsTrigger value="miembros">Miembros</TabsTrigger>
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
          <TabsContent value="academia">
            <AdminAcademia />
          </TabsContent>
          <TabsContent value="entregas">
            <AdminEntregas />
          </TabsContent>
          <TabsContent value="practicas">
            <AdminPracticas />
          </TabsContent>
          <TabsContent value="miembros">
            <AdminMiembros />
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
