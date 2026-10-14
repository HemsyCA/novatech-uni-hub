import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, MessageSquareWarning, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAcademy } from "@/components/academia/academy-context";
import { StatusDot } from "@/components/academia/ui";
import { courseModules, lessonPath } from "@/lib/academia/course";
import type { AcademyEntregaInput } from "@/services/supabase/academia";

type LinkField = Exclude<keyof AcademyEntregaInput, "reflexion">;

const linkGroups: { title: string; fields: { key: LinkField; label: string; placeholder: string }[] }[] = [
  {
    title: "Programación",
    fields: [
      { key: "wokwi_url", label: "Proyecto en Wokwi", placeholder: "https://wokwi.com/projects/…" },
      { key: "diagrama_url", label: "Imagen del diagrama de flujo", placeholder: "Enlace de Drive o similar" },
    ],
  },
  {
    title: "Electrónica",
    fields: [
      { key: "electronica_url", label: "PDF del esquemático y capturas de la PCB (2D y 3D)", placeholder: "Carpeta de Drive" },
    ],
  },
  {
    title: "Mecánica",
    fields: [
      { key: "onshape_url", label: "Documento de Onshape", placeholder: "https://cad.onshape.com/documents/…" },
      { key: "mecanica_url", label: "Archivo STL y tabla de medidas", placeholder: "Carpeta de Drive" },
    ],
  },
  {
    title: "Video",
    fields: [{ key: "video_url", label: "Video de 2 a 3 minutos", placeholder: "YouTube no listado o Drive" }],
  },
];

const inputClass = "bg-black border-white/20 focus-visible:ring-white/40";
const dateFormatter = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

function EntregaForm({ onDone }: { onDone: () => void }) {
  const { entrega } = useAcademy();
  const current = entrega.entrega;
  const [values, setValues] = useState<AcademyEntregaInput>({
    wokwi_url: current?.wokwi_url ?? "",
    diagrama_url: current?.diagrama_url ?? "",
    electronica_url: current?.electronica_url ?? "",
    onshape_url: current?.onshape_url ?? "",
    mecanica_url: current?.mecanica_url ?? "",
    video_url: current?.video_url ?? "",
    reflexion: current?.reflexion ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AcademyEntregaInput, string>>>({});
  const [sending, setSending] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    linkGroups.flatMap((g) => g.fields).forEach(({ key }) => {
      if (!/^https?:\/\/\S+$/.test(values[key].trim())) next[key] = "Pega un enlace que empiece con https://";
    });
    const reflexion = values.reflexion.trim().length;
    if (reflexion < 50) next.reflexion = "Escribe al menos unas líneas respondiendo las cuatro preguntas.";
    else if (reflexion > 4000) next.reflexion = "Máximo 4000 caracteres.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      await entrega.submit(values);
      toast({ title: "Entrega enviada", description: "La directiva la revisará pronto." });
      onDone();
    } catch (error) {
      const message = (error as { message?: string } | null)?.message;
      toast({ title: "No se pudo enviar la entrega", description: message || "Inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      {linkGroups.map((group) => (
        <fieldset key={group.title} className="space-y-4">
          <legend className="font-display font-bold">{group.title}</legend>
          {group.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`entrega-${field.key}`}>{field.label}</Label>
              <Input
                id={`entrega-${field.key}`}
                value={values[field.key]}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className={inputClass}
              />
              {errors[field.key] && <p className="text-xs text-red-400">{errors[field.key]}</p>}
            </div>
          ))}
        </fieldset>
      ))}

      <fieldset className="space-y-1.5">
        <legend className="font-display font-bold mb-2">Reflexión final</legend>
        <Label htmlFor="entrega-reflexion" className="text-white/60 font-normal leading-relaxed">
          ¿Qué fue lo más difícil y cómo lo resolviste? ¿Qué investigaste por tu cuenta? ¿Qué error te tomó más tiempo? ¿Qué
          categoría de robots te llama más la atención y por qué?
        </Label>
        <Textarea
          id="entrega-reflexion"
          value={values.reflexion}
          onChange={(e) => setValues((v) => ({ ...v, reflexion: e.target.value }))}
          rows={7}
          className={inputClass}
        />
        {errors.reflexion && <p className="text-xs text-red-400">{errors.reflexion}</p>}
      </fieldset>

      <p className="text-sm text-white/60">
        Antes de enviar, abre cada enlace en una <span className="text-white">ventana de incógnito</span> para comprobar
        que se ve sin iniciar sesión. Tus fichas de módulo ya están guardadas: no hace falta adjuntarlas.
      </p>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 disabled:opacity-60 transition-colors"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {current ? "Reenviar entrega" : "Enviar entrega"}
      </button>
    </form>
  );
}

export function EntregaSection() {
  const { progress, fichas, entrega } = useAcademy();
  const [editing, setEditing] = useState(false);
  const current = entrega.entrega;

  const parts = courseModules.map((module) => {
    const task = module.lessons.find((l) => l.isTask)!;
    return { module, task, done: progress.completed.has(task.key) && Boolean(fichas.moduleFicha(module.id)) };
  });
  const ready = parts.every((p) => p.done);

  let body;
  if (!current && !ready) {
    body = (
      <>
        <p className="text-sm text-white/60 mb-4">
          Podrás entregar cuando completes las tres partes de la tarea final, cada una con su ficha de módulo.
        </p>
        <ul className="divide-y divide-white/10">
          {parts.map(({ module, task, done }) => (
            <li key={module.id}>
              <Link to={lessonPath(task)} className="flex items-center gap-3 py-3 text-sm group">
                <StatusDot done={done} />
                <span className="flex-1 group-hover:underline underline-offset-4">Parte {module.name}</span>
                <span className="text-xs text-white/50">{done ? "Lista" : "Pendiente"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  } else if (!current || editing || current.estado === "observada") {
    body = (
      <>
        {current?.estado === "observada" && (
          <div className="mb-8 flex gap-3 rounded-xl border border-white/30 bg-white/[0.05] p-4 text-sm">
            <MessageSquareWarning className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">La directiva dejó observaciones</p>
              <p className="mt-1 text-white/75 whitespace-pre-line">{current.comentario}</p>
              <p className="mt-2 text-white/50">Corrige lo indicado y vuelve a enviar.</p>
            </div>
          </div>
        )}
        <EntregaForm onDone={() => setEditing(false)} />
      </>
    );
  } else if (current.estado === "enviada") {
    body = (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Clock className="h-6 w-6 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">Entrega enviada · en revisión</p>
          <p className="text-sm text-white/60">
            La enviaste el {dateFormatter.format(new Date(current.enviado_at))}. Te avisaremos cuando la directiva la revise.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-white/25 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
        >
          Editar entrega
        </button>
      </div>
    );
  } else {
    body = (
      <div className="flex gap-4">
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">¡Tu tarea final fue aprobada!</p>
          <p className="text-sm text-white/60 mt-1">
            Pronto se abrirá la Parte 2 de Academia Nova: soldadura THT y SMD, para prepararte antes de la práctica
            presencial.
          </p>
          {current.comentario && <p className="mt-3 text-sm text-white/75 whitespace-pre-line">“{current.comentario}”</p>}
        </div>
      </div>
    );
  }

  return (
    <section id="entrega" className="mb-12 scroll-mt-24 rounded-2xl border border-white/25 p-6">
      <h2 className="font-display text-xl font-bold mb-4">Entregar tarea final</h2>
      {body}
    </section>
  );
}
