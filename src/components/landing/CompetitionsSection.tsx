import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Trophy, MapPin, Calendar, Medal, Flag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const competitions = [
  {
    name: "Liga Nacional Universitaria 2024",
    location: "Lima, Perú",
    date: "Marzo - Diciembre 2024",
    type: "national",
    results: [
      { category: "Sumo 3kg", position: 1 },
      { category: "Seguidor de Línea", position: 2 },
      { category: "Mini Sumo", position: 1 },
    ],
    points: 2850,
  },
  {
    name: "RoboCup Latin America",
    location: "São Paulo, Brasil",
    date: "Julio 2024",
    type: "international",
    results: [
      { category: "Soccer Robots", position: 3 },
      { category: "Rescue Robots", position: 2 },
    ],
    points: 1200,
  },
  {
    name: "All Japan Robot Sumo",
    location: "Tokyo, Japón",
    date: "Diciembre 2024",
    type: "international",
    results: [
      { category: "Autonomous Sumo", position: 5 },
    ],
    points: 800,
  },
];

const upcomingEvents = [
  {
    name: "Fecha 5 - Liga Nacional",
    date: "15 Feb 2025",
    location: "Arequipa",
  },
  {
    name: "RoboCup Junior Regional",
    date: "22 Mar 2025",
    location: "Lima",
  },
  {
    name: "Competencia Internacional",
    date: "10 May 2025",
    location: "México",
  },
];

function PositionBadge({ position }: { position: number }) {
  const colors = {
    1: "bg-gold text-gold-foreground",
    2: "bg-gray-400 text-gray-900",
    3: "bg-amber-700 text-white",
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
        colors[position as keyof typeof colors] || "bg-muted text-muted-foreground"
      }`}
    >
      {position}
    </span>
  );
}

export function CompetitionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="competencias" className="py-24 relative bg-muted/30">
      <div className="container mx-auto px-4" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-gold/10 text-gold border border-gold/20 mb-4">
            COMPETENCIAS
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Nuestros </span>
            <span className="text-gradient-full">Logros</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Participamos en las competencias más importantes a nivel nacional e
            internacional, acumulando experiencia y victorias.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Competitions */}
          <div className="lg:col-span-2 space-y-6">
            {competitions.map((comp, index) => (
              <motion.div
                key={comp.name}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="glass-card rounded-2xl p-6 border border-border/50"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      comp.type === "international"
                        ? "bg-accent/10 text-accent"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {comp.type === "international" ? (
                      <Flag className="w-8 h-8" />
                    ) : (
                      <Trophy className="w-8 h-8" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-1">
                          {comp.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {comp.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {comp.date}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl font-bold text-gold">
                          {comp.points}
                        </div>
                        <div className="text-xs text-muted-foreground">puntos</div>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {comp.results.map((result) => (
                        <div
                          key={result.category}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
                        >
                          <PositionBadge position={result.position} />
                          <span className="text-muted-foreground">
                            {result.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="glass-card rounded-2xl p-6 border border-primary/30 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Próximos Eventos
                </h3>
              </div>

              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={event.name}
                    className="p-4 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <div className="font-medium text-foreground mb-2">
                      {event.name}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full mt-6 bg-gradient-primary text-primary-foreground"
              >
                Ver Calendario Completo
              </Button>
            </div>
          </motion.div>
        </div>

        {/* League Standing Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-gold/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Medal className="w-6 h-6 text-gold" />
                Liga Nacional 2024 - Posición Actual
              </h3>
              <span className="px-4 py-1 rounded-full bg-gold/20 text-gold font-display font-bold">
                #2
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Puntos Totales", value: "2,850" },
                { label: "Victorias", value: "18" },
                { label: "Podios", value: "12" },
                { label: "Participaciones", value: "24" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-muted/50"
                >
                  <div className="font-display text-2xl font-bold text-gold">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
