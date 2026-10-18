import type { ComponentType } from "react";
import { BookOpenCheck, Bot, Cpu, Laptop, LayoutList, Lightbulb, MessageCircle, Milestone, Search, Sparkles, type LucideIcon } from "lucide-react";
import {
  AnatomyScene,
  GearScene,
  HowItWorksScene,
  LearnScene,
  MentorScene,
  PathScene,
  PinsScene,
  TipsScene,
  WelcomeScene,
  WhyScene,
} from "@/components/academia/guide/GuideScenes";

// La Ruta de bienvenida: la guía de inicio partida en paradas.
// Cada parada tiene su escena (GuideScenes) y una idea para llevar.

export interface GuideStop {
  index: number;
  title: string;
  label: string;
  icon: LucideIcon;
  takeaway: string;
  minutes: number;
  Scene: ComponentType;
}

const stops: Omit<GuideStop, "index">[] = [
  {
    title: "¡Bienvenido/a a Nova Tech Team!",
    label: "Bienvenida",
    icon: Sparkles,
    takeaway: "Avanzas a tu ritmo, pero nunca solo/a: tienes a tu encargado de convocatoria.",
    minutes: 1,
    Scene: WelcomeScene,
  },
  {
    title: "Aprender investigando",
    label: "Aprender investigando",
    icon: Search,
    takeaway: "Lee, investiga, prueba y documenta: siempre en ese ciclo.",
    minutes: 2,
    Scene: LearnScene,
  },
  {
    title: "Tu encargado de convocatoria",
    label: "Tu encargado",
    icon: MessageCircle,
    takeaway: "Preguntar está bien: cuenta qué intentaste y qué pasó.",
    minutes: 1,
    Scene: MentorScene,
  },
  {
    title: "¿Cómo funciona?",
    label: "Cómo funciona",
    icon: Milestone,
    takeaway: "3 partes, entre 16 y 20 horas, en unas 3 semanas.",
    minutes: 1,
    Scene: HowItWorksScene,
  },
  {
    title: "Lo que necesitas",
    label: "Lo que necesitas",
    icon: Laptop,
    takeaway: "Una computadora, tres cuentas gratuitas y ningún componente.",
    minutes: 1,
    Scene: GearScene,
  },
  {
    title: "¿Por qué aprendemos estas cosas?",
    label: "Por qué esto",
    icon: Bot,
    takeaway: "6 piezas básicas te sirven para cualquier robot de Nova.",
    minutes: 2,
    Scene: WhyScene,
  },
  {
    title: "Mapa de pines Nova",
    label: "Mapa de pines",
    icon: Cpu,
    takeaway: "Siempre las mismas conexiones, en todas las lecciones y en la tarea final.",
    minutes: 1,
    Scene: PinsScene,
  },
  {
    title: "Cómo está organizada cada lección",
    label: "Cada lección",
    icon: LayoutList,
    takeaway: "Todas tienen la misma estructura y simulaciones para aprender tocando.",
    minutes: 2,
    Scene: AnatomyScene,
  },
  {
    title: "Tu camino en Nova",
    label: "Tu camino en Nova",
    icon: BookOpenCheck,
    takeaway: "Parte 1 → Parte 2 → práctica presencial → miembro de Nova.",
    minutes: 1,
    Scene: PathScene,
  },
  {
    title: "Consejos para avanzar",
    label: "Consejos",
    icon: Lightbulb,
    takeaway: "Pasos pequeños, lee los errores y escribe tu bitácora desde el día 1.",
    minutes: 1,
    Scene: TipsScene,
  },
];

export const guideStops: GuideStop[] = stops.map((stop, index) => ({ ...stop, index }));

export const guideMinutes = guideStops.reduce((total, stop) => total + stop.minutes, 0);
