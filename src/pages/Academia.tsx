import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CalendarClock, Lock } from "lucide-react";
import novatechLogo from "@/assets/novatech-logo.png";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAcademyAccess } from "@/hooks/use-academy-access";
import { getCurrentSession } from "@/services/supabase/auth";
import { daysLeft, formatDate, limaToday } from "@/lib/academy-dates";

export default function Academia() {
  const { loading, hasAccess, isStaff, memberships, activeMembership } = useAcademyAccess();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getCurrentSession().then(({ data: { session } }) => setEmail(session?.user?.email ?? null));
  }, []);

  const today = limaToday();
  const upcoming = memberships
    .filter((m) => m.starts_at > today)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
  const expired = memberships.find((m) => m.ends_at < today);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={novatechLogo} alt="NovaTech" className="h-10 w-10" />
            <span className="font-display font-bold text-gradient-primary hidden sm:block">NOVATECH</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al panel
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Academia <span className="text-gradient-primary">Nova</span>
          </h1>
          <p className="text-muted-foreground">Nivel 0 · Bienvenida</p>
        </motion.div>

        {loading ? (
          <div className="animate-pulse text-primary">Cargando...</div>
        ) : hasAccess ? (
          <div className="space-y-6">
            <Card className="glass-card border-border/30">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <CalendarClock className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-1">
                  {activeMembership ? (
                    <>
                      <CardTitle className="text-lg">{activeMembership.grupo_nombre}</CardTitle>
                      <CardDescription>
                        Tu acceso termina el {formatDate(activeMembership.ends_at)} · quedan{" "}
                        {daysLeft(activeMembership.ends_at, today)} día(s)
                      </CardDescription>
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-lg">Acceso de staff</CardTitle>
                      <CardDescription>Tienes acceso permanente como parte de la directiva.</CardDescription>
                    </>
                  )}
                </div>
                {isStaff && <Badge className="ml-auto shrink-0">Staff</Badge>}
              </CardHeader>
            </Card>

            <Card className="glass-card border-border/30">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <BookOpen className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-1">
                  <CardTitle className="text-lg">Contenido del curso</CardTitle>
                  <CardDescription>
                    Las lecciones y ejercicios de electrónica, mecánica y programación se publicarán aquí.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <Card className="glass-card border-border/30">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <Lock className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {upcoming
                    ? `Tu acceso empieza el ${formatDate(upcoming.starts_at)}`
                    : expired
                      ? `Tu acceso terminó el ${formatDate(expired.ends_at)}`
                      : "No tienes acceso a Academia Nova"}
                </CardTitle>
                <CardDescription>
                  {upcoming
                    ? `Formas parte de ${upcoming.grupo_nombre}. Vuelve ese día para empezar el curso.`
                    : expired
                      ? "Tu periodo de 3 semanas en la convocatoria ya finalizó. Sigues teniendo acceso a la tienda e impresión 3D."
                      : "Academia Nova está disponible para los convocados durante su periodo de convocatoria."}
                </CardDescription>
              </div>
            </CardHeader>
            {!upcoming && !expired && (
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {email && (
                  <p>
                    Si te convocaron, asegúrate de haber entrado con el mismo correo con el que te inscribieron. Ahora
                    estás usando <span className="text-foreground">{email}</span>.
                  </p>
                )}
                <p>
                  Conoce cómo unirte en{" "}
                  <Link to="/unete" className="text-primary hover:underline">
                    Únete
                  </Link>
                  .
                </p>
              </CardContent>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
