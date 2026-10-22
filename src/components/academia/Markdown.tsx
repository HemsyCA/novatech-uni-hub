import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChecklist } from "@/components/academia/checklist-context";
import { PhetSim } from "@/components/academia/widgets/PhetSim";
import { LedResistorCalculator } from "@/components/academia/widgets/LedResistorCalculator";
import { LedDiagram } from "@/components/academia/widgets/LedDiagram";
import { Potentiometer, VoltageDivider } from "@/components/academia/widgets/VoltageDivider";
import { Esp32Pinout } from "@/components/academia/widgets/Esp32Pinout";
import { AlgorithmOrder } from "@/components/academia/widgets/AlgorithmOrder";
import { BlinkSimulator } from "@/components/academia/widgets/BlinkSimulator";
import { IntegerDivision } from "@/components/academia/widgets/IntegerDivision";
import { ButtonLab } from "@/components/academia/widgets/ButtonLab";
import { AnalogReader } from "@/components/academia/widgets/AnalogReader";
import { ForLoop, PwmDemo } from "@/components/academia/widgets/Pwm";
import { ServoDemo } from "@/components/academia/widgets/ServoDemo";
import { SerialCommands } from "@/components/academia/widgets/SerialCommands";
import { SchematicSymbols } from "@/components/academia/widgets/SchematicSymbols";
import { PullResistor } from "@/components/academia/widgets/PullResistor";
import { PcbLayers } from "@/components/academia/widgets/PcbLayers";
import { ViewCube } from "@/components/academia/widgets/ViewCube";
import { SketchConstraints } from "@/components/academia/widgets/SketchConstraints";
import { FeatureHistory } from "@/components/academia/widgets/FeatureHistory";
import { Clearance, Overhang } from "@/components/academia/widgets/PrintRules";
import { Slicer } from "@/components/academia/widgets/Slicer";
import { PanelSimulator } from "@/components/academia/widgets/PanelSimulator";
import { UploadSimulator } from "@/components/academia/widgets/UploadSimulator";
import { SafetyCheck, TipTemperature } from "@/components/academia/widgets/SolderBasics";
import { ThtSolderGame } from "@/components/academia/widgets/ThtSolderGame";
import { DefectHunt } from "@/components/academia/widgets/DefectHunt";
import { SmdOrder, SmdSizes } from "@/components/academia/widgets/SmdWidgets";
import { ReviewCards } from "@/components/academia/widgets/ReviewCards";
import { Check, ChevronRight, Copy, Info, Lightbulb, Maximize2, TriangleAlert, Wrench, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ANSWERS_LANGUAGE = "language-respuestas";
const VIDEO_LANGUAGE = "language-video";
const YOUTUBE_ID = /^[\w-]{11}$/;
const PHET_LANGUAGE = "language-phet";
const PHET_SLUG = /^[a-z0-9-]+$/;
const WIDGET_LANGUAGE = "language-widget";
// ```imagen: ruta (en public/), texto alternativo y, opcional, el pie de la imagen.
const IMAGE_LANGUAGE = "language-imagen";
const IMAGE_SRC = /^\/[\w/.-]+\.(webp|png|jpe?g|svg)$/;

// Apoyos interactivos que se insertan en una lección con un bloque ```widget.
const widgets: Record<string, () => JSX.Element> = {
  "calculadora-led": LedResistorCalculator,
  "diagrama-led": LedDiagram,
  "divisor-voltaje": VoltageDivider,
  potenciometro: Potentiometer,
  "pinout-esp32": Esp32Pinout,
  "ordenar-semaforo": AlgorithmOrder,
  "simulador-parpadeo": BlinkSimulator,
  "division-enteros": IntegerDivision,
  "laboratorio-boton": ButtonLab,
  "lector-analogico": AnalogReader,
  pwm: PwmDemo,
  "bucle-for": ForLoop,
  servo: ServoDemo,
  "monitor-comandos": SerialCommands,
  "simbolos-esquematico": SchematicSymbols,
  "resistencia-pull": PullResistor,
  "capas-pcb": PcbLayers,
  "cubo-vistas": ViewCube,
  "boceto-definido": SketchConstraints,
  "historial-operaciones": FeatureHistory,
  holguras: Clearance,
  voladizos: Overhang,
  laminador: Slicer,
  "simulador-panel": PanelSimulator,
  "carga-arduino": UploadSimulator,
  "temperatura-cautin": TipTemperature,
  "seguridad-soldadura": SafetyCheck,
  "soldar-tht": ThtSolderGame,
  "encuentra-defecto": DefectHunt,
  "tamanos-smd": SmdSizes,
  "orden-smd": SmdOrder,
  "repaso-soldadura": ReviewCards,
};

type HastNode = { type: string; tagName?: string; value?: string; children?: HastNode[] };

const textOf = (node: HastNode): string =>
  node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join("");

// Texto en negrita con el que empieza un bloque: "> **Truco:** …" devuelve "Truco:".
const leadingStrong = (node: HastNode) => {
  const paragraph = node.children?.find((child) => child.type === "element");
  const first = paragraph?.children?.[0];
  return first?.type === "element" && first.tagName === "strong" ? textOf(first) : "";
};

type CalloutKind = "tip" | "warning" | "info" | "example" | "plain";

const calloutKind = (label: string): CalloutKind => {
  if (/^(truco|tip|consejo|idea|regla)/i.test(label)) return "tip";
  if (/^(cuidado|importante|atención|ojo|peligro|seguridad|el error)/i.test(label)) return "warning";
  if (/^(nota|dato)/i.test(label)) return "info";
  if (/^ejemplo/i.test(label)) return "example";
  return "plain";
};

const calloutStyles: Record<CalloutKind, { icon: LucideIcon | null; box: string; iconColor: string }> = {
  tip: { icon: Lightbulb, box: "border-amber-300/40 bg-amber-300/[0.08]", iconColor: "text-amber-300" },
  warning: { icon: TriangleAlert, box: "border-rose-400/40 bg-rose-400/[0.08]", iconColor: "text-rose-400" },
  info: { icon: Info, box: "border-sky-400/40 bg-sky-400/[0.08]", iconColor: "text-sky-400" },
  example: {
    icon: Wrench,
    box: "border-[rgb(var(--tone,255_255_255)/0.4)] bg-[rgb(var(--tone,255_255_255)/0.07)]",
    iconColor: "text-[rgb(var(--tone,255_255_255))]",
  },
  plain: { icon: null, box: "border-white/20 bg-white/[0.04]", iconColor: "" },
};

function YouTubeVideo({ id, title }: { id: string; title: string }) {
  return (
    <figure className="not-prose my-6">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/15 bg-white/[0.04]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-white/50">
        <span>{title}</span>
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline underline-offset-4"
        >
          Ver en YouTube
        </a>
      </figcaption>
    </figure>
  );
}

// Una captura de pantalla de la lección. Se puede ampliar, porque suele tener texto pequeño.
function LessonImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="not-prose my-6">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] transition-colors hover:border-white/40"
            aria-label={`Ampliar imagen: ${alt}`}
          >
            <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 text-xs text-white backdrop-blur transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5" /> Ampliar
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[92vh] w-[96vw] max-w-6xl overflow-auto border-white/15 bg-black p-2 sm:p-3">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <img src={src} alt={alt} className="h-auto w-full min-w-[720px] rounded-lg sm:min-w-0" />
        </DialogContent>
      </Dialog>
      {caption && <figcaption className="mt-2 text-xs leading-relaxed text-white/50">{caption}</figcaption>}
    </figure>
  );
}

