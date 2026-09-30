import { useEffect, useState } from "react";

/**
 * The current time, re-read whenever `nextDelay(now)` says the display would change.
 * A non-finite delay stops ticking. Coming back to a hidden tab re-reads at once,
 * because browsers throttle timers in background iframes.
 */
export function useNow(nextDelay: (now: number) => number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (from: number) => {
      const delay = nextDelay(from);
      if (Number.isFinite(delay)) timer = setTimeout(tick, delay);
    };
    const tick = () => {
      const time = Date.now();
      setNow(time);
      schedule(time);
    };
    const resync = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(timer);
      tick();
    };

    schedule(Date.now());
    document.addEventListener("visibilitychange", resync);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resync);
    };
  }, [nextDelay]);

  return now;
}
