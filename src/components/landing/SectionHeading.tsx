import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
  align?: "center" | "left";
  // "light" es para bloques de fondo blanco.
  tone?: "dark" | "light";
}

export function SectionHeading({ eyebrow, title, subtitle, as = "h2", align = "center", tone = "dark" }: SectionHeadingProps) {
  const light = tone === "light";
  const Heading = as;
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl mb-12 ${alignment}`}
    >
      {eyebrow && (
        <span className={`inline-block px-3 py-1 mb-4 text-xs tracking-widest uppercase border rounded-full ${
            light ? "border-black/20 text-black/60" : "border-white/20 text-white/70"
          }`}>
          {eyebrow}
        </span>
      )}
      <Heading
        className={`font-display font-black uppercase tracking-tight ${light ? "text-black" : "text-white"} ${
          as === "h1" ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl"
        }`}
      >
        {title}
      </Heading>
      {subtitle && (
        <p className={`mt-5 text-base md:text-lg leading-relaxed ${light ? "text-black/60" : "text-white/60"}`}>{subtitle}</p>
      )}
    </motion.div>
  );
}
