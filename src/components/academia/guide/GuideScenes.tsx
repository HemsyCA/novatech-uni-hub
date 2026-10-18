import { useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  Check,
  Clock,
  Coffee,
  Cpu,
  Eye,
  FlaskConical,
  Footprints,
  Laptop,
  MousePointerClick,
  type LucideIcon,
  MessageCircle,
  Mouse,
  Notebook,
  NotebookPen,
  PackageX,
  Play,
  RefreshCw,
  Search,
  TriangleAlert,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { PwmDemo } from "@/components/academia/widgets/Pwm";
import { moduleAccent } from "@/lib/academia/modules";

// Las paradas de la Ruta de bienvenida. Cada una cuenta lo mismo que la guía de inicio,
// pero como escena: tarjetas, diagramas y cosas para tocar en vez de un texto corrido.

const appear = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.35, delay },
});

const tone = (rgb: string) => ({ "--tone": rgb }) as CSSProperties;

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-lg leading-relaxed text-white/80">{children}</p>;
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/45">{children}</p>;
}

function Tile({
  icon: Icon,
  title,
  children,
  delay = 0,
  strong = false,
}: {
  icon: LucideIcon;
  title: ReactNode;
  children: ReactNode;
  delay?: number;
  strong?: boolean;
}) {
  return (
    <motion.div
      {...appear(delay)}
      className={`rounded-2xl border p-5 ${strong ? "border-white/40 bg-white/[0.06]" : "border-white/10 bg-white/[0.02]"}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-white/65">{children}</div>
    </motion.div>
  );
}

// Una secuencia de pasos con flechas: en fila en computadora, en columna en el celular.
function Flow({ steps }: { steps: { label: string; tone?: string }[] }) {
  return (
    <ol className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
      {steps.map((step, index) => (
        <motion.li
          key={step.label}
          {...appear(index * 0.08)}
          className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2"
        >
          <span
            style={step.tone ? tone(step.tone) : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              step.tone ? "border-[rgb(var(--tone)/0.6)] text-[rgb(var(--tone))]" : "border-white/20 text-white/85"
            }`}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <>
              <ArrowRight aria-hidden className="hidden h-4 w-4 text-white/30 sm:block" />
              <ArrowDown aria-hidden className="ml-4 h-3.5 w-3.5 text-white/30 sm:hidden" />
            </>
          )}
        </motion.li>
      ))}
    </ol>
  );
}

function Quote({ children }: { children: ReactNode }) {
  return (
    <motion.p {...appear()} className="border-l-2 border-nova pl-4 text-lg font-semibold leading-snug">
      {children}
    </motion.p>
  );
}

// ---------------------------------------------------------------- 1. Bienvenida

export function WelcomeScene() {
  const attitude = ["intente", "se equivoque", "investigue", "busque soluciones"];
  return (
    <div className="space-y-10">
      <Lead>
        Si estás leyendo esto, ya diste el primer paso para formar parte del equipo. Antes de empezar, es importante que sepas cómo funciona
        esta etapa:
      </Lead>

      <div className="grid gap-3 sm:grid-cols-2">
        <Tile icon={Clock} title="Aquí no hay clases dictadas…">
          Avanzas a tu ritmo, en el horario que puedas, siguiendo las lecciones de la Academia. Cada lección tiene una explicación escrita
          paso a paso y simulaciones interactivas para probar lo que aprendes.
        </Tile>
        <Tile icon={Users} title="…pero no estás solo" delay={0.1} strong>
          Durante toda la convocatoria tienes a un <strong className="text-white">encargado de convocatoria</strong> del equipo, a quien
          puedes preguntarle tus dudas.
        </Tile>
      </div>

      <section>
        <Label>Lo que viene</Label>
        <Flow
          steps={[
            { label: "Lecciones" },
            { label: "Tarea final" },
            { label: "Parte 2 · soldadura" },
            { label: "Práctica presencial" },
            { label: "La directiva decide tu ingreso" },
          ]}
        />
        <p className="mt-4 text-sm text-white/55">
          Al terminar, entregas una <strong className="text-white/85">tarea final</strong>. Si la apruebas, sigues con la Parte 2
          (soldadura) y una práctica presencial con el equipo; después, la directiva decide tu ingreso.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 p-6 text-center">
        <p className="text-white/70">No esperamos que sepas nada de robótica antes de empezar.</p>
        <p className="mt-1 text-white/70">Lo que sí buscamos es gente que…</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {attitude.map((word, index) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + index * 0.18, type: "spring", stiffness: 300, damping: 18 }}
              className="rounded-xl bg-white px-4 py-2 font-display text-lg font-black text-black"
            >
              {word}
            </motion.span>
          ))}
        </div>
        <p className="mt-5 text-sm text-white/55">Esa actitud es justamente lo que evalúa esta etapa.</p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- 2. Aprender investigando

