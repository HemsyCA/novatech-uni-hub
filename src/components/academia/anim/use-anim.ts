import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// El reloj de las animaciones de las lecciones y su color.
export const TONE = "rgb(var(--tone, 255 255 255))";
export const TONE_SOFT = "rgb(var(--tone, 255 255 255) / 0.25)";

// Un contador que avanza cada `ms`. `still` es true si no hay que animar.
export function useTick(ms: number) {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms, reduceMotion]);
  return { tick, still: Boolean(reduceMotion) };
}

// Una fase entre `count` que cambia cada `ms` (con movimiento reducido se queda en `fallback`).
export function usePhase(count: number, ms: number, fallback = 0) {
  const { tick, still } = useTick(ms);
  return still ? fallback : tick % count;
}
