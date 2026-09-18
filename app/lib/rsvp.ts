/** A Google Form that collects RSVPs. Its answers land in the form's Google Sheet. */
export type GoogleFormConfig = {
  /** The id in the form's link: https://docs.google.com/forms/d/e/<formId>/viewform */
  formId: string;
  /** Each question's field name ("entry.123456789"), taken from the form's pre-filled link. */
  fields: { name: string; attending: string; guests: string; message: string };
};

export type RsvpAnswers = {
  name: string;
  attending: "yes" | "no";
  guests: number;
  message: string;
};

/** The "Will you attend?" choices. The Google Form's options must use exactly this text. */
export const ATTENDING_LABELS = {
  yes: "Joyfully accept",
  no: "Regretfully decline",
} as const;

const ENTRY_FIELD = /^entry\.\d+$/;

export function isGoogleFormReady(form: GoogleFormConfig): boolean {
  return (
    form.formId.trim() !== "" &&
    Object.values(form.fields).every((field) => ENTRY_FIELD.test(field.trim()))
  );
}

/** The request that records one RSVP in the Google Form. */
export function googleFormSubmission(form: GoogleFormConfig, answers: RsvpAnswers) {
  const body = new URLSearchParams();
  body.set(form.fields.name.trim(), answers.name.trim());
  body.set(form.fields.attending.trim(), ATTENDING_LABELS[answers.attending]);
  body.set(form.fields.guests.trim(), answers.attending === "yes" ? String(answers.guests) : "0");
  body.set(form.fields.message.trim(), answers.message.trim());
  return { url: `https://docs.google.com/forms/d/e/${form.formId.trim()}/formResponse`, body };
}
