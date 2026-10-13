import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { addNovaMembers, listNovaMembers, removeNovaMember } from "@/services/supabase/miembros";
import { parseEmailList } from "@/services/supabase/academia";
import type { NovaMember } from "@/types/domain";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string } | null)?.message || fallback;

export function AdminMiembros() {
  const [members, setMembers] = useState<NovaMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailsText, setEmailsText] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    try {
      setMembers(await listNovaMembers());
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudieron cargar los miembros"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAdd = async () => {
    const { valid, invalid } = parseEmailList(emailsText);
    if (invalid.length > 0) {
      toast({ title: "Correos inválidos", description: invalid.join(", "), variant: "destructive" });
      return;
    }
    if (valid.length === 0) return;

    setSaving(true);
    try {
      await addNovaMembers(valid);
      toast({ title: "Miembros agregados", description: `${valid.length} correo(s) procesado(s)` });
      setEmailsText("");
      await fetchMembers();
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudieron agregar"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (member: NovaMember) => {
    try {
      await removeNovaMember(member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast({ title: "Miembro quitado" });
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudo quitar"), variant: "destructive" });
    }
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Agregar miembros</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acceso permanente al material interno. No necesitan estar registrados todavía: tendrán acceso cuando entren
            con ese mismo correo. La directiva y el superadmin ya cuentan como miembros.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="members-emails">Correos</Label>
            <Textarea
              id="members-emails"
              placeholder={"uno por línea o separados por coma\nana@gmail.com, luis@uni.pe"}
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleAdd} disabled={saving || !emailsText.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Agregar
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{members.length} miembro(s)</p>
        {members.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Todavía no hay miembros cargados</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{member.full_name || member.email}</p>
                {member.full_name && <p className="text-xs text-muted-foreground truncate">{member.email}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={member.registered ? "secondary" : "outline"}>
                  {member.registered ? "Registrado" : "Sin cuenta aún"}
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Quitar miembro">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Quitar a {member.full_name || member.email}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Perderá el acceso al material de miembros. Su cuenta no se borra y sigue siendo usuario general.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(member)}>Quitar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
