import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import { Box, Cpu, Move3d, RotateCcw } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";
import { FILTERS, LEFT, RIGHT, type PinKind } from "@/lib/academia/esp32-pins";
import type { ChipId, PartId, PinRef } from "@/components/academia/widgets/esp32-3d/Esp32Scene";

// La placa ESP32 DevKit V1 en 3D. La escena (three.js) se carga solo cuando se abre esta lección.
const Esp32Scene = lazy(() => import("@/components/academia/widgets/esp32-3d/Esp32Scene"));

const CHIPS: { id: ChipId; label: string }[] = [
  { id: "ch340", label: "CH340 (la del equipo)" },
  { id: "cp2102", label: "CP2102" },
];

const chipName = (chip: ChipId) => (chip === "ch340" ? "CH340" : "CP2102");

const partNames = (chip: ChipId): Record<PartId, string> => ({
  modulo: "Módulo ESP32",
  usb: "Conector micro USB",
  chip: `Chip USB-serial (${chipName(chip)})`,
  regulador: "Regulador de voltaje",
  en: "Botón EN",
  boot: "Botón BOOT",
  pines: "30 pines",
});

const partInfo = (chip: ChipId): Record<PartId, string> => ({
  modulo:
    "El rectángulo metálico. Adentro está el microcontrolador, el cerebro de la placa. En el borde, el zigzag dorado es la antena del Wi-Fi y el Bluetooth.",
  usb: "Sirve para dos cosas a la vez: alimentar la placa y cargarle programas desde la computadora.",
  chip:
    chip === "ch340"
      ? "Traduce entre el USB de tu computadora y el ESP32. Con el CH340 (la placa que usamos en el equipo) necesitas el driver CH340: lo verás en la lección Extra de Programación."
      : "Traduce entre el USB de tu computadora y el ESP32. Con el CP2102, más pequeño y cuadrado, necesitas el driver CP210x: lo verás en la lección Extra de Programación.",
  regulador: "Convierte los 5 V del USB en los 3.3 V que necesita el ESP32.",
  en: "Reinicia la placa, como apagarla y prenderla.",
  boot: "Se usa en algunos casos para cargar programas.",
  pines: "15 de cada lado. Por debajo salen las patitas que se clavan en el protoboard; arriba, cada una tiene su nombre impreso.",
});

const PART_ORDER: PartId[] = ["modulo", "usb", "chip", "regulador", "en", "boot", "pines"];

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

function Stage({ children, onReset }: { children: ReactNode; onReset: () => void }) {
  const webgl = useMemo(supportsWebGL, []);
  return (
    <div className="relative h-[380px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0c] sm:h-[420px]">
      {webgl ? (
        <Suspense fallback={<p className="flex h-full items-center justify-center text-sm text-white/50 animate-pulse">Cargando la placa en 3D…</p>}>
          {children}
        </Suspense>
      ) : (
        <p className="flex h-full items-center justify-center px-6 text-center text-sm text-white/50">
          Tu navegador no puede mostrar 3D. Usa la placa de abajo: tiene la misma información.
        </p>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white/60">
          <Move3d className="h-3.5 w-3.5" /> Arrastra para girar<span className="hidden sm:inline"> · rueda o pellizco para acercar</span>
        </span>
        <button
          type="button"
          onClick={onReset}
          className="pointer-events-auto inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white/70 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Centrar
        </button>
      </div>
    </div>
  );
}

function ChipSwitch({ chip, onChange }: { chip: ChipId; onChange: (chip: ChipId) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-white/50">Chip USB:</span>
      {CHIPS.map((c) => (
        <Choice key={c.id} selected={chip === c.id} onClick={() => onChange(c.id)}>
          {c.label}
        </Choice>
      ))}
    </div>
  );
}

// E3 · Las partes de la placa: toca cada parte para saber qué hace.
export function Esp32Parts3D() {
  const [chip, setChip] = useState<ChipId>("ch340");
  const [part, setPart] = useState<PartId | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const names = partNames(chip);
  const info = partInfo(chip);

  return (
    <WidgetCard icon={Box} label="Explora en 3D" title="ESP32 DevKit V1: sus partes">
      <div className="space-y-4">
        <ChipSwitch chip={chip} onChange={setChip} />
        <Stage onReset={() => setResetKey((k) => k + 1)}>
          <Esp32Scene mode="partes" chip={chip} selectedPart={part} onSelectPart={setPart} partNames={names} resetKey={resetKey} />
        </Stage>
        <div className="flex flex-wrap gap-1.5">
          {PART_ORDER.map((id) => (
            <Choice key={id} selected={part === id} onClick={() => setPart(id)}>
              {names[id]}
            </Choice>
          ))}
        </div>
        {part ? (
          <Feedback tone="info">
            <span className="font-semibold text-white">{names[part]}: </span>
            {info[part]}
          </Feedback>
        ) : (
          <Feedback tone="info">Gira la placa y toca cada parte (o elígela en la lista) para saber qué hace.</Feedback>
        )}
      </div>
    </WidgetCard>
  );
}

// E3 · Paso a paso: los 30 pines en 3D, con los del Mapa Nova y la alimentación ya rotulados.
export function Esp32Pins3D() {
  const [chip, setChip] = useState<ChipId>("ch340");
  const [pin, setPin] = useState<PinRef | null>(null);
  const [filter, setFilter] = useState<PinKind | null>(null);
  const [labels, setLabels] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const selected = pin ? (pin.side === "left" ? LEFT : RIGHT)[pin.index] : null;

  return (
    <WidgetCard icon={Cpu} label="Explora en 3D" title="ESP32 DevKit V1: sus 30 pines">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Choice key={f.label} selected={filter === f.kind} onClick={() => setFilter(f.kind)}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: `rgb(${f.color})` }} />
              {f.label}
            </Choice>
          ))}
          <Choice selected={labels} onClick={() => setLabels((v) => !v)}>
            Rótulos
          </Choice>
        </div>
        <Stage onReset={() => setResetKey((k) => k + 1)}>
          <Esp32Scene
            mode="pines"
            chip={chip}
            selectedPin={pin}
            onSelectPin={setPin}
            filter={filter}
            labels={labels}
            partNames={partNames(chip)}
            resetKey={resetKey}
          />
        </Stage>
        {selected ? (
          <Feedback tone="info">
            <span className="font-semibold text-white">{selected.label}: </span>
            {selected.info}
          </Feedback>
        ) : (
          <Feedback tone="info">Toca cualquier pin de la placa para ver qué es y si lo usamos en Nova.</Feedback>
        )}
        <ChipSwitch chip={chip} onChange={setChip} />
      </div>
    </WidgetCard>
  );
}
