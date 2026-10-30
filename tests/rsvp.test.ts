import assert from "node:assert/strict";
import { test } from "node:test";
import { rsvpRow } from "../app/lib/rsvp.ts";

test("an acceptance is trimmed and keeps its number of guests", () => {
  assert.deepEqual(
    rsvpRow({ name: "  Ana Cruz ", attending: "yes", guests: 2, message: " See you there! " }),
    { ok: true, row: { name: "Ana Cruz", attending: true, guests: 2, message: "See you there!" } },
  );
});

test("a decline records no guests", () => {
  const result = rsvpRow({ name: "Ben", attending: "no", guests: 4, message: "" });
  assert.ok(result.ok);
  assert.equal(result.row.guests, 0);
});

test("a reply without a name is rejected", () => {
  assert.equal(rsvpRow({ name: "  ", attending: "yes", guests: 1, message: "" }).ok, false);
});

test("an acceptance needs 1 to 10 guests", () => {
  for (const guests of [0, 11, Number.NaN]) {
    assert.equal(rsvpRow({ name: "Ana", attending: "yes", guests, message: "" }).ok, false, String(guests));
  }
});

test("an unknown answer to 'Will you attend?' is rejected", () => {
  const answers = { name: "Ana", attending: "maybe", guests: 1, message: "" } as never;
  assert.equal(rsvpRow(answers).ok, false);
});
