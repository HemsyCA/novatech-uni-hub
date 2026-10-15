import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import type { QuizQuestion } from "@/content/academia/preguntas";

// Mezcla las opciones siempre igual para cada pregunta, así la correcta no queda
// siempre en la misma letra y el orden no cambia al recargar.
const shuffledOrder = (question: QuizQuestion) => {
  let seed = [...question.question].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 7);
  const order = question.options.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const j = (seed >>> 16) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

function Question({
  question,
  number,
  selected,
  onSelect,
}: {
  question: QuizQuestion;
  number: number;
  selected: number | null;
  onSelect: (option: number) => void;
}) {
  const solved = selected === question.correct;
  const wrong = selected !== null && !solved ? question.options[selected] : null;
  const order = useMemo(() => shuffledOrder(question), [question]);

  return (
    <fieldset className="rounded-2xl border border-white/15 p-5">
      <legend className="sr-only">Pregunta {number}</legend>
      <p className="text-xs uppercase tracking-widest text-white/40">Pregunta {number}</p>
      <p className="mt-2 font-semibold leading-relaxed">{question.question}</p>
      <div className="mt-4 grid gap-2">
        {order.map((index, position) => {
          const option = question.options[index];
          const isCorrect = solved && index === question.correct;
          const isWrong = selected === index && !solved;
          return (
            <button
              key={option.text}
              type="button"
              disabled={solved}
              onClick={() => onSelect(index)}
              aria-pressed={selected === index}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                isCorrect
                  ? "border-emerald-400 bg-emerald-400/15 text-white"
                  : isWrong
                    ? "border-rose-400 bg-rose-400/10 text-white animate-shake"
                    : solved
                      ? "border-white/10 text-white/40"
                      : "border-white/20 text-white/85 hover:border-[rgb(var(--tone))] hover:bg-[rgb(var(--tone)/0.08)]"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                  isCorrect
                    ? "border-emerald-400 bg-emerald-400 text-black"
                    : isWrong
                      ? "border-rose-400 bg-rose-400 text-black"
                      : "border-white/30"
                }`}
              >
                {isCorrect ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : isWrong ? <X className="h-3.5 w-3.5" strokeWidth={3} /> : String.fromCharCode(65 + position)}
              </span>
              {option.text}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {solved && (
          <p className="mt-4 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            <span className="font-semibold text-emerald-300">¡Correcto! </span>
            {question.explanation}
          </p>
        )}
        {wrong && (
          <p className="mt-4 rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            <span className="font-semibold text-rose-300">Casi. </span>
            {wrong.hint ?? "Vuelve a leer el paso anterior y prueba otra opción."} Intenta otra vez.
          </p>
        )}
      </div>
    </fieldset>
  );
}

export function Quiz({ questions, onPassedChange }: { questions: QuizQuestion[]; onPassedChange: (passed: boolean) => void }) {
  const [selected, setSelected] = useState<(number | null)[]>(() => questions.map(() => null));
  const solved = questions.filter((q, i) => selected[i] === q.correct).length;
  const passed = solved === questions.length;

  useEffect(() => {
    onPassedChange(passed);
  }, [passed, onPassedChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-white/60">Responde bien las {questions.length} preguntas para abrir la siguiente lección.</p>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${passed ? "bg-emerald-400 text-black" : "bg-white/10 text-white/70"}`}>
          {solved}/{questions.length}
        </span>
      </div>
      {questions.map((question, index) => (
        <Question
          key={question.question}
          question={question}
          number={index + 1}
          selected={selected[index]}
          onSelect={(option) => setSelected((current) => current.map((value, i) => (i === index ? option : value)))}
        />
      ))}
    </div>
  );
}
