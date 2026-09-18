"use client";

import { ArrowRightIcon } from "./icons";
import { useOpenRsvp } from "./RsvpProvider";

export function RsvpButton({ className = "" }: { className?: string }) {
  const openRsvp = useOpenRsvp();
  // Ivory on tan is 3.3:1, which passes WCAG AA only as large text, so keep this at text-2xl.
  return (
    <button
      type="button"
      onClick={openRsvp}
      className={`inline-flex cursor-pointer items-center gap-3 rounded-full bg-tan px-10 py-3.5 text-2xl font-medium text-ivory shadow-sm transition-colors hover:bg-tan-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-dark ${className}`}
    >
      RSVP Now
      <ArrowRightIcon className="size-6" />
    </button>
  );
}
