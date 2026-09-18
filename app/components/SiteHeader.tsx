import { Monogram } from "./Monogram";
import { ClipboardIcon, ClockIcon, HeartIcon, InfoIcon, PeopleIcon } from "./icons";

const NAV = [
  { href: "#story", label: "Our Story", Icon: HeartIcon },
  { href: "#schedule", label: "Schedule", Icon: ClockIcon },
  { href: "#entourage", label: "Entourage", Icon: PeopleIcon },
  { href: "#rsvp", label: "RSVP", Icon: ClipboardIcon },
  { href: "#details", label: "Details", Icon: InfoIcon },
];

export function SiteHeader({ monogram }: { monogram: readonly [string, string] }) {
  return (
    <header className="sticky top-0 z-20 h-(--header-h) border-b border-tan/15 bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          aria-label="Back to top"
          className="rounded-full text-base focus-visible:outline-2 focus-visible:outline-tan-dark"
        >
          <Monogram letters={monogram} />
        </a>
        <nav aria-label="Sections">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  className="flex items-center gap-2 rounded-full p-2 transition-colors hover:bg-tan/10 hover:text-tan-dark focus-visible:outline-2 focus-visible:outline-tan-dark md:px-3"
                >
                  <Icon className="size-6" />
                  <span className="sr-only md:not-sr-only md:text-base md:tracking-wide">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
