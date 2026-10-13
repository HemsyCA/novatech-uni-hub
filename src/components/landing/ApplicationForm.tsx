import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { domainHasMailServers } from "@/lib/email-validation";
import { DuplicateApplicationError, submitAcademyApplication } from "@/services/supabase/academia";

const CICLOS = Array.from({ length: 10 }, (_, i) => String(i + 1));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^\+?[0-9]{9,15}$/;

export function ApplicationForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [carrera, setCarrera] = useState("");
  const [ciclo, setCiclo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanWhatsapp = whatsapp.replace(/[\s()-]/g, "");

    const nextErrors: Record<string, string> = {};
    if (!nombre.trim()) nextErrors.nombre = "Escribe tu nombre completo";
    if (!EMAIL_RE.test(cleanEmail)) nextErrors.email = "Escribe un correo válido";
    if (!WHATSAPP_RE.test(cleanWhatsapp)) nextErrors.whatsapp = "Escribe un número válido, por ejemplo 987654321";
    if (!carrera.trim()) nextErrors.carrera = "Escribe tu carrera";
    if (!ciclo) nextErrors.ciclo = "Elige tu ciclo";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      if ((await domainHasMailServers(cleanEmail)) === false) {
        setErrors({ email: "Ese dominio de correo no existe, revisa que esté bien escrito" });
        return;
      }
      await submitAcademyApplication({
        nombre: nombre.trim(),
        email: cleanEmail,
        whatsapp: cleanWhatsapp,
        carrera: carrera.trim(),
        ciclo: Number(ciclo),
      });
      setSent(true);
    } catch (error) {
      if (error instanceof DuplicateApplicationError) {
        setErrors({ email: "Ya tienes una inscripción pendiente con este correo" });
      } else {
        toast({ title: "No se pudo enviar", description: "Inténtalo de nuevo en unos minutos", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 mx-auto text-white" />
        <h3 className="font-display text-xl font-bold text-white">¡Inscripción recibida!</h3>
        <p className="text-sm text-white/60">
          La directiva revisará tu solicitud. Cuando te asignen a un grupo, podrás entrar a Academia Nova
          iniciando sesión con <span className="text-white">{email.trim().toLowerCase()}</span>.
        </p>
      </div>
    );
  }

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-xs text-destructive">{errors[key]}</p> : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="glass-card rounded-2xl p-6 md:p-8 space-y-4 text-left">
      <div className="space-y-2">
        <Label htmlFor="app-nombre">Nombre completo</Label>
        <Input id="app-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} />
        {fieldError("nombre")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-email">Gmail</Label>
        <Input
          id="app-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu.nombre@gmail.com"
          maxLength={254}
        />
        <p className="text-xs text-white/50">Usa el mismo correo con el que iniciarás sesión: tu acceso quedará ligado a él.</p>
        {fieldError("email")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-whatsapp">WhatsApp</Label>
        <Input
          id="app-whatsapp"
          type="tel"
          inputMode="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="987654321"
          maxLength={20}
        />
        {fieldError("whatsapp")}
      </div>
      <div className="grid sm:grid-cols-[1fr_9rem] gap-4">
        <div className="space-y-2">
          <Label htmlFor="app-carrera">Carrera</Label>
          <Input
            id="app-carrera"
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            placeholder="Ingeniería Mecatrónica"
            maxLength={120}
          />
          {fieldError("carrera")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-ciclo">Ciclo</Label>
          <Select value={ciclo} onValueChange={setCiclo}>
            <SelectTrigger id="app-ciclo">
              <SelectValue placeholder="Elige" />
            </SelectTrigger>
            <SelectContent>
              {CICLOS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}.º ciclo
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("ciclo")}
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-white text-black hover:bg-white/80 active:bg-white/70 transition-colors duration-300"
        disabled={submitting}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
        {submitting ? "Enviando..." : "Enviar inscripción"}
      </Button>
    </form>
  );
}
