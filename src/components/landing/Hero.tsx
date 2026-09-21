import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import novatechLogo from "@/assets/novatech-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

const TypewriterText = ({ text, startDelay = 0, speed = 60 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (displayedText.length === text.length) {
      setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, text, speed]);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setShowCursor(true);
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [startDelay]);

  return (
    <>
      {displayedText}
      {!isComplete && <span className={`${showCursor ? "opacity-100" : "opacity-0"}`}>|</span>}
    </>
  );
};

export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-black"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-display text-4xl md:text-6xl lg:text-8xl font-black mb-6 leading-tight tracking-tighter uppercase"
            >
              <span className="text-white">NOVA</span>
              <span className="text-white">TECH</span>
            </motion.h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 font-mono tracking-wide">
              <TypewriterText text={t.hero.subtitle} startDelay={800} speed={20} />
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center lg:justify-start">
              <button
                onClick={() => {
                  const element = document.getElementById("contacto");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="px-6 py-3 bg-white text-black font-mono font-semibold rounded-lg hover:bg-white/90 transition-colors duration-300"
              >
                Conócenos
              </button>
              <Link
                to="/robots"
                className="px-6 py-3 border-2 border-white text-white font-mono font-semibold rounded-lg hover:bg-white/10 transition-colors duration-300"
              >
                Prototipos
              </Link>
            </div>
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
              <div className="absolute inset-0 bg-white/20 opacity-40 blur-[60px] scale-75" />

              {/* Thin dashed ring, rotating slowly */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-white/25 rounded-full"
                style={{ width: "120%", height: "120%", left: "-10%", top: "-10%" }}
              />

              {/* Logo */}
              <motion.img
                src={novatechLogo}
                alt="NovaTech"
                className="w-72 h-72 md:w-96 md:h-96 object-contain relative z-10 animate-float"
              />

              {/* Orbiting dots */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
                style={{ width: "120%", height: "120%", left: "-10%", top: "-10%" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.8)]" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
                style={{ width: "120%", height: "120%", left: "-10%", top: "-10%" }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
              </motion.div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
                style={{ width: "120%", height: "120%", left: "-10%", top: "-10%" }}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
