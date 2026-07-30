"use client";

import { useEffect, useRef, useState } from "react";

// Anima um número de 0 até o valor final ao montar (efeito "contador").
export default function CountUp({
  value,
  className,
  duration = 700,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const [n, setN] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      value === 0
    ) {
      setN(value);
      return;
    }
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return <span className={className}>{n.toLocaleString("pt-BR")}</span>;
}
