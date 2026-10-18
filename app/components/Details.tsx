import type { ReactNode } from "react";
import { coupleNames, wedding, weekday } from "../content";
import { Countdown } from "./Countdown";
import { Divider } from "./Divider";
import { DinnerIcon, PinIcon, RingsIcon } from "./icons";
import { RsvpForm } from "./RsvpForm";

const LABEL = "text-sm tracking-[0.3em] text-gold-dark uppercase";
const SCRIPT = "font-script leading-tight text-gold-dark";
const EVENT_ICONS = { rings: RingsIcon, dinner: DinnerIcon };

type SectionProps = {
  id: string;
  title: string;
  /** Spaced capitals instead of script, as for "RSVP". */
  caps?: boolean;
  subtitle?: ReactNode;
  children: ReactNode;
};

/** A heading with the gilt divider under it, then the section's content. */
function Section({ id, title, caps, subtitle, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="px-6 py-14 sm:py-20">
      <div className="reveal mx-auto max-w-3xl text-center">
        <h2
          id={`${id}-title`}
          className={
            caps
              ? "text-[clamp(2rem,8vw,2.75rem)] tracking-[0.35em] text-gold-dark uppercase"
              : `${SCRIPT} text-[clamp(2.5rem,10vw,3.5rem)]`
          }
        >
          {title}
        </h2>
        <Divider className="mx-auto mt-1 w-40 text-gold" />
        {subtitle && <p className="mt-4 text-xl">{subtitle}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

/** Everything below the hero, in the landing's ivory and gold, one flowing column. */
export function Details() {
  const { date, welcome, events, attire, entourage, rsvp } = wedding;
  return (
    <div className="bg-[radial-gradient(ellipse_at_top,#fdf7ee,transparent_60%),linear-gradient(#f8efe3,#f6ecdf)]">
      <Section id="details" title={welcome.heading}>
        <p className="mx-auto max-w-md text-[1.35rem] leading-relaxed">{welcome.message}</p>
        <p className={`mt-10 ${LABEL}`}>{weekday}</p>
        <p className="mt-2 text-4xl tracking-wide">
          <time dateTime={date.iso}>{date.display}</time>
        </p>
      </Section>

      <Section id="countdown" title="Counting down to forever">
        <Countdown target={wedding.startsAt} />
      </Section>

      <Section id="schedule" title="Order of the Day">
        <ol className="mx-auto w-fit space-y-10">
          {events.map((event) => {
            const Icon = EVENT_ICONS[event.icon];
            return (
              <li key={event.name} className="grid grid-cols-[3rem_auto] items-center gap-6">
                <Icon className="size-12 text-gold" />
                {/* A gilt line with a bead, like a timeline. */}
                <div className="relative border-l border-gold/50 py-2 pl-7 text-left">
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -left-[5px] size-[9px] -translate-y-1/2 rotate-45 bg-gold"
                  />
                  <h3 className={`${SCRIPT} text-[2.25rem]`}>{event.name}</h3>
                  <p className="mt-1 text-2xl tracking-[0.15em]">{event.time}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section id="venues" title="Where to Find Us">
        <ul className="space-y-14">
          {events.map((event, i) => (
            <li key={event.name}>
              {i > 0 && <Divider className="mx-auto -mt-4 mb-10 w-24 text-gold/70" />}
              <p className={LABEL}>{event.name}</p>
              <h3 className={`${SCRIPT} mt-2 text-[clamp(2.25rem,9vw,3rem)]`}>{event.venue}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed tracking-[0.2em] uppercase">
                {event.address}
              </p>
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-ivory/70 px-7 py-2.5 text-sm tracking-[0.25em] text-gold-dark uppercase shadow-[0_6px_16px_-10px_rgb(80_60_40/0.5)] transition-colors hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-dark"
              >
                <PinIcon className="size-4" />
                View location
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="attire" title="Dress Code" subtitle={attire.theme}>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-5">
          {attire.palette.map(({ name, color }) => (
            <li key={name} className="flex w-20 flex-col items-center gap-2">
              <span
                aria-hidden="true"
                className="size-14 rounded-full border-2 border-ivory shadow-[0_0_0_1px_rgb(185_138_76/0.5),0_8px_16px_-8px_rgb(80_60_40/0.4)]"
                style={{ background: color }}
              />
              <span className="text-base">{name}</span>
            </li>
          ))}
        </ul>
        <dl className="mx-auto mt-12 grid max-w-2xl gap-8 sm:grid-cols-2">
          {attire.guides.map(({ who, text }) => (
            <div key={who}>
              <dt className={LABEL}>{who}</dt>
              <dd className="mt-2 text-xl">{text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-lg italic">{attire.note}</p>
      </Section>

      <Section id="entourage" title="The Entourage" subtitle="Standing beside us on our day">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {entourage.map(({ group, names }) => (
            <div key={group}>
              <h3 className={LABEL}>{group}</h3>
              <ul className="mt-3 space-y-1 text-xl">
                {names.map((name, i) => (
                  <li key={i}>{name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="rsvp" title="RSVP" caps subtitle={`Kindly reply by ${rsvp.by}`}>
        <RsvpForm form={rsvp.googleForm} />
      </Section>

      <footer className="px-6 pt-14 pb-20 text-center">
        <p className="text-2xl italic">With love,</p>
        <p className={`${SCRIPT} mt-1 text-[clamp(2.75rem,11vw,3.75rem)]`}>{coupleNames}</p>
        <p className="mt-2 text-lg text-gold-dark">{wedding.hashtag}</p>
      </footer>
    </div>
  );
}
