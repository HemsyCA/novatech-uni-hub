import { CheckCircle2, Hammer, Lightbulb, Target, type LucideIcon } from "lucide-react";

type FieldKey = "queria" | "hice" | "paso" | "aprendi";

export const FICHA_FIELDS: { key: FieldKey; icon: LucideIcon; label: string; hint: string; max: number }[] = [
  { key: "queria", icon: Target, label: "Quería", hint: "Qué buscabas lograr, en una línea.", max: 300 },
  { key: "hice", icon: Hammer, label: "Hice", hint: "Lo esencial de cómo lo hiciste.", max: 800 },
  { key: "paso", icon: CheckCircle2, label: "Pasó", hint: "¿Funcionó? Si falló: por qué y cómo lo arreglaste.", max: 800 },
  { key: "aprendi", icon: Lightbulb, label: "Aprendí", hint: "Una frase que le sirva a la próxima persona.", max: 300 },
];
