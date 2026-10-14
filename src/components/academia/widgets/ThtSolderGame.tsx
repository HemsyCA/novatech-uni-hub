import { useEffect, useState } from "react";
import { Flame, RotateCcw } from "lucide-react";
import { Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

type Result = "buena" | "fria" | "poco" | "exceso" | "pad" | "sin-estano" | "orden";

const RESULTS: Record<Result, { ok: boolean; title: string; text: string }> = {
  buena: { ok: true, title: "¡Junta perfecta!", text: "Forma de volcán, cubre todo el pad y se ve el contorno de la pata." },
  fria: {
    ok: false,
    title: "Soldadura fría",
    text: "Acercaste el estaño casi sin calentar el pad y la pata. Calienta las piezas 1 a 2 segundos antes: el estaño debe derretirse al tocarlas a ellas.",
  },
  poco: { ok: false, title: "Poco estaño", text: "El estaño no alcanzó a cubrir todo el pad. Mantén el estaño un poco más, hasta que la junta tenga forma de cono." },
  exceso: { ok: false, title: "Exceso de estaño", text: "Quedó una bola que esconde si la unión está bien hecha. Retira el estaño en cuanto la junta tenga forma de cono." },
  pad: { ok: false, title: "Pad levantado", text: "Tuviste el cautín más de 6 segundos: se quema el flux y el cobre del pad se despega. Todo el proceso debe durar 3 a 5 segundos." },
  "sin-estano": { ok: false, title: "Sin estaño", text: "Retiraste el cautín sin agregar estaño: la pata no quedó soldada." },
  orden: { ok: false, title: "Orden equivocado", text: "Retira primero el estaño y un instante después el cautín. Si no, el hilo de estaño queda pegado a la junta." },
};

const evaluate = (heatBeforeTin: number | null, tin: number, total: number): Result => {
  if (tin === 0) return "sin-estano";
  if (heatBeforeTin !== null && heatBeforeTin < 800) return "fria";
  if (total > 6000) return "pad";
  if (tin < 500) return "poco";
  if (tin > 2000) return "exceso";
  return "buena";
};

function Joint({ amount, result }: { amount: number; result: Result | null }) {
  const h = Math.min(4 + amount * 14, 30);
  const w = Math.min(6 + amount * 9, 24);
  const volcano = `M${100 - w} 66 Q${100 - w * 0.3} ${66 - h * 0.2} 98 ${66 - h} L102 ${66 - h} Q${100 + w * 0.3} ${66 - h * 0.2} ${100 + w} 66 Z`;
  const cold = result === "fria";
  return (
    <g>
      <defs>
        <pattern id="cold-grain" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#8b8b8b" />
          <circle cx="1" cy="1" r="0.8" fill="#5f5f5f" />
          <circle cx="3" cy="3" r="0.6" fill="#a3a3a3" />
        </pattern>
        <linearGradient id="shiny" x1="0" x2="1">
          <stop offset="0" stopColor="#9ca3af" />
          <stop offset="0.45" stopColor="#f3f4f6" />
          <stop offset="1" stopColor="#6b7280" />
        </linearGradient>
      </defs>
      {result === "exceso" ? (
        <circle cx="100" cy="52" r="17" fill="url(#shiny)" />
      ) : amount > 0 && result !== "sin-estano" ? (
        <path d={volcano} fill={cold ? "url(#cold-grain)" : "url(#shiny)"} />
      ) : null}
      {cold && <path d="M95 60 L99 56 L97 52" stroke="#3f3f46" strokeWidth="0.8" fill="none" />}
    </g>
  );
}

export function ThtSolderGame() {
  const [ironAt, setIronAt] = useState<number | null>(null);
  const [tinAt, setTinAt] = useState<number | null>(null);
  const [tinTotal, setTinTotal] = useState(0);
  const [heatBeforeTin, setHeatBeforeTin] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [result, setResult] = useState<Result | null>(null);
  const [lastTime, setLastTime] = useState(0);
  const [coldTin, setColdTin] = useState(false);

  const active = ironAt !== null && !result;
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [active]);

  const liveTin = tinTotal + (tinAt ? now - tinAt : 0);
  const elapsed = ironAt ? now - ironAt : 0;

  const reset = () => {
    setIronAt(null);
    setTinAt(null);
    setTinTotal(0);
    setHeatBeforeTin(null);
    setResult(null);
    setColdTin(false);
  };

  const toggleIron = () => {
    const t = Date.now();
    // Apoyar el cautín empieza un intento nuevo, también después de un resultado.
    if (ironAt === null || result) {
      reset();
      setIronAt(t);
      setNow(t);
      return;
    }
    setNow(t);
    setLastTime(t - ironAt);
    if (tinAt !== null) {
      setTinTotal((v) => v + (t - tinAt));
      setTinAt(null);
      setResult("orden");
      return;
    }
    setResult(evaluate(heatBeforeTin, tinTotal, t - ironAt));
  };

  const tinDown = () => {
    if (result) return;
    if (ironAt === null) {
      setColdTin(true);
      return;
    }
    const t = Date.now();
    setTinAt(t);
    if (heatBeforeTin === null) setHeatBeforeTin(t - ironAt);
  };

  const tinUp = () => {
    if (tinAt === null) return;
    setTinTotal((v) => v + (Date.now() - tinAt));
    setTinAt(null);
  };

  const ironOn = ironAt !== null && !result;
  const holding = tinAt !== null;
  const amount = Math.min(liveTin / 1200, 1.6);

  return (
    <WidgetCard icon={Flame} label="Minijuego" title="Suelda una pata THT">
      <ol className="space-y-1 text-xs text-white/60">
        <li>1. Apoya el cautín tocando el pad y la pata.</li>
        <li>2. Espera 1 a 2 segundos.</li>
        <li>3. Mantén presionado “estaño” hasta que la junta tenga forma de cono (unos 1 a 2 s).</li>
        <li>4. Suelta el estaño y luego retira el cautín. Todo en 3 a 5 segundos.</li>
      </ol>

      <div className="mt-4 rounded-xl bg-white/[0.03] p-2">
        <svg viewBox="0 0 200 100" className="h-auto w-full" role="img" aria-label="Vista de costado de la soldadura">
          <rect x="10" y="66" width="180" height="12" fill="#1f6f43" />
          <rect x="72" y={result === "pad" ? 61 : 63} width="56" height="3.5" fill="#d4a017" transform={result === "pad" ? "rotate(-8 72 64)" : undefined} />
          <line x1="100" y1="18" x2="100" y2="92" stroke="#d4d4d4" strokeWidth="3" />
          <Joint amount={amount} result={result} />
          {/* Cautín */}
          <g style={{ transition: "transform 0.25s ease" }} transform={ironOn ? "translate(0 0)" : "translate(-30 -22)"}>
            <path d="M20 20 L84 56 L90 52 L28 14 Z" fill="#9ca3af" />
            <path d="M84 56 L95 63 L90 52 Z" fill={ironOn ? "#f97316" : "#6b7280"} />
          </g>
          {/* Hilo de estaño */}
          <g style={{ transition: "transform 0.2s ease" }} transform={holding ? "translate(0 0)" : "translate(24 -18)"}>
            <line x1="180" y1="20" x2="106" y2="60" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
          </g>
          {ironOn && <text x="10" y="96" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="inherit">{(elapsed / 1000).toFixed(1)} s</text>}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={toggleIron}
          className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${
            ironOn ? "border-orange-400 bg-orange-400/15" : "border-white/25 hover:border-white/50"
          }`}
        >
          {ironOn ? "Retirar cautín" : "Apoyar cautín"}
        </button>
        <button
          type="button"
          onPointerDown={tinDown}
          onPointerUp={tinUp}
          onPointerLeave={tinUp}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && tinDown()}
          onKeyUp={(e) => (e.key === " " || e.key === "Enter") && tinUp()}
          aria-pressed={holding}
          className={`touch-none select-none rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${
            holding ? "border-[rgb(var(--accent,255_255_255))] bg-[rgb(var(--accent,255_255_255)/0.2)]" : "border-white/25 hover:border-white/50"
          }`}
        >
          {holding ? "Agregando estaño…" : "Mantén: estaño"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {result ? (
          <>
            <Feedback tone={RESULTS[result].ok ? "ok" : "error"}>
              <strong>{RESULTS[result].title}</strong> ({(lastTime / 1000).toFixed(1)} s). {RESULTS[result].text}
            </Feedback>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-sm text-white/60 underline underline-offset-4 hover:text-white">
              <RotateCcw className="h-4 w-4" /> Soldar otra vez
            </button>
          </>
        ) : coldTin && ironAt === null ? (
          <Feedback tone="error">Sin el cautín apoyado no hay calor: el estaño no se derrite. Primero apoya el cautín.</Feedback>
        ) : (
          <Feedback tone="info">
            {ironOn ? `Cautín apoyado: ${(elapsed / 1000).toFixed(1)} s · estaño: ${(liveTin / 1000).toFixed(1)} s` : "Empieza apoyando el cautín."}
          </Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
