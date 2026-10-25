import assert from "node:assert/strict";
import { test } from "node:test";
import { getCaptureCrop } from "../app/lib/photo-orientation.ts";

test("full view preserves the native camera dimensions in either orientation", () => {
  for (const [width, height] of [[1920, 1080], [1080, 1920]]) {
    assert.deepEqual(getCaptureCrop(width, height, "auto"), { x: 0, y: 0, width, height });
  }
});

test("portrait and landscape crops match their preview ratios and stay centered", () => {
  for (const [width, height] of [[1920, 1080], [1080, 1920]]) {
    for (const orientation of ["portrait", "landscape"] as const) {
      const crop = getCaptureCrop(width, height, orientation);
      const ratio = orientation === "portrait" ? 3 / 4 : 4 / 3;
      assert.ok(Math.abs(crop.width / crop.height - ratio) < 0.00001);
      assert.ok(crop.x >= 0 && crop.y >= 0);
      assert.ok(crop.x + crop.width <= width && crop.y + crop.height <= height);
      assert.equal(crop.x + crop.width / 2, width / 2);
      assert.equal(crop.y + crop.height / 2, height / 2);
    }
  }
});