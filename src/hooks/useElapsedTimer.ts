import { useState, useEffect } from 'react';

export function useElapsedTimer(active: boolean): number | null {
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      setElapsed(null);
      return;
    }
    // Start showing after 2s
    const showTimer = setTimeout(() => {
      setElapsed(2);
      const interval = setInterval(() => setElapsed((s) => (s ?? 2) + 1), 1000);
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(showTimer);
  }, [active]);

  return elapsed;
}
