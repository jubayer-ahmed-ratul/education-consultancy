import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

interface AnimatedNumberProps {
  value: string;
}

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const normalized = value.replace(/,/g, '').trim();
  const target = Number(normalized);
  const isNumeric = normalized !== '' && Number.isFinite(target);
  const decimalMatch = normalized.split('.')[1];
  const decimals = decimalMatch ? decimalMatch.length : 0;
  const hasCommas = value.includes(',');

  const [display, setDisplay] = useState<string>(() =>
    isNumeric ? (decimals > 0 ? (0).toFixed(decimals) : '0') : value
  );

  useEffect(() => {
    if (!isNumeric) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (decimals > 0) {
          const fixed = latest.toFixed(decimals);
          if (hasCommas) {
            const [intPart, decPart] = fixed.split('.');
            setDisplay(`${Number(intPart).toLocaleString('en-US')}.${decPart}`);
          } else {
            setDisplay(fixed);
          }
        } else {
          const rounded = Math.round(latest);
          setDisplay(hasCommas ? rounded.toLocaleString('en-US') : String(rounded));
        }
      },
    });

    return () => controls.stop();
  }, [inView, isNumeric, target, decimals, hasCommas, value]);

  return <span ref={ref}>{display}</span>;
}
