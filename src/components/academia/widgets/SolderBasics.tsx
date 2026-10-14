import { useState } from "react";
import { RotateCcw, ShieldCheck, Thermometer } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const SOLDERS = [
  { name: "Con plomo (63/37)", melts: "183 a 190 °C", min: 320, max: 350 },
  { name: "Sin plomo", melts: "217 a 220 °C", min: 350, max: 380 },
];

const T_MIN = 200;
const T_MAX = 450;

export function TipTemperature() {
  const [solder, setSolder] = useState(SOLDERS[0]);
  const [temp, setTemp] = useState(260);
  const pos = (t: number) => ((t - T_MIN) / (T_MAX - T_MIN)) * 100;
  const verdict = temp < solder.min ? "low" : temp > solder.max ? "high" : "ok";

  return (
    <WidgetCard icon={Thermometer} title="¿A qué temperatura pongo la punta?">
      <div className="flex flex-wrap gap-2">
        {SOLDERS.map((s) => (
          <Choice key={s.name} selected={s === solder} onClick={() => setSolder(s)}>
            {s.name}
          </Choice>
        ))}
      </div>
      <p className="mt-2 text-xs text-white/50">Este estaño se funde a {solder.melts}.</p>

      <div className="mt-5">
        <div className="relative h-4 rounded-full bg-gradient-to-r from-sky-500/40 via-amber-400/40 to-rose-500/60">
          <div
            className="absolute inset-y-0 rounded-full border-2 border-emerald-300 bg-emerald-400/30"
            style={{ left: `${pos(solder.min)}%`, width: `${pos(solder.max) - pos(solder.min)}%` }}
            title="Rango recomendado"
          />
          <div
            className="absolute -top-1 h-6 w-1.5 -translate-x-1/2 rounded-full bg-white shadow"
            style={{ left: `${pos(temp)}%`, transition: "left 0.15s ease" }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-white/40">
          <span>{T_MIN} °C</span>
          <span className="text-emerald-300">
            recomendado {solder.min}–{solder.max} °C
          </span>
          <span>{T_MAX} °C</span>
        </div>
      </div>

      <label htmlFor="tip-temp" className="mb-2 mt-4 flex justify-between text-xs text-white/50">
        Temperatura de la punta <span className="text-lg font-semibold text-white">{temp} °C</span>
      </label>
      <input
        id="tip-temp"
        type="range"
        min={T_MIN}
        max={T_MAX}
        step={10}
        value={temp}
        onChange={(e) => setTemp(Number(e.target.value))}
        className="w-full accent-[rgb(var(--accent,255_255_255))]"
      />

      <div className="mt-4">
        {verdict === "ok" ? (
          <Feedback tone="ok">
            Bien. La punta está bastante por encima del punto de fusión porque pierde calor al tocar el pad y la pata.
          </Feedback>
        ) : verdict === "low" ? (
          <Feedback tone="error">
            Muy fría: aunque el estaño se derrita en la punta, la junta no alcanza a calentarse y sale una soldadura fría.
          </Feedback>
        ) : (
          <Feedback tone="error">
            Demasiado caliente: quema el flux antes de tiempo, oxida la punta y puede despegar las pistas de la placa.
          </Feedback>
        )}
      </div>
    </WidgetCard>
  );
}

const SITUATIONS = [
  { text: "Dejo el cautín sobre la mesa un momento mientras acomodo la placa.", ok: false, why: "Siempre va al soporte: la punta pasa de 300 °C." },
  { text: "Antes de guardar el cautín, estaño la punta.", ok: true, why: "Esa capa de estaño fresco protege la punta del óxido." },
  { text: "Me pongo lentes antes de cortar las patas sobrantes.", ok: true, why: "Las patas cortadas salen disparadas." },
  { text: "La punta está oxidada, así que la lijo para que brille.", ok: false, why: "Se pierde su recubrimiento y deja de mojar el estaño. Límpiala con viruta de latón." },
  { text: "Subo la temperatura al máximo para que caliente más rápido.", ok: false, why: "Se oxida la punta y se dañan los pads." },
  { text: "Sueldo con la ventana abierta y sin acercar la cara al humo.", ok: true, why: "El humo viene del flux e irrita: ventilación siempre." },
  { text: "Como algo mientras sueldo y me lavo las manos al final.", ok: false, why: "No se come mientras se suelda, sobre todo con estaño con plomo." },
];

export function SafetyCheck() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const finished = index >= SITUATIONS.length;
  const situation = SITUATIONS[Math.min(index, SITUATIONS.length - 1)];

  const choose = (value: boolean) => {
    if (answer !== null) return;
    setAnswer(value);
    if (value === situation.ok) setScore((s) => s + 1);
  };

  const next = () => {
    setIndex((i) => i + 1);
    setAnswer(null);
  };

  return (
    <WidgetCard icon={ShieldCheck} label="Juego" title="¿Correcto o incorrecto?">
      {finished ? (
        <div className="space-y-3">
          <Feedback tone={score === SITUATIONS.length ? "ok" : "info"}>
            Acertaste {score} de {SITUATIONS.length}. {score === SITUATIONS.length ? "¡Listo para el laboratorio!" : "Repasa las reglas de seguridad y vuelve a intentarlo."}
          </Feedback>
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setScore(0);
              setAnswer(null);
            }}
            className="inline-flex items-center gap-2 text-sm text-white/60 underline underline-offset-4 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" /> Jugar de nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-white/50">
            Situación {index + 1} de {SITUATIONS.length}
          </p>
          <p className="rounded-xl bg-white/[0.05] px-4 py-4 text-base leading-relaxed">“{situation.text}”</p>
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map((value) => {
              const picked = answer === value;
              const right = answer !== null && value === situation.ok;
              return (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => choose(value)}
                  disabled={answer !== null}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    right
                      ? "border-emerald-400 bg-emerald-400/15"
                      : picked
                        ? "border-rose-400 bg-rose-400/10"
                        : "border-white/20 hover:border-white/40"
                  }`}
                >
                  {value ? "✅ Correcto" : "⚠️ Incorrecto"}
                </button>
              );
            })}
          </div>
          {answer !== null && (
            <>
              <Feedback tone={answer === situation.ok ? "ok" : "error"}>
                {answer === situation.ok ? "¡Bien! " : "No. "}
                {situation.why}
              </Feedback>
              <button type="button" onClick={next} className="rounded-xl bg-[rgb(var(--accent,255_255_255))] px-5 py-2.5 text-sm font-semibold text-black">
                {index + 1 === SITUATIONS.length ? "Ver resultado" : "Siguiente situación"}
              </button>
            </>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
