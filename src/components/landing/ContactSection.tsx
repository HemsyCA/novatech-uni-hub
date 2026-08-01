import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { createContactMessage } from "@/services/supabase/contact";
import { domainHasMailServers } from "@/lib/email-validation";

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const domainOk = await domainHasMailServers(email);
    if (domainOk === false) {
      toast({ title: t.contact.errorTitle, description: t.contact.errorDesc, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    try {
      await createContactMessage(name, email, message);
      toast({ title: t.contact.successTitle, description: t.contact.successDesc });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast({ title: t.contact.errorTitle, description: t.contact.errorDesc, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20 mb-4">
            {t.contact.badge}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">{t.contact.title1}</span>
            <span className="text-gradient-accent">{t.contact.title2}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.contact.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">{t.contact.nameLabel}</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.contact.namePlaceholder}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">{t.contact.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.contact.emailPlaceholder}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">{t.contact.messageLabel}</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.contact.messagePlaceholder}
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {submitting ? t.contact.sending : t.contact.send}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
