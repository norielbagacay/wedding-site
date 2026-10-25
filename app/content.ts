/**
 * Everything guests read on the site lives in this file.
 *
 * Before sharing the link:
 * - Replace every value that says "Sample".
 * - Set `siteUrl` to the deployed address (used for link previews).
 * - Keep `date`, and the day in `startsAt`, on the wedding day (`npm test` checks this).
 * - Connect the RSVP form to a Google Form (until then it says online RSVP opens soon):
 *   1. Create a Google Form with four questions: "Name" (short answer), "Will you attend?"
 *      (multiple choice with exactly "Joyfully accept" and "Regretfully decline"),
 *      "Number of guests" (short answer), and "Message" (paragraph).
 *   2. In the form's ⋮ menu choose "Get pre-filled link", type anything in each question,
 *      and click "Get link". The link looks like
 *      https://docs.google.com/forms/d/e/<formId>/viewform?...&entry.111=...&entry.222=...
 *   3. Copy <formId> and each question's entry.<number> into `rsvp.googleForm` below.
 */

import type { GoogleFormConfig } from "./lib/rsvp";

export type WeddingEvent = {
  name: string;
  /** The line drawing beside it in the schedule. */
  icon: "rings" | "dinner";
  time: string;
  venue: string;
  address: string;
  mapUrl: string;
};

export type EntourageGroup = { group: string; names: string[] };

export type DressCode = {
  theme: string;
  /** Motif colors shown as swatches; `color` is any CSS color. */
  palette: { name: string; color: string }[];
  guides: { who: string; text: string }[];
  note: string;
};

/** One way to send a gift, e.g. a bank account or an e-wallet. */
export type GiftMethod = {
  name: string;
  accountName: string;
  accountNumber: string;
  /** Optional QR code image in public/, e.g. "/gifts/gcash-qr.png". */
  qr?: string;
};

export type Wedding = {
  siteUrl: string;
  couple: { first: string; second: string };
  date: { display: string; iso: string };
  /** When the ceremony begins, with the venue's UTC offset; the countdown runs to this. */
  startsAt: string;
  welcome: { heading: string; message: string };
  rsvp: { by: string; googleForm: GoogleFormConfig };
  hashtags: string[];
  photoSharing: { message: string; qrImage: string };
  gifts: { message: string; methods: GiftMethod[] };
  events: WeddingEvent[];
  attire: DressCode;
  entourage: EntourageGroup[];
};

export const wedding: Wedding = {
  siteUrl: "https://genesis-and-rosher.vercel.app",
  couple: { first: "Genesis", second: "Rosher" },
  date: { display: "May 18, 2027", iso: "2027-05-18" },
  startsAt: "2027-05-18T15:00:00+08:00",
  welcome: {
    heading: "With joyful hearts",
    message:
      "Together with our families, we invite you to share in the day our two lives become one. Having you with us would make our celebration complete.",
  },
  rsvp: {
    by: "April 18, 2027",
    googleForm: {
      formId: "",
      fields: { name: "", attending: "", guests: "", message: "" },
    },
  },
  hashtags: ["#GENtlyROSHingIntoForever", "#GENuineLoveForROSH"],
  photoSharing: {
    message:
      "After our unplugged ceremony, help us capture and share our precious moments using our official wedding hashtags.",
    /** Add your photo upload QR image to public/ and enter its path, e.g. /photos/upload-qr.png. */
    qrImage: "",
  },
  gifts: {
    message:
      "The most important gift to us is your prayer and presence on our special day. But if you wish to bless us in some other way, we would love a monetary gift to put in our pot for our journey after tying the knot.",
    methods: [
      { name: "GCash", accountName: "Sample Name", accountNumber: "0917 000 0000" },
      { name: "BDO Savings", accountName: "Sample Name", accountNumber: "0000 0000 0000" },
    ],
  },
  events: [
    {
      name: "Ceremony",
      icon: "rings",
      time: "3:00 PM",
      venue: "Sample Chapel",
      address: "123 Placeholder St., Sample City",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Sample+Chapel",
    },
    {
      name: "Reception",
      icon: "dinner",
      time: "6:00 PM",
      venue: "Sample Garden Pavilion",
      address: "456 Example Ave., Sample City",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Sample+Garden+Pavilion",
    },
  ],
  attire: {
    theme: "Ivory & Gold",
    palette: [
      { name: "Ivory", color: "#fbf3e6" },
      { name: "Champagne", color: "#e9d4b4" },
      { name: "Blush", color: "#e8c4b8" },
      { name: "Gold", color: "#c99a55" },
      { name: "Taupe", color: "#8a6f58" },
    ],
    guides: [
      {
        who: "Gentlemen",
        text: "Sample: a dark suit or barong with light trousers.",
      },
      {
        who: "Ladies",
        text: "Sample: a long gown or cocktail dress in any of our motif colors.",
      },
    ],
    note: "Kindly avoid wearing white, which is reserved for the bride.",
  },
  entourage: [
    { group: "Parents of the Groom", names: ["Sample Father", "Sample Mother"] },
    { group: "Parents of the Bride", names: ["Sample Father", "Sample Mother"] },
    {
      group: "Principal Sponsors",
      names: ["Sample Sponsor 1", "Sample Sponsor 2", "Sample Sponsor 3", "Sample Sponsor 4"],
    },
    { group: "Best Man", names: ["Sample Best Man"] },
    { group: "Maid of Honor", names: ["Sample Maid of Honor"] },
    {
      group: "Groomsmen",
      names: ["Sample Groomsman 1", "Sample Groomsman 2", "Sample Groomsman 3"],
    },
    {
      group: "Bridesmaids",
      names: ["Sample Bridesmaid 1", "Sample Bridesmaid 2", "Sample Bridesmaid 3"],
    },
  ],
};

export const coupleNames = `${wedding.couple.first} & ${wedding.couple.second}`;

/** e.g. "May", derived from `date.iso`; written over the hero, which shows the day and year. */
export const month = new Date(`${wedding.date.iso}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  timeZone: "UTC",
});

/** e.g. "Sunday", derived from `date.iso`. */
export const weekday = new Date(`${wedding.date.iso}T00:00:00Z`).toLocaleDateString("en-US", {
  weekday: "long",
  timeZone: "UTC",
});
