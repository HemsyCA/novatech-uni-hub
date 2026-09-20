import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import novatechLogo from "@/assets/novatech-logo.png";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MotionLink = motion.create(Link);

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { label: t.nav.inicio, href: "/" },
    { label: t.nav.nosotros, href: "/nosotros" },
    { label: t.nav.robots, href: "/robots" },
    { label: t.nav.competencias, href: "/competencias" },
    { label: t.nav.equipo, href: "/equipo" },
  ];

  const serviceItems = [
    { label: t.nav.tienda, href: "/store" },
    { label: t.nav.impresion3d, href: "/print3d" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <MotionLink
            to="/"
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={novatechLogo}
              alt="NovaTech"
              className="h-12 w-12 object-contain"
            />
            <span className="font-display text-xl font-bold hidden sm:block">
              <span className="text-foreground">NOVA</span>
              <span className="text-primary">TECH</span>
            </span>
          </MotionLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <MotionLink
                key={item.label}
                to={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-300" />
              </MotionLink>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors outline-none">
                {t.nav.servicios}
                <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {serviceItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <Link to="/auth">
              <Button className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-colors duration-300">
                {t.nav.login}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-border/30"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-2 mt-2 border-t border-border/30">
                <span className="px-4 text-xs uppercase text-muted-foreground/70">{t.nav.servicios}</span>
                {serviceItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex justify-center pt-4 border-t border-border/30">
                <LanguageToggle />
              </div>

              <div className="flex flex-col gap-2">
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground transition-colors duration-300">
                    {t.nav.login}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
