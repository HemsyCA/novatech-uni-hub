import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, ChevronRight, Copy } from "lucide-react";

const ANSWERS_LANGUAGE = "language-respuestas";

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
  blockquote: ({ children }) => (
    <aside className="not-prose my-6 rounded-xl border border-white/20 bg-white/[0.04] px-5 py-4 text-sm leading-relaxed text-white/85 [&_strong]:text-white [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1">
      {children}
    </aside>
  ),
  pre: ({ node, children }) => {
    const code = node?.children[0];
    const classNames = code && "properties" in code ? code.properties.className : undefined;
    const isAnswers = Array.isArray(classNames) && classNames.includes(ANSWERS_LANGUAGE);

    const text = code && "children" in code ? code.children.map((c) => ("value" in c ? c.value : "")).join("") : "";

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
  input: ({ type, checked }) =>
    type === "checkbox" ? (
      <span
        aria-hidden
        className={`mr-2 inline-block h-4 w-4 translate-y-0.5 rounded border ${checked ? "bg-white border-white" : "border-white/50"}`}
      />
    ) : null,
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
