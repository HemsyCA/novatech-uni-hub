import { useState, type FormEvent } from "react";
import { SendHorizontal, Terminal } from "lucide-react";
import { Choice, LedIcon, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type Led = "verde" | "amarillo" | "rojo";

const COLORS: Record<Led, string> = { verde: "#4ade80", amarillo: "#facc15", rojo: "#f87171" };
const PINS: Record<Led, number> = { verde: 18, amarillo: 19, rojo: 23 };
const CASES: { key: string; label: string; led?: Led }[] = [
  { key: "v", label: "case 'v': encenderSolo(LED_VERDE);", led: "verde" },
  { key: "a", label: "case 'a': encenderSolo(LED_AMARILLO);", led: "amarillo" },
  { key: "r", label: "case 'r': encenderSolo(LED_ROJO);", led: "rojo" },
  { key: "x", label: "case 'x': apagarTodo();" },
  { key: "default", label: "default: Comando desconocido" },
];

export function SerialCommands() {
  const [on, setOn] = useState<Led | null>(null);
  const [log, setLog] = useState<string[]>(["Comandos: v = verde, a = amarillo, r = rojo, x = apagar todo"]);
  const [text, setText] = useState("");
  const [executed, setExecuted] = useState<string[]>([]);
  const [missingBreak, setMissingBreak] = useState(false);

  // Repite lo que hace el switch de P8 con cada letra recibida.
  const run = (char: string) => {
    const lines: string[] = [];
    const ran: string[] = [];
    let led = on;
    let index = CASES.findIndex((c) => c.key === char);
    if (index === -1) {
      ran.push("default");
      lines.push(`Comando desconocido: ${char}`);
      return { led, lines, ran };
    }
    // Sin break en el case 'v', el programa sigue de largo al case 'a'.
    while (index < CASES.length) {
      const c = CASES[index];
      ran.push(c.key);
      if (c.led) {
        led = c.led;
        lines.push(`Encendido el LED del pin ${PINS[c.led]}`);
      } else if (c.key === "x") {
        led = null;
        lines.push("Todo apagado");
      }
      if (!(missingBreak && c.key === "v")) break;
      index++;
    }
    return { led, lines, ran };
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!text) return;
    let led = on;
    const lines: string[] = [];
    let ran: string[] = [];
    // El Enter llega como '\n' y el programa lo ignora en su propio case.
    for (const char of text) {
      const result = run(char);
      led = result.led;
      lines.push(...result.lines);
      ran = result.ran;
    }
    setOn(led);
    setExecuted(ran);
    setLog((current) => [...current, `> ${text}`, ...lines].slice(-7));
    setText("");
  };

  return (
    <WidgetCard icon={Terminal} title="Controla los LEDs con letras">
      <div className="flex justify-center gap-6">
        {(Object.keys(COLORS) as Led[]).map((led) => (
          <div key={led} className="flex flex-col items-center">
            <LedIcon color={COLORS[led]} brightness={on === led ? 1 : 0} label={`LED ${led} ${on === led ? "encendido" : "apagado"}`} />
            <span className="text-[10px] text-white/40">GPIO {PINS[led]}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black p-3 font-mono text-xs">
        <div className="min-h-[7rem] space-y-0.5 text-emerald-300" aria-live="polite">
          {log.map((line, i) => (
            <div key={i} className={line.startsWith(">") ? "text-white/50" : ""}>
              {line}
            </div>
          ))}
        </div>
        <form onSubmit={send} className="mt-2 flex gap-2 border-t border-white/10 pt-2">
          <input
            value={text}
            maxLength={10}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe v, a, r o x"
            aria-label="Mensaje para el ESP32"
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
          />
          <button type="submit" className="inline-flex items-center gap-1 rounded-md bg-[rgb(var(--accent,255_255_255))] px-3 py-1 font-sans font-semibold text-black">
            <SendHorizontal className="h-3.5 w-3.5" /> Enviar
          </button>
        </form>
      </div>

      <div className="mt-4 space-y-1 font-mono text-[12px]">
        {CASES.map((c) => (
          <div
            key={c.key}
            className={`rounded-md px-3 py-1.5 transition-colors ${executed.includes(c.key) ? "bg-[rgb(var(--accent,255_255_255)/0.15)] text-white" : "text-white/40"}`}
          >
            {c.label}
            {c.key !== "default" && (missingBreak && c.key === "v" ? <span className="ml-1 text-rose-300">// sin break</span> : " break;")}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-white/50">Experimento:</span>
        <Choice selected={!missingBreak} onClick={() => setMissingBreak(false)}>Con todos los break</Choice>
        <Choice selected={missingBreak} onClick={() => setMissingBreak(true)}>Quitar el break de 'v'</Choice>
      </div>
      {missingBreak && (
        <p className="mt-2 text-xs text-rose-200/80">Ahora envía "v": el programa sigue de largo al case 'a' y termina encendiendo el amarillo.</p>
      )}
    </WidgetCard>
  );
}
