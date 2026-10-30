import type { Wedding } from "../content.ts";

type Result = { ok: true; wedding: Wedding } | { ok: false; problems: string[] };

/**
 * Checks content sent from /management before it's saved, and copies out only the
 * fields the site uses. Problems are written for the person editing.
 */
export function parseWedding(input: unknown): Result {
  const problems: string[] = [];

  function obj(value: unknown, label: string): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    problems.push(`${label} is missing.`);
    return {};
  }
  function list(value: unknown, label: string): unknown[] {
    if (Array.isArray(value)) return value;
    problems.push(`${label} is missing.`);
    return [];
  }
  function text(value: unknown, label: string, { required = true } = {}): string {
    if (typeof value !== "string") {
      problems.push(`${label} is missing.`);
      return "";
    }
    const trimmed = value.trim();
    if (required && !trimmed) problems.push(`${label} can't be empty.`);
    return trimmed;
  }
  function url(value: string, label: string, protocols: string[]) {
    try {
      if (!protocols.includes(new URL(value).protocol)) throw new Error();
    } catch {
      problems.push(`${label} must be a full ${protocols.join(" or ")}// link.`);
    }
  }
  function image(value: string, label: string) {
    if (value && !value.startsWith("/") && !value.startsWith("https://")) {
      problems.push(`${label} must start with / (a file in public/) or https://.`);
    }
  }

  const root = obj(input, "The content");

  const siteUrl = text(root.siteUrl, "Site address");
  if (siteUrl) url(siteUrl, "Site address", ["http:", "https:"]);

  const couple = obj(root.couple, "Couple");
  const date = obj(root.date, "Date");
  const iso = text(date.iso, "Wedding date");
  const display = text(date.display, "Date as shown");
  if (iso && Number.isNaN(Date.parse(`${iso}T00:00:00Z`))) {
    problems.push("Wedding date must be a date like 2027-05-18.");
  }

  const startsAt = text(root.startsAt, "Ceremony start");
  if (startsAt && (Number.isNaN(Date.parse(startsAt)) || startsAt.slice(0, 10) !== iso)) {
    problems.push("The ceremony start must be a time on the wedding date.");
  }

  const welcome = obj(root.welcome, "Welcome");
  const rsvp = obj(root.rsvp, "RSVP");

  const photoSharing = obj(root.photoSharing, "Snap & Share");
  const qrImage = text(photoSharing.qrImage, "Snap & Share QR image", { required: false });
  image(qrImage, "Snap & Share QR image");

  const gifts = obj(root.gifts, "Gifts");
  const attire = obj(root.attire, "Dress code");

  const wedding: Wedding = {
    siteUrl,
    couple: { first: text(couple.first, "First name"), second: text(couple.second, "Second name") },
    date: { display, iso },
    startsAt,
    welcome: {
      heading: text(welcome.heading, "Welcome heading"),
      message: text(welcome.message, "Welcome message"),
    },
    rsvp: { by: text(rsvp.by, "RSVP deadline") },
    hashtags: list(root.hashtags, "Hashtags")
      .map((tag, i) => text(tag, `Hashtag ${i + 1}`, { required: false }))
      .filter(Boolean),
    photoSharing: { message: text(photoSharing.message, "Snap & Share message"), qrImage },
    gifts: {
      message: text(gifts.message, "Gift message"),
      methods: list(gifts.methods, "Gift methods").map((value, i) => {
        const method = obj(value, `Gift method ${i + 1}`);
        const label = `Gift method ${i + 1}`;
        const qr = text(method.qr ?? "", `${label} QR image`, { required: false });
        image(qr, `${label} QR image`);
        return {
          name: text(method.name, `${label} name`),
          accountName: text(method.accountName, `${label} account name`),
          accountNumber: text(method.accountNumber, `${label} account number`),
          ...(qr ? { qr } : {}),
        };
      }),
    },
    events: list(root.events, "Events").map((value, i) => {
      const event = obj(value, `Event ${i + 1}`);
      const label = `Event ${i + 1}`;
      const mapUrl = text(event.mapUrl, `${label} map link`);
      if (mapUrl) url(mapUrl, `${label} map link`, ["https:"]);
      return {
        name: text(event.name, `${label} name`),
        icon: event.icon === "dinner" ? ("dinner" as const) : ("rings" as const),
        time: text(event.time, `${label} time`),
        venue: text(event.venue, `${label} venue`),
        address: text(event.address, `${label} address`),
        mapUrl,
      };
    }),
    attire: {
      theme: text(attire.theme, "Dress code theme"),
      palette: list(attire.palette, "Motif colors").map((value, i) => {
        const swatch = obj(value, `Color ${i + 1}`);
        return {
          name: text(swatch.name, `Color ${i + 1} name`),
          color: text(swatch.color, `Color ${i + 1} value`),
        };
      }),
      guides: list(attire.guides, "Attire guides").map((value, i) => {
        const guide = obj(value, `Attire guide ${i + 1}`);
        return {
          who: text(guide.who, `Attire guide ${i + 1} title`),
          text: text(guide.text, `Attire guide ${i + 1} text`),
        };
      }),
      note: text(attire.note, "Dress code note", { required: false }),
    },
    entourage: list(root.entourage, "Entourage").map((value, i) => {
      const group = obj(value, `Entourage group ${i + 1}`);
      return {
        group: text(group.group, `Entourage group ${i + 1} title`),
        names: list(group.names, `Entourage group ${i + 1} names`)
          .map((name) => text(name, `A name in entourage group ${i + 1}`, { required: false }))
          .filter(Boolean),
      };
    }),
  };

  return problems.length ? { ok: false, problems } : { ok: true, wedding };
}
