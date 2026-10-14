import { useState, type FormEvent } from "react";
import { ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import { FICHA_FIELDS } from "@/components/academia/ficha-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAcademy } from "@/components/academia/academy-context";
import { getLesson } from "@/lib/academia/course";
import { moduleInfo, type ModuleId } from "@/lib/academia/modules";
import type { AcademyFicha, AcademyFichaInput } from "@/services/supabase/academia";

const inputClass = "bg-black border-white/20 focus-visible:ring-white/40";

const moduleName = (id: string) => moduleInfo.find((m) => m.id === id)?.name ?? id;

const lessonCode = (lessonKey: string) => {
  const [moduleId, slug] = lessonKey.split("/");
  return getLesson(moduleId, slug)?.code ?? slug;
};

interface FichaFormProps {
  moduleId: ModuleId;
  lessonKey: string;
  isModuleFicha: boolean;
  initial?: AcademyFicha | null;
  onDone: () => void;
}

export function FichaForm({ moduleId, lessonKey, isModuleFicha, initial, onDone }: FichaFormProps) {
  const { fichas } = useAcademy();
  const [values, setValues] = useState({
    titulo: initial?.titulo ?? "",
    queria: initial?.queria ?? "",
    hice: initial?.hice ?? "",
    paso: initial?.paso ?? "",
    aprendi: initial?.aprendi ?? "",
    fuentes: initial?.fuentes ?? "",
    evidencia_url: initial?.evidencia_url ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof values, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    const required = (key: keyof typeof values, max: number) => {
      const length = values[key].trim().length;
      if (length < 3) next[key] = "Escribe al menos unas palabras.";
      else if (length > max) next[key] = `Máximo ${max} caracteres.`;
    };
    required("titulo", 120);
    FICHA_FIELDS.forEach((f) => required(f.key, f.max));
    required("fuentes", 500);
    if (!/^https?:\/\/\S+$/.test(values.evidencia_url.trim())) next.evidencia_url = "Pega un enlace que empiece con https://";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const input: AcademyFichaInput = {
      modulo: moduleId,
      lesson_key: lessonKey,
      es_del_modulo: isModuleFicha,
      titulo: values.titulo.trim(),
      queria: values.queria.trim(),
      hice: values.hice.trim(),
      paso: values.paso.trim(),
      aprendi: values.aprendi.trim(),
      fuentes: values.fuentes.trim(),
      evidencia_url: values.evidencia_url.trim(),
    };
    try {
      await fichas.save(input, initial?.id);
      toast({ title: initial ? "Ficha actualizada" : "Ficha guardada" });
      onDone();
    } catch {
      toast({ title: "No se pudo guardar la ficha", description: "Revisa tu conexión e inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const error = (key: string) => (errors[key] ? <p className="text-xs text-red-400">{errors[key]}</p> : null);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ficha-titulo">Título</Label>
        <Input
          id="ficha-titulo"
          value={values.titulo}
          onChange={(e) => set("titulo", e.target.value)}
          placeholder="Por ejemplo: Botón de inicio con pull-down"
          className={inputClass}
        />
        {error("titulo")}
      </div>

      {FICHA_FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={`ficha-${field.key}`} className="flex items-center gap-2">
            <field.icon className="h-4 w-4" />
            {field.label}
          </Label>
          <Textarea
            id={`ficha-${field.key}`}
            value={values[field.key]}
            onChange={(e) => set(field.key, e.target.value)}
            placeholder={field.hint}
            rows={field.max > 300 ? 3 : 2}
            className={inputClass}
          />
          {error(field.key)}
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ficha-fuentes">Fuentes</Label>
          <Input
            id="ficha-fuentes"
            value={values.fuentes}
            onChange={(e) => set("fuentes", e.target.value)}
            placeholder="Lección, hoja de datos o enlace"
            className={inputClass}
          />
          {error("fuentes")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ficha-evidencia">Evidencia (enlace)</Label>
          <Input
            id="ficha-evidencia"
            value={values.evidencia_url}
            onChange={(e) => set("evidencia_url", e.target.value)}
            placeholder="Wokwi, Onshape, Drive…"
            className={inputClass}
          />
          {error("evidencia_url")}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-black hover:bg-white/90 disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Guardar cambios" : "Guardar ficha"}
        </button>
        {initial && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-white/25 px-5 py-2.5 text-sm hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

interface FichaCardProps {
  ficha: AcademyFicha;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FichaCard({ ficha, onEdit, onDelete }: FichaCardProps) {
  return (
    <div className="rounded-2xl border border-white/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display font-bold">{ficha.titulo}</h3>
          <p className="mt-1 text-xs text-white/50">
            {moduleName(ficha.modulo)} · {lessonCode(ficha.lesson_key)}
            {ficha.es_del_modulo && " · Ficha del módulo"}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button type="button" onClick={onEdit} aria-label="Editar ficha" className="rounded-md p-2 hover:bg-white/10">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={onDelete} aria-label="Borrar ficha" className="rounded-md p-2 hover:bg-white/10">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      <dl className="mt-4 space-y-2">
        {FICHA_FIELDS.map((field) => (
          <div key={field.key} className="grid gap-1 sm:grid-cols-[80px_1fr]">
            <dt className="text-sm font-semibold">{field.label}</dt>
            <dd className="text-sm text-white/75 whitespace-pre-line">{ficha[field.key]}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/10 pt-3 text-xs text-white/50">
        <span>Fuentes: {ficha.fuentes}</span>
        <a href={ficha.evidencia_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white hover:underline">
          Ver evidencia <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
