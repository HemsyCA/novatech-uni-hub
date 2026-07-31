import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { findProfileByEmail, grantRole, listAllUserRoles, revokeRole } from "@/services/supabase/roles";
import type { AppRole, UserRole } from "@/types/domain";
import { useUserRole } from "@/hooks/use-user-role";

export function AdminRoles() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("directiva");
  const [granting, setGranting] = useState(false);
  const { toast } = useToast();
  const { isSuperadmin } = useUserRole();

  const fetchRoles = async () => {
    try {
      setRoles(await listAllUserRoles());
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los roles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleGrant = async () => {
    if (!email) return;

    if (newRole === "directiva" && !email.toLowerCase().endsWith("@uni.pe")) {
      toast({
        title: "Correo no permitido",
        description: "El rol de directiva solo puede otorgarse a correos @uni.pe",
        variant: "destructive",
      });
      return;
    }

    setGranting(true);
    try {
      const profile = await findProfileByEmail(email);
      if (!profile) {
        toast({ title: "Usuario no encontrado", description: "Debe haberse registrado antes en la plataforma", variant: "destructive" });
        return;
      }
      await grantRole(profile.user_id, newRole);
      toast({ title: "Rol otorgado" });
      setEmail("");
      fetchRoles();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo otorgar el rol", variant: "destructive" });
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Rol revocado" });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo revocar", variant: "destructive" });
    }
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  if (!isSuperadmin) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Solo el superadmin puede gestionar roles.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card border-border/30">
        <CardContent className="pt-4 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Email del usuario ya registrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="directiva">Directiva</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGrant} disabled={granting || !email} className="bg-gradient-primary">
              {granting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Otorgar
            </Button>
          </div>
          {newRole === "directiva" && (
            <p className="text-xs text-muted-foreground">
              El rol de directiva solo se puede otorgar a correos que terminen en @uni.pe.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {roles.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nadie tiene roles asignados todavía</p>
        ) : (
          roles.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <code className="text-xs text-muted-foreground">{r.user_id}</code>
                <Badge>{r.role}</Badge>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRevoke(r.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
