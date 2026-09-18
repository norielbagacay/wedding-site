import { LeafIcon } from "./icons";

type MonogramProps = {
  letters: readonly [string, string];
  /** Size it with a text-size class; the mark scales with font size. */
  className?: string;
};

export function Monogram({ letters: [first, second], className = "" }: MonogramProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex size-[2.75em] items-center justify-center rounded-full border border-tan/50 font-serif text-tan ${className}`}
    >
      <span className="-mr-[0.1em] -translate-y-[0.12em] text-[1.4em] leading-none">{first}</span>
      <span className="translate-y-[0.12em] text-[1.4em] leading-none">{second}</span>
      <LeafIcon className="absolute top-[0.2em] right-[0.15em] size-[0.9em] text-tan/70" />
    </span>
  );
}
