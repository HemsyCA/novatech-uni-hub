import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Choice, Feedback, LedIcon, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type Phase = "idle" | "compiling" | "connecting" | "writing" | "done" | "error";
type Board = "" | "Arduino Uno" | "ESP32 Dev Module";

const CONNECT_MS = 3500;

export function UploadSimulator() {
  const [driver, setDriver] = useState(false);
  const [dataCable, setDataCable] = useState(false);
  const [board, setBoard] = useState<Board>("");
  const [port, setPort] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<string[]>([]);
  const [hint, setHint] = useState("");
  const [bootHeld, setBootHeld] = useState(false);
  const [blink, setBlink] = useState(false);
  const timers = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  const portAvailable = driver && dataCable;
  const busy = phase === "compiling" || phase === "connecting" || phase === "writing";

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  // Si el puerto desaparece (sin driver o con cable de carga), deja de estar elegido.
  useEffect(() => {
    if (!portAvailable) setPort("");
  }, [portAvailable]);

  const fail = (output: string[], explanation: string) => {
    setLines((current) => [...current, ...output]);
    setHint(explanation);
    setPhase("error");
  };

  const upload = () => {
    clearTimers();
    setLines([]);
    setHint("");
    setBlink(false);
    if (!board) return fail(["Error: no se seleccionó ninguna placa."], "Elige tu placa en Herramientas → Placa.");
    if (!port)
      return fail(
        ["Error: no se seleccionó ningún puerto."],
        portAvailable
          ? "Elige el puerto en Herramientas → Puerto."
          : "No aparece ningún puerto: falta el driver de tu chip USB o tu cable es solo de carga. Revisa las dos cosas.",
      );
    setPhase("compiling");
    setLines(["Compilando sketch…"]);
    later(900, () => {
      if (board === "Arduino Uno") {
        fail(
          ["Subiendo…", "avrdude: stk500_recv(): programmer is not responding"],
          "Elegiste una placa que no es la tuya: el programa se preparó para un Arduino Uno. Elige ESP32 Dev Module.",
        );
        return;
      }
      setLines((current) => [...current, "El sketch usa 289 541 bytes.", "Connecting…"]);
      setPhase("connecting");
      later(CONNECT_MS, () => {
        if (phaseRef.current !== "connecting") return;
        fail(
          ["A fatal error occurred: Failed to connect to ESP32: Timed out waiting for packet header"],
          "Tu placa necesita ayuda para entrar en modo de carga: mantén presionado BOOT mientras dice “Connecting…”.",
        );
      });
    });
  };

  // Mantener BOOT durante "Connecting…" hace que la carga empiece.
  useEffect(() => {
    if (phase !== "connecting" || !bootHeld) return;
    clearTimers();
    setPhase("writing");
    setLines((l) => [...l, "Conectado. Puedes soltar BOOT."]);
    [25, 50, 75, 100].forEach((pct, i) =>
      later(350 * (i + 1), () => setLines((l) => [...l, `Writing at 0x000${1 + i}0000… (${pct} %)`])),
    );
    later(1700, () => {
      setLines((l) => [...l, "Hard resetting via RTS pin…"]);
      setPhase("done");
    });
  }, [phase, bootHeld]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setInterval(() => setBlink((b) => !b), 1000);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <WidgetCard icon={Upload} label="Simulador" title="Carga tu primer programa">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-xs text-white/50">Driver USB</span>
          <Choice selected={!driver} onClick={() => setDriver(false)}>Sin instalar</Choice>
          <Choice selected={driver} onClick={() => setDriver(true)}>CP2102 / CH340 instalado</Choice>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-xs text-white/50">Cable</span>
          <Choice selected={!dataCable} onClick={() => setDataCable(false)}>Solo de carga</Choice>
          <Choice selected={dataCable} onClick={() => setDataCable(true)}>De datos</Choice>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-xs text-white/50">Placa</span>
          {(["Arduino Uno", "ESP32 Dev Module"] as Board[]).map((b) => (
            <Choice key={b} selected={board === b} onClick={() => setBoard(b)}>
              {b}
            </Choice>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-xs text-white/50">Puerto</span>
          {portAvailable ? (
            <Choice selected={port === "COM3"} onClick={() => setPort("COM3")}>COM3</Choice>
          ) : (
            <span className="text-sm text-white/40">(no aparece ninguno)</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-white/10 bg-black p-3 font-mono text-xs">
          <div className="min-h-[7rem] space-y-0.5" aria-live="polite">
            {lines.length === 0 ? (
              <span className="text-white/30">Consola de Arduino IDE…</span>
            ) : (
              lines.map((line, i) => (
                <div key={i} className={line.startsWith("A fatal") || line.startsWith("Error") || line.startsWith("avrdude") ? "text-rose-300" : "text-white/80"}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-4 sm:flex-col">
          <div className="flex flex-col items-center rounded-lg border border-white/20 bg-white/[0.04] px-3 py-2">
            <span className="text-[10px] text-white/50">ESP32</span>
            <div className="mt-2 flex gap-2">
              <button type="button" className="rounded border border-white/30 px-2 py-1 text-[11px] text-white/60" onClick={() => phase === "done" && setBlink(false)}>
                EN
              </button>
              <button
                type="button"
                onPointerDown={() => setBootHeld(true)}
                onPointerUp={() => setBootHeld(false)}
                onPointerLeave={() => setBootHeld(false)}
                onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setBootHeld(true)}
                onKeyUp={() => setBootHeld(false)}
                aria-pressed={bootHeld}
                className={`touch-none select-none rounded border px-2 py-1 text-[11px] font-semibold ${
                  bootHeld ? "border-[rgb(var(--accent,255_255_255))] bg-[rgb(var(--accent,255_255_255))] text-black" : "border-white/30 text-white"
                }`}
              >
                BOOT
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <LedIcon color="#4ade80" brightness={phase === "done" && blink ? 1 : 0} />
            <span className="text-[10px] text-white/40">GPIO 18</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={upload}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--accent,255_255_255))] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
      >
        <Upload className="h-4 w-4" /> {busy ? "Subiendo…" : "Subir"}
      </button>

      <div className="mt-4">
        {phase === "connecting" ? (
          <Feedback tone="info">Dice “Connecting…”: ¿qué botón de la placa tienes que mantener presionado?</Feedback>
        ) : phase === "done" ? (
          <Feedback tone="ok">¡Programa cargado! El LED del GPIO 18 parpadea con el código de P2. El mismo código de Wokwi, ahora en una placa real.</Feedback>
        ) : hint ? (
          <Feedback tone="error">{hint}</Feedback>
        ) : (
          <Feedback tone="info">Configura todo como en el Paso a paso y presiona Subir. Si algo falla, la consola te dará la pista.</Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