function CodeBlock({ text, children }: { text: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="not-prose relative my-6">
      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black px-2.5 py-1 text-xs text-white/80 hover:text-white hover:border-white/50 transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copiado" : "Copiar"}
      </button>
      <pre className="overflow-x-auto rounded-xl border border-white/15 bg-white/[0.04] p-4 pr-24 text-[13px] leading-relaxed text-white/90">
        {children}
      </pre>
    </div>
  );
}

function TaskCheckbox({ type, checked }: { type?: string; checked?: boolean }) {
  // Dentro de una lista que se puede marcar, la casilla la dibuja TaskItem.
  const checklist = useChecklist();
  if (type !== "checkbox" || checklist) return null;
  return (
    <span
      aria-hidden
      className={`mr-2 inline-block h-4 w-4 translate-y-0.5 rounded border ${checked ? "bg-white border-white" : "border-white/50"}`}
    />
  );
}

function TaskItem({ node, className, children }: { node?: HastNode; className?: string; children?: ReactNode }) {
  const checklist = useChecklist();
  const isTask = className?.includes("task-list-item");
  if (!checklist || !isTask || !node) return <li className={className}>{children}</li>;

  const item = textOf(node).trim();
  const done = checklist.checked.has(item);
  return (
    <li className="not-prose my-1.5 list-none">
      <button
        type="button"
        aria-pressed={done}
        onClick={() => checklist.toggle(item)}
        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-2.5 text-left text-sm leading-relaxed transition-colors [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_strong]:text-white ${
          done ? "border-[rgb(var(--tone,255_255_255)/0.5)] bg-[rgb(var(--tone,255_255_255)/0.08)] text-white" : "border-white/15 text-white/80 hover:border-white/30"
        }`}
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            done ? "border-[rgb(var(--tone,255_255_255))] bg-[rgb(var(--tone,255_255_255))] text-black" : "border-white/40"
          }`}
        >
          {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span>{children}</span>
      </button>
    </li>
  );
}

