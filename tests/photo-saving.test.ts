import assert from "node:assert/strict";
import { test } from "node:test";
import { isPhonePhotoSaving } from "../app/lib/photo-saving.ts";

test("iOS and Android use native phone saving instead of automatic downloads", () => {
  for (const userAgent of ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", "Mozilla/5.0 (Linux; Android 15; Pixel)"]) {
    assert.equal(isPhonePhotoSaving(userAgent, 5), true);
  }
});

test("iPadOS desktop mode is recognized without changing desktop Mac saving", () => {
  const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15";
  assert.equal(isPhonePhotoSaving(userAgent, 5), true);
  assert.equal(isPhonePhotoSaving(userAgent, 0), false);
  assert.equal(isPhonePhotoSaving("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 10), false);
});