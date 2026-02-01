import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Instagram, Youtube, Linkedin, Github } from "lucide-react";
import novatechLogo from "@/assets/novatech-logo.png";

const footerLinks = {
  navegacion: [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Robots", href: "#robots" },
    { label: "Competencias", href: "#competencias" },
    { label: "Equipo", href: "#equipo" },
  ],
  recursos: [
    { label: "Documentación", href: "#" },
    { label: "Calendario", href: "#" },
    { label: "Galería", href: "#" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Términos de Uso", href: "#" },
    { label: "Privacidad", href: "#" },
    { label: "Contacto", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="relative bg-card/50 border-t border-border/30">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <a href="#inicio" className="flex items-center gap-3 mb-4">
              <img
                src={novatechLogo}
                alt="NovaTech UNI"
                className="h-12 w-12 object-contain"
              />
              <span className="font-display text-xl font-bold text-gradient-primary">
                NOVATECH UNI
              </span>
            </a>
            <p className="text-sm text-muted-foreground mb-6">
              Equipo universitario de robótica. Innovación, competencia y
              excelencia técnica.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Navegación
            </h4>
            <ul className="space-y-2">
              {footerLinks.navegacion.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Recursos
            </h4>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mt-0.5 text-primary" />
                <span>contacto@novatechuni.edu</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <span>Universidad Nacional de Ingeniería, Lima, Perú</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 NovaTech UNI. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
