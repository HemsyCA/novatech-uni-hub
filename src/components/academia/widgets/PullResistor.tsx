import { useEffect, useState } from "react";
import { CircuitBoard } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type Config = "ninguna" | "pulldown" | "pullup";

const VALUES = [10, 1000, 10000, 100000];
const ohms = (value: number) => (value >= 1000 ? `${value / 1000} kΩ` : `${value} Ω`);

const ON = "rgb(var(--tone, 255 255 255))";
const OFF = "rgba(255,255,255,0.45)";

function Schematic({ config, pressed, resistor }: { config: Config; pressed: boolean; resistor: number }) {
  // Pull-down: 3V3 → botón → nodo, nodo → R → GND. Pull-up: 3V3 → R → nodo, nodo → botón → GND.
  const flowing = pressed && config !== "ninguna";
  const top = config === "pullup" ? "resistor" : "button";
  const label = { fill: "white", fontSize: 11, fontFamily: "inherit" };
  const hint = { fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "inherit" };
  const wire = (active: boolean) => ({ stroke: active ? ON : OFF, strokeWidth: active ? 3 : 2, fill: "none", strokeDasharray: active ? "6 5" : undefined });

  const buttonPart = (y: number, active: boolean) => (
    <g>
      <line x1="60" y1={y} x2="60" y2={y + 14} {...wire(active)} />
      <circle cx="60" cy={y + 18} r="3" fill="none" stroke="white" />
      <circle cx="60" cy={y + 46} r="3" fill="none" stroke="white" />
      <line x1="60" y1={y + 21} x2={pressed ? 60 : 44} y2={pressed ? y + 43 : y + 40} stroke={active ? ON : "white"} strokeWidth="2" />
      <line x1="60" y1={y + 50} x2="60" y2={y + 64} {...wire(active)} />
      <text x="70" y={y + 36} {...label}>SW1</text>
    </g>
  );
  const resistorPart = (y: number, active: boolean) =>
    config === "ninguna" ? (
      <text x="40" y={y + 36} {...hint}>(sin resistencia)</text>
    ) : (
      <g>
        <line x1="60" y1={y} x2="60" y2={y + 14} {...wire(active)} />
        <rect x="50" y={y + 14} width="20" height="36" rx="2" fill="none" stroke="white" strokeWidth="2" />
        <line x1="60" y1={y + 50} x2="60" y2={y + 64} {...wire(active)} />
        <text x="76" y={y + 30} {...label}>R</text>
        <text x="76" y={y + 44} {...hint}>{ohms(resistor)}</text>
      </g>
    );

  return (
    <svg viewBox="0 0 220 230" className="h-auto w-full max-w-[220px]" role="img" aria-label="Esquema del botón con su resistencia">
      <line x1="40" y1="12" x2="80" y2="12" stroke="white" strokeWidth="2" />
      <text x="88" y="16" {...label}>3V3</text>
      <line x1="60" y1="12" x2="60" y2="30" {...wire(flowing)} />
      {top === "button" ? buttonPart(30, flowing) : resistorPart(30, flowing)}
      <circle cx="60" cy="102" r="4" fill="white" />
      <line x1="60" y1="102" x2="150" y2="102" stroke="white" strokeWidth="2" />
      <rect x="150" y="88" width="56" height="28" rx="4" fill="rgba(255,255,255,0.06)" stroke="white" />
      <text x="157" y="106" {...label}>GPIO21</text>
      <line x1="60" y1="94" x2="60" y2="110" {...wire(flowing)} />
      {top === "button" ? resistorPart(110, flowing) : buttonPart(110, flowing)}
      <line x1="60" y1="174" x2="60" y2="192" {...wire(flowing)} />
      <line x1="44" y1="192" x2="76" y2="192" stroke="white" strokeWidth="2" />
      <line x1="50" y1="199" x2="70" y2="199" stroke="white" strokeWidth="2" />
      <line x1="56" y1="206" x2="64" y2="206" stroke="white" strokeWidth="2" />
      <text x="84" y="204" {...hint}>GND</text>
    </svg>
  );
}

export function PullResistor() {
  const [config, setConfig] = useState<Config>("pulldown");
  const [resistor, setResistor] = useState(10000);
  const [pressed, setPressed] = useState(false);
  const [noise, setNoise] = useState(false);

  // Sin resistencia y con el botón suelto, el pin capta ruido.
  useEffect(() => {
    if (config !== "ninguna" || pressed) return;
    const timer = setInterval(() => setNoise(Math.random() < 0.5), 180);
    return () => clearInterval(timer);
  }, [config, pressed]);

  const reading =
    config === "ninguna"
      ? pressed
        ? "HIGH"
        : noise
          ? "HIGH"
          : "LOW"
      : config === "pulldown"
        ? pressed
          ? "HIGH"
          : "LOW"
        : pressed
          ? "LOW"
          : "HIGH";
  const currentMa = (3.3 / resistor) * 1000;

  return (
    <WidgetCard icon={CircuitBoard} title="El botón en el esquemático">
      <div className="flex flex-wrap gap-2">
        <Choice selected={config === "ninguna"} onClick={() => setConfig("ninguna")}>Sin resistencia</Choice>
        <Choice selected={config === "pulldown"} onClick={() => setConfig("pulldown")}>Pull-down</Choice>
        <Choice selected={config === "pullup"} onClick={() => setConfig("pullup")}>Pull-up</Choice>
      </div>

      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <Schematic config={config} pressed={pressed} resistor={resistor} />
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setPressed(true)}
            onKeyUp={() => setPressed(false)}
            aria-pressed={pressed}
            className={`w-full touch-none select-none rounded-xl border-2 px-4 py-4 font-semibold transition-colors ${
              pressed ? "border-[rgb(var(--tone,255_255_255))] bg-[rgb(var(--tone,255_255_255)/0.15)]" : "border-white/25"
            }`}
          >
            {pressed ? "Presionado" : "Mantén presionado el botón"}
          </button>
          <div className="rounded-xl bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-white/50">El ESP32 lee en GPIO21</p>
            <p className="text-2xl font-semibold text-[rgb(var(--tone,255_255_255))]">{reading}</p>
          </div>
          {config !== "ninguna" && (
            <div>
              <p className="mb-2 text-xs text-white/50">Valor de la resistencia</p>
              <div className="flex flex-wrap gap-2">
                {VALUES.map((v) => (
                  <Choice key={v} selected={resistor === v} onClick={() => setResistor(v)}>
                    {ohms(v)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {config === "ninguna" ? (
          <Feedback tone="error">
            Sin resistencia, con el botón suelto el pin queda <strong>flotante</strong>: lee HIGH y LOW al azar.
          </Feedback>
        ) : resistor < 1000 ? (
          <Feedback tone="error">
            Con {ohms(resistor)}, al presionar pasan {currentMa.toFixed(0)} mA de 3V3 a GND: es casi un cortocircuito. Por eso se usa 10 kΩ.
          </Feedback>
        ) : (
          <Feedback tone={resistor === 10000 ? "ok" : "info"}>
            {config === "pulldown" ? "Pull-down: presionado = HIGH, suelto = LOW." : "Pull-up: funciona al revés, presionado = LOW."} Al presionar
            pasan solo {currentMa < 1 ? currentMa.toFixed(2) : currentMa.toFixed(1)} mA por la resistencia
            {resistor === 10000 ? ": el valor que usamos en Nova." : "."}
          </Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
