import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOTH_LAYOUTS, getBoothGeometry, fitPhoto, composeBoothPhotos } from "../app/lib/photo-booth.ts";

test("single photo keeps its original size without gutters", () => {
  assert.deepEqual(getBoothGeometry(1200, 1600, BOOTH_LAYOUTS[0]), {
    width: 1200, height: 1600, cells: [{ x: 0, y: 0, width: 1200, height: 1600 }],
  });
});

test("2, 3, and 4 photo strips keep shots in order, within the sheet, with gaps", () => {
  for (const layout of [BOOTH_LAYOUTS[1], BOOTH_LAYOUTS[2], BOOTH_LAYOUTS[3]]) {
    const geometry = getBoothGeometry(1200, 1600, layout);
    assert.equal(geometry.cells.length, layout.count);
    geometry.cells.forEach((cell, index) => {
      assert.equal(cell.x, 0);
      assert.equal(cell.width, geometry.width);
      if (index > 0) assert.ok(cell.y > geometry.cells[index - 1].y + cell.height);
      assert.ok(cell.y + cell.height <= geometry.height);
    });
  }
});

test("4-photo strip stacks all four shots in one column", () => {
  const { cells, width, height } = getBoothGeometry(1200, 1600, BOOTH_LAYOUTS[3]);
  assert.equal(cells.length, 4);
  cells.forEach((cell, index) => {
    assert.equal(cell.x, 0);
    assert.equal(cell.width, width);
    if (index > 0) assert.ok(cell.y > cells[index - 1].y + cells[index - 1].height);
  });
  assert.equal(cells[3].y + cells[3].height, height);
});

test("landscape shots fit in portrait slots without distortion or cropping", () => {
  const cell = { x: 20, y: 50, width: 600, height: 800 };
  const fit = fitPhoto(1600, 900, cell);
  assert.equal(fit.width / fit.height, 1600 / 900);
  assert.equal(fit.x, 20);
  assert.ok(fit.y > cell.y);
  assert.ok(fit.y + fit.height < cell.y + cell.height);
});

test("incomplete photo sets cannot be exported", () => {
  const shot = { width: 1200, height: 1600 } as HTMLCanvasElement;
  assert.throws(() => composeBoothPhotos([shot], BOOTH_LAYOUTS[2]), /Complete all photos/);
  assert.equal(composeBoothPhotos([shot], BOOTH_LAYOUTS[0]), shot);
});