import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Cpu, CircuitBoard, Box, Code2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const tools = [
  { name: "Arduino IDE", icon: Cpu, color: "primary" },
  { name: "EasyEDA", icon: CircuitBoard, color: "accent" },
  { name: "OneShape", icon: Box, color: "gold" },
  { name: "Visual Studio", icon: Code2, color: "secondary" },
];

export function ToolsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  return (
    <section className="py-24 relative bg-muted/30">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
            {t.tools.badge}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">{t.tools.title1}</span>
            <span className="text-gradient-primary">{t.tools.title2}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.tools.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 text-center h-full border-gradient hover:scale-105 transition-transform duration-300">
                <div
                  className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                    tool.color === "primary"
                      ? "bg-primary/10 text-primary"
                      : tool.color === "accent"
                        ? "bg-accent/10 text-accent"
                        : tool.color === "secondary"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-gold/10 text-gold"
                  }`}
                >
                  <tool.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{tool.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