const CYCLE: { icon: LucideIcon; title: string; text: ReactNode }[] = [
  {
    icon: BookOpen,
    title: "Lee",
    text: "Todo lo que sabe el equipo se publica en la web de Nova: las lecciones de esta Academia, nuestros robots y su documentación. Es tu punto de partida.",
  },
  {
    icon: Search,
    title: "Investiga",
    text: "Cuando algo no está explicado, búscalo: hojas de datos, documentación oficial, foros. Usar inteligencia artificial para que te expliquen está permitido; copiar sin entender, no. Si sigues trabado, pregúntale al encargado de la convocatoria.",
  },
  {
    icon: FlaskConical,
    title: "Prueba",
    text: "Lleva lo que aprendiste a los simuladores y, más adelante, al hardware real. Equivocarte es parte del proceso.",
  },
  {
    icon: NotebookPen,
    title: "Documenta",
    text: (
      <>
        Llena una{" "}
        <Link to="/academia/bitacora" className="text-white underline underline-offset-4">
          ficha de bitácora
        </Link>{" "}
        de cuatro preguntas: Quería, Hice, Pasó y Aprendí. Es obligatoria al cerrar cada módulo y opcional al final de cualquier lección. Es
        la forma en que el equipo comparte lo que aprende.
      </>
    ),
  },
];

