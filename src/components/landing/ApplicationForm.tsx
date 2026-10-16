import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { domainHasMailServers } from "@/lib/email-validation";
import { DuplicateApplicationError, submitAcademyApplication } from "@/services/supabase/academia";
import { useLanguage } from "@/contexts/LanguageContext";
import { fillTemplate, pageText } from "@/lib/i18n-pages";

const CICLOS = Array.from({ length: 10 }, (_, i) => String(i + 1));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^\+?[0-9]{9,15}$/;

export function ApplicationForm() {
  const { lang } = useLanguage();
  const f = pageText[lang].form;
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
    if (!nombre.trim()) nextErrors.nombre = f.errName;
    if (!EMAIL_RE.test(cleanEmail)) nextErrors.email = f.errEmail;
    if (!WHATSAPP_RE.test(cleanWhatsapp)) nextErrors.whatsapp = f.errWhatsapp;
    if (!carrera.trim()) nextErrors.carrera = f.errCareer;
    if (!ciclo) nextErrors.ciclo = f.errCycle;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      if ((await domainHasMailServers(cleanEmail)) === false) {
        setErrors({ email: f.errDomain });
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
        setErrors({ email: f.errDuplicate });
      } else {
        toast({ title: f.toastTitle, description: f.toastDescription, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 mx-auto text-white" />
        <h3 className="font-display text-xl font-bold text-white">{f.successTitle}</h3>
        <p className="text-sm text-white/60">
          {f.successBefore}
          <span className="text-white">{email.trim().toLowerCase()}</span>
          {f.successAfter}
        </p>
      </div>
    );
  }

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-xs text-destructive">{errors[key]}</p> : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="glass-card rounded-2xl p-6 md:p-8 space-y-4 text-left">
      <div className="space-y-2">
        <Label htmlFor="app-nombre">{f.name}</Label>
        <Input id="app-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} />
        {fieldError("nombre")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-email">{f.email}</Label>
        <Input
          id="app-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={f.emailPlaceholder}
          maxLength={254}
        />
        <p className="text-xs text-white/50">{f.emailHint}</p>
        {fieldError("email")}
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-whatsapp">{f.whatsapp}</Label>
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
          <Label htmlFor="app-carrera">{f.career}</Label>
          <Input
            id="app-carrera"
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            placeholder={f.careerPlaceholder}
            maxLength={120}
          />
          {fieldError("carrera")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-ciclo">{f.cycle}</Label>
          <Select value={ciclo} onValueChange={setCiclo}>
            <SelectTrigger id="app-ciclo">
              <SelectValue placeholder={f.cyclePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {CICLOS.map((c) => (
                <SelectItem key={c} value={c}>
                  {fillTemplate(f.cycleOption, { n: c })}
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
        {submitting ? f.sending : f.submit}
      </Button>
    </form>
  );
}
