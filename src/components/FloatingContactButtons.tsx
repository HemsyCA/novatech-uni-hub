import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Instagram, Linkedin, Facebook } from "lucide-react";
import { TiktokIcon } from "@/components/icons/SocialIcons";

const socialLinks = [
  { icon: Facebook, href: "https://web.facebook.com/profile.php?id=61553951379710", label: "Facebook", color: "hover:bg-white/40" },
  { icon: Instagram, href: "https://www.instagram.com/novatechuni/", label: "Instagram", color: "hover:bg-white/40" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/nova-tech-uni/", label: "LinkedIn", color: "hover:bg-white/40" },
  { icon: TiktokIcon, href: "https://www.tiktok.com/@novatechteam", label: "TikTok", color: "hover:bg-white/40" },
];

export function FloatingContactButtons() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 pointer-events-auto"
        />
      )}

      <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
        {/* Main Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-white/90 transition-all duration-300 pointer-events-auto"
        >
          <Mail className="w-7 h-7" />
        </motion.button>

        {/* Floating Buttons */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 flex flex-col gap-4 pointer-events-auto"
          >
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.div
                  key={social.label}
                  initial={{ opacity: 0, scale: 0, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer pointer-events-auto"
                >
                  <button
                    onClick={() => window.open(social.href, "_blank")}
                    type="button"
                    className={`w-14 h-14 bg-white/20 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${social.color} backdrop-blur-sm hover:shadow-xl pointer-events-auto`}
                    title={social.label}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}
