import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarIcon, Loader2, Mail, Phone, Printer as PrinterIcon, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { listPrinters, listUserReservations, createReservation } from "@/services/supabase/reservations";
import { getCurrentSession, subscribeToAuth } from "@/services/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { StatusTracker } from "@/components/StatusTracker";
import { reservationSteps } from "@/lib/tracker-steps";
import { EmptyState, PageHeader, PageTabs, StatusPill, type StatusTone } from "@/components/account/ui";
import { inputClass, primaryButton, secondaryButton } from "@/lib/account/styles";
import type { Printer, Reservation } from "@/types/domain";

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const RESERVATION_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Enviada", tone: "neutral" },
  approved: { label: "Aceptada", tone: "progress" },
  in_progress: { label: "Imprimiendo", tone: "progress" },
  completed: { label: "Lista para recoger", tone: "attention" },
  cancelled: { label: "Cancelada", tone: "off" },
};
const ACTIVE = ["pending", "approved", "in_progress", "completed"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-white/60">{label}</span>
      {children}
    </label>
  );
}

export default function Print3D() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [grams, setGrams] = useState("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  // Datos de contacto solo para quien reserva sin cuenta.
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // ?vista=reservas (o el enlace antiguo #mis-reservas) abre tus reservas.
  const view = user && (searchParams.get("vista") === "reservas" || location.hash === "#mis-reservas") ? "reservas" : "reservar";

  const printer = printers.find((p) => p.id === selectedPrinter);
  const estimatedCost = printer ? parseFloat(grams || "0") * printer.cost_per_gram + parseFloat(hours || "0") * printer.cost_per_hour : 0;
  const activeReservations = reservations.filter((r) => ACTIVE.includes(r.status)).length;

  useEffect(() => {
    const { data: { subscription } } = subscribeToAuth(async (_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });
    getCurrentSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });
    listPrinters()
      .then(setPrinters)
      .catch(() => toast({ title: "Error", description: "No se pudieron cargar las impresoras", variant: "destructive" }))
      .finally(() => setLoading(false));
    return () => subscription.unsubscribe();
  }, [toast]);

  const fetchReservations = (userId: string) =>
    listUserReservations(userId)
      .then(setReservations)
      .catch(() => toast({ title: "Error", description: "No se pudieron cargar tus reservas", variant: "destructive" }));

  useEffect(() => {
    if (!user) return;
    fetchReservations(user.id);
    const channel = supabase
      .channel(`print-reservations-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "print_reservations", filter: `user_id=eq.${user.id}` },
        () => fetchReservations(user.id),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // fetchReservations solo depende del usuario y de toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!date || !time || !selectedPrinter) {
      toast({ title: "Faltan datos", description: "Elige la impresora, la fecha y la hora.", variant: "destructive" });
      return;
    }
    if (!user && (!contactName || !contactEmail || !contactPhone)) {
      toast({ title: "Faltan datos", description: "Completa tus datos de contacto.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const reservation: Record<string, unknown> = {
      user_id: user?.id ?? null,
      printer_id: selectedPrinter,
      project_name: projectName,
      description,
      estimated_grams: parseFloat(grams),
      estimated_hours: parseFloat(hours),
      scheduled_date: format(date, "yyyy-MM-dd"),
      scheduled_time: time,
    };
    if (!user) Object.assign(reservation, { contact_name: contactName, contact_email: contactEmail, contact_phone: contactPhone });

    try {
      await createReservation(reservation);
      toast({
        title: "¡Reserva enviada!",
        description: user ? "Te avisaremos cuando la aceptemos." : "Te contactaremos pronto para confirmarla.",
      });
      setProjectName("");
      setDescription("");
      setGrams("");
      setHours("");
      setDate(undefined);
      setTime("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      if (user) {
        await fetchReservations(user.id);
        navigate("/print3d?vista=reservas", { replace: true });
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo crear la reserva", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const reserveForm = (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 p-5 md:p-6">
        {!user && (
          <fieldset className="space-y-4 border-b border-white/10 pb-5">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Tus datos</legend>
            <Field label="Nombre completo">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={`${inputClass} pl-10`} required />
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Correo">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={`${inputClass} pl-10`} required />
                </div>
              </Field>
              <Field label="Teléfono">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+51 999 999 999" className={`${inputClass} pl-10`} required />
                </div>
              </Field>
            </div>
          </fieldset>
        )}

        <Field label="Nombre del proyecto">
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ej.: chasis del robot" className={inputClass} required />
        </Field>
        <Field label="Descripción (opcional)">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Material, color, detalles…" className={inputClass} />
        </Field>
        <Field label="Impresora">
          <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
            <SelectTrigger className="rounded-xl border-white/15 bg-black">
              <SelectValue placeholder="Elige una impresora" />
            </SelectTrigger>
            <SelectContent className="nova-shell font-mono">
              {printers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} · {p.type === "filament" ? "Filamento" : "Resina"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Gramos estimados">
            <input type="number" min="1" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="50" className={inputClass} required />
          </Field>
          <Field label="Horas estimadas">
            <input type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="3" className={inputClass} required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha">
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className={`${inputClass} flex items-center gap-2 text-left`}>
                  <CalendarIcon className="h-4 w-4 text-white/50" />
                  <span className={date ? "text-white" : "text-white/30"}>{date ? format(date, "d MMM yyyy", { locale: es }) : "Elegir"}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="nova-shell w-auto p-0 font-mono">
                <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
              </PopoverContent>
            </Popover>
          </Field>
          <Field label="Hora">
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="rounded-xl border-white/15 bg-black">
                <SelectValue placeholder="Elegir" />
              </SelectTrigger>
              <SelectContent className="nova-shell font-mono">
                {HOURS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-4 py-3">
          <div>
            <p className="text-xs text-white/50">Costo estimado</p>
            {printer && (
              <p className="text-[11px] text-white/40">
                S/ {printer.cost_per_gram}/g + S/ {printer.cost_per_hour}/h
              </p>
            )}
          </div>
          <p className="text-2xl font-bold">S/ {estimatedCost.toFixed(2)}</p>
        </div>

        <button type="submit" disabled={submitting} className={`${primaryButton} w-full`}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Reservar turno
        </button>
      </form>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">Cómo funciona</h2>
          <ol className="mt-3 space-y-3 text-sm text-white/70">
            {["Completa los datos de tu proyecto.", "Elige la fecha y la hora.", "Aceptamos tu reserva y la imprimimos.", "Te avisamos cuando esté lista para recoger."].map(
              (stepText, index) => (
                <li key={stepText} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/25 text-xs">{index + 1}</span>
                  {stepText}
                </li>
              ),
            )}
          </ol>
        </section>
        {!user && (
          <p className="rounded-2xl border border-white/10 p-5 text-sm text-white/60">
            Con una cuenta sigues el estado de tus impresiones y te avisamos de cada cambio.{" "}
            <Link to={`/auth?next=${encodeURIComponent("/print3d")}`} className="text-white underline underline-offset-4">
              Inicia sesión
            </Link>
          </p>
        )}
      </aside>
    </div>
  );

  const myReservations =
    reservations.length === 0 ? (
      <EmptyState
        action={
          <button type="button" onClick={() => navigate("/print3d", { replace: true })} className={secondaryButton}>
            Reservar una impresión
          </button>
        }
      >
        Todavía no tienes reservas.
      </EmptyState>
    ) : (
      <div className="space-y-3">
        {reservations.map((res) => {
          const status = RESERVATION_STATUS[res.status] ?? { label: res.status, tone: "neutral" as StatusTone };
          return (
            <article key={res.id} className="space-y-4 rounded-2xl border border-white/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <PrinterIcon className="h-4 w-4 text-white/60" /> {res.project_name}
                  </p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {format(new Date(`${res.scheduled_date}T12:00:00`), "d MMM yyyy", { locale: es })} · {res.scheduled_time} ·{" "}
                    {res.printers?.name} · {res.estimated_grams} g · {res.estimated_hours} h
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">S/ {Number(res.estimated_cost).toFixed(2)}</span>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </div>
              </div>
              <StatusTracker steps={reservationSteps} currentKey={res.status} />
            </article>
          );
        })}
      </div>
    );

  return (
    <main className="container mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-28">
      <PageHeader title="Impresión 3D" description="Reserva un turno en nuestras impresoras y sigue su estado." />
      {user && (
        <PageTabs
          active={view}
          tabs={[
            { id: "reservar", label: "Reservar", to: "/print3d" },
            { id: "reservas", label: "Mis reservas", to: "/print3d?vista=reservas", count: activeReservations },
          ]}
        />
      )}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      ) : view === "reservas" ? (
        myReservations
      ) : (
        reserveForm
      )}
    </main>
  );
}
