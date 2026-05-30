import { useState, useEffect } from 'react';

export function useElapsedTimer(active: boolean): number | null {
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;

    let intervalId: NodeJS.Timeout;
    const showTimer = setTimeout(() => {
      setElapsed(2);
      intervalId = setInterval(() => setElapsed((s) => (s ?? 2) + 1), 1000);
    }, 2000);

    return () => {
      clearTimeout(showTimer);
      if (intervalId) clearInterval(intervalId);
      setElapsed(null);
    };
  }, [active]);

  return active ? elapsed : null;
}
