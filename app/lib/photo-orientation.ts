export const PHOTO_ORIENTATIONS = [
  { id: "auto", name: "Full view" },
  { id: "portrait", name: "Portrait" },
  { id: "landscape", name: "Landscape" },
] as const;

export type PhotoOrientation = (typeof PHOTO_ORIENTATIONS)[number]["id"];

/** Use the complete camera feed by default; match explicit crops to the live preview. */
export function getCaptureCrop(width: number, height: number, orientation: PhotoOrientation) {
  if (orientation === "auto") return { x: 0, y: 0, width, height };
  const ratio = orientation === "portrait" ? 3 / 4 : 4 / 3;
  const cropWidth = Math.min(width, height * ratio);
  const cropHeight = cropWidth / ratio;
  return { x: (width - cropWidth) / 2, y: (height - cropHeight) / 2, width: cropWidth, height: cropHeight };
}