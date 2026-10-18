"use client";

import { useState, type FormEvent } from "react";
import {
  ATTENDING_LABELS,
  googleFormSubmission,
  isGoogleFormReady,
  type GoogleFormConfig,
  type RsvpAnswers,
} from "../lib/rsvp";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; answers: RsvpAnswers }
  | { kind: "error" };

const LABEL = "block text-left text-sm tracking-[0.2em] text-gold-dark uppercase";
const FIELD =
  "mt-2 block w-full rounded-full border border-gold/40 bg-ivory/80 px-5 py-3 text-lg text-taupe shadow-[inset_0_1px_3px_rgb(80_60_40/0.08)] focus:border-gold-dark focus:outline-none";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0];
}

/** Records an RSVP in the couple's Google Form; until one is set up, says so instead. */
export function RsvpForm({ form }: { form: GoogleFormConfig }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [attending, setAttending] = useState<RsvpAnswers["attending"]>("yes");
  const ready = isGoogleFormReady(form);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const answers: RsvpAnswers = {
      name: String(data.get("name") ?? ""),
      attending,
      guests: Number(data.get("guests") ?? 1),
      message: String(data.get("message") ?? ""),
    };
    const { url, body } = googleFormSubmission(form, answers);
    setStatus({ kind: "sending" });
    try {
      // Google Forms doesn't allow cross-origin reads, so the response is opaque;
      // a request that completes means the answer was delivered.
      await fetch(url, { method: "POST", mode: "no-cors", body });
      setStatus({ kind: "sent", answers });
    } catch {
      setStatus({ kind: "error" });
    }
  }

  if (status.kind === "sent") {
    const { name, attending: reply } = status.answers;
    return (
      <p role="status" className="mx-auto max-w-sm text-2xl leading-snug italic">
        {reply === "yes"
          ? `Thank you, ${firstName(name)}! We can’t wait to celebrate with you.`
          : `Thank you for letting us know, ${firstName(name)}. You’ll be missed.`}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
      <label className={LABEL}>
        Your name
        <input name="name" required autoComplete="name" className={FIELD} />
      </label>

      <fieldset className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-lg">
        <legend className="sr-only">Will you attend?</legend>
        {(Object.keys(ATTENDING_LABELS) as RsvpAnswers["attending"][]).map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="attending"
              value={value}
              checked={attending === value}
              onChange={() => setAttending(value)}
              className="size-4 accent-gold-dark"
            />
            {ATTENDING_LABELS[value]}
          </label>
        ))}
      </fieldset>

      {attending === "yes" && (
        <label className={LABEL}>
          Number of guests
          <input
            name="guests"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            required
            className={FIELD}
          />
        </label>
      )}

      <label className={LABEL}>
        A note for us <span className="normal-case tracking-normal italic">(optional)</span>
        <textarea name="message" rows={3} className={`${FIELD} rounded-3xl`} />
      </label>

      <button
        type="submit"
        disabled={!ready || status.kind === "sending"}
        className="w-full cursor-pointer rounded-full bg-linear-to-r from-[#a67c46] via-[#c99a55] to-[#8d6635] px-8 py-4 text-sm font-semibold tracking-[0.3em] text-ivory uppercase shadow-[0_10px_24px_-10px_rgb(110_80_40/0.6)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "sending" ? "Sending…" : "Confirm attendance"}
      </button>

      {!ready && <p className="text-lg italic">Online RSVP opens soon.</p>}
      {status.kind === "error" && (
        <p role="alert" className="text-lg">
          Sorry, that didn’t go through. Please check your connection and try again.
        </p>
      )}
    </form>
  );
}
