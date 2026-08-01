import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn("flex items-center rounded-full border border-border/50 bg-muted/30 p-0.5 text-xs font-medium", className)}>
      <button
        type="button"
        onClick={() => setLang("es")}
        className={cn(
          "px-2.5 py-1 rounded-full transition-colors",
          lang === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "px-2.5 py-1 rounded-full transition-colors",
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}
