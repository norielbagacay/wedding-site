# Rosher & Genesis Wedding Invitation Page: Design

Date: 2026-09-18
Status: Approved

## Goal

A single-page wedding invitation site for Rosher & Genesis. Guests open it from a shared link (mostly on phones). It invites them, gives them the schedule, venues, entourage and FAQ, and sends them to a Google Form to RSVP.

The visual reference is the mockup the couple supplied: a watercolor beach painting of the couple, a cream header with a monogram and line icons, script and serif type in warm taupe, and a tan pill RSVP button.

## Decisions

| Topic | Decision |
|---|---|
| Structure | One page, sections reached by anchor links from header icons |
| Rendering | Server components only; no client JavaScript |
| RSVP | External Google Form (link opens in a new tab); no backend |
| Content | All copy lives in `app/content.ts`, prefilled with sample values |
| Background | `public/bg.jpg`, supplied by the couple (clean painting, no text) |
| Theme | Light only; no dark mode |

Rejected: Framer Motion (a dependency for little gain), one route per section (guests would have to tap around instead of scrolling).

## Visual system

- **Fonts** (via `next/font/google`): Great Vibes for script headings; Cormorant Garamond (400, 500, 600, plus italic) for everything else.
- **Colors:**
  - `cream` `#f8f3ec`: header and page background
  - `sand` `#efe6da`: alternate section background
  - `taupe` `#6f5a48`: body text
  - `taupe-soft` `#76604f`: secondary text (darkened from `#8b7564` so it passes AA on `sand`)
  - `tan` `#a48660`: button and accents
  - `tan-dark` `#8d704c`: button hover
  - `ivory` `#fffaf2`: button text
- **Hero wash:** a vertical cream gradient over the painting (about 35% opacity at the edges and 55% behind the text) so taupe text passes WCAG AA contrast.
- **Motion:** sections fade and rise in on scroll using CSS scroll-driven animations (`animation-timeline: view()`), only inside `@supports` and `prefers-reduced-motion: no-preference`. Browsers without support show the content immediately.
- **Scrolling:** `scroll-behavior: smooth` on `html` (reduced-motion users excluded); each section has `scroll-margin-top` equal to the header height.

## Page layout

Section backgrounds alternate to separate them: Our Story `cream`, Schedule `sand`, Entourage `cream`, RSVP `sand`, Details `cream`, footer `sand`.

### Header (sticky, cream, 64px tall)
- Left: "RG" monogram, overlapping serif letters in a thin tan circle with a small leaf sprig (inline SVG). Links to `#top`.
- Right: five line icons (inline SVG, 1.5px stroke, taupe). Each has an `aria-label`; the label is visible beside the icon from the `md` breakpoint up.

| Icon | Label | Target |
|---|---|---|
| Heart | Our Story | `#story` |
| Clock | Schedule | `#schedule` |
| People | Entourage | `#entourage` |
| Clipboard | RSVP | `#rsvp` |
| Info | Details | `#details` |

### Hero (`#top`, fills the viewport below the header, `100svh` minus 64px)
- Background: `next/image` with `fill`, `src="/bg.jpg"`, `sizes="100vw"`, `loading="eager"`, `fetchPriority="high"`, `object-cover`, `alt=""` (decorative). Next 16 deprecates `priority`, so it is not used.
- Underneath the image: a sand-to-cream gradient, so the hero still looks intentional if `bg.jpg` is missing.
- Centered stack:
  1. "You're Invited" (script)
  2. "to the wedding of" (serif)
  3. "Rosher & Genesis" (large script)
  4. Display date, e.g. "December 12, 2026" (serif)
  5. **Click to RSVP! →**: tan pill button linking to the RSVP form
  6. "Scroll down to check details." (italic serif) with a chevron linking to `#story`

### Our Story (`#story`)
Script heading, then two or three short story beats from `content.story` (title plus paragraph), stacked on mobile and in a row on desktop.

