import { existsSync } from "node:fs";
import { join } from "node:path";
import { Attire } from "./components/Attire";
import { Entourage } from "./components/Entourage";
import { Envelope } from "./components/Envelope";
import { Faq } from "./components/Faq";
import { Hero } from "./components/Hero";
import { InvitationCard } from "./components/InvitationCard";
import { OurStory } from "./components/OurStory";
import { Rsvp } from "./components/Rsvp";
import { RsvpProvider } from "./components/RsvpProvider";
import { Schedule } from "./components/Schedule";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { coupleNames, wedding, weekday } from "./content";

export default function Home() {
  const { couple, date, rsvp } = wedding;
  // Chrome draws a broken-image icon even with alt="", so only use the painting once it exists.
  const backgroundSrc = existsSync(join(process.cwd(), "public", "bg.jpg")) ? "/bg.jpg" : undefined;
  return (
    <Envelope
      backgroundSrc={backgroundSrc}
      monogram={couple.monogram}
      names={coupleNames}
      dateDisplay={date.display}
      card={
        <InvitationCard
          opening={wedding.invitation.opening}
          names={coupleNames}
          request={wedding.invitation.request}
          weekday={weekday}
          dateDisplay={date.display}
          dateIso={date.iso}
          events={wedding.events}
          deadline={rsvp.deadline}
        />
      }
    >
      <RsvpProvider form={rsvp.googleForm} deadline={rsvp.deadline}>
        <SiteHeader monogram={couple.monogram} />
        <main>
          <Hero
            backgroundSrc={backgroundSrc}
            names={coupleNames}
            dateDisplay={date.display}
            dateIso={date.iso}
          />
          <OurStory beats={wedding.story} />
          <Schedule events={wedding.events} dateDisplay={date.display} />
          <Attire attire={wedding.attire} />
          <Entourage groups={wedding.entourage} />
          <Rsvp deadline={rsvp.deadline} />
          <Faq faqs={wedding.faqs} />
        </main>
        <SiteFooter
          monogram={couple.monogram}
          names={coupleNames}
          dateDisplay={date.display}
          hashtag={wedding.hashtag}
        />
      </RsvpProvider>
    </Envelope>
  );
}
