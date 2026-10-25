export const PHOTO_FILTERS = [
  { id: "original", name: "Original", css: "none", gray: 0, sepia: 0, brightness: 1, contrast: 1 },
  { id: "warm", name: "Golden", css: "sepia(0.35)", gray: 0, sepia: 0.35, brightness: 1, contrast: 1 },
  { id: "mono", name: "B&W", css: "grayscale(1)", gray: 1, sepia: 0, brightness: 1, contrast: 1 },
  { id: "vintage", name: "Vintage", css: "sepia(0.85)", gray: 0, sepia: 0.85, brightness: 1, contrast: 1 },
  { id: "soft", name: "Soft", css: "brightness(1.12) contrast(0.9)", gray: 0, sepia: 0, brightness: 1.12, contrast: 0.9 },
  { id: "digicam", name: "Digicam", css: "saturate(1.25) brightness(1.04) contrast(1.18)", gray: 0, sepia: 0, saturation: 1.25, brightness: 1.04, contrast: 1.18 },
] as const;

export type PhotoFilter = (typeof PHOTO_FILTERS)[number];

/** Apply the preview's color treatment to exported pixels, including on mobile Safari. */
export function applyPhotoFilter(pixels: Uint8ClampedArray, filter: PhotoFilter) {
  const saturation = "saturation" in filter ? filter.saturation : 1;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sepia = [
      0.393 * r + 0.769 * g + 0.189 * b,
      0.349 * r + 0.686 * g + 0.168 * b,
      0.272 * r + 0.534 * g + 0.131 * b,
    ];
    for (let channel = 0; channel < 3; channel++) {
      const original = pixels[i + channel];
      let value = original * (1 - filter.gray) + gray * filter.gray;
      value = Math.min(255, value * (1 - filter.sepia) + sepia[channel] * filter.sepia);
      value = Math.min(255, Math.max(0, gray + (value - gray) * saturation));
      value = Math.min(255, value * filter.brightness);
      pixels[i + channel] = (value - 127.5) * filter.contrast + 127.5;
    }
  }
}