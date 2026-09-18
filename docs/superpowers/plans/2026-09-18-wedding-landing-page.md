# Rosher & Genesis Wedding Invitation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the create-next-app starter with a single-page wedding invitation for Rosher & Genesis. It is styled after the couple's mockup, and RSVPs go to a Google Form.

**Architecture:** One static page built from React server components, with no client JavaScript. All copy lives in `app/content.ts`, and `app/page.tsx` passes it to the section components as props. Styling uses Tailwind v4, with theme tokens in `app/globals.css`. The only logic is the RSVP link fallback and the content sanity checks, and both are unit-tested with Node's built-in test runner.

**Tech Stack:** Next.js 16.3 (App Router), React 19.2, Tailwind CSS 4.3, TypeScript 5.9, `next/font/google`, `next/image`, and `node:test` on Node 25 (which runs `.ts` files directly).

**Spec:** `docs/superpowers/specs/2026-09-18-wedding-landing-page-design.md`

---

## Ground rules for this repo

- **This Next.js is newer than most docs you know.** When unsure of an API, read `node_modules/next/dist/docs/`. Differences this plan relies on:
  - `<Image priority>` is deprecated. Use `loading="eager"` with `fetchPriority="high"`.
  - A relative Open Graph image with no `metadataBase` fails the build.
  - `LayoutProps<"/">` is a generated global type, so run `npx next typegen` before `npx tsc`.
- **Shell:** run commands in Git Bash from the repo root (`C:\project\wedding`). In PowerShell, `npm` and `npx` are blocked by the execution policy, so use `npm.cmd` and `npx.cmd` there.
- **Import extensions:** tests import app modules *with* the `.ts` extension, because Node needs it. App code imports *without* it.
- **Testing split:** UI components are verified by typecheck, lint, build, and screenshots, not unit tests. There's no DOM test setup, and adding one isn't worth it for static markup.
- **Dev server:** one may already be listening on port 3000 (the user's). Reuse it. Check with `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/`. If that doesn't print `200`, start `npm run dev` in the background.
- **Screenshots** use headless Edge. Run this in **PowerShell** once per session to define the helper, then call `Shot`:

```powershell
$out = "$env:TEMP\wedding-shots"
New-Item -ItemType Directory -Force $out | Out-Null
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
function Shot($name, $size, $path) {
  Start-Process -FilePath $edge -Wait -NoNewWindow -ArgumentList @(
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-prefers-reduced-motion",
    "--user-data-dir=$out\profile", "--window-size=$size", "--virtual-time-budget=5000",
    "--screenshot=$out\$name.png", "http://localhost:3000/$path")
}
```

  Screenshots land in `%TEMP%\wedding-shots\`. Open the PNGs to look at them. Reduced motion is forced so anchor jumps are instant and the reveal animation doesn't catch sections mid-fade.

## File map

| File | Responsibility |
|---|---|
| `app/content.ts` | All guest-facing copy, its types, and `coupleNames` |
| `app/lib/rsvp.ts` | `rsvpLink()`: where RSVP buttons point |
| `app/components/icons.tsx` | Inline SVG icons |
| `app/components/Monogram.tsx` | The RG mark, used in the header and footer |
| `app/components/Section.tsx` | Section wrapper: id, heading, background tone, reveal animation |
| `app/components/RsvpButton.tsx` | Tan pill RSVP link |
| `app/components/SiteHeader.tsx` | Sticky header with icon nav |
| `app/components/Hero.tsx` | Painting, names, date, RSVP button |
| `app/components/OurStory.tsx`, `Schedule.tsx`, `Entourage.tsx`, `Rsvp.tsx`, `Faq.tsx`, `SiteFooter.tsx` | One section each |
| `app/page.tsx` | Composes the page from `wedding` |
| `app/layout.tsx` | Fonts and metadata |
| `app/globals.css` | Theme tokens, smooth scroll, reveal animation |
| `tests/rsvp.test.ts`, `tests/content.test.ts` | Unit tests |

Deleted: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`.

---

### Task 1: Test runner and `rsvpLink`

**Files:**
- Modify: `tsconfig.json`, `package.json`
- Create: `tests/rsvp.test.ts`, `app/lib/rsvp.ts`

- [ ] **Step 1: Let TypeScript accept `.ts` import paths**

Tests import `../app/lib/rsvp.ts`. Without this flag, `tsc` rejects that path. The flag is allowed because `noEmit` is already on.

Run:
```bash
sed -i 's/"noEmit": true,/"noEmit": true,\n    "allowImportingTsExtensions": true,/' tsconfig.json && grep -n -A1 '"noEmit"' tsconfig.json
```
Expected:
```
8:    "noEmit": true,
9-    "allowImportingTsExtensions": true,
```

- [ ] **Step 2: Add the `test` script**

In `package.json`, make `scripts` read exactly:
```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "node --test \"tests/**/*.test.ts\""
  },
```

- [ ] **Step 3: Write the failing test**

Create `tests/rsvp.test.ts`:
```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { rsvpLink } from "../app/lib/rsvp.ts";

test("points to the RSVP section when no form URL is set", () => {
  assert.deepEqual(rsvpLink(""), { href: "#rsvp", external: false });
});

test("treats a whitespace-only form URL as unset", () => {
  assert.deepEqual(rsvpLink("   "), { href: "#rsvp", external: false });
});

test("points to the trimmed form URL when one is set", () => {
  assert.deepEqual(rsvpLink(" https://forms.gle/abc123 "), {
    href: "https://forms.gle/abc123",
    external: true,
  });
});
```

- [ ] **Step 4: Run it and watch it fail**

Run: `npm test`
Expected: FAIL. The output contains `ERR_MODULE_NOT_FOUND` and `app/lib/rsvp.ts`, and ends with `ℹ fail 1` (the file fails to load).

- [ ] **Step 5: Implement `rsvpLink`**

Create `app/lib/rsvp.ts`:
```ts
export type RsvpLink = { href: string; external: boolean };

/**
 * Where RSVP buttons point: the Google Form once its URL is set,
 * otherwise the RSVP section on this page.
 */
export function rsvpLink(formUrl: string): RsvpLink {
  const url = formUrl.trim();
  return url ? { href: url, external: true } : { href: "#rsvp", external: false };
}
```

- [ ] **Step 6: Run the tests and watch them pass**

Run: `npm test`
Expected: `ℹ tests 3`, `ℹ pass 3`, `ℹ fail 0`.

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json package.json tests/rsvp.test.ts app/lib/rsvp.ts
git commit -F - <<'EOF'
Add node:test runner and rsvpLink with tests

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: Content module

**Files:**
- Create: `tests/content.test.ts`, `app/content.ts`

- [ ] **Step 1: Write the failing test**

These tests catch the mistakes the couple is most likely to make when editing `content.ts`.

Create `tests/content.test.ts`:
```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { wedding } from "../app/content.ts";

test("the display date and the ISO date are the same day", () => {
  const fromIso = new Date(`${wedding.date.iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  assert.equal(wedding.date.display, fromIso);
});

