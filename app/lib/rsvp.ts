export type RsvpAnswers = {
  name: string;
  attending: "yes" | "no";
  guests: number;
  message: string;
};

/** A reply as stored in Supabase (the rsvps table in supabase/schema.sql). */
export type RsvpRow = {
  id: string;
  name: string;
  attending: boolean;
  guests: number;
  message: string;
  created_at: string;
};

/** The "Will you attend?" choices. */
export const ATTENDING_LABELS = {
  yes: "Joyfully accept",
  no: "Regretfully decline",
} as const;

export const MAX_GUESTS = 10;

/** Checks a reply from the form and turns it into a row for the rsvps table. */
export function rsvpRow(
  answers: RsvpAnswers,
): { ok: true; row: Omit<RsvpRow, "id" | "created_at"> } | { ok: false; error: string } {
  const name = String(answers.name ?? "").trim();
  const message = String(answers.message ?? "").trim();
  const attending = answers.attending === "yes";
  const guests = attending ? Math.trunc(Number(answers.guests)) : 0;

  if (!name) return { ok: false, error: "Please enter your name." };
  if (name.length > 100) return { ok: false, error: "Please shorten your name." };
  if (answers.attending !== "yes" && answers.attending !== "no") {
    return { ok: false, error: "Please choose whether you’ll attend." };
  }
  if (attending && !(guests >= 1 && guests <= MAX_GUESTS)) {
    return { ok: false, error: `The number of guests must be 1 to ${MAX_GUESTS}.` };
  }
  if (message.length > 1000) return { ok: false, error: "Please shorten your note." };
  return { ok: true, row: { name, attending, guests, message } };
}
