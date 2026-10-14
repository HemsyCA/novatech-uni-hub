import { useState } from "react";
import { ListOrdered, Microscope, RotateCcw, X } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const SIZES = [
  { code: "1206", w: 3.2, h: 1.6, level: "Fácil, ideal para empezar" },
  { code: "0805", w: 2.0, h: 1.25, level: "Fácil con práctica" },
  { code: "0603", w: 1.6, h: 0.8, level: "Requiere pinzas finas y lupa" },
];

const PX_PER_MM = 22;

function SmdPart({ w, h }: { w: number; h: number }) {
  const W = w * PX_PER_MM;
  const H = h * PX_PER_MM;
  const cap = Math.max(W * 0.18, 5);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <rect width={W} height={H} rx="2" fill="#1f1f1f" />
      <rect width={cap} height={H} rx="1.5" fill="#cbd5e1" />
      <rect x={W - cap} width={cap} height={H} rx="1.5" fill="#cbd5e1" />
    </svg>
  );
}

export function SmdSizes() {
  const [selected, setSelected] = useState(SIZES[0]);

  return (
    <WidgetCard icon={Microscope} label="Míralo de cerca" title="¿Qué tan pequeños son?">
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => (
          <Choice key={s.code} selected={s === selected} onClick={() => setSelected(s)}>
            {s.code}
          </Choice>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-around gap-4 rounded-xl bg-white/[0.03] px-3 py-6">
        <div className="flex flex-col items-center gap-2">
          <SmdPart w={selected.w} h={selected.h} />
          <span className="text-xs text-white/60">
            {selected.code}: {selected.w} × {selected.h} mm
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <svg width={7 * PX_PER_MM} height={2.5 * PX_PER_MM} viewBox="0 0 154 55" aria-hidden>
            <ellipse cx="77" cy="27.5" rx="76" ry="26" fill="#f5f5f4" />
          </svg>
          <span className="text-xs text-white/60">un grano de arroz (≈ 7 mm)</span>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-white/40">Los dos dibujos están a la misma escala, aumentados.</p>

      <div className="mt-4">
        <Feedback tone="info">
          <strong>{selected.code}</strong> · {selected.level}. El código indica el tamaño en centésimas de pulgada:{" "}
          {selected.code.slice(0, 2)} × {selected.code.slice(2)}.
        </Feedback>
      </div>
    </WidgetCard>
  );
}

const STEPS = [
  "Pon estaño en uno solo de los pads",
  "Toma el componente con la pinza y acércalo",
  "Recalienta el pad estañado y desliza el componente a su lugar",
  "Suelda el otro extremo",
  "Vuelve al primer extremo, agrega flux y retócalo",
];

const SHUFFLED = [3, 0, 4, 2, 1];

export function SmdOrder() {
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const available = SHUFFLED.filter((i) => !placed.includes(i));
  const firstWrong = placed.findIndex((step, position) => step !== position);
  const complete = placed.length === STEPS.length;
  const solved = complete && firstWrong === -1;

  return (
    <WidgetCard icon={ListOrdered} title="Ordena: estañar un pad primero">
      {solved && checked ? (
        <div className="space-y-3">
          <Feedback tone="ok">
            ¡Exacto! Fijar un solo lado primero evita el “efecto lápida”: si estañas los dos pads, el componente queda inclinado.
          </Feedback>
          <ol className="space-y-1 text-sm text-white/80">
            {STEPS.map((step, i) => (
              <li key={step}>
                {i + 1}. {step}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => {
              setPlaced([]);
              setChecked(false);
            }}
            className="inline-flex items-center gap-2 text-sm text-white/60 underline underline-offset-4 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" /> Hacerlo de nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-white/60">Toca los pasos en el orden correcto para soldar una resistencia SMD.</p>
          <ol className="min-h-[3rem] space-y-1.5 rounded-xl border border-dashed border-white/20 p-2">
            {placed.length === 0 && <li className="px-2 py-2 text-sm text-white/35">Tus pasos aparecerán aquí…</li>}
            {placed.map((step, position) => (
              <li key={step}>
                <button
                  type="button"
                  onClick={() => {
                    setPlaced((current) => current.filter((i) => i !== step));
                    setChecked(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                    checked && position === firstWrong ? "bg-rose-400/15 text-rose-100 ring-1 ring-rose-400" : "bg-white/[0.06]"
                  }`}
                >
                  <span className="w-5 text-xs text-white/40">{position + 1}.</span>
                  <span className="flex-1">{STEPS[step]}</span>
                  <X className="h-3.5 w-3.5 text-white/40" aria-label="Quitar" />
                </button>
              </li>
            ))}
          </ol>
          {available.length > 0 && (
            <div className="flex flex-col gap-2">
              {available.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setPlaced((current) => [...current, step])}
                  className="rounded-lg border border-white/20 px-3 py-2 text-left text-sm hover:border-[rgb(var(--accent,255_255_255))]"
                >
                  {STEPS[step]}
                </button>
              ))}
            </div>
          )}
          {complete && !checked && (
            <button type="button" onClick={() => setChecked(true)} className="rounded-xl bg-[rgb(var(--accent,255_255_255))] px-5 py-2.5 text-sm font-semibold text-black">
              Comprobar
            </button>
          )}
          {checked && !solved && (
            <Feedback tone="error">El paso {firstWrong + 1} no va ahí. Toca un paso de tu lista para quitarlo y vuelve a intentarlo.</Feedback>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