test("siteUrl is an absolute http(s) URL", () => {
  assert.match(new URL(wedding.siteUrl).protocol, /^https?:$/);
});

test("the RSVP form URL is empty or https", () => {
  const url = wedding.rsvp.formUrl.trim();
  if (url) assert.equal(new URL(url).protocol, "https:");
});

test("every event has an https map link", () => {
  for (const event of wedding.events) {
    assert.equal(new URL(event.mapUrl).protocol, "https:", event.name);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `app/content.ts`. The 3 rsvp tests still pass.

- [ ] **Step 3: Write the content module**

Create `app/content.ts`:
```ts
/**
 * Everything guests read on the invitation lives in this file.
 *
 * Before sharing the link:
 * - Replace every value that says "Sample".
 * - Set `siteUrl` to the deployed address (used for link previews).
 * - Keep `date.display` and `date.iso` on the same day (`npm test` checks this).
 * - Paste the Google Form link into `rsvp.formUrl`. While it's empty, the RSVP
 *   buttons scroll to the RSVP section, which says the form is coming soon.
 */

export type StoryBeat = { title: string; text: string };

export type WeddingEvent = {
  name: string;
  time: string;
  venue: string;
  address: string;
  mapUrl: string;
};

export type EntourageGroup = { group: string; names: string[] };

export type FaqItem = { question: string; answer: string };

export type Wedding = {
  siteUrl: string;
  couple: { first: string; second: string; monogram: [string, string] };
  date: { display: string; iso: string };
  hashtag: string;
  rsvp: { formUrl: string; deadline: string };
  story: StoryBeat[];
  events: WeddingEvent[];
  entourage: EntourageGroup[];
  faqs: FaqItem[];
};

export const wedding: Wedding = {
  siteUrl: "http://localhost:3000",
  couple: { first: "Rosher", second: "Genesis", monogram: ["R", "G"] },
  date: { display: "December 12, 2026", iso: "2026-12-12" },
  hashtag: "#RosherAndGenesis",
  rsvp: { formUrl: "", deadline: "November 12, 2026" },
  story: [
    {
      title: "How we met",
      text: "Sample: a few sentences about the day Rosher and Genesis first crossed paths.",
    },
    {
      title: "The proposal",
      text: "Sample: where and how the question was asked, and the answer that followed.",
    },
    {
      title: "Forever starts",
      text: "Sample: what the two of you look forward to most as you begin married life.",
    },
  ],
  events: [
    {
      name: "Ceremony",
      time: "3:00 PM",
      venue: "Sample Chapel",
      address: "123 Placeholder St., Sample City",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Sample+Chapel",
    },
    {
      name: "Reception",
      time: "6:00 PM",
      venue: "Sample Garden Pavilion",
      address: "456 Example Ave., Sample City",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Sample+Garden+Pavilion",
    },
  ],
  entourage: [
    {
      group: "Principal Sponsors",
      names: ["Sample Sponsor 1", "Sample Sponsor 2", "Sample Sponsor 3", "Sample Sponsor 4"],
    },
    { group: "Best Man & Maid of Honor", names: ["Sample Best Man", "Sample Maid of Honor"] },
    {
      group: "Groomsmen",
      names: ["Sample Groomsman 1", "Sample Groomsman 2", "Sample Groomsman 3"],
    },
    {
      group: "Bridesmaids",
      names: ["Sample Bridesmaid 1", "Sample Bridesmaid 2", "Sample Bridesmaid 3"],
    },
  ],
  faqs: [
    {
      question: "What should I wear?",
      answer:
        "Sample: formal attire in soft neutrals such as cream, beige, and sage. Please avoid white.",
    },
    {
      question: "Can I bring a plus-one?",
      answer: "Sample: we can only accommodate the guests named on your invitation.",
    },
    {
      question: "Are children welcome?",
      answer: "Sample: we love your little ones, but this will be an adults-only celebration.",
    },
    {
      question: "Is there parking?",
      answer: "Sample: free parking is available at both venues.",
    },
    {
      question: "What about gifts?",
      answer:
        "Sample: your presence is the best gift. If you wish to give, a contribution toward our new home would be appreciated.",
    },
  ],
};

export const coupleNames = `${wedding.couple.first} & ${wedding.couple.second}`;
```

- [ ] **Step 4: Run the tests and watch them pass**

Run: `npm test`
Expected: `ℹ tests 7`, `ℹ pass 7`, `ℹ fail 0`.

- [ ] **Step 5: Commit**

```bash
git add tests/content.test.ts app/content.ts
git commit -F - <<'EOF'
Add wedding content module with sample copy and sanity tests

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: Theme, fonts, and metadata

**Files:**
- Replace: `app/globals.css`, `app/layout.tsx`
- Modify: `docs/superpowers/specs/2026-09-18-wedding-landing-page-design.md` (one color)

- [ ] **Step 1: Replace `app/globals.css`**

`taupe-soft` is `#76604f`, not the spec's `#8b7564`. The spec's value reaches only about 4.2:1 contrast on `sand`, and body text needs 4.5:1 for WCAG AA; `#76604f` reaches 4.8:1 on sand and 5.9:1 on cream.

```css
@import "tailwindcss";

@theme {
  --color-cream: #f8f3ec;
  --color-sand: #efe6da;
  --color-taupe: #6f5a48;
  --color-taupe-soft: #76604f;
  --color-tan: #a48660;
  --color-tan-dark: #8d704c;
  --color-ivory: #fffaf2;
}

@theme inline {
  --font-script: var(--font-great-vibes), cursive;
  --font-serif: var(--font-cormorant), Georgia, serif;
}

:root {
  --header-h: 4rem;
}

@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

/* Keep section headings clear of the sticky header when jumping to an anchor. */
section[id] {
  scroll-margin-top: var(--header-h);
}

/* Fade sections up as they scroll into view. Browsers without scroll-driven
   animations, and reduced-motion users, just see them. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 10rem;
    }
  }
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(1.5rem);
  }
}
```

- [ ] **Step 2: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { coupleNames, wedding } from "./content";
import "./globals.css";

const script = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const title = `${coupleNames} · Wedding Invitation`;
const description = `You're invited to celebrate the wedding of ${coupleNames} on ${wedding.date.display}.`;

export const metadata: Metadata = {
  metadataBase: new URL(wedding.siteUrl),
  title,
  description,
  openGraph: { title, description, type: "website", images: ["/bg.jpg"] },
  twitter: { card: "summary_large_image", title, description, images: ["/bg.jpg"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${script.variable} ${serif.variable} antialiased`}>
      <body className="bg-cream font-serif text-lg text-taupe">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Record the color change in the spec**

```bash
sed -i 's/^  - `taupe-soft` `#8b7564`: secondary text$/  - `taupe-soft` `#76604f`: secondary text (darkened from `#8b7564` so it passes AA on `sand`)/' docs/superpowers/specs/2026-09-18-wedding-landing-page-design.md
grep -n 'taupe-soft' docs/superpowers/specs/2026-09-18-wedding-landing-page-design.md
```
Expected: one line showing `#76604f` and the reason.

- [ ] **Step 4: Typecheck and lint**

Run: `npx next typegen && npx tsc --noEmit && npm run lint`
Expected: typegen finishes without errors, `tsc` prints nothing, and eslint prints no problems. The starter `page.tsx` still compiles, because it only uses Tailwind classes.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx docs/superpowers/specs/2026-09-18-wedding-landing-page-design.md
git commit -F - <<'EOF'
Set up invitation theme, fonts, and metadata

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: Icons and monogram

**Files:**
- Create: `app/components/icons.tsx`, `app/components/Monogram.tsx`

- [ ] **Step 1: Create `app/components/icons.tsx`**

```tsx
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

export function PeopleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 19v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
      <circle cx="5.5" cy="9.5" r="2" />
      <path d="M2 17v-.5A2.5 2.5 0 0 1 4.5 14H6" />
      <circle cx="18.5" cy="9.5" r="2" />
      <path d="M22 17v-.5a2.5 2.5 0 0 0-2.5-2.5H18" />
    </Icon>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" />
      <path d="M9 11h6M9 15h4" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1} {...props}>
      <path d="M5 20C8 15 12 9 18 4" />
      <path d="M8.3 15.2c-2-.2-3.3-1.5-3.5-3.5 2 .1 3.3 1.4 3.5 3.5z" />
      <path d="M11 11.3c.3-2 1.7-3.1 3.7-3.1-.2 2-1.6 3.1-3.7 3.1z" />
      <path d="M13.6 8.2c-1.8-.5-2.7-1.9-2.5-3.7 1.8.5 2.7 1.9 2.5 3.7z" />
    </Icon>
  );
}
```

- [ ] **Step 2: Create `app/components/Monogram.tsx`**

The mark is sized in `em`, so the caller sets its size with a text-size class.

```tsx
import { LeafIcon } from "./icons";

type MonogramProps = {
  letters: readonly [string, string];
  /** Size it with a text-size class; the mark scales with font size. */
  className?: string;
};

export function Monogram({ letters: [first, second], className = "" }: MonogramProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex size-[2.75em] items-center justify-center rounded-full border border-tan/50 font-serif text-tan ${className}`}
    >
      <span className="-mr-[0.1em] -translate-y-[0.12em] text-[1.4em] leading-none">{first}</span>
      <span className="translate-y-[0.12em] text-[1.4em] leading-none">{second}</span>
      <LeafIcon className="absolute top-[0.2em] right-[0.15em] size-[0.9em] text-tan/70" />
    </span>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no output from `tsc`, no eslint problems.

- [ ] **Step 4: Commit**

```bash
git add app/components/icons.tsx app/components/Monogram.tsx
git commit -F - <<'EOF'
Add line icons and RG monogram

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 5: Section wrapper and RSVP button

**Files:**
- Create: `app/components/Section.tsx`, `app/components/RsvpButton.tsx`

- [ ] **Step 1: Create `app/components/Section.tsx`**

```tsx
import type { ReactNode } from "react";

const TONES = { cream: "bg-cream", sand: "bg-sand" } as const;

type SectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  tone: keyof typeof TONES;
  children: ReactNode;
};

export function Section({ id, title, subtitle, tone, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={`${TONES[tone]} px-6 py-20 sm:py-28`}>
      <div className="reveal mx-auto max-w-4xl text-center">
        <h2 id={headingId} className="font-script text-5xl sm:text-6xl">
          {title}
        </h2>
        {subtitle && <p className="mt-3 text-xl text-taupe-soft italic">{subtitle}</p>}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `app/components/RsvpButton.tsx`**

```tsx
import { rsvpLink } from "../lib/rsvp";
import { ArrowRightIcon } from "./icons";

type RsvpButtonProps = { formUrl: string; className?: string };

export function RsvpButton({ formUrl, className = "" }: RsvpButtonProps) {
  const { href, external } = rsvpLink(formUrl);
  // Ivory on tan is 3.3:1, which passes WCAG AA only as large text, so keep this at text-2xl.
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-3 rounded-full bg-tan px-10 py-3.5 text-2xl font-medium text-ivory shadow-sm transition-colors hover:bg-tan-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-dark ${className}`}
    >
      Click to RSVP!
      {external && <span className="sr-only"> (opens in a new tab)</span>}
      <ArrowRightIcon className="size-6" />
    </a>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no output from `tsc`, no eslint problems.

- [ ] **Step 4: Commit**

```bash
git add app/components/Section.tsx app/components/RsvpButton.tsx
git commit -F - <<'EOF'
Add Section wrapper and RsvpButton

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 6: Header, hero, and the new page shell

**Files:**
- Create: `app/components/SiteHeader.tsx`, `app/components/Hero.tsx`
- Replace: `app/page.tsx`
- Delete: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

- [ ] **Step 1: Create `app/components/SiteHeader.tsx`**

On phones the labels are screen-reader-only. From `md` up they show beside the icons.

```tsx
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
```

- [ ] **Step 2: Create `app/components/Hero.tsx`**

```tsx
import Image from "next/image";
import { ChevronDownIcon } from "./icons";
import { RsvpButton } from "./RsvpButton";

type HeroProps = {
  names: string;
  dateDisplay: string;
  dateIso: string;
  formUrl: string;
};

export function Hero({ names, dateDisplay, dateIso, formUrl }: HeroProps) {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col items-center overflow-hidden bg-linear-to-b from-sand via-cream to-sand px-6 pt-16 pb-8 text-center"
    >
      {/* If public/bg.jpg is missing, the section's gradient shows instead. */}
      <Image
        src="/bg.jpg"
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="-z-20 object-cover object-[center_40%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-cream/35 via-cream/55 to-cream/35"
      />

      <div className="flex flex-1 flex-col items-center justify-center [text-shadow:0_0_1.25rem_var(--color-cream)]">
        <p className="font-script text-5xl sm:text-6xl">You&rsquo;re Invited</p>
        <p className="mt-4 text-xl tracking-wide sm:text-2xl">to the wedding of</p>
        <h1 className="mt-2 font-script text-[clamp(2.75rem,12vw,6.5rem)] leading-tight text-balance">
          {names}
        </h1>
        <p className="mt-4 text-2xl tracking-wide sm:text-3xl">
          <time dateTime={dateIso}>{dateDisplay}</time>
        </p>
        <RsvpButton formUrl={formUrl} className="mt-12 [text-shadow:none]" />
      </div>

      <a href="#story" className="mt-12 flex flex-col items-center gap-1 text-lg italic">
        Scroll down to check details.
        <ChevronDownIcon className="size-6" />
      </a>
    </section>
  );
}
```

- [ ] **Step 3: Replace `app/page.tsx` with the header and hero**

```tsx
import { Hero } from "./components/Hero";
import { SiteHeader } from "./components/SiteHeader";
import { coupleNames, wedding } from "./content";

export default function Home() {
  const { couple, date, rsvp } = wedding;
  return (
    <>
      <SiteHeader monogram={couple.monogram} />
      <main>
        <Hero
          names={coupleNames}
          dateDisplay={date.display}
          dateIso={date.iso}
          formUrl={rsvp.formUrl}
        />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Delete the starter SVGs**

Run: `git rm -q public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg && ls public`
Expected: `public` is empty, or contains only `bg.jpg` if the couple has added it.

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no output from `tsc`, no eslint problems.

- [ ] **Step 6: Screenshot phone and desktop**

Make sure the dev server answers on port 3000 (see Ground rules). Then, in PowerShell with the `Shot` helper defined:
```powershell
Shot "t6-phone" "390,844" ""
Shot "t6-desktop" "1440,900" ""
```
Open both PNGs and check them against the mockup:
- A cream header, with the RG monogram in a circle on the left and five line icons on the right. On desktop, a label sits beside each icon.
- "You're Invited", "to the wedding of", "Rosher & Genesis" (large script, on one line on desktop), and "December 12, 2026", stacked and centered.
- A tan pill "Click to RSVP! →" button with ivory text.
- "Scroll down to check details." with a chevron near the bottom of the viewport.
- The painting behind everything if `public/bg.jpg` exists. Otherwise a soft sand/cream gradient, with no broken-image icon.

Fix anything that's off before committing.

- [ ] **Step 7: Commit**

```bash
git add app/components/SiteHeader.tsx app/components/Hero.tsx app/page.tsx
git commit -F - <<'EOF'
Add header and hero, replace starter page

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```
(The SVG deletions were already staged by `git rm`.)

---

### Task 7: Our Story, Schedule & Venue, Entourage

**Files:**
- Create: `app/components/OurStory.tsx`, `app/components/Schedule.tsx`, `app/components/Entourage.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `app/components/OurStory.tsx`**

The beats stack on phones. From `md` up they sit in equal columns, however many beats there are.

```tsx
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
```

- [ ] **Step 2: Create `app/components/Schedule.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `app/components/Entourage.tsx`**

Names wrap into two centered columns from `sm` up. A group with a single name stays centered.

```tsx
import type { EntourageGroup } from "../content";
import { Section } from "./Section";

export function Entourage({ groups }: { groups: EntourageGroup[] }) {
  return (
    <Section id="entourage" title="Entourage" tone="cream">
      <div className="space-y-12">
        {groups.map(({ group, names }) => (
          <div key={group}>
            <h3 className="text-sm font-semibold tracking-[0.3em] text-tan-dark uppercase">
              {group}
            </h3>
            <ul className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-y-2">
              {names.map((name, i) => (
                <li key={i} className="w-full sm:w-1/2">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Add the three sections to `app/page.tsx`**

Replace the file with:
```tsx
import { Entourage } from "./components/Entourage";
import { Hero } from "./components/Hero";
import { OurStory } from "./components/OurStory";
import { Schedule } from "./components/Schedule";
import { SiteHeader } from "./components/SiteHeader";
import { coupleNames, wedding } from "./content";

export default function Home() {
  const { couple, date, rsvp } = wedding;
  return (
    <>
      <SiteHeader monogram={couple.monogram} />
      <main>
        <Hero
          names={coupleNames}
          dateDisplay={date.display}
          dateIso={date.iso}
          formUrl={rsvp.formUrl}
        />
        <OurStory beats={wedding.story} />
        <Schedule events={wedding.events} dateDisplay={date.display} />
        <Entourage groups={wedding.entourage} />
      </main>
    </>
  );
}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no output from `tsc`, no eslint problems.

- [ ] **Step 6: Screenshot the new sections**

```powershell
Shot "t7-phone-story" "390,844" "#story"
Shot "t7-phone-schedule" "390,844" "#schedule"
Shot "t7-desktop-schedule" "1440,900" "#schedule"
Shot "t7-desktop-entourage" "1440,900" "#entourage"
```
Check:
- Each section's script heading sits just below the sticky header, not hidden under it.
- Story beats stack on the phone and form three columns on desktop.
- Two cream schedule cards on a sand background, side by side on desktop, each with a "View map →" link.
- Entourage groups show small uppercase labels over centered names, in two columns on desktop.

If a hash screenshot shows the top of the page instead of the section, the headless browser ignored the fragment. In that case, check the anchor in a normal browser at http://localhost:3000/#schedule instead.

- [ ] **Step 7: Commit**

```bash
git add app/components/OurStory.tsx app/components/Schedule.tsx app/components/Entourage.tsx app/page.tsx
git commit -F - <<'EOF'
Add Our Story, Schedule & Venue, and Entourage sections

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 8: RSVP, Details & FAQ, footer

**Files:**
- Create: `app/components/Rsvp.tsx`, `app/components/Faq.tsx`, `app/components/SiteFooter.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `app/components/Rsvp.tsx`**

While there's no form URL, a button here would only link to this same section, so the section shows a "coming soon" line instead.

```tsx
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
```

- [ ] **Step 2: Create `app/components/Faq.tsx`**

```tsx
import type { FaqItem } from "../content";
import { ChevronDownIcon } from "./icons";
import { Section } from "./Section";

export function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Section id="details" title="Details & FAQ" tone="cream">
      <div className="mx-auto max-w-2xl divide-y divide-tan/20 border-y border-tan/20 text-left">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-medium [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDownIcon className="size-5 shrink-0 text-tan-dark transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 leading-relaxed text-taupe-soft">{answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Create `app/components/SiteFooter.tsx`**

```tsx
import { Monogram } from "./Monogram";

type SiteFooterProps = {
  monogram: readonly [string, string];
  names: string;
  dateDisplay: string;
  hashtag: string;
};

export function SiteFooter({ monogram, names, dateDisplay, hashtag }: SiteFooterProps) {
  return (
    <footer className="bg-sand px-6 py-14 text-center">
      <Monogram letters={monogram} className="text-2xl" />
      <p className="mt-5 text-xl">
        {names} · {dateDisplay}
      </p>
      {hashtag && <p className="mt-2 tracking-wide text-taupe-soft">{hashtag}</p>}
    </footer>
  );
}
```

- [ ] **Step 4: Finish `app/page.tsx`**

Replace the file with:
```tsx
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
  return (
    <>
      <SiteHeader monogram={couple.monogram} />
      <main>
        <Hero
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
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no output from `tsc`, no eslint problems.

- [ ] **Step 6: Screenshot the new sections**

```powershell
Shot "t8-phone-rsvp" "390,844" "#rsvp"
Shot "t8-phone-details" "390,844" "#details"
Shot "t8-desktop-details" "1440,900" "#details"
```
Check:
- The RSVP section, on sand, reads "Kindly respond by **November 12, 2026**." followed by "The RSVP form will be available soon." in italics.
- The FAQ shows five closed questions separated by thin lines, each with a chevron on the right and no default disclosure triangle.
- The footer, on sand, shows the monogram, "Rosher & Genesis · December 12, 2026", and "#RosherAndGenesis". It may be off-screen on the phone shot, which is fine.

- [ ] **Step 7: Commit**

```bash
git add app/components/Rsvp.tsx app/components/Faq.tsx app/components/SiteFooter.tsx app/page.tsx
git commit -F - <<'EOF'
Add RSVP, Details & FAQ, and footer

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 9: Final verification

**Files:** none, unless a check fails.

- [ ] **Step 1: Unit tests**

Run: `npm test`
Expected: `ℹ pass 7`, `ℹ fail 0`.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no problems.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: the build succeeds, and the route table lists `/` as `○ (Static)`. This works while the dev server is running, because Next 16 keeps dev output in `.next/dev`.

- [ ] **Step 4: Check the rendered HTML**

Run:
```bash
html=$(curl -s http://localhost:3000/)
echo "section ids: $(echo "$html" | grep -o 'id="[a-z]*"' | sort -u | tr '\n' ' ')"
echo "new-tab links: $(echo "$html" | grep -o 'target="_blank"' | wc -l)"
echo "links to #rsvp: $(echo "$html" | grep -o 'href="#rsvp"' | wc -l)"
echo "$html" | grep -o '<meta property="og:image" content="[^"]*"'
echo "$html" | grep -o '<title>[^<]*</title>'
```
Expected:
```
section ids: id="details" id="entourage" id="rsvp" id="schedule" id="story" id="top"
new-tab links: 2
links to #rsvp: 2
<meta property="og:image" content="http://localhost:3000/bg.jpg"
<title>Rosher &amp; Genesis · Wedding Invitation</title>
```
(The two new-tab links are the map links. The two `#rsvp` links are the header icon and the hero button, which falls back to `#rsvp` because `formUrl` is empty.)

- [ ] **Step 5: Final screenshots**

```powershell
Shot "final-phone-top" "390,844" ""
Shot "final-desktop-top" "1440,900" ""
Shot "final-phone-schedule" "390,844" "#schedule"
Shot "final-desktop-entourage" "1440,900" "#entourage"
```
Compare `final-phone-top` side by side with the mockup: the header layout, the script/serif pairing, taupe text, the tan pill button, and the scroll hint. Check that nothing overflows horizontally at 390px wide.

- [ ] **Step 6: Commit any fixes**

If Steps 1–5 needed fixes, commit them with a message describing the fix and the `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>` trailer. If nothing changed, there's nothing to commit.