export function LearnScene() {
  const [active, setActive] = useState(0);
  const step = CYCLE[active];
  const Icon = step.icon;

  return (
    <div className="space-y-8">
      <Lead>
        En Nova no se dictan clases: se aprende investigando. Estas lecciones son una guía para que avances por tu cuenta, y el ciclo es
        siempre el mismo. Toca cada fase:
      </Lead>

      <div className="grid gap-6 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center">
        {/* El ciclo: cuatro fases alrededor de un centro que gira. */}
        <div className="relative mx-auto grid aspect-square w-full max-w-[15rem] grid-cols-2 grid-rows-2 gap-3">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black"
          >
            <RefreshCw className="h-6 w-6 animate-[spin_8s_linear_infinite] text-white/40 motion-reduce:animate-none" />
          </span>
          {CYCLE.map((phase, index) => {
            const PhaseIcon = phase.icon;
            // Orden en el sentido del reloj: arriba izq., arriba der., abajo der., abajo izq.
            const place = ["col-start-1 row-start-1", "col-start-2 row-start-1", "col-start-2 row-start-2", "col-start-1 row-start-2"][
              index
            ];
            const selected = index === active;
            return (
              <button
                key={phase.title}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={selected}
                className={`${place} flex flex-col items-center justify-center gap-1.5 rounded-2xl border text-sm font-semibold transition-colors ${
                  selected ? "border-white bg-white text-black" : "border-white/15 text-white/75 hover:border-white/40"
                }`}
              >
                <PhaseIcon className="h-5 w-5" />
                <span>
                  {index + 1}. {phase.title}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-white/15 p-5"
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/45">
            <Icon className="h-4 w-4" /> Fase {active + 1} de 4
          </p>
          <p className="mt-2 font-display text-2xl font-black">{step.title}.</p>
          <p className="mt-2 leading-relaxed text-white/75">{step.text}</p>
          <button
            type="button"
            onClick={() => setActive((active + 1) % CYCLE.length)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white"
          >
            {active === CYCLE.length - 1 ? "Y vuelve a empezar" : `Luego: ${CYCLE[active + 1].title}`} <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>

      <Quote>Acostúmbrate a leer la web de Nova: ahí vamos publicando todo lo que el equipo aprende.</Quote>
    </div>
  );
}

// ---------------------------------------------------------------- 3. Tu encargado

export function MentorScene() {
  return (
    <div className="space-y-10">
      <Lead>Durante toda la convocatoria, una persona del equipo te acompaña:</Lead>

      <div className="grid gap-3 sm:grid-cols-3">
        <Tile icon={MessageCircle} title="Pregúntale tus dudas" strong>
          Si ya leíste e investigaste y sigues trabado, escríbele. Cuéntale qué intentaste y qué pasó: así te ayuda más rápido.
        </Tile>
        <Tile icon={Users} title="Reuniones de refuerzo" delay={0.08}>
          Según su disponibilidad, puede organizar reuniones para repasar los temas que más cuestan.
        </Tile>
        <Tile icon={Coffee} title="Un compartir" delay={0.16}>
          A veces también se organiza un encuentro para conocerse con el equipo y compartir algo de comer.
        </Tile>
      </div>

      {/* Cómo se ve una buena pregunta: qué intentaste y qué pasó. */}
      <section>
        <Label>Por ejemplo, una buena pregunta</Label>
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <motion.div {...appear()} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-white px-4 py-3 text-sm text-black">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-black/50">Tú</span>
            En una lección, mi LED no enciende en Wokwi.{" "}
            <mark className="rounded bg-nova/20 px-0.5 text-black">Ya revisé la resistencia y la polaridad del LED</mark> y{" "}
            <mark className="rounded bg-nova/20 px-0.5 text-black">sigue apagado</mark>. ¿Qué más puedo revisar?
          </motion.div>
          <motion.div
            {...appear(0.3)}
            className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/15 px-4 py-3 text-sm text-white/80"
          >
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-white/45">Encargado</span>
            ¡Bien que ya revisaste eso! Mira ahora a qué pin está conectado…
          </motion.div>
        </div>
        <p className="mt-3 text-xs text-white/45">Lo resaltado es lo que más ayuda: qué intentaste y qué pasó.</p>
      </section>

      <Quote>Preguntar está bien: lo que valoramos es que lo hayas intentado antes.</Quote>
    </div>
  );
}

// ---------------------------------------------------------------- 4. ¿Cómo funciona?

function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div {...appear(delay)} className="flex items-baseline gap-3 rounded-2xl border border-white/10 px-4 py-3 sm:block sm:py-4">
      <p className="whitespace-nowrap font-display text-2xl font-black sm:text-3xl">{value}</p>
      <p className="text-xs text-white/55 sm:mt-1">{label}</p>
    </motion.div>
  );
}

export function HowItWorksScene() {
  const parts = [
    { label: "Electrónica", tone: moduleAccent("electronica") },
    { label: "Mecánica", tone: moduleAccent("mecanica") },
    { label: "Programación", tone: moduleAccent("programacion") },
  ];
  const steps: ReactNode[] = [
    <>
      Avanza por las 3 partes:
      <span className="mt-2 flex flex-wrap gap-2">
        {parts.map((part) => (
          <span
            key={part.label}
            style={tone(part.tone)}
            className="rounded-full border border-[rgb(var(--tone)/0.6)] px-3 py-1 text-xs font-semibold text-[rgb(var(--tone))]"
          >
            {part.label}
          </span>
        ))}
      </span>
    </>,
    <>
      En cada lección:
      <span className="mt-2 block">
        <Flow
          steps={[
            { label: "lee la explicación" },
            { label: "haz el paso a paso" },
            { label: "resuelve la mini práctica" },
            { label: "revisa el checklist" },
          ]}
        />
      </span>
    </>,
    <>
      Al final de cada parte encontrarás <strong className="text-white">su pieza de la tarea final</strong>.
    </>,
    <>Cuando tengas las 3 piezas, grabas un video corto, ordenas tu bitácora y lo entregas todo.</>,
    <>
      La directiva revisa tu entrega. Si la aprueba, se abre la <strong className="text-white">Parte 2: soldadura</strong>.
    </>,
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <Stat value="16–20 h" label="Tiempo estimado en total" delay={0} />
        <Stat value="3 sem." label="Plazo sugerido desde tu inscripción" delay={0.08} />
        <Stat value="~6 h" label="Por semana" delay={0.16} />
      </div>

      <ol>
        {steps.map((step, index) => (
          <motion.li key={index} {...appear(index * 0.06)} className="relative flex gap-4 pb-6 last:pb-0">
            {index < steps.length - 1 && (
              <span aria-hidden className="absolute left-[15px] top-9 h-[calc(100%-2.25rem)] w-0.5 bg-white/15" />
            )}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-black text-sm font-bold">
              {index + 1}
            </span>
            <div className="min-w-0 pt-1 text-white/80">{step}</div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------- 5. Lo que necesitas

const GEAR: { icon: LucideIcon; title: string; text: ReactNode }[] = [
  { icon: Laptop, title: "Una computadora con internet", text: "Windows, Mac o Linux, y un navegador actualizado (Chrome o Firefox)." },
  { icon: Mouse, title: "Un mouse con rueda", text: "Para el diseño 3D es casi obligatorio." },
  {
    icon: UserPlus,
    title: "Cuentas gratuitas",
    text: (
      <>
        <strong className="text-white/90">Wokwi</strong> (simulador), <strong className="text-white/90">EasyEDA</strong> (diseño
        electrónico) y <strong className="text-white/90">Onshape</strong> (diseño 3D). En cada parte te explicamos cómo crearlas.
      </>
    ),
  },
  { icon: Notebook, title: "Un cuaderno", text: "Para cálculos, dibujos y tu bitácora." },
];

export function GearScene() {
  const [ready, setReady] = useState<Set<number>>(new Set());
  const toggle = (index: number) =>
    setReady((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <Lead>Arma tu equipo. Marca lo que ya tienes:</Lead>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ready.size === GEAR.length ? "bg-white text-black" : "bg-white/10 text-white/70"}`}
        >
          {ready.size}/{GEAR.length}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {GEAR.map((item, index) => {
          const Icon = item.icon;
          const has = ready.has(index);
          return (
            <motion.button
              key={item.title}
              {...appear(index * 0.06)}
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={has}
              className={`flex gap-4 rounded-2xl border p-4 text-left transition-colors ${has ? "border-white bg-white/[0.07]" : "border-white/10 hover:border-white/30"}`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${has ? "bg-white text-black" : "border border-white/15"}`}
              >
                {has ? <Check className="h-6 w-6" strokeWidth={3} /> : <Icon className="h-6 w-6" />}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{item.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-white/60">{item.text}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.div {...appear()} className="flex gap-4 rounded-2xl border border-dashed border-white/25 p-5">
        <PackageX className="h-8 w-8 shrink-0 text-white/70" />
        <div>
          <p className="font-semibold">No necesitas comprar ningún componente.</p>
          <p className="mt-1 text-sm text-white/60">
            Toda la Parte 1 se hace en programas y simuladores online. El hardware real llega con la práctica presencial de la Parte 2.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------- 6. ¿Por qué aprendemos estas cosas?

const CONCEPTS = [
  {
    name: "Salida digital",
    hint: "encender / apagar",
    learn: "Un LED",
    use: "En todas las categorías: indicadores, activar drivers de motores",
  },
  {
    name: "Entrada digital",
    hint: "sí / no",
    learn: "Un botón",
    use: "Botón de inicio (obligatorio en minisumo), finales de carrera, sensores de contacto",
  },
  {
    name: "Entrada analógica",
    hint: "un valor que varía",
    learn: "Un potenciómetro",
    use: "Sensores de línea del seguidor, medir la batería, casi cualquier sensor",
  },
  {
    name: "Salida PWM",
    hint: "cuánto, no solo sí / no",
    learn: "El brillo de un LED",
    use: "La velocidad de los motores en minisumo, soccer y seguidor de línea",
  },
  {
    name: "Servomotor",
    hint: "ir a un ángulo exacto",
    learn: "Un servo SG90",
    use: "Las articulaciones del OTTO y del minihumanoide, brazos, pateadores",
  },
  {
    name: "Recibir comandos",
    hint: "",
    learn: "Enviar letras al ESP32 desde la computadora",
    use: "Control por Bluetooth del minisumo y del soccer",
  },
];

const LOOP_EXAMPLES = {
  "Seguidor de línea": ["percibe la línea", "decide hacia dónde corregir", "actúa sobre los motores"],
  OTTO: ["percibe un comando", "decide qué paso dar", "actúa sobre sus servos"],
} as const;

export function WhyScene() {
  const [open, setOpen] = useState(0);
  const [example, setExample] = useState<keyof typeof LOOP_EXAMPLES>("Seguidor de línea");
  const loop: { icon: LucideIcon; name: string; text: string }[] = [
    { icon: Eye, name: "Percibir", text: "Leer lo que pasa afuera (botones, sensores, comandos)." },
    { icon: Brain, name: "Decidir", text: "El programa analiza lo que leyó y elige qué hacer." },
    { icon: Zap, name: "Actuar", text: "Mover motores, servos, encender luces." },
  ];

  return (
    <div className="space-y-12">
      <Lead>
        En Nova se construyen robots muy distintos: minisumos autónomos y por Bluetooth, seguidores de línea, robots soccer, OTTOs y
        minihumanoides con servos, entre otros. Parecen mundos diferentes, pero{" "}
        <strong className="text-white">todos están hechos de las mismas piezas básicas</strong>. Si dominas estas 6, puedes entrar a
        cualquier categoría:
      </Lead>

      <section>
        <Label>Las 6 piezas · toca una</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONCEPTS.map((concept, index) => (
            <button
              key={concept.name}
              type="button"
              onClick={() => setOpen(index)}
              aria-pressed={open === index}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${open === index ? "border-white bg-white text-black" : "border-white/15 hover:border-white/40"}`}
            >
              <span className="block text-sm font-semibold">{concept.name}</span>
              {concept.hint && (
                <span className={`block text-xs ${open === index ? "text-black/60" : "text-white/45"}`}>{concept.hint}</span>
              )}
            </button>
          ))}
        </div>
        <motion.div
          key={open}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 sm:grid-cols-2"
        >
          <div className="bg-black p-4">
            <p className="text-[11px] uppercase tracking-widest text-white/45">Cómo lo aprendes aquí</p>
            <p className="mt-1 font-semibold">{CONCEPTS[open].learn}</p>
          </div>
          <div className="bg-black p-4">
            <p className="text-[11px] uppercase tracking-widest text-white/45">Dónde lo usarás después</p>
            <p className="mt-1 font-semibold">{CONCEPTS[open].use}</p>
          </div>
        </motion.div>
      </section>

      <section>
        <h3 className="font-display text-xl font-bold">El ciclo de todo robot</h3>
        <p className="mt-1 text-white/65">Todo robot, por complejo que sea, repite sin parar el mismo ciclo:</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(LOOP_EXAMPLES) as (keyof typeof LOOP_EXAMPLES)[]).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setExample(name)}
              aria-pressed={example === name}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${example === name ? "border-white bg-white text-black" : "border-white/20 text-white/70 hover:border-white/40"}`}
            >
              <Bot className="mr-1 inline h-3.5 w-3.5" /> Un {name}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {loop.map((phase, index) => {
            const PhaseIcon = phase.icon;
            return (
              <div key={phase.name} className="relative rounded-2xl border border-white/15 p-4">
                <p className="flex items-center gap-2 font-display text-lg font-black uppercase">
                  <PhaseIcon className="h-5 w-5" /> {phase.name}
                </p>
                <p className="mt-1 text-sm text-white/60">{phase.text}</p>
                <motion.p
                  key={example}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 }}
                  className="mt-3 rounded-lg bg-white/[0.06] px-3 py-2 text-sm"
                >
                  Un {example} <strong>{LOOP_EXAMPLES[example][index]}</strong>
                </motion.p>
                {index < loop.length - 1 && (
                  <ArrowRight
                    aria-hidden
                    className="absolute -right-[13px] top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-black text-white/50 sm:block"
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-white/55">En este nivel vas a construir ese ciclo completo con componentes simples.</p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- 7. Mapa de pines Nova

const PINS = [
  { part: "LED verde", pin: "GPIO 18", note: "Con resistencia de 220 Ω", dot: "#4ade80" },
  { part: "LED amarillo", pin: "GPIO 19", note: "Con resistencia de 220 Ω", dot: "#facc15" },
  { part: "LED rojo", pin: "GPIO 23", note: "Con resistencia de 220 Ω", dot: "#f87171" },
  { part: "Botón", pin: "GPIO 21", note: "Con resistencia pull-down de 10 kΩ", dot: "#e5e5e5" },
  { part: "Potenciómetro (pin central)", pin: "GPIO 34", note: "Extremos a 3V3 y GND", dot: "#e5e5e5" },
  { part: "Servo SG90 (señal)", pin: "GPIO 25", note: "Alimentación a 5 V (VIN) y GND", dot: "#e5e5e5" },
];

export function PinsScene() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <Lead>
        Para que todo encaje,{" "}
        <strong className="text-white">en todas las lecciones y en la tarea final usamos siempre las mismas conexiones</strong>. Así lo que
        conectas en el simulador, lo que dibujas en el esquemático y lo que escribes en el código coinciden.
      </Lead>

      <section>
        <Label>Toca un componente para seguir su cable</Label>
        <div className="relative">
          {/* La placa: un ESP32 visto de arriba; cada cable llega a su pin. */}
          <div aria-hidden className="absolute inset-y-0 right-0 w-24 rounded-2xl border-2 border-white/30 bg-[#0b0b0b] sm:w-28" />
          <p className="relative ml-auto flex w-24 items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-widest text-white/50 sm:w-28">
            <Cpu className="h-3 w-3" /> ESP32
          </p>
          <ul className="relative space-y-2 pb-3">
            {PINS.map((row, index) => {
              const on = active === index;
              return (
                <li key={row.pin} className={`flex items-center transition-opacity ${active === null || on ? "" : "opacity-45"}`}>
                  <button
                    type="button"
                    onClick={() => setActive(on ? null : index)}
                    aria-pressed={on}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                      on ? "border-white bg-white/[0.08]" : "border-white/15 hover:border-white/35"
                    }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: row.dot, boxShadow: on ? `0 0 12px ${row.dot}` : undefined }}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">{row.part}</span>
                      {on && <span className="block text-xs text-white/60">{row.note}</span>}
                    </span>
                  </button>
                  <span
                    aria-hidden
                    className={`w-4 shrink-0 sm:w-10 ${on ? "h-0.5 bg-white" : "border-t-2 border-dashed border-white/20"}`}
                  />
                  <span className="flex w-24 shrink-0 items-center gap-2 sm:w-28">
                    <span
                      className={`-ml-[5px] h-2.5 w-2.5 shrink-0 rounded-sm border ${on ? "border-white bg-white" : "border-white/40 bg-black"}`}
                    />
                    <span className={`text-xs font-semibold tabular-nums ${on ? "text-white" : "text-white/55"}`}>{row.pin}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <p className="text-sm text-white/55">Vuelve a esta parada cada vez que lo necesites: es tu referencia de conexiones.</p>
    </div>
  );
}

// ---------------------------------------------------------------- 8. Cómo está organizada cada lección

const ANATOMY = [
  { name: "Objetivo", text: "Lo que podrás hacer al terminar." },
  { name: "¿Para qué me sirve?", text: "En qué categorías de robots se usa." },
  { name: "Explicación", text: "La teoría, explicada desde cero." },
  { name: "Paso a paso", text: "La práctica guiada." },
  { name: "Errores comunes", text: "Los problemas típicos y cómo resolverlos." },
  { name: "Mini práctica", text: "Un ejercicio para hacer por tu cuenta." },
  { name: "Puedo continuar si…", text: "Una autoevaluación rápida." },
];

// Algunas de las simulaciones que hay dentro de las lecciones, por módulo.
const SIMULATIONS: { module: string; name: string; items: string[] }[] = [
  {
    module: "electronica",
    name: "Electrónica",
    items: ["Calcula la resistencia de un LED", "Mueve un divisor de voltaje", "Circuitos de PhET", "Las capas de una PCB"],
  },
  {
    module: "programacion",
    name: "Programación",
    items: ["Haz parpadear un LED", "Laboratorio del botón", "Gira un servo", "Envía comandos al ESP32"],
  },
  {
    module: "mecanica",
    name: "Mecánica",
    items: ["El cubo de vistas 3D", "Bocetos bien definidos", "Voladizos y holguras", "Prepara tu pieza para imprimir"],
  },
  {
    module: "soldadura",
    name: "Soldadura",
    items: ["Suelda una pieza THT", "Encuentra el defecto", "Tamaños SMD", "La temperatura del cautín"],
  },
];

export function AnatomyScene() {
  return (
    <div className="space-y-8">
      <Lead>Todas las lecciones siguen la misma estructura, para que siempre sepas dónde estás:</Lead>

      {/* Una lección "desarmada" en sus 7 partes. */}
      <div className="overflow-hidden rounded-2xl border border-white/15">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="ml-3 text-xs text-white/40">Una lección cualquiera</span>
        </div>
        <ol className="divide-y divide-white/10">
          {ANATOMY.map((part, index) => (
            <motion.li key={part.name} {...appear(index * 0.07)} className="flex items-center gap-4 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-black">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{part.name}</span>
                <span className="block text-sm text-white/55">{part.text}</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Lo que más engancha: en las lecciones no solo se lee, se prueba. */}
      <section className="space-y-5">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-nova px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <MousePointerClick className="h-3.5 w-3.5" /> Aprendes tocando
          </p>
          <h3 className="mt-3 font-display text-2xl font-black leading-tight">Más de 30 simulaciones interactivas</h3>
          <p className="mt-2 text-white/70">
            Dentro de las lecciones no solo lees: mueves perillas, conectas cables, programas un LED y hasta sueldas en pantalla. Cada
            simulación te deja equivocarte sin romper nada, y al final de cada lección unas preguntas rápidas te dicen si ya puedes seguir.
          </p>
        </div>

        <div style={tone(moduleAccent("programacion"))}>
          <p className="mb-2 text-xs text-white/45">Pruébala aquí: es una de las que encontrarás en Programación.</p>
          <PwmDemo />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {SIMULATIONS.map((group, index) => (
            <motion.div
              key={group.module}
              {...appear(index * 0.06)}
              style={tone(moduleAccent(group.module))}
              className="rounded-2xl border border-[rgb(var(--tone)/0.35)] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--tone))]">{group.name}</p>
              <ul className="mt-2 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                    <Play className="h-3 w-3 shrink-0 fill-[rgb(var(--tone))] text-[rgb(var(--tone))]" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- 9. Tu camino en Nova

const STAGES = [
  {
    name: "Parte 1 – Bienvenida",
    what: "Este contenido: Electrónica, Mecánica y Programación. Autónomo, en texto y simuladores.",
    how: "Inscribiéndote en la convocatoria",
  },
  {
    name: "Parte 2 – Soldadura",
    what: "Soldadura THT y SMD, en texto y videos, para prepararte antes de tocar el hardware.",
    how: "Cuando la directiva aprueba tu tarea final",
  },
  {
    name: "Práctica presencial",
    what: "Recibes un kit de placa y la sueldas con guía del equipo.",
    how: "El encargado de la convocatoria te asigna una fecha",
  },
  {
    name: "Miembro de Nova",
    what: "Material interno, foro y bitácora del equipo; luego, competencias o investigación.",
    how: "La directiva decide tu ingreso",
  },
];

export function PathScene() {
  return (
    <div className="space-y-8">
      <Lead>Así sigue tu camino después de esta ruta. Cada etapa se abre con la anterior:</Lead>
      <ol className="grid gap-3 md:grid-cols-4">
        {STAGES.map((stage, index) => (
          <motion.li
            key={stage.name}
            {...appear(index * 0.1)}
            className={`relative rounded-2xl border p-4 ${index === 0 ? "border-white/50 bg-white/[0.06]" : "border-white/10"}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? "bg-white text-black" : "border border-white/25 text-white/70"}`}
              >
                {index + 1}
              </span>
              {index === 0 && (
                <span className="rounded-full bg-nova px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Estás aquí
                </span>
              )}
            </div>
            <p className="mt-3 font-semibold">{stage.name}</p>
            <p className="mt-1 text-sm text-white/60">{stage.what}</p>
            <p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/45">
              <span className="font-semibold text-white/70">Cómo se accede: </span>
              {stage.how}
            </p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------- 10. Consejos para avanzar

export function TipsScene() {
  return (
    <div className="space-y-8">
      <Lead>Cuatro consejos del equipo para que no te trabes:</Lead>
      <div className="grid gap-3 sm:grid-cols-2">
        <Tile icon={TriangleAlert} title="Lee los errores">
          Cuando algo falla, el programa casi siempre te dice por qué. Copia el mensaje de error y búscalo en internet: alguien ya tuvo el
          mismo problema.
          <code className="mt-3 block overflow-x-auto rounded-lg bg-white/[0.06] px-3 py-2 text-xs text-white/80">
            error: 'ledPin' was not declared in this scope
          </code>
        </Tile>
        <Tile icon={Footprints} title="Avanza en pasos pequeños" delay={0.08}>
          Prueba cada parte por separado antes de juntarlas.
        </Tile>
        <Tile icon={NotebookPen} title="Escribe tu bitácora desde el día 1" delay={0.16}>
          Llena una{" "}
          <Link to="/academia/bitacora" className="text-white underline underline-offset-4">
            ficha
          </Link>{" "}
          cada vez que resuelvas algo; al final solo tendrás que elegir tus mejores fichas.
        </Tile>
        <Tile icon={RefreshCw} title="No te quedes trabado días en lo mismo" delay={0.24}>
          Si algo no sale, busca otra explicación, avanza con otra lección y vuelve después, o pregúntale al encargado de la convocatoria.
        </Tile>
      </div>
    </div>
  );
}
