"use client";

import { useSyncExternalStore } from "react";

function subscribe(onTick: () => void) {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
}

/** The current second; null while rendering on the server, so the markup matches. */
function useNowSeconds() {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 1000),
    () => null,
  );
}

const UNITS = [
  ["Days", 86400],
  ["Hours", 3600],
  ["Minutes", 60],
  ["Seconds", 1],
] as const;

/** Days, hours, minutes and seconds until `target` (an ISO date-time). */
export function Countdown({ target }: { target: string }) {
  const now = useNowSeconds();
  const left = now === null ? null : Math.max(0, Math.floor(Date.parse(target) / 1000) - now);

  if (left === 0) {
    return <p className="text-3xl italic">Today is the day!</p>;
  }

  return (
    <dl className="mx-auto grid max-w-md grid-cols-4 divide-x divide-gold/40" aria-live="off">
      {UNITS.map(([label, size], i) => {
        const value =
          left === null
            ? null
            : Math.floor(i === 0 ? left / size : (left % UNITS[i - 1][1]) / size);
        return (
          <div key={label} className="flex flex-col-reverse items-center gap-1 px-2">
            <dt className="text-xs tracking-[0.25em] text-gold-dark uppercase">{label}</dt>
            <dd className="text-[clamp(2rem,9vw,2.75rem)] leading-none tabular-nums">
              {value === null ? "–" : i === 0 ? value : String(value).padStart(2, "0")}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
