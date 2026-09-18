import Image from "next/image";
import { ChevronDownIcon } from "./icons";
import { RsvpButton } from "./RsvpButton";

type HeroProps = {
  /** Omit to show the plain gradient (e.g. before public/bg.jpg is added). */
  backgroundSrc?: string;
  names: string;
  dateDisplay: string;
  dateIso: string;
  formUrl: string;
};

export function Hero({ backgroundSrc, names, dateDisplay, dateIso, formUrl }: HeroProps) {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col items-center overflow-hidden bg-linear-to-b from-sand via-cream to-sand px-6 pt-16 pb-8 text-center"
    >
      {backgroundSrc && (
        <Image
          src={backgroundSrc}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="-z-20 object-cover object-[center_40%]"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-cream/35 via-cream/55 to-cream/35"
      />

      <div className="flex flex-1 flex-col items-center justify-center [text-shadow:0_0_1.25rem_var(--color-cream)]">
        <p className="font-script text-5xl sm:text-6xl">You&rsquo;re Invited</p>
        <p className="mt-4 text-xl tracking-wide sm:text-2xl">to the wedding of</p>
        <h1 className="mt-2 font-script text-[clamp(2.75rem,12vw,6.5rem)] leading-tight text-balance">
          {names}
        </h1>
        <p className="mt-4 text-2xl tracking-wide sm:text-3xl">
          <time dateTime={dateIso}>{dateDisplay}</time>
        </p>
        <RsvpButton formUrl={formUrl} className="mt-12 [text-shadow:none]" />
      </div>

      <a href="#story" className="mt-12 flex flex-col items-center gap-1 text-lg italic">
        Scroll down to check details.
        <ChevronDownIcon className="size-6" />
      </a>
    </section>
  );
}
