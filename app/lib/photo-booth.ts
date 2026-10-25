export const BOOTH_LAYOUTS = [
  { id: "single", name: "1 photo", count: 1, columns: 1, rows: 1 },
  { id: "double", name: "2-photo strip", count: 2, columns: 1, rows: 2 },
  { id: "triple", name: "3-photo strip", count: 3, columns: 1, rows: 3 },
  { id: "quad", name: "4-photo strip", count: 4, columns: 1, rows: 4 },
] as const;

export type BoothLayout = (typeof BOOTH_LAYOUTS)[number];

export function getBoothGeometry(width: number, height: number, layout: BoothLayout) {
  const cellWidth = Math.max(1, Math.round(width));
  const cellHeight = Math.max(1, Math.round(height));
  const gap = layout.count === 1 ? 0 : Math.max(1, Math.round(Math.min(cellWidth, cellHeight) * 0.035));
  return {
    width: cellWidth * layout.columns + gap * (layout.columns - 1),
    height: cellHeight * layout.rows + gap * (layout.rows - 1),
    cells: Array.from({ length: layout.count }, (_, index) => ({
      x: (index % layout.columns) * (cellWidth + gap),
      y: Math.floor(index / layout.columns) * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight,
    })),
  };
}

/** Center each shot without cropping, including shots with different orientations. */
export function fitPhoto(width: number, height: number, cell: { x: number; y: number; width: number; height: number }) {
  const scale = Math.min(cell.width / width, cell.height / height);
  const fitWidth = width * scale;
  const fitHeight = height * scale;
  return { x: cell.x + (cell.width - fitWidth) / 2, y: cell.y + (cell.height - fitHeight) / 2, width: fitWidth, height: fitHeight };
}

export function composeBoothPhotos(shots: HTMLCanvasElement[], layout: BoothLayout): HTMLCanvasElement {
  if (shots.length !== layout.count) throw new Error("Complete all photos before composing the sheet");
  if (layout.count === 1) return shots[0];
  const geometry = getBoothGeometry(Math.max(...shots.map((shot) => shot.width)), Math.max(...shots.map((shot) => shot.height)), layout);
  const canvas = document.createElement("canvas");
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Photo sheet unavailable");
  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  shots.forEach((shot, index) => {
    const fit = fitPhoto(shot.width, shot.height, geometry.cells[index]);
    context.drawImage(shot, fit.x, fit.y, fit.width, fit.height);
  });
  return canvas;
}