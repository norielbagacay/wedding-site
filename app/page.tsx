import { existsSync } from "node:fs";
import { join } from "node:path";
import { Entourage } from "./components/Entourage";
import { Faq } from "./components/Faq";
import { Hero } from "./components/Hero";
import { OurStory } from "./components/OurStory";
import { Rsvp } from "./components/Rsvp";
import { Schedule } from "./components/Schedule";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { coupleNames, wedding } from "./content";

export default function Home() {
  const { couple, date, rsvp } = wedding;
  // Chrome draws a broken-image icon even with alt="", so only use the painting once it exists.
  const hasBackground = existsSync(join(process.cwd(), "public", "bg.jpg"));
  return (
    <>
      <SiteHeader monogram={couple.monogram} />
      <main>
        <Hero
          backgroundSrc={hasBackground ? "/bg.jpg" : undefined}
          names={coupleNames}
          dateDisplay={date.display}
          dateIso={date.iso}
          formUrl={rsvp.formUrl}
        />
        <OurStory beats={wedding.story} />
        <Schedule events={wedding.events} dateDisplay={date.display} />
        <Entourage groups={wedding.entourage} />
        <Rsvp formUrl={rsvp.formUrl} deadline={rsvp.deadline} />
        <Faq faqs={wedding.faqs} />
      </main>
      <SiteFooter
        monogram={couple.monogram}
        names={coupleNames}
        dateDisplay={date.display}
        hashtag={wedding.hashtag}
      />
    </>
  );
}
