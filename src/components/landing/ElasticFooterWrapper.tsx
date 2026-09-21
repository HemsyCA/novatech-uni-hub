import { useState, useEffect, useRef, ReactNode } from "react";

interface ElasticFooterWrapperProps {
  children: ReactNode;
}

export function ElasticFooterWrapper({ children }: ElasticFooterWrapperProps) {
  const [stretchHeight, setStretchHeight] = useState(0);
  const targetStretchRef = useRef(0);
  const isActiveRef = useRef(false);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let animationFrame: number;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;

      if (scrollHeight <= 0) return;

      const scrollPercent = Math.min(scrollPosition / scrollHeight, 1);
      const isAtBottom = scrollPercent > 0.95;

      isActiveRef.current = true;

      clearTimeout(inactivityTimeoutRef.current);

      if (isAtBottom) {
        const overscroll = (scrollPercent - 0.95) / 0.05 * 100;
        targetStretchRef.current = Math.min(overscroll * 1.5, 200);
      } else {
        targetStretchRef.current = 0;
      }

      inactivityTimeoutRef.current = setTimeout(() => {
        isActiveRef.current = false;
      }, 150);
    };

    const animate = () => {
      setStretchHeight((prev) => {
        const target = targetStretchRef.current;

        if (!isActiveRef.current) {
          return 0;
        }

        const diff = target - prev;

        if (Math.abs(diff) < 0.5) {
          return target;
        }

        const resistance = 1 + (prev / 200);
        const easing = Math.max(0.12 / resistance, 0.02);

        return Math.max(prev + diff * easing, 0);
      });

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", handleScroll);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrame);
      clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ paddingBottom: stretchHeight }}>
        {children}
      </div>
    </div>
  );
}
