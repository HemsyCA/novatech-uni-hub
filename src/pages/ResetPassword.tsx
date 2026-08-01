import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentSession, subscribeToAuth, updatePassword } from "@/services/supabase/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSession = (hasSession: boolean) => {
      if (!active) return;
      setValidLink(hasSession);
      setReady(true);
    };

    const { data: { subscription } } = subscribeToAuth((_event, session) => {
      checkSession(Boolean(session?.user));
    });

    getCurrentSession().then(({ data: { session } }) => {
      checkSession(Boolean(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Contraseña actualizada", description: "Ya puedes usar tu nueva contraseña." });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-border/30">
          {!ready ? (
            <CardContent className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </CardContent>
          ) : !validLink ? (
            <CardHeader className="text-center">
              <XCircle className="mx-auto h-10 w-10 text-destructive" />
              <CardTitle className="mt-4">El enlace no es válido o expiró</CardTitle>
              <CardDescription>
                Vuelve a pedir el enlace de restablecimiento desde la pantalla de inicio de sesión.
              </CardDescription>
            </CardHeader>
          ) : (
            <>
              <CardHeader className="text-center">
                <KeyRound className="mx-auto h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Elige tu nueva contraseña</CardTitle>
                <CardDescription>Tiene que tener al menos 6 caracteres.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Guardar contraseña
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
