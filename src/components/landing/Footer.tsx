import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Instagram, Youtube, Linkedin, Github, Facebook} from "lucide-react";
import {TiktokIcon} from "@/components/icons/SocialIcons";
import novatechLogo from "@/assets/novatech-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

const socialLinks = [
  { icon: Facebook, href: "https://web.facebook.com/profile.php?id=61553951379710", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/novatechuni/", label: "Instagram" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/nova-tech-uni/", label: "LinkedIn" },
  { icon: TiktokIcon, href: "https://www.tiktok.com/@novatechteam", label: "TikTok" },
];

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    navegacion: [
      { label: t.nav.inicio, href: "/" },
      { label: t.nav.nosotros, href: "/nosotros" },
      { label: t.nav.robots, href: "/robots" },
      { label: t.nav.competencias, href: "/competencias" },
      { label: t.nav.equipo, href: "/equipo" },
    ],
    recursos: [
      { label: t.footer.docs, href: "#" },
      { label: t.footer.calendar, href: "#" },
      { label: t.footer.gallery, href: "#" },
      { label: t.footer.blog, href: "#" },
    ],
    legal: [
      { label: t.footer.terms, href: "#" },
      { label: t.footer.privacy, href: "#" },
      { label: t.footer.contactLink, href: "#" },
    ],
  };

  return (
    <footer className="relative bg-black border-t border-border/30">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col items-center">
            <Link to="/" className="mb-4 w-32 h-32 flex items-center justify-center border-2 border-white/20 rounded-lg hover:border-white transition-colors">
              <img
                src={novatechLogo}
                alt="NovaTech"
                className="h-20 w-20 object-contain"
              />
            </Link>
            <p className="text-sm text-white text-center">
              {t.footer.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              {t.footer.navHeading}
            </h4>
            <ul className="space-y-2">
              {footerLinks.navegacion.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              {t.footer.resourcesHeading}
            </h4>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors"
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
              {t.footer.contactHeading}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mt-0.5 text-white" />
                <span>contacto@novatechuni.edu</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-white" />
                <span>Universidad Nacional de Ingeniería, Lima, Perú</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 NovaTech. {t.footer.rights}
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
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
