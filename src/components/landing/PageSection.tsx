import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/page-motion";

export function Label({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="font-mono text-[13px] uppercase tracking-[0.22em] text-white/50">
      {index && <span className="text-nova">{index} · </span>}
      {children}
    </p>
  );
}

interface PageHeroProps {
  id?: string;
  label: string;
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHero({ id, label, title, subtitle, action, children }: PageHeroProps) {
  return (
    <section id={id} className="font-sans py-24 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div {...fadeIn} className="max-w-3xl">
          <Label>{label}</Label>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold uppercase leading-[1.05] text-white">{title}</h1>
          {subtitle && <p className="mt-8 text-lg md:text-xl font-light leading-relaxed text-white/70">{subtitle}</p>}
          {action}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

interface SectionProps {
  id?: string;
  index?: string;
  label: string;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  children: ReactNode;
}

// Título fijo a la izquierda y contenido a la derecha en pantallas grandes.
export function Section({ id, index, label, title, subtitle, aside, children }: SectionProps) {
  return (
    <section id={id} className="font-sans border-t border-white/10 py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-6xl grid gap-10 lg:grid-cols-12 lg:gap-16">
        <motion.header {...fadeIn} className="lg:col-span-4 lg:sticky lg:top-28 self-start">
          <Label index={index}>{label}</Label>
          <h2 className="mt-4 font-sans text-3xl md:text-4xl font-semibold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="mt-4 text-base font-light leading-relaxed text-white/60">{subtitle}</p>}
          {aside}
        </motion.header>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}
