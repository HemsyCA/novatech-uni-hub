import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Linkedin, Github, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const teamMembers = [
  {
    name: "Carlos Mendoza",
    role: "Líder del Equipo",
    area: "Directiva",
    avatar: "👨‍💼",
  },
  {
    name: "María Torres",
    role: "Jefa de Mecánica",
    area: "Directiva",
    avatar: "👩‍🔧",
  },
  {
    name: "Luis García",
    role: "Jefe de Electrónica",
    area: "Directiva",
    avatar: "👨‍🔬",
  },
  {
    name: "Ana Quispe",
    role: "Jefa de Programación",
    area: "Directiva",
    avatar: "👩‍💻",
  },
  {
    name: "Diego Vargas",
    role: "Competidor Senior",
    area: "Competidor",
    avatar: "🤖",
  },
  {
    name: "Sofía López",
    role: "Competidora",
    area: "Competidor",
    avatar: "⚡",
  },
];

const generations = [
  { year: "2024", members: 12, active: true },
  { year: "2023", members: 15, active: true },
  { year: "2022", members: 10, active: false },
  { year: "2021", members: 8, active: false },
  { year: "2020", members: 6, active: false },
];

export function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="equipo" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary border border-secondary/20 mb-4">
            NUESTRO EQUIPO
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Las Mentes </span>
            <span className="text-gradient-accent">Detrás</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un equipo multidisciplinario de ingenieros apasionados que trabajan
            juntos para crear robots excepcionales.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-4 text-center hover:border-primary/50 transition-all duration-300 h-full">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-accent flex items-center justify-center text-3xl">
                  {member.avatar}
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1 truncate">
                  {member.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {member.role}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    member.area === "Directiva"
                      ? "bg-accent/20 text-accent"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {member.area}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Generations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Mural de Generaciones
              </h3>
              <p className="text-muted-foreground">
                Honramos a cada generación que ha sido parte de NovaTech UNI
              </p>
            </div>
            <div className="flex items-center gap-4 text-center">
              <div>
                <div className="font-display text-3xl font-bold text-primary">
                  {generations.reduce((acc, g) => acc + g.members, 0)}+
                </div>
                <div className="text-xs text-muted-foreground">Miembros Totales</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <div className="font-display text-3xl font-bold text-gold">
                  {generations.length}
                </div>
                <div className="text-xs text-muted-foreground">Generaciones</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {generations.map((gen, index) => (
              <motion.div
                key={gen.year}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  gen.active
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/50 border-border/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold ${
                    gen.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {gen.year.slice(-2)}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    Generación {gen.year}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {gen.members} miembros {gen.active && "• Activa"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="glass-card rounded-2xl p-8 md:p-12 border border-primary/30 max-w-3xl mx-auto">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              ¿Quieres ser parte del equipo?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Buscamos estudiantes apasionados por la robótica, la programación,
              la mecánica y la electrónica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-primary text-primary-foreground glow-cyan"
              >
                <Mail className="w-4 h-4 mr-2" />
                Únete a NovaTech
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground"
              >
                Conocer Requisitos
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
