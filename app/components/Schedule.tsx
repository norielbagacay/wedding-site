import type { WeddingEvent } from "../content";
import { ArrowRightIcon } from "./icons";
import { Section } from "./Section";

type ScheduleProps = { events: WeddingEvent[]; dateDisplay: string };

export function Schedule({ events, dateDisplay }: ScheduleProps) {
  return (
    <Section id="schedule" title="Schedule & Venue" subtitle={dateDisplay} tone="sand">
      <ul className="grid gap-6 sm:grid-cols-2">
        {events.map((event) => (
          <li
            key={event.name}
            className="rounded-3xl border border-tan/20 bg-cream px-6 py-10 shadow-sm"
          >
            <h3 className="font-script text-4xl text-tan">{event.name}</h3>
            <p className="mt-3 text-2xl font-medium">{event.time}</p>
            <p className="mt-5 font-semibold">{event.venue}</p>
            <p className="text-taupe-soft">{event.address}</p>
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border-b border-tan/50 pb-0.5 text-tan-dark transition-colors hover:border-tan-dark"
            >
              View map
              <span className="sr-only"> for {event.venue} (opens in a new tab)</span>
              <ArrowRightIcon className="size-4" />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
