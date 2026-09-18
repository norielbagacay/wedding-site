import type { DressCode } from "../content";
import { FloralCorner } from "./Florals";
import { Section } from "./Section";

export function Attire({ attire }: { attire: DressCode }) {
  return (
    <Section id="attire" title="Attire & Theme" subtitle={attire.theme} tone="cream">
      <h3 className="text-sm font-semibold tracking-[0.3em] text-tan-dark uppercase">
        Color motif
      </h3>
      <ul className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-6">
        {attire.palette.map(({ name, color }) => (
          <li key={name} className="flex w-24 flex-col items-center gap-2">
            <span
              className="size-16 rounded-full shadow-md ring-4 ring-ivory"
              style={{ backgroundColor: color }}
            />
            <span>{name}</span>
          </li>
        ))}
      </ul>

      <ul className="mt-14 grid gap-8 sm:grid-cols-2">
        {attire.guides.map(({ who, text }, i) => (
          <li
            key={who}
            className="relative rounded-3xl border border-tan/20 bg-ivory px-6 py-10 shadow-sm"
          >
            <FloralCorner
              idPrefix={`attire-${i}`}
              className={`pointer-events-none absolute -top-6 w-24 ${i % 2 ? "-right-6 -scale-x-100" : "-left-6"}`}
            />
            <h3 className="font-script text-4xl text-tan">{who}</h3>
            <p className="mt-3 leading-relaxed text-taupe-soft">{text}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-lg italic">{attire.note}</p>
    </Section>
  );
}
