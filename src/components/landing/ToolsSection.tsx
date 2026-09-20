import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArduinoIcon, EasyEdaIcon, OnshapeIcon, VSCodeIcon } from "@/components/icons/ToolIcons";
import { useLanguage } from "@/contexts/LanguageContext";

const tools = [
  { name: "Arduino IDE", icon: ArduinoIcon, color: "primary", url: "https://www.arduino.cc/" },
  { name: "EasyEDA", icon: EasyEdaIcon, color: "accent", url: "https://easyeda.com/" },
  { name: "OneShape", icon: OnshapeIcon, color: "gold", url: "https://www.onshape.com/" },
  { name: "Visual Studio Code", icon: VSCodeIcon, color: "secondary", url: "https://code.visualstudio.com/" },
];

export function ToolsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  return (
    <section className="py-24 relative bg-black">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-mono text-5xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
            <span className="text-white">{t.tools.title1}</span>
            <span className="text-white">{t.tools.title2}</span>
          </h2>
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
              <div className="rounded-2xl p-6 text-center h-full bg-transparent hover:scale-105 transition-transform duration-300">
                <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-block">
                  <div className={`h-20 mx-auto flex items-center justify-center mb-4 text-white cursor-pointer group-hover:text-white/80 transition-colors duration-300 ${tool.name === "Arduino IDE" ? "w-25" : "w-20"}`}>
                    <tool.icon className="w-full h-full" />
                  </div>
                </a>
                <h3 className="font-display text-base font-semibold text-white group-hover:text-white transition-colors duration-300">{tool.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