const components: Components = {
  a: ({ href, children }) => {
    if (href?.startsWith("/")) return <Link to={href}>{children}</Link>;
    const external = href?.startsWith("http");
    return (
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-white/15">
      <table className="w-full text-sm text-left [&_th]:bg-white/[0.06] [&_th]:font-semibold [&_th]:text-white [&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_td]:text-white/75 [&_tr]:border-b [&_tr]:border-white/10 [&_tbody_tr:last-child]:border-b-0 [&_code]:text-white">
        {children}
      </table>
    </div>
  ),
  blockquote: ({ node, children }) => {
    const callout = calloutStyles[calloutKind(node ? leadingStrong(node) : "")];
    const Icon = callout.icon;
    return (
      <aside
        className={`not-prose my-6 flex gap-3 rounded-xl border px-5 py-4 text-sm leading-relaxed text-white/85 [&_strong]:text-white [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_p+p]:mt-2 ${callout.box}`}
      >
        {Icon && <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${callout.iconColor}`} aria-hidden />}
        <div className="min-w-0 flex-1">{children}</div>
      </aside>
    );
  },
  pre: ({ node, children }) => {
    const code = node?.children[0];
    const classNames = code && "properties" in code ? code.properties.className : undefined;
    const isAnswers = Array.isArray(classNames) && classNames.includes(ANSWERS_LANGUAGE);
    const isVideo = Array.isArray(classNames) && classNames.includes(VIDEO_LANGUAGE);
    const isPhet = Array.isArray(classNames) && classNames.includes(PHET_LANGUAGE);
    const isWidget = Array.isArray(classNames) && classNames.includes(WIDGET_LANGUAGE);
    const isImage = Array.isArray(classNames) && classNames.includes(IMAGE_LANGUAGE);

    const text = code && "children" in code ? code.children.map((c) => ("value" in c ? c.value : "")).join("") : "";

    if (isVideo) {
      const [id = "", title = "Video de apoyo"] = text.trim().split(/\r?\n/).map((line) => line.trim());
      if (YOUTUBE_ID.test(id)) return <YouTubeVideo id={id} title={title} />;
    }

    if (isPhet) {
      const [slug = "", title = "Simulación", instructions] = text.trim().split(/\r?\n/).map((line) => line.trim());
      if (PHET_SLUG.test(slug)) return <PhetSim slug={slug} title={title} instructions={instructions} />;
    }

    if (isImage) {
      const [src = "", alt = "Imagen de la lección", caption] = text.trim().split(/\r?\n/).map((line) => line.trim());
      if (IMAGE_SRC.test(src)) return <LessonImage src={src} alt={alt} caption={caption} />;
    }

    if (isWidget) {
      const Widget = widgets[text.trim()];
      if (Widget) return <Widget />;
    }

    if (isAnswers) {
      return (
        <details className="group my-6 rounded-xl border border-white/20">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
            <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            Ver respuestas (ábrelas solo después de intentarlo)
          </summary>
          <div className="border-t border-white/10 px-5 text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        </details>
      );
    }

    return <CodeBlock text={text}>{children}</CodeBlock>;
  },
  input: ({ type, checked }) => <TaskCheckbox type={type} checked={checked} />,
  li: ({ node, className, children }) => (
    <TaskItem node={node as HastNode | undefined} className={className}>
      {children}
    </TaskItem>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-lg prose-h3:mt-10 prose-h3:border-b prose-h3:border-white/10 prose-h3:pb-2 prose-h4:text-base prose-p:text-white/80 prose-li:text-white/80 prose-strong:text-white prose-a:text-white prose-a:underline-offset-4 prose-code:text-white prose-code:before:content-none prose-code:after:content-none prose-li:marker:text-white/40 [&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0">

      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
