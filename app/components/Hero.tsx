import Image from "next/image";
import { FloralCorner } from "./Florals";
import { ChevronDownIcon } from "./icons";
import { RsvpButton } from "./RsvpButton";

type HeroProps = {
  /** Omit to show the plain gradient (e.g. before public/bg.jpg is added). */
  backgroundSrc?: string;
  names: string;
  dateDisplay: string;
  dateIso: string;
};

export function Hero({ backgroundSrc, names, dateDisplay, dateIso }: HeroProps) {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col items-center overflow-hidden bg-linear-to-b from-sand via-cream to-sand px-5 pt-12 pb-8 text-center sm:px-6 sm:pt-16"
    >
      {backgroundSrc && (
        <Image
          src={backgroundSrc}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="-z-20 object-cover object-[center_30%]"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-cream/25 via-cream/45 to-cream/30"
      />
      <FloralCorner
        idPrefix="hero-tr"
        className="pointer-events-none absolute -top-4 -right-6 w-[clamp(8rem,24vw,16rem)] -scale-x-100"
      />
      <FloralCorner
        idPrefix="hero-bl"
        className="pointer-events-none absolute -bottom-6 -left-6 w-[clamp(8rem,24vw,16rem)] -scale-y-100"
      />

      <div className="flex flex-1 flex-col items-center justify-center [text-shadow:0_0_1.25rem_var(--color-cream)]">
        <p className="font-script text-[clamp(2.5rem,11vw,3.75rem)] leading-tight">You&rsquo;re Invited</p>
        <p className="mt-3 text-xl tracking-wide sm:text-2xl">to the wedding of</p>
        <h1 className="mt-2 font-script text-[clamp(2.5rem,12vw,6.5rem)] leading-tight text-balance">
          {names}
        </h1>
        <p className="mt-4 text-2xl tracking-wide sm:text-3xl">
          <time dateTime={dateIso}>{dateDisplay}</time>
        </p>
        <RsvpButton className="mt-12 [text-shadow:none]" />
      </div>

      <a href="#story" className="mt-12 flex flex-col items-center gap-1 text-lg italic">
        Scroll down to check details.
        <ChevronDownIcon className="size-6" />
      </a>
    </section>
  );
}
