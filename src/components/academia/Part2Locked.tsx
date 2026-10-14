import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAcademy } from "@/components/academia/academy-context";

export function Part2Status() {
  const { entrega } = useAcademy();
  const estado = entrega.entrega?.estado;

  if (estado === "enviada") return <>Tu tarea final está en revisión. La Parte 2 se abrirá cuando la directiva la apruebe.</>;
  if (estado === "observada") return <>La directiva dejó observaciones en tu tarea final. Corrígelas y vuelve a enviarla.</>;
  return <>Se abre cuando la directiva aprueba tu tarea final de la Parte 1.</>;
}

export function Part2Locked() {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-white/15 p-8">
      <Lock className="h-8 w-8 text-white/60 mb-5" />
      <p className="text-xs uppercase tracking-widest text-white/50">Parte 2 · Soldadura</p>
      <h1 className="font-display text-2xl font-bold mt-2 mb-3">Todavía no está disponible</h1>
      <p className="text-white/60 leading-relaxed">
        <Part2Status />
      </p>
      <Link
        to="/academia/tarea-final#entrega"
        className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 font-semibold text-black hover:bg-white/90 transition-colors"
      >
        Ir a la tarea final
      </Link>
    </div>
  );
}
