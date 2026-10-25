import { AnimCard, CodeRow, FlowDots, LedShape, Pill } from "@/components/academia/anim/AnimKit";
import { TONE, usePhase, useTick } from "@/components/academia/anim/use-anim";

// Animaciones de Programación (P2–P8): el código se ilumina línea por línea mientras se ve lo que hace.

// ---------------------------------------------------------------- P2 · setup() una vez, loop() para siempre

export function SetupLoop() {
  const { tick, still, restart } = useTick(1000);
  // 0: se enciende el ESP32 · 1-2: setup() (una sola vez) · desde 3: el loop de 4 líneas se repite.
  const t = still ? 3 : tick;
  const booting = t === 0;
  const inSetup = t === 1 || t === 2;
  const loopLine = t < 3 ? -1 : (t - 3) % 4;
  const vuelta = t < 3 ? 0 : Math.floor((t - 3) / 4) + 1;
  const ledOn = loopLine === 0 || loopLine === 1;
  return (
    <AnimCard
      title="Así recorre el ESP32 tu programa"
      onRestart={restart}
      caption={
        <>
          Al encender, <code className="text-white">setup()</code> se ejecuta <strong className="text-white">una sola vez</strong>. Después,{" "}
          <code className="text-white">loop()</code> se repite sin parar: fíjate en el contador de vueltas. Usa{" "}
          <strong className="text-white">Ver desde el inicio</strong> para volver a ver el encendido.
        </>
      }
    >
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl bg-white/[0.04] py-2">
          <CodeRow on={inSetup}>void setup() {"{"}</CodeRow>
          <CodeRow on={t === 2} indent={1}>
            pinMode(18, OUTPUT);
          </CodeRow>
          <CodeRow on={false}>{"}"}</CodeRow>
          <CodeRow on={t >= 3}>void loop() {"{"}</CodeRow>
          <CodeRow on={loopLine === 0} indent={1}>
            digitalWrite(18, HIGH);
          </CodeRow>
          <CodeRow on={loopLine === 1} indent={1}>
            delay(500);
          </CodeRow>
          <CodeRow on={loopLine === 2} indent={1}>
            digitalWrite(18, LOW);
          </CodeRow>
          <CodeRow on={loopLine === 3} indent={1}>
            delay(500);
          </CodeRow>
          <CodeRow on={false}>{"}"}</CodeRow>
        </div>
        <div className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 40 44" className="h-14 w-12" aria-hidden>
            <LedShape x={20} y={22} level={ledOn ? 1 : 0} color="#4ade80" />
          </svg>
          <Pill on={booting}>se enciende</Pill>
          <Pill on={inSetup}>setup: 1 vez</Pill>
          <Pill on={t >= 3}>loop: vuelta {vuelta}</Pill>
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P2 · Las tres primeras instrucciones

export function FirstInstructions() {
  const phase = usePhase(4, 1300, 3);
  const output = phase >= 1;
  const high = phase === 2 || phase === 3;
  const waiting = phase === 3;
  return (
    <AnimCard title="Qué hace cada instrucción en el pin 18">
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Pill on={phase === 1} className="font-mono">
              pinMode(18, OUTPUT);
            </Pill>
            <span className="text-xs text-white/55">el pin pasa a ser una salida</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill on={phase === 2} className="font-mono">
              digitalWrite(18, HIGH);
            </Pill>
            <span className="text-xs text-white/55">pone 3.3 V en el pin: el LED enciende</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill on={phase === 3} className="font-mono">
              delay(500);
            </Pill>
            <span className="text-xs text-white/55">espera medio segundo sin hacer nada</span>
          </div>
        </div>
        <svg viewBox="0 0 120 70" className="h-20 w-32" aria-hidden>
          <rect x="4" y="20" width="40" height="30" rx="4" fill="#16191d" stroke="rgba(255,255,255,0.4)" />
          <text x="24" y="39" textAnchor="middle" fontSize="9" fill="white">
            pin 18
          </text>
          <text x="24" y="62" textAnchor="middle" fontSize="8" fill={output ? TONE : "rgba(255,255,255,0.4)"}>
            {output ? "SALIDA" : "sin configurar"}
          </text>
          <line x1="44" y1="35" x2="82" y2="35" stroke={high ? TONE : "rgba(255,255,255,0.25)"} strokeWidth="2" />
          <text x="63" y="28" textAnchor="middle" fontSize="8" fill="white">
            {high ? "3.3 V" : "0 V"}
          </text>
          <LedShape x={98} y={34} level={high ? 1 : 0} color="#4ade80" />
          {waiting && (
            <g>
              <circle cx="63" cy="56" r="8" fill="none" stroke="rgba(255,255,255,0.5)" />
              <line x1="63" y1="56" x2="63" y2="50" stroke="white" strokeWidth="1.5" className="origin-[63px_56px] animate-spin" />
            </g>
          )}
        </svg>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P3 · El Monitor Serial

export function SerialMonitor() {
  const { tick, still, restart } = useTick(900);
  const t = still ? 5 : tick % 7;
  const lines = [
    { kind: "print", text: "Contador: " },
    { kind: "println", text: "1" },
    { kind: "print", text: "Contador: " },
    { kind: "println", text: "2" },
    { kind: "print", text: "Contador: " },
    { kind: "println", text: "3" },
  ];
  // Arma lo que se ve en la ventana: print se queda en la línea, println salta.
  const shown = lines.slice(0, Math.min(t, lines.length));
  const screen: string[] = [""];
  shown.forEach((l) => {
    screen[screen.length - 1] += l.text;
    if (l.kind === "println") screen.push("");
  });
  const current = lines[Math.min(t, lines.length) - 1];
  return (
    <AnimCard
      onRestart={restart}
      title="El ESP32 escribe en tu computadora por el cable USB"
      caption={
        <>
          <code className="text-white">print</code> escribe y se queda en la misma línea; <code className="text-white">println</code>{" "}
          escribe y salta a la siguiente.
        </>
      }
    >
      <div className="grid items-center gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-white/30 bg-[#16191d] px-3 py-4 text-xs">ESP32</div>
          <svg viewBox="0 0 70 20" className="h-5 w-16" aria-hidden>
            <line x1="0" y1="10" x2="70" y2="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
            <FlowDots path="M0 10 H70" count={3} duration={1} still={still} />
          </svg>
        </div>
        <div className="rounded-xl border border-white/15 bg-black p-3 font-mono text-[12px]">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-white/40">Monitor Serial</p>
          {screen.map((line, i) => (
            <p key={i} className="min-h-[1.1rem] text-emerald-300">
              {line}
              {i === screen.length - 1 && <span className="animate-pulse text-white">▌</span>}
            </p>
          ))}
          {current && (
            <p className="mt-2 text-[11px] text-white/45">
              Última instrucción: Serial.{current.kind}("{current.text}")
            </p>
          )}
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P3 · Las variables

export function VariableBox() {
  const { tick, still, restart } = useTick(1000);
  const value = still ? 3 : tick % 6;
  return (
    <AnimCard
      onRestart={restart}
      title="Una variable es una caja con nombre"
      caption="Cada vez que se ejecuta la línea de abajo, el programa saca el valor de la caja, le suma 1 y lo vuelve a guardar."
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <svg viewBox="0 0 140 110" className="h-32 w-40" aria-label={`La caja contador guarda ${value}`}>
          <path d="M20 40 L70 20 L120 40 L70 60 Z" fill="#3b2f1e" stroke="#d8b98a" />
          <path d="M20 40 V90 L70 108 V60 Z" fill="#5a4630" stroke="#d8b98a" />
          <path d="M120 40 V90 L70 108 V60 Z" fill="#4a3a28" stroke="#d8b98a" />
          <text x="45" y="80" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)">
            int
          </text>
          <text key={value} x="95" y="82" textAnchor="middle" fontSize="26" fontWeight="800" fill={TONE} className="animate-pulse">
            {value}
          </text>
          <text x="70" y="14" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
            contador
          </text>
        </svg>
        <div className="space-y-2 font-mono text-sm">
          <p className="rounded-lg bg-white/[0.05] px-3 py-2">int contador = 0;</p>
          <p className="rounded-lg bg-[rgb(var(--tone,255_255_255)/0.15)] px-3 py-2 text-white">contador = contador + 1;</p>
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P3 · Variable global vs local

export function GlobalLocal() {
  const { tick, still, restart } = useTick(1100);
  const vuelta = still ? 3 : (tick % 5) + 1;
  return (
    <AnimCard
      onRestart={restart}
      title="Global vs. local: ¿qué pasa en cada vuelta del loop?"
      caption="La global se crea una vez y conserva su valor: sigue sumando. La local se crea de nuevo en cada vuelta, empieza siempre en 0 y nunca pasa de 1."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white/[0.03] p-3">
          <div className="font-mono text-[12px]">
            <CodeRow on={false}>int total = 0; // global</CodeRow>
            <CodeRow on={false}>void loop() {"{"}</CodeRow>
            <CodeRow on indent={1}>
              total = total + 1;
            </CodeRow>
            <CodeRow on={false}>{"}"}</CodeRow>
          </div>
          <p className="mt-3 text-center text-sm">
            total = <span className="font-display text-2xl font-black text-[rgb(var(--tone,255_255_255))]">{vuelta}</span>
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3">
          <div className="font-mono text-[12px]">
            <CodeRow on={false}>void loop() {"{"}</CodeRow>
            <CodeRow on indent={1}>
              int veces = 0; // local
            </CodeRow>
            <CodeRow on indent={1}>
              veces = veces + 1;
            </CodeRow>
            <CodeRow on={false}>{"}"}</CodeRow>
          </div>
          <p className="mt-3 text-center text-sm">
            veces = <span className="font-display text-2xl font-black">1</span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-white/50">Vuelta {vuelta} del loop</p>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P4 · Leer un pin y decidir con if / else

export function ReadAndDecide() {
  const phase = usePhase(2, 1700, 0);
  const pressed = phase === 0;
  return (
    <AnimCard title="digitalRead lee el botón; if / else decide">
      <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
        <div className="flex flex-col items-center gap-1">
          <svg viewBox="0 0 60 40" className="h-10 w-16" aria-hidden>
            <rect x="8" y="28" width="44" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="18" y={pressed ? 20 : 12} width="24" height="8" rx="2" fill={TONE} style={{ transition: "y 0.15s" }} />
          </svg>
          <span className="text-xs text-white/55">{pressed ? "presionado" : "suelto"}</span>
          <Pill on>{pressed ? "HIGH" : "LOW"}</Pill>
        </div>
        <div className="rounded-xl bg-white/[0.04] py-2">
          <CodeRow on>int estado = digitalRead(21);</CodeRow>
          <CodeRow on>if (estado == HIGH) {"{"}</CodeRow>
          <CodeRow on={pressed} indent={1}>
            digitalWrite(18, HIGH);
          </CodeRow>
          <CodeRow on={!pressed}>
            {"}"} else {"{"}
          </CodeRow>
          <CodeRow on={!pressed} indent={1}>
            digitalWrite(18, LOW);
          </CodeRow>
          <CodeRow on={false}>{"}"}</CodeRow>
        </div>
        <svg viewBox="0 0 40 44" className="h-14 w-12" aria-hidden>
          <LedShape x={20} y={22} level={pressed ? 1 : 0} color="#4ade80" />
        </svg>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P4 · Estar presionado vs. acabar de presionar

export function EdgeDetection() {
  const { tick, still, restart } = useTick(250);
  // Una señal de botón: dos pulsaciones de distinto largo dentro de un ciclo de 32 pasos.
  const signal = (i: number) => {
    const p = ((i % 32) + 32) % 32;
    return (p >= 4 && p < 12) || (p >= 18 && p < 22);
  };
  const t = still ? 8 : tick;
  const now = signal(t);
  // Cada ciclo de 32 pasos trae 2 pulsaciones; se cuentan las del ciclo actual hasta ahora.
  const cycleStart = Math.floor(t / 32) * 32;
  const presses =
    Math.floor(t / 32) * 2 +
    Array.from({ length: t - cycleStart + 1 }, (_, k) => cycleStart + k).filter((i) => signal(i) && !signal(i - 1)).length;
  const toggled = presses % 2 === 1;
  const path = Array.from({ length: 32 }, (_, i) => `${i === 0 ? "M" : "L"}${i * 8} ${signal(t - 31 + i) ? 8 : 30} H${i * 8 + 8}`).join(
    " ",
  );
  return (
    <AnimCard
      onRestart={restart}
      title="Dos formas de usar el mismo botón"
      caption="El LED de la izquierda copia el botón: encendido mientras está presionado. El de la derecha cambia solo cuando el botón pasa de LOW a HIGH, sin importar cuánto rato lo mantengas."
    >
      <svg viewBox="0 0 256 40" className="w-full" aria-label="Señal del botón en el tiempo">
        <path d={still ? "M0 30 H48 V8 H112 V30 H160 V8 H192 V30 H256" : path} fill="none" stroke={TONE} strokeWidth="2" />
        <line x1="252" y1="0" x2="252" y2="40" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
          <svg viewBox="0 0 40 44" className="h-12 w-10 shrink-0" aria-hidden>
            <LedShape x={20} y={22} level={now ? 1 : 0} color="#4ade80" />
          </svg>
          <p className="text-xs text-white/70">
            <strong className="text-white">Mientras está presionado</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
          <svg viewBox="0 0 40 44" className="h-12 w-10 shrink-0" aria-hidden>
            <LedShape x={20} y={22} level={toggled ? 1 : 0} color="#facc15" />
          </svg>
          <p className="text-xs text-white/70">
            <strong className="text-white">Cada vez que se presiona</strong> · pulsaciones: {presses}
          </p>
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P4 · El rebote

export function Debounce() {
  const phase = usePhase(2, 2600, 1);
  const withDebounce = phase === 1;
  const bounce = "M0 34 H60 V8 H64 V34 H68 V8 H73 V34 H77 V8 H82 V34 H86 V8 H200 V34 H240";
  return (
    <AnimCard
      title="Un botón real 'rebota' al presionarlo"
      caption="En los primeros milisegundos los contactos rebotan y la señal sube y baja varias veces. Si esperas unos 50 ms después del primer cambio, cuentas una sola pulsación."
    >
      <svg viewBox="0 0 240 46" className="w-full" aria-label="Señal con rebotes al presionar">
        <path d={bounce} fill="none" stroke={TONE} strokeWidth="2" />
        <text x="73" y="44" textAnchor="middle" fontSize="8" fill="#facc15">
          rebotes
        </text>
        {withDebounce && <rect x="60" y="2" width="40" height="36" fill="rgba(74,222,128,0.12)" stroke="#4ade80" strokeDasharray="3 2" />}
        {withDebounce && (
          <text x="104" y="12" fontSize="8" fill="#4ade80">
            espera 50 ms
          </text>
        )}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill on={!withDebounce}>Sin antirrebote: cuenta 5 pulsaciones ❌</Pill>
        <Pill on={withDebounce}>Con antirrebote: cuenta 1 ✅</Pill>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P5 · map: de una escala a otra

export function MapScales() {
  const { tick, still } = useTick(80);
  const f = still ? 0.5 : (Math.sin(tick / 20) + 1) / 2;
  const valor = Math.round(f * 4095);
  const porcentaje = Math.round((valor * 100) / 4095);
  const x = 20 + f * 220;
  const ruler = (y: number, from: string, to: string, label: string) => (
    <>
      <line x1="20" y1={y} x2="240" y2={y} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={20 + i * 22} y1={y - 4} x2={20 + i * 22} y2={y + 4} stroke="rgba(255,255,255,0.4)" />
      ))}
      <text x="20" y={y + 16} textAnchor="middle" fontSize="9" fill="white">
        {from}
      </text>
      <text x="240" y={y + 16} textAnchor="middle" fontSize="9" fill="white">
        {to}
      </text>
      <text x="130" y={y - 10} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">
        {label}
      </text>
    </>
  );
  return (
    <AnimCard
      title="map convierte la escala de 0–4095 en la de 0–100"
      caption="Las dos reglas tienen el mismo largo: map solo cambia los números de los extremos, como una regla de tres."
    >
      <svg viewBox="0 0 260 130" className="mx-auto w-full max-w-md" aria-label={`valor ${valor} equivale a ${porcentaje} %`}>
        {ruler(34, "0", "4095", "valor (lo que lee el ESP32)")}
        {ruler(104, "0", "100", "porcentaje")}
        <line x1={x} y1="34" x2={x} y2="104" stroke={TONE} strokeWidth="2" strokeDasharray="4 3" />
        <circle cx={x} cy="34" r="6" fill={TONE} />
        <circle cx={x} cy="104" r="6" fill={TONE} />
        <text x={x} y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
          {valor} → {porcentaje} %
        </text>
      </svg>
      <p className="mt-2 text-center font-mono text-xs text-white/60">map(valor, 0, 4095, 0, 100)</p>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P5 · Decisiones por rangos

export function RangeDecisions() {
  const { tick, still } = useTick(90);
  const p = still ? 50 : Math.round(((Math.sin(tick / 18) + 1) / 2) * 100);
  const branch = p < 33 ? 0 : p < 66 ? 1 : 2;
  const colors = ["#4ade80", "#facc15", "#f87171"];
  return (
    <AnimCard
      title="El programa revisa las condiciones en orden"
      caption="Se ejecuta solo la primera condición que se cumple; las demás se saltan."
    >
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="relative h-4 overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 w-[33%] bg-emerald-400/40" />
            <div className="absolute inset-y-0 left-[33%] w-[33%] bg-yellow-300/40" />
            <div className="absolute inset-y-0 left-[66%] right-0 bg-rose-400/40" />
            <div className="absolute inset-y-0 w-1 bg-white" style={{ left: `${p}%` }} />
          </div>
          <p className="mt-1 text-center text-sm">
            porcentaje = <strong className="tabular-nums">{p}</strong>
          </p>
          <div className="mt-2 rounded-xl bg-white/[0.04] py-2">
            <CodeRow on={branch === 0}>if (porcentaje &lt; 33) {"{"} // bajo</CodeRow>
            <CodeRow on={branch === 1}>
              {"}"} else if (porcentaje &lt; 66) {"{"} // medio
            </CodeRow>
            <CodeRow on={branch === 2}>
              {"}"} else {"{"} // alto
            </CodeRow>
          </div>
        </div>
        <svg viewBox="0 0 40 44" className="mx-auto h-14 w-12" aria-hidden>
          <LedShape x={20} y={22} level={1} color={colors[branch]} />
        </svg>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P7 · Por dentro de un servo

export function ServoInside() {
  const { tick, still } = useTick(120);
  const targets = [30, 150, 90];
  const target = still ? 90 : targets[Math.floor(tick / 30) % targets.length];
  // El ángulo actual persigue al pedido, como lo hace el circuito de control.
  const sinceChange = still ? 30 : tick % 30;
  const previous = targets[(Math.floor(tick / 30) + targets.length - 1) % targets.length];
  const current = still ? 90 : Math.round(previous + (target - previous) * Math.min(1, sinceChange / 12));
  const moving = current !== target;
  const rad = ((180 - current) * Math.PI) / 180;
  return (
    <AnimCard
      title="Cómo llega un servo al ángulo que le pides"
      caption="El potenciómetro del eje le dice al circuito en qué ángulo está. El circuito compara con el ángulo pedido y mueve el motor hasta que coinciden; ahí se detiene y se queda firme."
    >
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <svg viewBox="0 0 220 140" className="mx-auto w-full max-w-xs" aria-label={`Servo yendo a ${target} grados`}>
          <path d="M55 72 A55 55 0 0 1 165 72" fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 4" />
          <rect x="40" y="72" width="140" height="60" rx="6" fill="#1e3a8a" stroke="#60a5fa" />
          <line
            x1="110"
            y1="72"
            x2={110 + 55 * Math.cos(rad)}
            y2={72 - 55 * Math.sin(rad)}
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="110" cy="72" r="8" fill="white" />
          <text x="110" y="98" textAnchor="middle" fontSize="8" fill="#bfdbfe">
            motor · engranajes · potenciómetro
          </text>
          <text x="110" y="120" textAnchor="middle" fontSize="9" fill={moving ? "#facc15" : "#4ade80"}>
            {moving ? "moviendo…" : "llegó: se queda firme"}
          </text>
        </svg>
        <div className="space-y-2 text-center">
          <div className="rounded-xl bg-white/[0.04] px-4 py-2">
            <p className="text-xs text-white/50">Ángulo pedido</p>
            <p className="font-display text-xl font-black">{target}°</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] px-4 py-2">
            <p className="text-xs text-white/50">Ángulo actual</p>
            <p className="font-display text-xl font-black tabular-nums">{current}°</p>
          </div>
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P7 · Sus 3 cables

export function ServoWires() {
  const { still } = useTick(100000);
  const wires = [
    { y: 26, color: "#f97316", name: "Naranja · señal", to: "GPIO 25", pulse: true },
    { y: 50, color: "#ef4444", name: "Rojo · 5 V", to: "VIN", pulse: false },
    { y: 74, color: "#7c4a26", name: "Marrón · GND", to: "GND", pulse: false },
  ];
  return (
    <AnimCard title="Por el cable naranja viajan los pulsos; el rojo y el marrón dan la energía">
      <svg viewBox="0 0 300 100" className="mx-auto w-full max-w-lg" aria-label="Los tres cables del servo">
        <rect x="6" y="14" width="62" height="72" rx="6" fill="#16191d" stroke="rgba(255,255,255,0.4)" />
        <text x="37" y="54" textAnchor="middle" fontSize="10" fill="white">
          ESP32
        </text>
        <rect x="232" y="22" width="62" height="56" rx="6" fill="#1e3a8a" stroke="#60a5fa" />
        <text x="263" y="54" textAnchor="middle" fontSize="10" fill="white">
          servo
        </text>
        {wires.map((w) => (
          <g key={w.name}>
            <line x1="68" y1={w.y} x2="232" y2={w.y} stroke={w.color} strokeWidth="4" />
            <text x="150" y={w.y - 6} textAnchor="middle" fontSize="8" fill="white">
              {w.name} ({w.to})
            </text>
            {w.pulse && <FlowDots path={`M68 ${w.y} H232`} count={4} duration={1.2} color="white" radius={2} still={still} />}
          </g>
        ))}
      </svg>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P8 · Recibir por Serial: la fila de espera

export function SerialQueue() {
  const { tick, still, restart } = useTick(900);
  // Llegan 'a', 'b', 'c' y el programa lee una por vuelta.
  const t = still ? 3 : tick % 8;
  const arrived = ["a", "b", "c"].slice(0, Math.min(t, 3));
  const read = Math.max(0, Math.min(t - 3, 3));
  const queue = arrived.slice(read);
  const last = read > 0 ? arrived[read - 1] : null;
  return (
    <AnimCard
      onRestart={restart}
      title="Lo que escribes llega a una fila de espera"
      caption={
        <>
          <code className="text-white">Serial.available()</code> dice cuántas letras esperan en la fila.{" "}
          <code className="text-white">Serial.read()</code> saca la primera, una por vez.
        </>
      }
    >
      <div className="grid items-center gap-3 sm:grid-cols-[auto_1fr_auto]">
        <div className="rounded-lg border border-white/20 bg-black px-3 py-2 font-mono text-xs text-white/70">
          Monitor: <span className="text-white">{arrived.join("")}</span>
          <span className="animate-pulse">▌</span>
        </div>
        <div className="flex min-h-[2.5rem] items-center gap-1.5 rounded-xl border border-dashed border-white/20 px-3">
          <span className="text-[10px] text-white/40">fila:</span>
          {queue.map((letter) => (
            <span
              key={letter}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgb(var(--tone,255_255_255)/0.2)] font-mono text-sm text-white"
            >
              {letter}
            </span>
          ))}
        </div>
        <div className="space-y-1 text-center font-mono text-xs">
          <Pill on={queue.length > 0}>available() = {queue.length}</Pill>
          <p className="text-white/60">read() → {last ? `'${last}'` : "—"}</p>
        </div>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P8 · switch

export function SwitchCase() {
  const letters = ["a", "b", "x"];
  const phase = usePhase(3, 1800, 0);
  const letter = letters[phase];
  const led = letter === "a" ? 1 : 0;
  return (
    <AnimCard title="switch salta directo al case de la letra que llegó">
      <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
        <div className="text-center">
          <p className="text-xs text-white/50">Llegó</p>
          <p className="font-mono text-3xl font-black text-[rgb(var(--tone,255_255_255))]">'{letter}'</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] py-2">
          <CodeRow on>switch (comando) {"{"}</CodeRow>
          <CodeRow on={letter === "a"} indent={1}>
            case 'a': encender; break;
          </CodeRow>
          <CodeRow on={letter === "b"} indent={1}>
            case 'b': apagar; break;
          </CodeRow>
          <CodeRow on={letter === "x"} indent={1}>
            default: no hace nada; break;
          </CodeRow>
          <CodeRow on={false}>{"}"}</CodeRow>
        </div>
        <svg viewBox="0 0 40 44" className="mx-auto h-14 w-12" aria-hidden>
          <LedShape x={20} y={22} level={led} color="#4ade80" />
        </svg>
      </div>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P8 · Funciones propias

export function FunctionCall() {
  const { tick, still, restart } = useTick(650);
  // 0: llamada en loop · 1-3: dentro de la función · 4: vuelve a loop
  const step = still ? 0 : tick % 6;
  const inside = step >= 1 && step <= 3;
  return (
    <AnimCard
      onRestart={restart}
      title="Al llamar una función, el programa salta a ella y vuelve"
      caption="loop() llama a apagarTodo(): el programa salta a la función, ejecuta sus 3 líneas y vuelve justo donde estaba."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white/[0.04] py-2">
          <p className="px-2 pb-1 text-[10px] uppercase tracking-widest text-white/40">loop()</p>
          <CodeRow on={step === 0}>apagarTodo();</CodeRow>
          <CodeRow on={step === 4 || step === 5}>delay(1000);</CodeRow>
        </div>
        <div className={`rounded-xl py-2 transition-colors ${inside ? "bg-[rgb(var(--tone,255_255_255)/0.08)]" : "bg-white/[0.04]"}`}>
          <p className="px-2 pb-1 text-[10px] uppercase tracking-widest text-white/40">void apagarTodo()</p>
          <CodeRow on={step === 1}>digitalWrite(LED_VERDE, LOW);</CodeRow>
          <CodeRow on={step === 2}>digitalWrite(LED_AMARILLO, LOW);</CodeRow>
          <CodeRow on={step === 3}>digitalWrite(LED_ROJO, LOW);</CodeRow>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-white/50">
        {inside ? "→ dentro de la función" : step >= 4 ? "← volvió a loop()" : "loop() llama a la función"}
      </p>
    </AnimCard>
  );
}

// ---------------------------------------------------------------- P8 · El salto al Bluetooth

export function BluetoothJump() {
  const { tick, still } = useTick(1200);
  const letters = ["a", "b", "a", "c"];
  const letter = letters[(still ? 0 : tick) % letters.length];
  return (
    <AnimCard
      title="Del cable USB al celular, con la misma lógica"
      caption={
        <>
          Las letras ahora llegan por el aire desde el celular, pero el ESP32 hace lo mismo:{" "}
          <code className="text-white">SerialBT.read()</code> y el mismo <code className="text-white">switch</code>.
        </>
      }
    >
      <svg viewBox="0 0 300 100" className="mx-auto w-full max-w-md" aria-label="Un celular envía letras por Bluetooth al ESP32">
        <rect x="16" y="14" width="44" height="74" rx="8" fill="#16191d" stroke="rgba(255,255,255,0.5)" />
        <rect x="22" y="24" width="32" height="50" rx="3" fill="#0b2540" />
        <text x="38" y="54" textAnchor="middle" fontSize="16" fontWeight="800" fill="white">
          {letter}
        </text>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${90 + i * 26} 34 q8 16 0 32`}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2.5"
            style={still ? undefined : { animation: `pulse 1.2s ease-in-out ${i * 0.25}s infinite` }}
          />
        ))}
        <rect x="200" y="28" width="84" height="46" rx="6" fill="#16191d" stroke="rgba(255,255,255,0.4)" />
        <text x="242" y="48" textAnchor="middle" fontSize="10" fill="white">
          ESP32
        </text>
        <text x="242" y="64" textAnchor="middle" fontSize="9" fill={TONE}>
          recibió '{letter}'
        </text>
      </svg>
    </AnimCard>
  );
}
