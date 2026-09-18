import type { ReactNode } from "react";

const TONES = { cream: "bg-cream", sand: "bg-sand" } as const;

type SectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  tone: keyof typeof TONES;
  children: ReactNode;
};

export function Section({ id, title, subtitle, tone, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={`${TONES[tone]} px-6 py-20 sm:py-28`}>
      <div className="reveal mx-auto max-w-4xl text-center">
        <h2 id={headingId} className="font-script text-5xl sm:text-6xl">
          {title}
        </h2>
        {subtitle && <p className="mt-3 text-xl text-taupe-soft italic">{subtitle}</p>}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
