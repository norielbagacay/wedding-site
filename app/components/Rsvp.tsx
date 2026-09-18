import { rsvpLink } from "../lib/rsvp";
import { RsvpButton } from "./RsvpButton";
import { Section } from "./Section";

export function Rsvp({ formUrl, deadline }: { formUrl: string; deadline: string }) {
  const formIsReady = rsvpLink(formUrl).external;
  return (
    <Section id="rsvp" title="RSVP" tone="sand">
      <p className="text-xl">
        Kindly respond by <strong className="font-semibold">{deadline}</strong>.
      </p>
      {formIsReady ? (
        <RsvpButton formUrl={formUrl} className="mt-10" />
      ) : (
        <p className="mt-6 text-taupe-soft italic">The RSVP form will be available soon.</p>
      )}
    </Section>
  );
}
