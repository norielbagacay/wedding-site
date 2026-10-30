import assert from "node:assert/strict";
import { test } from "node:test";
import { wedding } from "../app/content.ts";
import { parseWedding } from "../app/lib/wedding-data.ts";

test("the starting content in app/content.ts can be saved as is", () => {
  assert.deepEqual(parseWedding(wedding), { ok: true, wedding });
});

test("text is trimmed and blank names and hashtags are dropped", () => {
  const result = parseWedding({
    ...wedding,
    couple: { first: "  Genesis ", second: "Rosher" },
    hashtags: ["#One", "  ", "#Two"],
    entourage: [{ group: "Best Man", names: ["Ana", "", " Ben "] }],
  });
  assert.ok(result.ok);
  assert.equal(result.wedding.couple.first, "Genesis");
  assert.deepEqual(result.wedding.hashtags, ["#One", "#Two"]);
  assert.deepEqual(result.wedding.entourage, [{ group: "Best Man", names: ["Ana", "Ben"] }]);
});

test("fields the site doesn't use are left out", () => {
  const result = parseWedding({ ...wedding, extra: "<script>" });
  assert.ok(result.ok);
  assert.equal("extra" in result.wedding, false);
});

test("a ceremony start on another day is rejected", () => {
  const result = parseWedding({ ...wedding, startsAt: "2027-05-19T15:00:00+08:00" });
  assert.equal(result.ok, false);
});

test("a map link that isn't https is rejected", () => {
  const events = [{ ...wedding.events[0], mapUrl: "javascript:alert(1)" }];
  const result = parseWedding({ ...wedding, events });
  assert.ok(!result.ok);
  assert.match(result.problems.join(" "), /Event 1 map link/);
});

test("anything that isn't the content object is rejected", () => {
  assert.equal(parseWedding(null).ok, false);
  assert.equal(parseWedding("hello").ok, false);
});
