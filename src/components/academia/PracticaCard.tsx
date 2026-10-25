import { CalendarPlus, CheckCircle2, Clock, MapPin, XCircle } from "lucide-react";
import { formatLimaDateTime } from "@/lib/academy-dates";
import type { AcademyPractica } from "@/services/supabase/academia";

const PRACTICE_HOURS = 3;

const toCalendarStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const googleCalendarUrl = (practica: AcademyPractica) => {
  const start = new Date(practica.fecha);
  const end = new Date(start.getTime() + PRACTICE_HOURS * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Práctica de soldadura · NovaTech UNI",
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    location: practica.lugar,
    details: practica.indicaciones ?? "Práctica presencial de Academia Nova. Recibirás tu kit de placa para soldar.",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
};

function Comentario({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="mt-3 rounded-lg bg-white/[0.06] px-4 py-3 text-sm text-white/80">
      <span className="font-semibold text-white">Comentario del encargado:</span> {text}
    </p>
  );
}

export function PracticaCard({ practica }: { practica: AcademyPractica | null }) {
  if (!practica) {
    return (
      <div className="flex gap-4 rounded-2xl border border-dashed border-white/20 p-5">
        <Clock className="h-6 w-6 shrink-0 text-white/50" />
        <div>
          <p className="font-semibold">Práctica presencial: aún sin fecha</p>
          <p className="mt-1 text-sm text-white/60">
            El encargado de la convocatoria te asignará una fecha en los próximos días. Aparecerá aquí y en Inicio.
          </p>
        </div>
      </div>
    );
  }

  if (practica.estado === "asistio") {
    return (
      <div className="flex gap-4 rounded-2xl border border-white/25 p-5">
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold">Completaste la práctica presencial</p>
          <p className="mt-1 text-sm text-white/60">
            La directiva revisará tu recorrido y decidirá tu ingreso al equipo. Te avisaremos por aquí.
          </p>
          <Comentario text={practica.comentario} />
        </div>
      </div>
    );
  }

  if (practica.estado === "no_asistio") {
    return (
      <div className="flex gap-4 rounded-2xl border border-white/15 p-5">
        <XCircle className="h-6 w-6 shrink-0 text-white/60" />
        <div className="min-w-0">
          <p className="font-semibold">No registramos tu asistencia a la práctica</p>
          <p className="mt-1 text-sm text-white/60">
            Escribe al encargado de la convocatoria para ver si es posible reprogramarla.
          </p>
          <Comentario text={practica.comentario} />
        </div>
      </div>
    );
  }

  const past = new Date(practica.fecha).getTime() < Date.now();

  return (
    <div className="rounded-2xl border border-white/25 p-5">
      <p className="text-xs uppercase tracking-widest text-white/50">Tu práctica presencial</p>
      <p className="mt-2 font-display text-xl font-bold first-letter:uppercase">{formatLimaDateTime(practica.fecha)}</p>
      <p className="mt-2 flex items-start gap-2 text-sm text-white/80">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        {practica.lugar}
      </p>
      {practica.indicaciones && <p className="mt-3 whitespace-pre-line text-sm text-white/60">{practica.indicaciones}</p>}
      {past ? (
        <p className="mt-4 text-sm text-white/60">La fecha ya pasó. El encargado registrará tu asistencia.</p>
      ) : (
        <a
          href={googleCalendarUrl(practica)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Agregar a Google Calendar
        </a>
      )}
    </div>
  );
}
