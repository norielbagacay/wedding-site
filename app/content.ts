/**
 * Everything guests read on the invitation lives in this file.
 *
 * Before sharing the link:
 * - Replace every value that says "Sample".
 * - Set `siteUrl` to the deployed address (used for link previews).
 * - Keep `date.display` and `date.iso` on the same day (`npm test` checks this).
 * - Connect the RSVP pop-up to a Google Form (until then it says online RSVP opens soon):
 *   1. Create a Google Form with four questions: "Name" (short answer), "Will you attend?"
 *      (multiple choice with exactly "Joyfully accept" and "Regretfully decline"),
 *      "Number of guests" (short answer), and "Message" (paragraph).
 *   2. In the form's ⋮ menu choose "Get pre-filled link", type anything in each question,
 *      and click "Get link". The link looks like
 *      https://docs.google.com/forms/d/e/<formId>/viewform?...&entry.111=...&entry.222=...
 *   3. Copy <formId> and each question's entry.<number> into `rsvp.googleForm` below.
 */

import type { GoogleFormConfig } from "./lib/rsvp";

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

export type DressCode = {
  theme: string;
  /** Motif colors shown as swatches; `color` is any CSS color. */
  palette: { name: string; color: string }[];
  guides: { who: string; text: string }[];
  note: string;
};

export type Wedding = {
  siteUrl: string;
  couple: { first: string; second: string; monogram: [string, string] };
  date: { display: string; iso: string };
  /** The wording on the invitation card revealed when the curtains open. */
  invitation: { opening: string; request: string };
  hashtag: string;
  rsvp: { deadline: string; googleForm: GoogleFormConfig };
  story: StoryBeat[];
  events: WeddingEvent[];
  attire: DressCode;
  entourage: EntourageGroup[];
  faqs: FaqItem[];
};

export const wedding: Wedding = {
  siteUrl: "https://genesis-and-rosher.vercel.app",
  couple: { first: "Genesis", second: "Rosher", monogram: ["G", "R"] },
  date: { display: "May 9, 2027", iso: "2027-05-09" },
  invitation: {
    opening: "Together with their families",
    request: "request the honor of your presence at the celebration of their marriage",
  },
  hashtag: "#GenesisAndRosher",
  rsvp: {
    deadline: "April 9, 2027",
    googleForm: {
      formId: "",
      fields: { name: "", attending: "", guests: "", message: "" },
    },
  },
  story: [
    {
      title: "How we met",
      text: "Sample: a few sentences about the day Genesis and Rosher first crossed paths.",
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
  attire: {
    theme: "Garden by the Sea",
    palette: [
      { name: "Dusty Rose", color: "#d9a39a" },
      { name: "Peach", color: "#efc3a1" },
      { name: "Sage", color: "#9fb08f" },
      { name: "Champagne", color: "#e9d8bd" },
      { name: "Taupe", color: "#a48660" },
    ],
    guides: [
      {
        who: "Gentlemen",
        text: "Sample: long-sleeved polo or barong in cream or beige, with light-colored trousers.",
      },
      {
        who: "Ladies",
        text: "Sample: a long dress or cocktail dress in any of our motif colors.",
      },
    ],
    note: "Kindly avoid wearing white, which is reserved for the bride.",
  },
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

/** e.g. "G & R", shown on the closed curtains. */
export const coupleInitials = wedding.couple.monogram.join(" & ");

/** e.g. "Sunday", derived from `date.iso`. */
export const weekday = new Date(`${wedding.date.iso}T00:00:00Z`).toLocaleDateString("en-US", {
  weekday: "long",
  timeZone: "UTC",
});
