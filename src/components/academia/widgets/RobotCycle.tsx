import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { RefreshCw } from "lucide-react";

// P1 · El ciclo de todo robot: Percibir → Decidir → Actuar, con una animación pequeña al lado de cada fase.
// No es para tocar: muestra la idea. Las fases se iluminan en orden, una y otra vez, como el loop() del robot.

const STYLES = `
@keyframes rc-wave { 0% { opacity: 0; transform: scale(0.5); } 40% { opacity: 1; } 100% { opacity: 0; transform: scale(1.35); } }
@keyframes rc-press { 0%, 60%, 100% { transform: translateY(0); } 70%, 85% { transform: translateY(3px); } }
@keyframes rc-yes { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0.15; } 100% { opacity: 1; } }
@keyframes rc-no { 0%, 45% { opacity: 0.15; } 50%, 95% { opacity: 1; } 100% { opacity: 0.15; } }
@keyframes rc-spin { to { transform: rotate(360deg); } }
@keyframes rc-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
@keyframes rc-arm { 0%, 100% { transform: rotate(-35deg); } 50% { transform: rotate(35deg); } }
.rc-anim * { transform-box: fill-box; }
@media (prefers-reduced-motion: reduce) { .rc-anim * { animation: none !important; } }
`;

const TONE = "rgb(var(--tone, 255 255 255))";

function Sense() {
  return (
    <svg viewBox="0 0 80 64" className="rc-anim h-16 w-20" aria-hidden>
      {/* Un sensor de distancia con sus dos "ojos" y las ondas que salen y rebotan */}
      <rect x="4" y="18" width="22" height="28" rx="3" fill="#1f2937" stroke="rgba(255,255,255,0.35)" />
      <circle cx="15" cy="26" r="5" fill="#9ca3af" />
      <circle cx="15" cy="38" r="5" fill="#9ca3af" />
      {[0, 0.5, 1].map((delay) => (
        <path
          key={delay}
          d="M30 20 Q40 32 30 44"
          fill="none"
          stroke={TONE}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transformOrigin: "left center", animation: `rc-wave 1.5s ease-out ${delay}s infinite` }}
        />
      ))}
      {/* El obstáculo que detecta */}
      <rect x="62" y="16" width="12" height="32" rx="2" fill="rgba(255,255,255,0.18)" />
      {/* Y un botón que se presiona */}
      <g style={{ animation: "rc-press 2s ease-in-out infinite" }}>
        <rect x="36" y="52" width="14" height="6" rx="2" fill={TONE} />
      </g>
      <rect x="33" y="57" width="20" height="4" rx="1" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

function Decide() {
  return (
    <svg viewBox="0 0 80 64" className="rc-anim h-16 w-20" aria-hidden>
      {/* Un rombo de decisión: a veces sale por "sí", a veces por "no" */}
      <path d="M30 6 L48 22 L30 38 L12 22 Z" fill="#1f2937" stroke={TONE} strokeWidth="2" />
      <text x="30" y="27" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">
        ?
      </text>
      <g style={{ animation: "rc-yes 3s steps(1) infinite" }}>
        <path d="M48 22 H66" stroke={TONE} strokeWidth="2.5" />
        <path d="M62 17 L68 22 L62 27" fill="none" stroke={TONE} strokeWidth="2.5" />
        <text x="58" y="14" textAnchor="middle" fontSize="9" fill="white">
          sí
        </text>
      </g>
      <g style={{ animation: "rc-no 3s steps(1) infinite" }}>
        <path d="M30 38 V56" stroke={TONE} strokeWidth="2.5" />
        <path d="M25 52 L30 58 L35 52" fill="none" stroke={TONE} strokeWidth="2.5" />
        <text x="40" y="52" fontSize="9" fill="white">
          no
        </text>
      </g>
    </svg>
  );
}

function Act() {
  return (
    <svg viewBox="0 0 80 64" className="rc-anim h-16 w-20" aria-hidden>
      {/* Una rueda que gira (motor) */}
      <g style={{ transformOrigin: "center", animation: "rc-spin 1.6s linear infinite" }}>
        <circle cx="18" cy="34" r="14" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="4" />
        {[0, 60, 120].map((a) => (
          <line
            key={a}
            x1={18 - 12 * Math.cos((a * Math.PI) / 180)}
            y1={34 - 12 * Math.sin((a * Math.PI) / 180)}
            x2={18 + 12 * Math.cos((a * Math.PI) / 180)}
            y2={34 + 12 * Math.sin((a * Math.PI) / 180)}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2.5"
          />
        ))}
      </g>
      {/* Un LED que parpadea */}
      <g style={{ animation: "rc-blink 1s steps(1) infinite" }}>
        <circle cx="46" cy="16" r="9" fill={TONE} opacity="0.25" />
        <circle cx="46" cy="16" r="5" fill={TONE} />
      </g>
      <line x1="44" y1="21" x2="44" y2="30" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="48" y1="21" x2="48" y2="28" stroke="#9ca3af" strokeWidth="1.5" />
      {/* Y el brazo de un servo que va y viene */}
      <rect x="54" y="42" width="20" height="14" rx="2" fill="#1f2937" stroke="rgba(255,255,255,0.35)" />
      <g style={{ transformOrigin: "0% 50%", animation: "rc-arm 2s ease-in-out infinite" }}>
        <rect x="64" y="40" width="14" height="4" rx="2" fill={TONE} />
      </g>
      <circle cx="64" cy="42" r="2.5" fill="white" />
    </svg>
  );
}

const PHASES: { title: string; text: ReactNode; Art: () => JSX.Element }[] = [
  { title: "Percibir", text: "leer botones, sensores o comandos.", Art: Sense },
  { title: "Decidir", text: "según lo que leyó, elegir qué hacer.", Art: Decide },
  { title: "Actuar", text: "mover motores o servos, encender luces.", Art: Act },
];

export function RobotCycle() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setActive((current) => (current + 1) % PHASES.length), 1800);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className="not-prose my-6">
      <style>{STYLES}</style>
      <ol className="relative space-y-3">
        {PHASES.map(({ title, text, Art }, index) => {
          const on = !reduceMotion && active === index;
          return (
            <li
              key={title}
              className={`flex items-center gap-4 rounded-2xl border p-3 transition-colors duration-500 ${
                on ? "border-[rgb(var(--tone,255_255_255)/0.6)] bg-[rgb(var(--tone,255_255_255)/0.08)]" : "border-white/10"
              }`}
            >
              <span className="flex shrink-0 items-center justify-center rounded-xl bg-white/[0.04] p-1">
                <Art />
              </span>
              <p className="text-white/80">
                <span className="mr-1 text-white/40">{index + 1}.</span>
                <strong className="text-white">{title}:</strong> {text}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex items-center gap-2 text-sm text-white/50">
        <RefreshCw className="h-4 w-4 animate-[spin_6s_linear_infinite] motion-reduce:animate-none" />
        Y vuelve a empezar: el robot repite este ciclo sin parar mientras esté encendido.
      </p>
    </div>
  );
}
