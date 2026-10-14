import { useState } from "react";
import { Divide } from "lucide-react";
import { Choice, Feedback, WidgetCard } from "@/components/academia/widgets/WidgetCard";

const PRESETS: [string, string][] = [
  ["7", "2"],
  ["7", "2.0"],
  ["1", "3"],
  ["10", "4"],
  ["10.0", "4"],
  ["9", "3"],
];

const NUMBER = /^-?\d+(\.\d*)?$/;

// Imita a C++: si los dos son enteros, la división se corta hacia cero.
// Serial.println de un decimal muestra 2 cifras (3.50).
const evaluate = (a: string, b: string) => {
  if (!NUMBER.test(a) || !NUMBER.test(b)) return null;
  const x = Number(a);
  const y = Number(b);
  const integers = !a.includes(".") && !b.includes(".");
  if (y === 0) return { integers, output: null };
  return { integers, output: integers ? String(Math.trunc(x / y)) : (x / y).toFixed(2), exact: x / y };
};

export function IntegerDivision() {
  const [a, setA] = useState("7");
  const [b, setB] = useState("2");
  const result = evaluate(a.trim(), b.trim());

  const input = (value: string, onChange: (v: string) => void, label: string) => (
    <input
      value={value}
      inputMode="decimal"
      aria-label={label}
      onChange={(e) => onChange(e.target.value.replace(",", "."))}
      className="w-16 rounded border border-[rgb(var(--accent,255_255_255)/0.6)] bg-black px-1 text-center text-[rgb(var(--accent,255_255_255))]"
    />
  );

  return (
    <WidgetCard icon={Divide} title="¿Qué imprime el ESP32?">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(([x, y]) => (
          <Choice
            key={`${x}/${y}`}
            selected={a === x && b === y}
            onClick={() => {
              setA(x);
              setB(y);
            }}
          >
            {x} / {y}
          </Choice>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-sm">
        <p className="text-white/80">
          Serial.println({input(a, setA, "Primer número")} / {input(b, setB, "Segundo número")});
        </p>
        <p className="mt-3 text-xs text-white/40">Monitor Serial</p>
        <p className="mt-1 rounded-md bg-black px-3 py-2 text-lg font-semibold text-emerald-300">
          {result?.output ?? "—"}
        </p>
      </div>

      <div className="mt-3">
        {!result ? (
          <Feedback tone="info">Escribe dos números, por ejemplo 7 y 2.</Feedback>
        ) : result.output === null ? (
          <Feedback tone="error">No se puede dividir entre 0: en un ESP32 real el resultado no tendría sentido.</Feedback>
        ) : result.integers && result.exact !== undefined && !Number.isInteger(result.exact) ? (
          <Feedback tone="error">
            Los dos son enteros (<code>int</code>), así que el resultado también es entero: {result.exact.toFixed(2)} se corta a{" "}
            <strong>{result.output}</strong>. Agrega <code>.0</code> a uno de los dos para obtener decimales.
          </Feedback>
        ) : result.integers ? (
          <Feedback tone="ok">La división es exacta, así que no se pierde nada aunque los dos sean enteros.</Feedback>
        ) : (
          <Feedback tone="ok">
            Al menos uno tiene punto decimal (<code>float</code>), así que el resultado conserva los decimales.
          </Feedback>
        )}
      </div>
    </WidgetCard>
  );
}
