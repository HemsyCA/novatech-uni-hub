import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, NotebookPen, Plus } from "lucide-react";
import { useAcademy } from "@/components/academia/academy-context";
import { FichaCard, FichaForm } from "@/components/academia/Ficha";
import { toast } from "@/hooks/use-toast";
import type { Lesson } from "@/lib/academia/course";
import type { AcademyFicha } from "@/services/supabase/academia";

function useFichaActions() {
  const { fichas } = useAcademy();
  const [editing, setEditing] = useState<AcademyFicha | null>(null);

  const remove = async (ficha: AcademyFicha) => {
    if (!window.confirm(`¿Borrar la ficha "${ficha.titulo}"?`)) return;
    try {
      await fichas.remove(ficha.id);
      toast({ title: "Ficha borrada" });
    } catch {
      toast({ title: "No se pudo borrar la ficha", variant: "destructive" });
    }
  };

  return { editing, setEditing, remove };
}

function ModuleFicha({ lesson }: { lesson: Lesson }) {
  const { fichas } = useAcademy();
  const { editing, setEditing, remove } = useFichaActions();
  const ficha = fichas.moduleFicha(lesson.moduleId);

  return (
    <section id="ficha" className="mt-14 scroll-mt-24 rounded-2xl border border-white/25 p-6">
      <div className="flex items-center gap-3">
        <NotebookPen className="h-5 w-5" />
        <h2 className="font-display text-xl font-bold">Ficha del módulo</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-black">Obligatoria</span>
      </div>
      <p className="mt-2 text-sm text-white/60">
        Cuenta lo que más te costó en este módulo con la{" "}
        <Link to="/academia/bitacora" className="text-white underline underline-offset-4">
          ficha de bitácora
        </Link>
        . Es una de las tres fichas que se revisan en la tarea final.
      </p>
      <div className="mt-6">
        {ficha && editing?.id !== ficha.id ? (
          <FichaCard ficha={ficha} onEdit={() => setEditing(ficha)} onDelete={() => remove(ficha)} />
        ) : (
          <FichaForm
            moduleId={lesson.moduleId}
            lessonKey={lesson.key}
            isModuleFicha
            initial={ficha}
            onDone={() => setEditing(null)}
          />
        )}
      </div>
    </section>
  );
}

function LessonFichaList({ lesson }: { lesson: Lesson }) {
  const { fichas } = useAcademy();
  const { editing, setEditing, remove } = useFichaActions();
  const [creating, setCreating] = useState(false);
  const list = fichas.lessonFichas(lesson.key);

  return (
    <details className="group mt-14 rounded-2xl border border-white/15" open={list.length > 0 || undefined}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <NotebookPen className="h-5 w-5 shrink-0" />
          <span>
            <span className="block font-semibold">¿Algo te costó en esta lección?</span>
            <span className="block text-sm text-white/60">
              Anótalo en una ficha (opcional){list.length > 0 && ` · ${list.length} guardada${list.length > 1 ? "s" : ""}`}
            </span>
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-white/10 p-5">
        {list.map((ficha) =>
          editing?.id === ficha.id ? (
            <FichaForm
              key={ficha.id}
              moduleId={lesson.moduleId}
              lessonKey={lesson.key}
              isModuleFicha={false}
              initial={ficha}
              onDone={() => setEditing(null)}
            />
          ) : (
            <FichaCard key={ficha.id} ficha={ficha} onEdit={() => setEditing(ficha)} onDelete={() => remove(ficha)} />
          ),
        )}
        {creating ? (
          <FichaForm
            moduleId={lesson.moduleId}
            lessonKey={lesson.key}
            isModuleFicha={false}
            onDone={() => setCreating(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva ficha
          </button>
        )}
      </div>
    </details>
  );
}

export function LessonFichas({ lesson }: { lesson: Lesson }) {
  return lesson.isTask ? <ModuleFicha lesson={lesson} /> : <LessonFichaList lesson={lesson} />;
}
