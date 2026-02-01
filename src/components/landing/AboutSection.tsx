import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Lightbulb, Users, Award } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Misión",
    description:
      "Formar ingenieros competitivos a través del desarrollo de robots autónomos, fomentando la innovación y el trabajo en equipo.",
    color: "primary",
  },
  {
    icon: Lightbulb,
    title: "Innovación",
    description:
      "Desarrollamos soluciones creativas utilizando tecnología de punta en mecánica, electrónica y programación.",
    color: "accent",
  },
  {
    icon: Users,
    title: "Comunidad",
    description:
      "Más de 50 miembros activos trabajando juntos, compartiendo conocimiento y pasión por la robótica.",
    color: "secondary",
  },
  {
    icon: Award,
    title: "Excelencia",
    description:
      "Múltiples podios en competencias nacionales e internacionales que validan nuestro compromiso con la calidad.",
    color: "gold",
  },
];

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="nosotros" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
            SOBRE NOSOTROS
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Construyendo el </span>
            <span className="text-gradient-primary">Futuro</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Somos un equipo de estudiantes universitarios apasionados por la robótica,
            unidos por el deseo de innovar y competir al más alto nivel.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 h-full border-gradient hover:scale-105 transition-transform duration-300">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    feature.color === "primary"
                      ? "bg-primary/10 text-primary"
                      : feature.color === "accent"
                      ? "bg-accent/10 text-accent"
                      : feature.color === "secondary"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-gold/10 text-gold"
                  }`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20"
        >
          <div className="glass-card rounded-2xl p-8 md:p-12">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
              <span className="text-foreground">Nuestra </span>
              <span className="text-gradient-accent">Historia</span>
            </h3>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {[
                { year: "2018", event: "Fundación", desc: "Inicio del equipo" },
                { year: "2020", event: "Primera Victoria", desc: "Campeonato Nacional" },
                { year: "2022", event: "Internacional", desc: "Competencia Global" },
                { year: "2024", event: "Expansión", desc: "Nuevas categorías" },
              ].map((item, index) => (
                <div key={item.year} className="flex items-center gap-4 md:flex-col md:text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground">
                    {item.year}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.event}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block w-24 h-0.5 bg-gradient-to-r from-primary to-accent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
