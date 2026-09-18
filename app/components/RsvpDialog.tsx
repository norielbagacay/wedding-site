"use client";

import { useState, type FormEvent, type MouseEvent, type Ref } from "react";
import {
  ATTENDING_LABELS,
  googleFormSubmission,
  isGoogleFormReady,
  type GoogleFormConfig,
  type RsvpAnswers,
} from "../lib/rsvp";
import { FloralDivider } from "./Florals";
import { CloseIcon } from "./icons";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; answers: RsvpAnswers }
  | { kind: "error" };

type RsvpDialogProps = {
  ref: Ref<HTMLDialogElement>;
  form: GoogleFormConfig;
  deadline: string;
};

const FIELD =
  "mt-2 block w-full rounded-xl border border-tan/40 bg-ivory px-4 py-3 text-lg text-taupe focus:border-tan-dark focus:outline-none";
const PILL =
  "w-full cursor-pointer rounded-full bg-tan px-8 py-3.5 text-2xl font-medium text-ivory transition-colors hover:bg-tan-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-dark";

function closeDialog(event: MouseEvent<HTMLElement>) {
  event.currentTarget.closest("dialog")?.close();
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0];
}

export function RsvpDialog({ ref, form, deadline }: RsvpDialogProps) {
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

  function handleClose() {
    // After a successful RSVP, reopening starts a fresh form.
    if (status.kind === "sent") {
      setStatus({ kind: "idle" });
      setAttending("yes");
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="rsvp-dialog-title"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto max-h-[92svh] w-[min(92vw,32rem)] overflow-y-auto rounded-3xl bg-cream p-0 text-taupe shadow-2xl backdrop:bg-taupe/40 backdrop:backdrop-blur-sm"
    >
      <div className="relative px-6 py-10 sm:px-10">
        <button
          type="button"
          aria-label="Close"
          onClick={closeDialog}
          className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-taupe-soft transition-colors hover:bg-tan/10 hover:text-taupe"
        >
          <CloseIcon className="size-6" />
        </button>

        {status.kind === "sent" ? (
          <div role="status" className="text-center">
            <h2 id="rsvp-dialog-title" className="font-script text-5xl">
              Thank you!
            </h2>
            <FloralDivider idPrefix="rsvp-thanks-divider" className="mx-auto mt-1 w-44" />
            <p className="mt-4 text-xl">
              {status.answers.attending === "yes"
                ? `We can't wait to celebrate with you, ${firstName(status.answers.name)}.`
                : `We'll miss you, ${firstName(status.answers.name)}. Thank you for letting us know.`}
            </p>
            <button type="button" onClick={closeDialog} className={`mt-8 ${PILL}`}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 id="rsvp-dialog-title" className="text-center font-script text-5xl">
              RSVP
            </h2>
            <FloralDivider idPrefix="rsvp-form-divider" className="mx-auto mt-1 w-44" />
            <p className="mt-1 text-center text-taupe-soft italic">Kindly respond by {deadline}</p>

            <label className="mt-8 block">
              <span className="font-medium">Your name</span>
              <input
                name="name"
                required
                autoFocus
                autoComplete="name"
                placeholder="Full name"
                className={FIELD}
              />
            </label>

            <fieldset className="mt-6">
              <legend className="font-medium">Will you attend?</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {(["yes", "no"] as const).map((value) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center justify-center rounded-xl border border-tan/40 bg-ivory px-4 py-3 text-center text-lg transition-colors has-checked:border-taupe has-checked:bg-taupe has-checked:text-ivory has-focus-visible:outline-2 has-focus-visible:outline-tan-dark"
                  >
                    <input
                      type="radio"
                      name="attending"
                      value={value}
                      checked={attending === value}
                      onChange={() => setAttending(value)}
                      className="sr-only"
                    />
                    {ATTENDING_LABELS[value]}
                  </label>
                ))}
              </div>
            </fieldset>

            {attending === "yes" && (
              <label className="mt-6 block">
                <span className="font-medium">Number of guests, including you</span>
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

            <label className="mt-6 block">
              <span className="font-medium">
                Message for the couple <span className="text-taupe-soft">(optional)</span>
              </span>
              <textarea name="message" rows={3} className={FIELD} />
            </label>

            {status.kind === "error" && (
              <p role="alert" className="mt-4 text-center">
                Something went wrong. Please check your connection and try again.
              </p>
            )}

            <button
              type="submit"
              disabled={!ready || status.kind === "sending"}
              className={`mt-8 ${PILL} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {status.kind === "sending" ? "Sending…" : "Send RSVP"}
            </button>
            {!ready && (
              <p className="mt-3 text-center text-taupe-soft italic">Online RSVP opens soon.</p>
            )}
          </form>
        )}
      </div>
    </dialog>
  );
}