### Schedule & Venue (`#schedule`)
One card per event in `content.events` (sample: Ceremony, Reception). Each card shows the name, time, venue name, address, and a "View map" link (`mapUrl`, new tab).

### Entourage (`#entourage`)
Groups from `content.entourage` (sample: Principal Sponsors, Best Man & Maid of Honor, Groomsmen, Bridesmaids). Each group has a small-caps label over centered names, two columns from `sm` up.

### RSVP (`#rsvp`)
Short line, "Kindly respond by {deadline}.", and the same RSVP button as the hero.

### Details & FAQ (`#details`)
Items from `content.faqs` rendered as native `<details>`/`<summary>` accordions (sample: dress code, gifts, parking, kids, plus-ones).

### Footer
The monogram, "Rosher & Genesis · {display date}", and `hashtag` (only when it is non-empty).

## Content model (`app/content.ts`)

```ts
export const wedding = {
  siteUrl: "http://localhost:3000", // set to the real URL after deploying
  couple: { first: "Rosher", second: "Genesis", monogram: ["R", "G"] },
  date: { display: "December 12, 2026", iso: "2026-12-12" },
  hashtag: "#RosherAndGenesis",
  rsvp: { formUrl: "", deadline: "November 12, 2026" },
  story: [{ title: string, text: string }],
  events: [{ name, time, venue, address, mapUrl }],
  entourage: [{ group: string, names: string[] }],
  faqs: [{ question: string, answer: string }],
};
```

Sample values are realistic but obviously generic (for example "Sample Chapel, 123 Placeholder St."), and the file opens with a comment listing what to replace.

## Components (`app/components/`)

Each file does one thing and takes its data as props from `page.tsx`:

- `SiteHeader.tsx`: header, monogram link, and icon nav
- `Monogram.tsx`: the RG mark, reused in the header and footer
- `icons.tsx`: the five nav icons plus arrow and chevron, all inline SVG
- `Section.tsx`: wrapper that renders the `<section id>`, script heading, optional subtitle, background variant, and reveal class
- `RsvpButton.tsx`: the pill button (see edge cases)
- `Hero.tsx`, `OurStory.tsx`, `Schedule.tsx`, `Entourage.tsx`, `Rsvp.tsx`, `Faq.tsx`, `SiteFooter.tsx`

`app/page.tsx` imports `wedding` and composes the components in the order above. `app/layout.tsx` loads the fonts and sets the metadata. `app/globals.css` holds the Tailwind v4 `@theme` tokens, smooth scrolling, and the reveal animation.

## Metadata

- `metadataBase: new URL(wedding.siteUrl)` (a relative Open Graph image without it is a build error in this Next version)
- Title: "Rosher & Genesis · Wedding Invitation"
- Description: "You're invited to celebrate the wedding of Rosher & Genesis on {display date}."
- Open Graph and Twitter image: `/bg.jpg`, so a shared link previews with the painting

## Edge cases

- **`bg.jpg` missing:** the gradient under the image shows through; `alt=""` prevents a broken-image label.
- **`rsvp.formUrl` empty:** `RsvpButton` links to `#rsvp` instead of an external URL, and the RSVP section reads "The RSVP form will be available soon." Once a URL is set, the button opens it in a new tab with `rel="noopener noreferrer"`.
- **Long names or many entourage entries:** text wraps; lists flow into two columns from `sm` up.

## Cleanup

Remove the create-next-app leftovers: the starter page markup, the Geist fonts, the dark-mode CSS variables, and the unused SVGs in `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).

## Verification

1. `npm run lint` passes.
2. `npm run build` passes.
3. With the dev server running, headless Edge screenshots at 390×844 (phone) and 1440×900 (desktop) are compared against the mockup: hero layout, header icons, fonts, colors, button.
4. Anchor links from each header icon land on the right section below the sticky header.
5. With `formUrl` empty, the RSVP buttons go to `#rsvp`; with a URL set, they open it in a new tab.

## Out of scope

Photo gallery, countdown timer, on-site RSVP storage, guest-specific links, multiple languages, music.
