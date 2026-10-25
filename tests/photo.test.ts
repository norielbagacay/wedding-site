import assert from "node:assert/strict";
import { test } from "node:test";
import { applyPhotoFilter, PHOTO_FILTERS } from "../app/lib/photo.ts";

test("original filter preserves colors and alpha", () => {
  const pixels = new Uint8ClampedArray([255, 40, 0, 128, 12, 80, 210, 255]);
  const original = pixels.slice();
  applyPhotoFilter(pixels, PHOTO_FILTERS[0]);
  assert.deepEqual(pixels, original);
});

test("black and white exports luminance with equal color channels", () => {
  const pixels = new Uint8ClampedArray([255, 0, 0, 200]);
  applyPhotoFilter(pixels, PHOTO_FILTERS[2]);
  assert.deepEqual([...pixels], [54, 54, 54, 200]);
});

test("golden filter creates warmer highlights without changing transparency", () => {
  const pixels = new Uint8ClampedArray([200, 200, 200, 190]);
  applyPhotoFilter(pixels, PHOTO_FILTERS[1]);
  assert.ok(pixels[0] > pixels[1]);
  assert.ok(pixels[1] > pixels[2]);
  assert.equal(pixels[3], 190);
});

test("soft filter brightens a midtone and keeps highlights within range", () => {
  const pixels = new Uint8ClampedArray([100, 100, 100, 255, 255, 255, 255, 255]);
  applyPhotoFilter(pixels, PHOTO_FILTERS[4]);
  assert.ok(pixels[0] > 100);
  assert.ok(pixels[4] <= 255);
  assert.equal(pixels[7], 255);
});