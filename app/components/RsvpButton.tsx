import { rsvpLink } from "../lib/rsvp";
import { ArrowRightIcon } from "./icons";

type RsvpButtonProps = { formUrl: string; className?: string };

export function RsvpButton({ formUrl, className = "" }: RsvpButtonProps) {
  const { href, external } = rsvpLink(formUrl);
  // Ivory on tan is 3.3:1, which passes WCAG AA only as large text, so keep this at text-2xl.
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-3 rounded-full bg-tan px-10 py-3.5 text-2xl font-medium text-ivory shadow-sm transition-colors hover:bg-tan-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-dark ${className}`}
    >
      Click to RSVP!
      {external && <span className="sr-only"> (opens in a new tab)</span>}
      <ArrowRightIcon className="size-6" />
    </a>
  );
}
