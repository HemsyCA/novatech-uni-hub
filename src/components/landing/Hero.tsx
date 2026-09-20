import { motion } from "framer-motion";
import novatechLogo from "@/assets/novatech-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background">
        {/* Single soft accent glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-primary/10 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-foreground">NOVA</span>
              <span className="text-primary">TECH</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              {t.hero.subtitle}
            </motion.p>
          </motion.div>

          {/* Logo/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Soft glow */}
              <div className="absolute inset-0 bg-primary/20 opacity-40 blur-[60px] scale-75" />

              {/* Thin ring */}
              <div
                className="absolute inset-0 border border-border rounded-full"
                style={{ width: "120%", height: "120%", left: "-10%", top: "-10%" }}
              />

              {/* Logo */}
              <motion.img
                src={novatechLogo}
                alt="NovaTech"
                className="w-72 h-72 md:w-96 md:h-96 object-contain relative z-10 animate-float"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
