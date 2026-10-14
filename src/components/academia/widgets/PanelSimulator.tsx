import { useState, type FormEvent } from "react";
import { Gamepad2, SendHorizontal } from "lucide-react";
import { Feedback, LedIcon, WidgetCard } from "@/components/academia/widgets/WidgetCard";
import { ServoDrawing } from "@/components/academia/widgets/ServoDemo";

type Mode = "MANUAL" | "COMANDOS";

// Letras de ejemplo: en su panel, cada convocado elige las suyas.
const COMMANDS: Record<string, number> = { a: 0, b: 90, c: 180 };

const potToAngle = (pot: number) => Math.trunc((pot * 180) / 4095);

export function PanelSimulator() {
  const [name, setName] = useState("Ana");
  const [mode, setMode] = useState<Mode>("MANUAL");
  const [pot, setPot] = useState(2048);
  const [angle, setAngle] = useState(potToAngle(2048));
  const [text, setText] = useState("");
  const [log, setLog] = useState<string[]>(() => ["Comandos: a = 0°, b = 90°, c = 180°", `[Ana] Modo: MANUAL | Ángulo: ${potToAngle(2048)}`]);

  const print = (...lines: string[]) => setLog((current) => [...current, ...lines].slice(-7));
  const report = (m: Mode, a: number) => print(`[${name || "Tu nombre"}] Modo: ${m} | Ángulo: ${a}`);

  const pressButton = () => {
    const next: Mode = mode === "MANUAL" ? "COMANDOS" : "MANUAL";
    setMode(next);
    // Al volver a MANUAL, el servo vuelve a seguir a la perilla.
    const nextAngle = next === "MANUAL" ? potToAngle(pot) : angle;
    setAngle(nextAngle);
    report(next, nextAngle);
  };

  const turnPot = (value: number) => {
    setPot(value);
    if (mode !== "MANUAL") return;
    const next = potToAngle(value);
    // Solo se imprime cuando el ángulo cambia, como con estadoAnterior en P4.
    if (next !== angle) {
      setAngle(next);
      report(mode, next);
    }
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    for (const char of text) {
      if (char in COMMANDS) {
        setAngle(COMMANDS[char]);
        report(mode, COMMANDS[char]);
      } else {
        print(`Comando desconocido: ${char}`);
      }
    }
    setText("");
  };

  const alert = angle < 10 || angle > 170;

  return (
    <WidgetCard icon={Gamepad2} label="Así debe funcionar" title="El Panel de control Nova, terminado">
      <p className="text-sm text-white/60">
        Pruébalo como si ya lo hubieras programado. No te da el código: te muestra qué debe pasar. En tu versión, tú eliges las 3
        letras.
      </p>

      <div className="mt-4 grid items-center gap-4 sm:grid-cols-2">
        <div className="flex justify-center">
          <ServoDrawing angle={angle} />
        </div>
        <div className="flex justify-center gap-4">
          {[
            { label: "Verde · MANUAL", color: "#4ade80", on: mode === "MANUAL" },
            { label: "Amarillo · COMANDOS", color: "#facc15", on: mode === "COMANDOS" },
            { label: "Rojo · alerta", color: "#f87171", on: alert },
          ].map((led) => (
            <div key={led.label} className="flex w-16 flex-col items-center text-center">
              <LedIcon color={led.color} brightness={led.on ? 1 : 0} label={`LED ${led.label} ${led.on ? "encendido" : "apagado"}`} />
              <span className="text-[10px] leading-tight text-white/45">{led.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
        <button
          type="button"
          onClick={pressButton}
          className="rounded-xl border-2 border-white/30 px-5 py-3 font-semibold transition-colors active:bg-white/15"
        >
          Botón · cambiar modo
        </button>
        <div>
          <label htmlFor="panel-pot" className="mb-1 flex justify-between text-xs text-white/50">
            Potenciómetro
            <span>{mode === "MANUAL" ? `${pot} → ${potToAngle(pot)}°` : "en COMANDOS no hace nada"}</span>
          </label>
          <input
            id="panel-pot"
            type="range"
            min={0}
            max={4095}
            value={pot}
            onChange={(e) => turnPot(Number(e.target.value))}
            className="w-full accent-[rgb(var(--accent,255_255_255))]"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black p-3 font-mono text-xs">
        <div className="min-h-[7.5rem] space-y-0.5 text-emerald-300" aria-live="polite">
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        <form onSubmit={send} className="mt-2 flex gap-2 border-t border-white/10 pt-2">
          <input
            value={text}
            maxLength={8}
            disabled={mode !== "COMANDOS"}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === "COMANDOS" ? "Escribe a, b o c" : "Cambia a modo COMANDOS para escribir"}
            aria-label="Comando para el panel"
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/30 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={mode !== "COMANDOS"}
            className="inline-flex items-center gap-1 rounded-md bg-[rgb(var(--accent,255_255_255))] px-3 py-1 font-sans font-semibold text-black disabled:opacity-30"
          >
            <SendHorizontal className="h-3.5 w-3.5" /> Enviar
          </button>
        </form>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
        <label htmlFor="panel-name">Tu nombre en el reporte:</label>
        <input
          id="panel-name"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          className="w-28 rounded-md border border-white/20 bg-black px-2 py-1 text-white"
        />
      </div>

      <div className="mt-4">
        <Feedback tone={alert ? "error" : "info"}>
          {alert
            ? `El servo está en ${angle}°: menos de 10° o más de 170°, por eso se enciende el LED rojo.`
            : "Lleva el servo a un extremo (con la perilla o con a y c) y mira el LED rojo. Fíjate también que el reporte solo se imprime cuando algo cambia."}
        </Feedback>
      </div>
    </WidgetCard>
  );
}
