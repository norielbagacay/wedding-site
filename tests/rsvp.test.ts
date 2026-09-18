import assert from "node:assert/strict";
import { test } from "node:test";
import {
  googleFormSubmission,
  isGoogleFormReady,
  type GoogleFormConfig,
} from "../app/lib/rsvp.ts";

const form: GoogleFormConfig = {
  formId: "1FAIpQLSexample",
  fields: { name: "entry.111", attending: "entry.222", guests: "entry.333", message: "entry.444" },
};

test("a form without an id is not ready", () => {
  assert.equal(isGoogleFormReady({ ...form, formId: " " }), false);
});

test("a form with a question that has no entry id is not ready", () => {
  assert.equal(isGoogleFormReady({ ...form, fields: { ...form.fields, guests: "" } }), false);
});

test("a form with an id and an entry id for every question is ready", () => {
  assert.equal(isGoogleFormReady(form), true);
});

test("an acceptance posts the trimmed answers to the form's response URL", () => {
  const { url, body } = googleFormSubmission(form, {
    name: "  Ana Cruz ",
    attending: "yes",
    guests: 2,
    message: " See you there! ",
  });
  assert.equal(url, "https://docs.google.com/forms/d/e/1FAIpQLSexample/formResponse");
  assert.deepEqual(Object.fromEntries(body), {
    "entry.111": "Ana Cruz",
    "entry.222": "Joyfully accept",
    "entry.333": "2",
    "entry.444": "See you there!",
  });
});

test("a decline records zero guests", () => {
  const { body } = googleFormSubmission(form, {
    name: "Ben",
    attending: "no",
    guests: 3,
    message: "",
  });
  assert.equal(body.get("entry.222"), "Regretfully decline");
  assert.equal(body.get("entry.333"), "0");
});
