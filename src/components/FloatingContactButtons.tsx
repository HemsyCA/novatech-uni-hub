import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Facebook, Instagram, Linkedin, X } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { TiktokIcon } from "@/components/icons/SocialIcons";

// El botón flotante de redes: su ícono va cambiando entre las redes para que se entienda que lleva a ellas
// (un sobre hacía pensar en "enviar un mensaje"). Al abrirlo, cada red aparece con su nombre.

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/novatechuni/", label: "Instagram" },
  { icon: TiktokIcon, href: "https://www.tiktok.com/@novatechteam", label: "TikTok" },
  { icon: Facebook, href: "https://web.facebook.com/profile.php?id=61553951379710", label: "Facebook" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/nova-tech-uni/", label: "LinkedIn" },
];

// Dentro de la cuenta estorbarían a la barra inferior y a la navegación de las lecciones.
const ACCOUNT_PATHS = ["/dashboard", "/academia", "/miembros", "/admin", "/conocimientos", "/comunidad"];
// Tienda e Impresión 3D se abren dentro de la cuenta cuando hay sesión.
const SERVICE_PATHS = ["/store", "/print3d"];

// El globito "Síguenos" aparece solo la primera vez (por navegador).
const HINT_KEY = "nova-redes-visto";
const hintSeen = () => {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true;
  }
};
const markHintSeen = () => {
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    // Sin almacenamiento, el globito puede volver a aparecer: no es grave.
  }
};

export function FloatingContactButtons() {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const reduceMotion = useReducedMotion();
  const { pathname } = useLocation();
  const { user } = useSession();
  const hidden = ACCOUNT_PATHS.some((path) => pathname.startsWith(path)) || (user && SERVICE_PATHS.some((path) => pathname.startsWith(path)));

  // El ícono pasa por cada red mientras el botón está cerrado.
  useEffect(() => {
    if (reduceMotion || isOpen || hidden) return;
    const id = window.setInterval(() => setCurrent((c) => (c + 1) % socialLinks.length), 2000);
    return () => window.clearInterval(id);
  }, [reduceMotion, isOpen, hidden]);

  // El globito aparece unos segundos después de entrar y se va solo.
  useEffect(() => {
    if (hidden || hintSeen()) return;
    const show = window.setTimeout(() => setShowHint(true), 2500);
    const hide = window.setTimeout(() => {
      setShowHint(false);
      markHintSeen();
    }, 9000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [hidden]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (hidden) return null;

  const toggle = () => {
    setIsOpen((open) => !open);
    setShowHint(false);
    markHintSeen();
  };

  const Current = socialLinks[current].icon;

  return (
    <>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-40" aria-hidden />}

      <div className="fixed bottom-5 right-5 z-50 sm:bottom-8 sm:right-8">
        {/* Las redes, cada una con su nombre */}
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              id="redes-nova"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 right-1 flex flex-col items-end gap-3"
            >
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.li
                    key={social.label}
                    initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ delay: (socialLinks.length - 1 - index) * 0.05, duration: 0.2 }}
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3"
                    >
                      <span className="rounded-full bg-black/85 px-3 py-1.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-black">
                        {social.label}
                      </span>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-md transition-all group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                        <Icon className="h-5 w-5" />
                      </span>
                    </a>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* "Síguenos": la primera vez, y al pasar el mouse */}
        <AnimatePresence>
          {showHint && !isOpen && (
            <motion.button
              type="button"
              onClick={toggle}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg"
            >
              Síguenos en redes
              <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-white" aria-hidden />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={toggle}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isOpen ? "Cerrar redes sociales" : "Síguenos en redes sociales"}
          aria-expanded={isOpen}
          aria-controls="redes-nova"
          title={isOpen ? undefined : "Síguenos en redes"}
          className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white text-black shadow-lg"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {isOpen ? (
              <motion.span key="cerrar" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                <X className="h-7 w-7" />
              </motion.span>
            ) : (
              <motion.span
                key={socialLinks[current].label}
                initial={reduceMotion ? false : { y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Current className="h-7 w-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
