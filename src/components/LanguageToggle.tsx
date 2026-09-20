import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn("flex items-center rounded-full border border-white/30 bg-white/10 p-0.5 text-xs font-medium", className)}>
      <button
        type="button"
        onClick={() => setLang("es")}
        className={cn(
          "px-2.5 py-1 rounded-full transition-colors",
          lang === "es" ? "bg-white text-black" : "text-muted-foreground hover:text-white"
        )}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "px-2.5 py-1 rounded-full transition-colors",
          lang === "en" ? "bg-white text-black" : "text-muted-foreground hover:text-white"
        )}
      >
        EN
      </button>
    </div>
  );
}
