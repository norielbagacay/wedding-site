import assert from "node:assert/strict";
import { test } from "node:test";
import { wedding } from "../app/content.ts";
import { isGoogleFormReady } from "../app/lib/rsvp.ts";

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

test("the RSVP Google Form is either not set up yet or fully set up", () => {
  const form = wedding.rsvp.googleForm;
  if (form.formId.trim()) {
    assert.ok(isGoogleFormReady(form), "each question needs its entry.<number> id");
  }
});

test("every event has an https map link", () => {
  for (const event of wedding.events) {
    assert.equal(new URL(event.mapUrl).protocol, "https:", event.name);
  }
});
