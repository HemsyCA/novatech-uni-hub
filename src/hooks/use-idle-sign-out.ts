import { useEffect } from "react";

// Última actividad de cada usuario, compartida entre pestañas: si trabajas en una, las demás no te sacan.
const keyFor = (userId: string) => `nova-ultima-actividad:${userId}`;
const SAVE_EVERY_MS = 60 * 1000;
const CHECK_EVERY_MS = 60 * 1000;

const readLast = (key: string) => {
  try {
    return Number(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
};

const saveNow = (key: string) => {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // Sin almacenamiento no se puede medir la inactividad; la sesión sigue normal.
  }
};

// Cierra la sesión tras `limitMs` sin actividad. Solo se activa para cuentas con permisos
// delicados (directiva), donde una sesión olvidada en una computadora compartida es un riesgo.
// `signedInAt`: cuándo inició sesión. Un ingreso posterior a la última actividad guardada es un
// ingreso nuevo, no una sesión olvidada, así que cuenta como actividad.
export function useIdleSignOut(userId: string | null, enabled: boolean, limitMs: number, signedInAt: number | null, onExpire: () => void) {
  useEffect(() => {
    if (!enabled || !userId) return;
    const key = keyFor(userId);

    const last = Math.max(readLast(key) ?? 0, signedInAt ?? 0) || null;
    if (last && Date.now() - last > limitMs) {
      onExpire();
      return;
    }
    saveNow(key);

    let lastSaved = Date.now();
    const onActivity = () => {
      if (Date.now() - lastSaved < SAVE_EVERY_MS) return;
      lastSaved = Date.now();
      saveNow(key);
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const timer = window.setInterval(() => {
      const latest = readLast(key);
      if (latest && Date.now() - latest > limitMs) onExpire();
    }, CHECK_EVERY_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.clearInterval(timer);
    };
  }, [userId, enabled, limitMs, signedInAt, onExpire]);
}
