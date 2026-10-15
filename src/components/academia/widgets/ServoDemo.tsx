import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Choice, CodeLine, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const PERIOD_MS = 20;

const pulseMs = (angle: number) => 0.5 + (angle / 180) * 2;

export function ServoDrawing({ angle }: { angle: number }) {
  // 0° apunta a la derecha y 180° a la izquierda, como el brazo de un SG90 visto desde arriba.
  const rad = (Math.PI * (180 - angle)) / 180;
  const cx = 110;
  const cy = 90;
  const x = cx - Math.cos(rad) * 70;
  const y = cy - Math.sin(rad) * 70;
  return (
    <svg viewBox="0 0 220 120" className="h-auto w-full max-w-[260px]" role="img" aria-label={`Servo en ${angle} grados`}>
      <path d="M40 90 A70 70 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="3 4" />
      {[0, 90, 180].map((a) => {
        const r = (Math.PI * (180 - a)) / 180;
        return (
          <text key={a} x={cx - Math.cos(r) * 86} y={cy - Math.sin(r) * 86 + 4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontFamily="inherit">
            {a}°
          </text>
        );
      })}
      <rect x="80" y="78" width="60" height="38" rx="4" fill="#1d4ed8" opacity="0.8" />
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="white" strokeWidth="9" strokeLinecap="round" style={{ transition: "all 0.25s ease-out" }} />
      <circle cx={cx} cy={cy} r="9" fill="white" />
      <circle cx={cx} cy={cy} r="3" fill="#1d4ed8" />
    </svg>
  );
}

function PulseChart({ angle }: { angle: number }) {
  const width = 240;
  const scale = width / PERIOD_MS;
  const pulse = pulseMs(angle) * scale;
  return (
    <svg viewBox="0 0 250 64" className="h-16 w-full" role="img" aria-label={`Pulso de ${pulseMs(angle).toFixed(2)} ms cada 20 ms`}>
      <path
        d={`M0 50 V10 H${pulse} V50 H${width}`}
        fill="none"
        stroke="rgb(var(--tone, 255 255 255))"
        strokeWidth="2"
      />
      <line x1="0" y1="58" x2={width} y2="58" stroke="rgba(255,255,255,0.2)" />
      <text x="0" y="64" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="inherit">0 ms</text>
      <text x={width - 24} y="64" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="inherit">20 ms</text>
      <text x={pulse + 4} y="22" fill="rgb(var(--tone, 255 255 255))" fontSize="10" fontFamily="inherit">
        {pulseMs(angle).toFixed(2)} ms
      </text>
    </svg>
  );
}

export function ServoDemo() {
  const [angle, setAngle] = useState(90);

  return (
    <WidgetCard icon={RotateCw} title="Mueve el servo">
      <div className="flex justify-center">
        <ServoDrawing angle={angle} />
      </div>
      <label htmlFor="servo-angle" className="mb-2 mt-3 flex justify-between text-xs text-white/50">
        Ángulo <span className="font-semibold text-white">{angle}°</span>
      </label>
      <input
        id="servo-angle"
        type="range"
        min={0}
        max={180}
        value={angle}
        onChange={(e) => setAngle(Number(e.target.value))}
        className="w-full accent-[rgb(var(--tone,255_255_255))]"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {[0, 45, 90, 135, 180].map((a) => (
          <Choice key={a} selected={angle === a} onClick={() => setAngle(a)}>
            {a}°
          </Choice>
        ))}
      </div>
      <div className="mt-4">
        <CodeLine>miServo.write({angle});</CodeLine>
      </div>
      <div className="mt-4 rounded-xl bg-white/[0.03] p-3">
        <p className="text-xs text-white/50">Lo que la librería envía por el GPIO 25 (un pulso cada 20 ms)</p>
        <PulseChart angle={angle} />
      </div>
    </WidgetCard>
  );
}
