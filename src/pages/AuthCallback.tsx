import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentSession, subscribeToAuth } from "@/services/supabase/auth";

type CallbackStatus = "loading" | "success" | "error";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>("loading");

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = subscribeToAuth((_event, session) => {
      if (!active || !session?.user) return;
      setStatus("success");
      setTimeout(() => active && navigate("/dashboard", { replace: true }), 1200);
    });

    getCurrentSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        setStatus("success");
        setTimeout(() => active && navigate("/dashboard", { replace: true }), 1200);
      } else {
        setStatus("error");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-border/30">
          <CardHeader className="text-center">
            {status === "loading" && <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />}
            {status === "error" && <XCircle className="mx-auto h-10 w-10 text-destructive" />}

            <CardTitle className="mt-4">
              {status === "loading" && "Confirmando tu cuenta..."}
              {status === "success" && "¡Cuenta confirmada!"}
              {status === "error" && "El enlace no es válido o expiró"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Espera un momento mientras validamos tu email."}
              {status === "success" && "Te estamos llevando a tu panel."}
              {status === "error" &&
                "Vuelve a intentar el registro o inicia sesión si ya confirmaste tu cuenta antes."}
            </CardDescription>
          </CardHeader>

          {status === "error" && (
            <CardContent className="flex justify-center">
              <Button asChild className="bg-gradient-primary">
                <Link to="/auth">Volver a iniciar sesión</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
