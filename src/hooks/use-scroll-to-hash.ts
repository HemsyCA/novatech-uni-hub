import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToHash(ready = true) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash || !ready) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, ready]);
}
