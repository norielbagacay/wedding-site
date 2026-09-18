"use client";

import { useEffect, useState } from "react";
import { Monogram } from "./Monogram";
import { RsvpButton } from "./RsvpButton";
import {
  ClipboardIcon,
  ClockIcon,
  CloseIcon,
  HangerIcon,
  HeartIcon,
  InfoIcon,
  MenuIcon,
  PeopleIcon,
} from "./icons";

const NAV = [
  { href: "#story", label: "Our Story", Icon: HeartIcon },
  { href: "#schedule", label: "Schedule", Icon: ClockIcon },
  { href: "#attire", label: "Attire", Icon: HangerIcon },
  { href: "#entourage", label: "Entourage", Icon: PeopleIcon },
  { href: "#rsvp", label: "RSVP", Icon: ClipboardIcon },
  { href: "#details", label: "Details", Icon: InfoIcon },
];

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-tan-dark";

/** Full labelled menu on large screens; a hamburger drop-down below `lg`. */
export function SiteHeader({ monogram }: { monogram: readonly [string, string] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 h-(--header-h) border-b border-tan/15 bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="#top"
            aria-label="Back to top"
            onClick={closeMenu}
            className={`rounded-full text-base ${FOCUS_RING}`}
          >
            <Monogram letters={monogram} />
          </a>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-2">
              {NAV.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 tracking-wide transition-colors hover:bg-tan/10 hover:text-tan-dark ${FOCUS_RING}`}
                  >
                    <Icon className="size-6" />
                    <span className="text-base">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className={`-mr-2 cursor-pointer rounded-full p-2 transition-colors hover:bg-tan/10 lg:hidden ${FOCUS_RING}`}
          >
            {menuOpen ? <CloseIcon className="size-7" /> : <MenuIcon className="size-7" />}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Sections"
            className="absolute inset-x-0 top-full max-h-[calc(100svh-var(--header-h))] overflow-y-auto border-b border-tan/15 bg-cream shadow-lg lg:hidden"
          >
            <ul className="mx-auto grid max-w-2xl gap-1 px-4 pt-3 sm:grid-cols-2 sm:px-6">
              {NAV.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={closeMenu}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-xl transition-colors hover:bg-tan/10 hover:text-tan-dark ${FOCUS_RING}`}
                  >
                    <Icon className="size-6 shrink-0 text-tan-dark" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mx-auto max-w-2xl px-4 pt-3 pb-5 sm:px-6" onClick={closeMenu}>
              <RsvpButton className="w-full justify-center" />
            </div>
          </nav>
        )}
      </header>

      {/* Outside the header: its backdrop-blur would trap a fixed child inside the header box. */}
      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={closeMenu}
          className="fixed inset-x-0 top-(--header-h) bottom-0 z-20 bg-taupe/25 lg:hidden"
        />
      )}
    </>
  );
}
