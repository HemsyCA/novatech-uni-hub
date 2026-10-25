import { AnimCard, FlowDots, LedShape, Pill } from "@/components/academia/anim/AnimKit";
import { TONE, usePhase, useTick } from "@/components/academia/anim/use-anim";

// Animaciones de Electrónica (E1–E6). Cada una muestra en movimiento lo que explica el texto que la acompaña.

// ---------------------------------------------------------------- E1 · La analogía del agua

export function WaterAnalogy() {
  const { tick, still } = useTick(2600);
  const narrow = still ? false : tick % 2 === 1; // alterna tubería ancha y estrecha
  const pipe = narrow ? 6 : 16;
  const flow = narrow ? 3.2 : 1.4;
  const level = narrow ? 0.35 : 1;
  return (
    <AnimCard
      title="Voltaje, corriente y resistencia, con agua y con electricidad"
      caption={
        <>
          El tanque alto da la <strong className="text-white">presión</strong> (voltaje). Cuando la tubería se{" "}
          <strong className="text-white">estrecha</strong> (más resistencia), pasa{" "}
          <strong className="text-white">menos agua por segundo</strong> (menos corriente), y en el circuito el LED brilla menos.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="rounded-xl bg-white/[0.03] p-3">
          <svg viewBox="0 0 220 120" className="w-full" aria-label="Agua bajando de un tanque por una tubería">
            <rect x="10" y="10" width="44" height="60" rx="3" fill="#0b2540" stroke="#60a5fa" />
            <rect x="12" y="20" width="40" height="48" fill="#3b82f6" opacity="0.55" />
            <text x="32" y="86" textAnchor="middle" fontSize="9" fill="#93c5fd">
              presión
            </text>
            <path d="M54 60 H120" stroke="#60a5fa" strokeWidth="16" opacity="0.35" />
            <path d="M120 60 H160" stroke="#60a5fa" strokeWidth={pipe} opacity="0.35" style={{ transition: "stroke-width 0.6s" }} />
            <path d="M160 60 H205" stroke="#60a5fa" strokeWidth="16" opacity="0.35" />
            <FlowDots path="M56 60 H205" count={narrow ? 4 : 9} duration={flow} color="#93c5fd" still={still} />
            <text x="140" y={narrow ? 82 : 88} textAnchor="middle" fontSize="9" fill="white">
              {narrow ? "tubería estrecha" : "tubería ancha"}
            </text>
          </svg>
          <figcaption className="text-center text-xs text-white/50">Agua</figcaption>
        </figure>
        <figure className="rounded-xl bg-white/[0.03] p-3">
          <svg viewBox="0 0 220 120" className="w-full" aria-label="Corriente en un circuito con pila, resistencia y LED">
            <rect x="14" y="40" width="26" height="40" rx="3" fill="#1f2937" stroke="rgba(255,255,255,0.4)" />
            <text x="27" y="64" textAnchor="middle" fontSize="10" fill="white">
              V
            </text>
            <path d="M27 40 V18 H190 V96 H27 V80" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
            {/* resistencia: más alta cuando es "estrecha" */}
            <rect x="80" y="12" width={narrow ? 44 : 22} height="12" rx="3" fill="#d8b98a" style={{ transition: "width 0.6s" }} />
            <text x="100" y="38" textAnchor="middle" fontSize="9" fill="white">
              {narrow ? "resistencia alta" : "resistencia baja"}
            </text>
            <LedShape x={190} y={58} level={level} />
            <FlowDots path="M27 40 V18 H190 V96 H27 V80" count={narrow ? 4 : 9} duration={flow * 1.8} still={still} />
          </svg>
          <figcaption className="text-center text-xs text-white/50">Electricidad</figcaption>
        </figure>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E2 · Resistencias en serie

export function SeriesResistors() {
  const phase = usePhase(3, 2200, 0);
  const pairs = [
    [220, 330],
    [1000, 1000],
    [4700, 10000],
  ];
  const [r1, r2] = pairs[phase];
  const fmt = (v: number) => (v >= 1000 ? `${v / 1000} kΩ` : `${v} Ω`);
  const { still } = useTick(100000);
  return (
    <AnimCard
      title="Dos resistencias en serie"
      caption="Los puntitos son la corriente: es la misma en R1 y en R2 porque solo tiene un camino. Y la resistencia total es la suma de las dos."
    >
      <svg viewBox="0 0 300 120" className="mx-auto w-full max-w-md" aria-label="Circuito con dos resistencias en serie">
        <rect x="14" y="42" width="26" height="40" rx="3" fill="#1f2937" stroke="rgba(255,255,255,0.4)" />
        <text x="27" y="66" textAnchor="middle" fontSize="10" fill="white">
          V
        </text>
        <path d="M27 42 V20 H280 V104 H27 V82" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        <rect x="80" y="13" width="44" height="14" rx="3" fill="#d8b98a" />
        <rect x="180" y="13" width="44" height="14" rx="3" fill="#d8b98a" />
        <text x="102" y="44" textAnchor="middle" fontSize="11" fill="white">
          R1 = {fmt(r1)}
        </text>
        <text x="202" y="44" textAnchor="middle" fontSize="11" fill="white">
          R2 = {fmt(r2)}
        </text>
        <FlowDots path="M27 42 V20 H280 V104 H27 V82" count={10} duration={4} still={still} />
        <text x="150" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill={TONE}>
          R total = {fmt(r1)} + {fmt(r2)} = {fmt(r1 + r2)}
        </text>
      </svg>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E2 · Sensores que funcionan igual (LDR)

export function LightSensor() {
  const { tick, still } = useTick(120);
  // La luz sube y baja suavemente.
  const light = still ? 0.7 : (Math.sin(tick / 12) + 1) / 2;
  const ldr = Math.round(1000 + (1 - light) * 49000); // más luz → menos resistencia
  const fixed = 10000;
  // LDR arriba (a 3V3) y resistencia fija abajo: más luz → más voltaje en el medio.
  const volts = (3.3 * fixed) / (ldr + fixed);
  const reading = Math.round((volts / 3.3) * 4095);
  return (
    <AnimCard
      title="Una fotorresistencia (LDR) en un divisor de voltaje"
      caption="Con más luz, la LDR tiene menos resistencia, y el voltaje del punto medio sube. El ESP32 solo lee ese voltaje: igual que con el potenciómetro."
    >
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <svg viewBox="0 0 260 150" className="w-full" aria-label="Sol, fotorresistencia y voltaje medido">
          <circle cx="36" cy="40" r={14 + light * 6} fill="#facc15" opacity={0.25 + light * 0.75} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1={36 + 22 * Math.cos((a * Math.PI) / 180)}
              y1={40 + 22 * Math.sin((a * Math.PI) / 180)}
              x2={36 + 30 * Math.cos((a * Math.PI) / 180)}
              y2={40 + 30 * Math.sin((a * Math.PI) / 180)}
              stroke="#facc15"
              strokeWidth="2"
              opacity={light}
            />
          ))}
          <text x="36" y="90" textAnchor="middle" fontSize="9" fill="white">
            luz {Math.round(light * 100)} %
          </text>
          {/* divisor */}
          <text x="150" y="14" textAnchor="middle" fontSize="9" fill="white">
            3V3
          </text>
          <line x1="150" y1="18" x2="150" y2="30" stroke="white" />
          <rect x="138" y="30" width="24" height="34" rx="4" fill="#7f1d1d" stroke="#f87171" />
          <text x="186" y="50" fontSize="9" fill="white">
            LDR {ldr >= 1000 ? `${(ldr / 1000).toFixed(1)} kΩ` : `${ldr} Ω`}
          </text>
          <line x1="150" y1="64" x2="150" y2="84" stroke="white" />
          <circle cx="150" cy="78" r="3" fill={TONE} />
          <line x1="150" y1="78" x2="214" y2="78" stroke={TONE} strokeDasharray="3 3" />
          <rect x="138" y="84" width="24" height="34" rx="4" fill="#d8b98a" />
          <text x="186" y="104" fontSize="9" fill="white">
            10 kΩ
          </text>
          <line x1="150" y1="118" x2="150" y2="132" stroke="white" />
          <text x="150" y="144" textAnchor="middle" fontSize="9" fill="white">
            GND
          </text>
        </svg>
        <div className="space-y-2 text-center">
          <div className="rounded-xl bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-white/50">Voltaje en el medio</p>
            <p className="font-display text-2xl font-black tabular-nums">{volts.toFixed(2)} V</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-white/50">Lo que lee el ESP32</p>
            <p className="font-display text-2xl font-black tabular-nums">{reading}</p>
          </div>
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E3 · Tipos de pines (los 4 usos de un GPIO)

export function GpioModes() {
  const { tick, still } = useTick(500);
  const t = still ? 1 : tick;
  const on = t % 4 < 2;
  const pressed = t % 6 < 3;
  const pot = still ? 0.6 : (Math.sin(t / 3) + 1) / 2;
  const duty = still ? 0.3 : [0.1, 0.3, 0.6, 0.9][Math.floor(t / 3) % 4];
  const wave = (d: number) => {
    let path = "M0 30";
    for (let i = 0; i < 4; i++) path += ` V8 H${i * 30 + 30 * d} V30 H${(i + 1) * 30}`;
    return path;
  };
  const panel = "flex flex-col items-center gap-2 rounded-xl bg-white/[0.03] p-3";
  return (
    <AnimCard title="Lo que puede hacer un pin GPIO">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={panel}>
          <p className="text-xs font-semibold">Salida digital</p>
          <svg viewBox="0 0 60 50" className="h-14" aria-hidden>
            <LedShape x={30} y={26} level={on ? 1 : 0} />
          </svg>
          <Pill on={on}>{on ? "HIGH · 3.3 V" : "LOW · 0 V"}</Pill>
        </div>
        <div className={panel}>
          <p className="text-xs font-semibold">Entrada digital</p>
          <svg viewBox="0 0 60 50" className="h-14" aria-hidden>
            <rect x="12" y="34" width="36" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="20" y={pressed ? 28 : 20} width="20" height="8" rx="2" fill={TONE} style={{ transition: "y 0.15s" }} />
          </svg>
          <Pill on={pressed}>lee {pressed ? "HIGH (1)" : "LOW (0)"}</Pill>
        </div>
        <div className={panel}>
          <p className="text-xs font-semibold">Entrada analógica</p>
          <svg viewBox="0 0 60 50" className="h-14" aria-hidden>
            <circle cx="30" cy="25" r="16" fill="#1f2937" stroke="rgba(255,255,255,0.4)" />
            <line
              x1="30"
              y1="25"
              x2={30 + 13 * Math.cos(Math.PI * (0.75 + pot * 1.5))}
              y2={25 + 13 * Math.sin(Math.PI * (0.75 + pot * 1.5))}
              stroke={TONE}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <Pill on>lee {Math.round(pot * 4095)}</Pill>
        </div>
        <div className={panel}>
          <p className="text-xs font-semibold">Salida PWM</p>
          <svg viewBox="0 0 120 40" className="h-14 w-full" aria-hidden>
            <path d={wave(duty)} fill="none" stroke={TONE} strokeWidth="2" />
          </svg>
          <Pill on>encendido {Math.round(duty * 100)} %</Pill>
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E3 · La regla de oro

export function GoldenRule() {
  const phase = usePhase(2, 2400, 0);
  const safe = phase === 0;
  return (
    <AnimCard title="¿Qué voltaje puede recibir un pin?">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <svg viewBox="0 0 240 90" className="w-full max-w-sm" aria-label={safe ? "3.3 V en el pin: seguro" : "5 V en el pin: se daña"}>
          <rect x="10" y="25" width="54" height="40" rx="4" fill="#1f2937" stroke="rgba(255,255,255,0.4)" />
          <text x="37" y="50" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">
            {safe ? "3.3 V" : "5 V"}
          </text>
          <line x1="64" y1="45" x2="150" y2="45" stroke={safe ? "#4ade80" : "#f87171"} strokeWidth="3" />
          <rect x="150" y="20" width="76" height="50" rx="6" fill="#16191d" stroke="rgba(255,255,255,0.4)" />
          <text x="188" y="42" textAnchor="middle" fontSize="11" fill="white">
            ESP32
          </text>
          <text x="188" y="58" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">
            GPIO
          </text>
          {!safe && (
            <g className="animate-pulse">
              <path d="M150 34 l-8 -10 m8 22 l-10 2 m10 10 l-8 10" stroke="#facc15" strokeWidth="2" />
              <circle cx="160" cy="16" r="6" fill="#737373" opacity="0.6" />
              <circle cx="170" cy="8" r="5" fill="#737373" opacity="0.5" />
            </g>
          )}
        </svg>
        <p
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${safe ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}
        >
          {safe ? "3.3 V: el pin trabaja normal ✅" : "5 V: el pin se daña para siempre 💥"}
        </p>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E3 · Los pines dan señal, no fuerza

export function SignalVsPower() {
  const phase = usePhase(3, 2800, 2);
  const { still } = useTick(100000);
  const scenes = [
    { title: "Pin → LED", ok: true, text: "Un LED necesita poquita corriente: el pin alcanza." },
    { title: "Pin → motor", ok: false, text: "Un motor necesita mucha más corriente: el pin no puede moverlo (y se puede dañar)." },
    { title: "Pin → driver → motor", ok: true, text: "El pin solo da la orden; el driver toma la energía de la batería y mueve el motor." },
  ];
  const scene = scenes[phase];
  return (
    <AnimCard title="El pin da la señal; la fuerza viene de otro lado">
      <div className="flex flex-wrap gap-2">
        {scenes.map((s, i) => (
          <Pill key={s.title} on={i === phase}>
            {s.title}
          </Pill>
        ))}
      </div>
      <svg viewBox="0 0 300 110" className="mx-auto mt-3 w-full max-w-md" aria-label={scene.title}>
        <rect x="8" y="35" width="56" height="40" rx="5" fill="#16191d" stroke="rgba(255,255,255,0.4)" />
        <text x="36" y="59" textAnchor="middle" fontSize="10" fill="white">
          GPIO
        </text>
        {phase === 0 && (
          <>
            <line x1="64" y1="55" x2="210" y2="55" stroke={TONE} strokeWidth="2" />
            <FlowDots path="M64 55 H210" count={4} duration={1.4} still={still} />
            <LedShape x={226} y={52} level={1} scale={1.3} />
          </>
        )}
        {phase === 1 && (
          <>
            <line x1="64" y1="55" x2="200" y2="55" stroke={TONE} strokeWidth="2" />
            <FlowDots path="M64 55 H200" count={2} duration={3} still={still} />
            <circle cx="230" cy="55" r="24" fill="#1f2937" stroke="rgba(255,255,255,0.5)" />
            <text x="230" y="59" textAnchor="middle" fontSize="10" fill="white">
              motor
            </text>
            <text x="230" y="98" textAnchor="middle" fontSize="10" fill="#f87171">
              no gira
            </text>
          </>
        )}
        {phase === 2 && (
          <>
            <line x1="64" y1="55" x2="122" y2="55" stroke={TONE} strokeWidth="2" strokeDasharray="4 3" />
            <rect x="122" y="35" width="52" height="40" rx="5" fill="#1f2937" stroke={TONE} />
            <text x="148" y="59" textAnchor="middle" fontSize="10" fill="white">
              driver
            </text>
            <rect x="126" y="88" width="44" height="18" rx="3" fill="#0b2540" stroke="#60a5fa" />
            <text x="148" y="100" textAnchor="middle" fontSize="9" fill="#93c5fd">
              batería
            </text>
            <line x1="148" y1="88" x2="148" y2="75" stroke="#60a5fa" strokeWidth="3" />
            <line x1="174" y1="55" x2="206" y2="55" stroke="#60a5fa" strokeWidth="3" />
            <g style={{ transformOrigin: "236px 55px", animation: still ? undefined : "spin 0.8s linear infinite" }}>
              <circle cx="236" cy="55" r="24" fill="#1f2937" stroke="rgba(255,255,255,0.5)" />
              <line x1="236" y1="33" x2="236" y2="77" stroke="white" strokeWidth="3" />
              <line x1="214" y1="55" x2="258" y2="55" stroke="white" strokeWidth="3" />
            </g>
          </>
        )}
      </svg>
      <p className={`mt-2 text-sm ${scene.ok ? "text-emerald-200" : "text-rose-200"}`}>
        {scene.ok ? "✅ " : "❌ "}
        {scene.text}
      </p>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E4 · Componentes THT y SMD

export function ThtVsSmd() {
  const phase = usePhase(2, 2600, 1);
  const placed = phase === 1;
  return (
    <AnimCard
      title="Cómo se sueldan: THT atraviesa la placa, SMD va encima"
      caption="Vista de costado de la placa. En este nivel usarás solo componentes THT."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="rounded-xl bg-white/[0.03] p-3">
          <svg viewBox="0 0 160 110" className="w-full" aria-label="Componente THT con patas que atraviesan la placa">
            <rect x="10" y="60" width="140" height="12" fill="#2f6b3a" />
            <rect x="46" y="58" width="8" height="16" fill="#0b0b0b" />
            <rect x="106" y="58" width="8" height="16" fill="#0b0b0b" />
            <g style={{ transform: `translateY(${placed ? 0 : -24}px)`, transition: "transform 0.6s" }}>
              <rect x="58" y="24" width="44" height="18" rx="6" fill="#d8b98a" />
              <path d="M58 33 H50 V84 M102 33 H110 V84" fill="none" stroke="#a3a3a3" strokeWidth="2.5" />
            </g>
            {placed && (
              <>
                <path d="M43 74 q7 10 14 0" fill="#c0c0c0" />
                <path d="M103 74 q7 10 14 0" fill="#c0c0c0" />
              </>
            )}
            <text x="80" y="104" textAnchor="middle" fontSize="9" fill="white">
              soldadura por debajo
            </text>
          </svg>
          <figcaption className="text-center text-xs font-semibold">THT · patas que atraviesan</figcaption>
        </figure>
        <figure className="rounded-xl bg-white/[0.03] p-3">
          <svg viewBox="0 0 160 110" className="w-full" aria-label="Componente SMD soldado sobre la superficie">
            <rect x="10" y="60" width="140" height="12" fill="#2f6b3a" />
            <rect x="62" y="56" width="12" height="4" fill="#c8a45a" />
            <rect x="86" y="56" width="12" height="4" fill="#c8a45a" />
            <g style={{ transform: `translateY(${placed ? 0 : -24}px)`, transition: "transform 0.6s" }}>
              <rect x="66" y="48" width="28" height="8" rx="1" fill="#1b1b1b" />
            </g>
            {placed && (
              <>
                <path d="M60 56 q4 -6 8 0" fill="#c0c0c0" />
                <path d="M92 56 q4 -6 8 0" fill="#c0c0c0" />
              </>
            )}
            <text x="80" y="104" textAnchor="middle" fontSize="9" fill="white">
              diminuto, sobre la superficie
            </text>
          </svg>
          <figcaption className="text-center text-xs font-semibold">SMD · va encima (Parte 2)</figcaption>
        </figure>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E5 · El botón flotante

export function FloatingPin() {
  const { tick, still } = useTick(160);
  // Lecturas "al azar": un patrón pseudoaleatorio que se ve como ruido.
  const readings = Array.from({ length: 24 }, (_, i) => (((Math.sin((tick + i) * 12.9898) * 43758.5453) % 1) + 1) % 1 > 0.5);
  const current = still ? true : readings[readings.length - 1];
  const path = readings.map((high, i) => `${i === 0 ? "M" : "L"}${i * 10} ${high ? 8 : 34} H${i * 10 + 10}`).join(" ");
  return (
    <AnimCard
      title="Un pin sin conectar a nada lee cualquier cosa"
      caption="Nadie toca el botón y aun así el ESP32 ve HIGH y LOW al azar: el pin capta ruido como una antena. La resistencia pull-down del siguiente paso lo soluciona."
    >
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <svg viewBox="0 0 240 44" className="w-full" aria-label="Lecturas al azar de un pin flotante">
          <text x="0" y="6" fontSize="7" fill="rgba(255,255,255,0.4)">
            HIGH
          </text>
          <text x="0" y="44" fontSize="7" fill="rgba(255,255,255,0.4)">
            LOW
          </text>
          <path d={still ? "M0 34 H60 V8 H120 V34 H180 V8 H240" : path} fill="none" stroke="#f87171" strokeWidth="2" />
        </svg>
        <div className="rounded-xl bg-white/[0.04] px-4 py-3 text-center">
          <p className="text-xs text-white/50">El botón: suelto</p>
          <p className="mt-1 font-display text-xl font-black text-rose-300">lee {current ? "HIGH" : "LOW"}</p>
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E5 · El botón de 4 patas

export function FourLegButton() {
  const phase = usePhase(2, 1800, 1);
  const pressed = phase === 1;
  return (
    <AnimCard
      title="Por dentro, las 4 patas están unidas de dos en dos"
      caption="Las patas 1-2 siempre están unidas, y también las 3-4. Al presionar, el botón une los dos pares y la corriente pasa. Por eso en el esquemático se dibuja con 2 terminales."
    >
      <svg
        viewBox="0 0 220 140"
        className="mx-auto w-full max-w-xs"
        aria-label={pressed ? "Botón presionado: conecta los dos pares" : "Botón suelto"}
      >
        <rect x="50" y="30" width="120" height="80" rx="8" fill="#1f2937" stroke="rgba(255,255,255,0.4)" />
        <circle cx="110" cy="70" r={pressed ? 18 : 22} fill="#2b2b2b" stroke="rgba(255,255,255,0.4)" style={{ transition: "r 0.2s" }} />
        {[
          [50, 44, "1"],
          [170, 44, "2"],
          [50, 96, "3"],
          [170, 96, "4"],
        ].map(([x, y, n]) => (
          <g key={n as string}>
            <line
              x1={x as number}
              y1={y as number}
              x2={(x as number) + ((x as number) < 100 ? -30 : 30)}
              y2={y as number}
              stroke="#a3a3a3"
              strokeWidth="4"
            />
            <text x={(x as number) + ((x as number) < 100 ? -36 : 36)} y={(y as number) + 4} textAnchor="middle" fontSize="11" fill="white">
              {n}
            </text>
          </g>
        ))}
        {/* uniones internas siempre presentes */}
        <line x1="62" y1="44" x2="158" y2="44" stroke={TONE} strokeWidth="3" />
        <line x1="62" y1="96" x2="158" y2="96" stroke={TONE} strokeWidth="3" />
        {/* el puente que une los pares al presionar */}
        <line
          x1="110"
          y1="44"
          x2="110"
          y2="96"
          stroke={pressed ? "#4ade80" : "rgba(255,255,255,0.12)"}
          strokeWidth="4"
          strokeDasharray={pressed ? "0" : "4 4"}
        />
        <text x="110" y="132" textAnchor="middle" fontSize="11" fill={pressed ? "#4ade80" : "rgba(255,255,255,0.5)"}>
          {pressed ? "presionado: 1-2 conectado con 3-4" : "suelto: los pares no se tocan"}
        </text>
      </svg>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- E6 · Reglas de ruteo

export function RoutingRules() {
  const phase = usePhase(3, 3000, 0);
  const rules = [
    {
      title: "Ancho según la corriente",
      text: "La pista de alimentación lleva más corriente: si es delgada, se calienta. Por eso va de 1 mm y las señales de 0.5 mm.",
    },
    { title: "Ángulos de 45°", text: "Evita las esquinas de 90°: dobla la pista con ángulos de 45°." },
    { title: "Cruzar con una vía", text: "Dos pistas de la misma capa no se cruzan: una pasa a la otra capa por una vía." },
  ];
  return (
    <AnimCard title="Reglas básicas para dibujar pistas">
      <div className="flex flex-wrap gap-2">
        {rules.map((r, i) => (
          <Pill key={r.title} on={i === phase}>
            {r.title}
          </Pill>
        ))}
      </div>
      <svg viewBox="0 0 300 120" className="mt-3 w-full rounded-xl bg-[#0f2a1a]" aria-label={rules[phase].title}>
        {phase === 0 && (
          <>
            <path d="M20 40 H280" stroke="#c8a45a" strokeWidth="3" />
            <text x="24" y="30" fontSize="9" fill="white">
              señal · 0.5 mm
            </text>
            <path d="M20 85 H280" stroke="#c8a45a" strokeWidth="9" />
            <text x="24" y="72" fontSize="9" fill="white">
              alimentación · 1 mm
            </text>
            <path d="M150 85 H280" stroke="#f97316" strokeWidth="2" opacity="0.6" className="animate-pulse" />
          </>
        )}
        {phase === 1 && (
          <>
            <path d="M30 30 H130 V95 H170" fill="none" stroke="#c8a45a" strokeWidth="5" opacity="0.4" />
            <text x="40" y="22" fontSize="9" fill="#f87171">
              ✗ 90°
            </text>
            <path d="M160 30 H230 L265 65 V95" fill="none" stroke="#c8a45a" strokeWidth="5" />
            <text x="200" y="22" fontSize="9" fill="#4ade80">
              ✓ 45°
            </text>
          </>
        )}
        {phase === 2 && (
          <>
            <path d="M20 60 H280" stroke="#c8a45a" strokeWidth="5" />
            <path d="M150 15 V48" stroke="#c8a45a" strokeWidth="5" />
            <path d="M150 72 V105" stroke="#c8a45a" strokeWidth="5" />
            <path d="M150 48 V72" stroke="#60a5fa" strokeWidth="5" strokeDasharray="4 3" />
            <circle cx="150" cy="48" r="6" fill="#0f2a1a" stroke="#c0c0c0" strokeWidth="3" />
            <circle cx="150" cy="72" r="6" fill="#0f2a1a" stroke="#c0c0c0" strokeWidth="3" />
            <text x="160" y="40" fontSize="9" fill="white">
              vía
            </text>
            <text x="160" y="92" fontSize="9" fill="#93c5fd">
              capa de abajo
            </text>
          </>
        )}
      </svg>
      <p className="mt-2 text-sm text-white/70">{rules[phase].text}</p>
    </AnimCard>
  );
}
