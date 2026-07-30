import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Printer, CalendarIcon, Clock, DollarSign, Loader2, User, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import novatechLogo from "@/assets/novatech-logo.png";
import { listPrinters, listUserReservations, createReservation } from "@/services/supabase/reservations";
import { getCurrentSession, subscribeToAuth } from "@/services/supabase/auth";
import type { Printer, Reservation } from "@/types/domain";

export default function Print3D() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [grams, setGrams] = useState("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  // Campos de contacto para usuarios no autenticados
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const selectedPrinterData = printers.find(p => p.id === selectedPrinter);
  const estimatedCost = selectedPrinterData 
    ? (parseFloat(grams || "0") * selectedPrinterData.cost_per_gram + parseFloat(hours || "0") * selectedPrinterData.cost_per_hour)
    : 0;

  useEffect(() => {
    const { data: { subscription } } = subscribeToAuth((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });

    getCurrentSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });

    fetchPrinters();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Solo cargar reservas si el usuario está autenticado
    if (user) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPrinters = async () => {
    try {
      const printersData = await listPrinters();
      setPrinters(printersData);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las impresoras", variant: "destructive" });
    }
  };

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const reservationsData = await listUserReservations(user.id);
      setReservations(reservationsData);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar tus reservas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !selectedPrinter) {
      toast({ title: "Error", description: "Completa todos los campos requeridos", variant: "destructive" });
      return;
    }

    // Validar campos de contacto si no está autenticado
    if (!user) {
      if (!contactName || !contactEmail || !contactPhone) {
        toast({ 
          title: "Error", 
          description: "Completa todos los datos de contacto", 
          variant: "destructive" 
        });
        return;
      }
    }

    setSubmitting(true);
    
    const reservationData: Record<string, unknown> = {
      user_id: user?.id || null,
      printer_id: selectedPrinter,
      project_name: projectName,
      description,
      estimated_grams: parseFloat(grams),
      estimated_hours: parseFloat(hours),
      scheduled_date: format(date, "yyyy-MM-dd"),
      scheduled_time: time,
    };

    // Agregar datos de contacto si no hay usuario autenticado
    if (!user) {
      reservationData.contact_name = contactName;
      reservationData.contact_email = contactEmail;
      reservationData.contact_phone = contactPhone;
    }

    try {
      await createReservation(reservationData);
      toast({ 
        title: "¡Reserva creada!", 
        description: user 
          ? "Tu turno ha sido registrado." 
          : "Tu turno ha sido registrado. Te contactaremos pronto para confirmar." 
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
        fetchReservations();
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo crear la reserva", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-blue-500/20 text-blue-400",
    in_progress: "bg-cyan-500/20 text-cyan-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobado",
    in_progress: "En Progreso",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={user ? "/dashboard" : "/"} className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Printer className="h-6 w-6 text-cyan-400" />
              <span className="font-display font-bold">Impresión 3D</span>
            </div>
          </div>
          {user && (
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario de reserva */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="glass-card border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-cyan-400" />
                  Nueva Reserva
                </CardTitle>
                <CardDescription>Reserva tu turno de impresión 3D</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Campos de contacto solo para usuarios no autenticados */}
                  {!user && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Nombre completo *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="contact-name"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Tu nombre completo"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="contact-email"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Teléfono *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="contact-phone"
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+51 999 999 999"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="border-t border-border/30 pt-4" />
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Nombre del proyecto</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Ej: Chasis del robot"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción (opcional)</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalles adicionales..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Impresora</Label>
                    <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una impresora" />
                      </SelectTrigger>
                      <SelectContent>
                        {printers.map((printer) => (
                          <SelectItem key={printer.id} value={printer.id}>
                            {printer.name} ({printer.type === "filament" ? "Filamento" : "Resina"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gramos estimados</Label>
                      <Input
                        type="number"
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        placeholder="Ej: 50"
                        min="1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Horas estimadas</Label>
                      <Input
                        type="number"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        placeholder="Ej: 3"
                        min="0.5"
                        step="0.5"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: es }) : "Seleccionar"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Hora</Label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Costo estimado */}
                  <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-cyan-400" />
                          <span className="text-muted-foreground">Costo Estimado:</span>
                        </div>
                        <span className="text-2xl font-bold text-cyan-400">
                          S/ {estimatedCost.toFixed(2)}
                        </span>
                      </div>
                      {selectedPrinterData && (
                        <p className="text-xs text-muted-foreground mt-2">
                          S/ {selectedPrinterData.cost_per_gram}/g + S/ {selectedPrinterData.cost_per_hour}/hora
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full bg-gradient-primary" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Reservar Turno
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Historial de reservas - Solo para usuarios autenticados */}
          {user ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-violet-400" />
                    Mis Reservas
                  </CardTitle>
                  <CardDescription>Historial de tus impresiones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {reservations.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No tienes reservas aún
                      </p>
                    ) : (
                      reservations.map((res) => (
                        <Card key={res.id} className="bg-muted/30 border-border/30">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{res.project_name}</h4>
                              <Badge className={statusColors[res.status]}>
                                {statusLabels[res.status]}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <span>📅 {format(new Date(res.scheduled_date), "PP", { locale: es })}</span>
                              <span>🕐 {res.scheduled_time}</span>
                              <span>⚖️ {res.estimated_grams}g</span>
                              <span>⏱️ {res.estimated_hours}h</span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                              <span className="text-xs">{res.printers?.name}</span>
                              <span className="font-semibold text-cyan-400">
                                S/ {Number(res.estimated_cost).toFixed(2)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="glass-card border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-cyan-400" />
                    Información
                  </CardTitle>
                  <CardDescription>Acerca de nuestras impresoras 3D</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Reserva tu turno para usar nuestras impresoras 3D profesionales. 
                      Disponemos de impresoras de filamento y resina para todos tus proyectos.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Proceso:</h4>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Completa el formulario con los detalles de tu proyecto</li>
                        <li>Selecciona la fecha y hora que prefieras</li>
                        <li>Recibirás una confirmación por email</li>
                        <li>Te contactaremos para coordinar la entrega</li>
                      </ol>
                    </div>
                    <div className="pt-4 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/auth" className="text-primary hover:underline">
                          Inicia sesión
                        </Link>{" "}
                        para ver tu historial de reservas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
