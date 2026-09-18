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
