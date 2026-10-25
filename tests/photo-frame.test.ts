import assert from "node:assert/strict";
import { test } from "node:test";
import { PHOTO_FRAMES, getFrameLayout, addPhotoFrame } from "../app/lib/photo-frame.ts";

test("no frame preserves the original dimensions and returns the untouched photo canvas", () => {
  const frame = PHOTO_FRAMES.find((item) => item.id === "none")!;
  assert.deepEqual(getFrameLayout(1200, 1600, frame), { width: 1200, height: 1600, border: 0, footer: 0 });
  const photo = { width: 1200, height: 1600 } as HTMLCanvasElement;
  assert.equal(addPhotoFrame(photo, frame, [], ""), photo);
});

test("decorative frames add space around portrait and landscape photos without cropping", () => {
  for (const frame of PHOTO_FRAMES.filter((item) => item.id !== "none")) {
    for (const [width, height] of [[1200, 1600], [1600, 900]]) {
      const layout = getFrameLayout(width, height, frame);
      assert.equal(layout.width - layout.border * 2, width);
      assert.equal(layout.height - layout.border - layout.footer, height);
      assert.ok(layout.footer > layout.border * 4, "reserve a generous caption area below the photo");
    }
  }
});