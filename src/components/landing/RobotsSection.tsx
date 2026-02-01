import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Shield, Gauge, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const robots = [
  {
    name: "NOVA-X1",
    category: "Sumo 3kg",
    description: "Robot de combate diseñado para máxima tracción y empuje lateral.",
    stats: { potencia: 95, defensa: 80, velocidad: 70 },
    color: "primary",
    image: "🤖",
  },
  {
    name: "PHANTOM",
    category: "Seguidor de Línea",
    description: "Velocidad extrema con sensores de alta precisión para curvas cerradas.",
    stats: { potencia: 60, defensa: 50, velocidad: 98 },
    color: "accent",
    image: "⚡",
  },
  {
    name: "TITAN MK3",
    category: "Sumo Autónomo",
    description: "Inteligencia artificial para detección y estrategia de combate autónoma.",
    stats: { potencia: 85, defensa: 90, velocidad: 65 },
    color: "gold",
    image: "🦾",
  },
  {
    name: "SPECTRE",
    category: "Mini Sumo",
    description: "Compacto pero devastador, optimizado para reacciones rápidas.",
    stats: { potencia: 70, defensa: 60, velocidad: 95 },
    color: "secondary",
    image: "👾",
  },
];

function StatBar({ value, color }: { value: number; color: string }) {
  const colorClass =
    color === "primary"
      ? "bg-primary"
      : color === "accent"
      ? "bg-accent"
      : color === "gold"
      ? "bg-gold"
      : "bg-secondary";

  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${colorClass}`}
      />
    </div>
  );
}

export function RobotsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="robots" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-64 top-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -left-64 bottom-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20 mb-4">
            NUESTROS ROBOTS
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Máquinas de </span>
            <span className="text-gradient-accent">Combate</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada robot es el resultado de meses de diseño, iteración y pruebas.
            Conoce a nuestros competidores.
          </p>
        </motion.div>

        {/* Robots Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {robots.map((robot, index) => (
            <motion.div
              key={robot.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 h-full border border-border/50 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  {/* Robot Icon */}
                  <div
                    className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl ${
                      robot.color === "primary"
                        ? "bg-primary/10"
                        : robot.color === "accent"
                        ? "bg-accent/10"
                        : robot.color === "gold"
                        ? "bg-gold/10"
                        : "bg-secondary/10"
                    }`}
                  >
                    {robot.image}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {robot.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          robot.color === "primary"
                            ? "bg-primary/20 text-primary"
                            : robot.color === "accent"
                            ? "bg-accent/20 text-accent"
                            : robot.color === "gold"
                            ? "bg-gold/20 text-gold"
                            : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        {robot.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {robot.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Potencia
                          </span>
                          <span className="text-foreground">{robot.stats.potencia}%</span>
                        </div>
                        <StatBar value={robot.stats.potencia} color={robot.color} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Defensa
                          </span>
                          <span className="text-foreground">{robot.stats.defensa}%</span>
                        </div>
                        <StatBar value={robot.stats.defensa} color={robot.color} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Gauge className="w-3 h-3" /> Velocidad
                          </span>
                          <span className="text-foreground">{robot.stats.velocidad}%</span>
                        </div>
                        <StatBar value={robot.stats.velocidad} color={robot.color} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Todos los Robots
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
