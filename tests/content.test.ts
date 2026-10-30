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

test("every event has an https map link", () => {
  for (const event of wedding.events) {
    assert.equal(new URL(event.mapUrl).protocol, "https:", event.name);
  }
});

test("the countdown runs to the wedding day", () => {
  assert.equal(wedding.startsAt.slice(0, 10), wedding.date.iso);
  assert.ok(!Number.isNaN(Date.parse(wedding.startsAt)), "startsAt must be a valid date-time");
});
