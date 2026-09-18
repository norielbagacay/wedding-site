import { RsvpButton } from "./RsvpButton";
import { Section } from "./Section";

export function Rsvp({ deadline }: { deadline: string }) {
  return (
    <Section id="rsvp" title="RSVP" tone="cream">
      <p className="text-xl">
        Kindly respond by <strong className="font-semibold">{deadline}</strong>.
      </p>
      <RsvpButton className="mt-10" />
    </Section>
  );
}
