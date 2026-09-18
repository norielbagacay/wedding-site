import type { StoryBeat } from "../content";
import { Section } from "./Section";

export function OurStory({ beats }: { beats: StoryBeat[] }) {
  return (
    <Section id="story" title="Our Story" tone="cream">
      <ol className="grid gap-12 md:auto-cols-fr md:grid-flow-col">
        {beats.map((beat, i) => (
          <li key={beat.title}>
            <span className="text-sm tracking-[0.3em] text-tan-dark">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-2xl font-semibold">{beat.title}</h3>
            <p className="mt-3 leading-relaxed text-taupe-soft">{beat.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
