"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function AnimatedCounter({
  value,
  duration = 1200,
  prefix = "",
  suffix = "",
  formatter,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = startValue + (value - startValue) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId.current);
    };
  }, [value, duration]);

  const formatted = formatter
    ? formatter(displayValue)
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
