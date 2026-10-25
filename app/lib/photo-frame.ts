export const PHOTO_FRAMES = [
  { id: "instax", name: "Instax", background: "#fffdf8", ink: "#65492f" },
  { id: "gold", name: "Ivory & Gold", background: "#fff3dd", ink: "#8b642f" },
  { id: "black", name: "Classic Black", background: "#191817", ink: "#fff7e8" },
  { id: "none", name: "No frame", background: "transparent", ink: "#65492f" },
] as const;

export type PhotoFrame = (typeof PHOTO_FRAMES)[number];

/** Add borders around the photo, preserving every pixel of portrait or landscape images. */
export function getFrameLayout(width: number, height: number, frame: PhotoFrame) {
  const unit = Math.min(width, height);
  const border = frame.id === "none" ? 0 : Math.max(1, Math.round(unit * 0.055));
  const footer = frame.id === "none" ? 0 : Math.max(1, Math.round(unit * 0.25));
  return { width: width + border * 2, height: height + border + footer, border, footer };
}

export function addPhotoFrame(
  photo: HTMLCanvasElement,
  frame: PhotoFrame,
  hashtags: string[],
  names: string,
): HTMLCanvasElement {
  if (frame.id === "none") return photo;
  const layout = getFrameLayout(photo.width, photo.height, frame);
  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Frame canvas unavailable");
  context.fillStyle = frame.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(photo, layout.border, layout.border);
  if (frame.id === "gold") {
    context.strokeStyle = "#bd9455";
    context.lineWidth = Math.max(1, layout.border * 0.035);
    const inset = layout.border * 0.35;
    context.strokeRect(inset, inset, canvas.width - inset * 2, canvas.height - inset * 2);
    context.strokeRect(layout.border, layout.border, photo.width, photo.height);
  }
  const footerTop = layout.border + photo.height;
  const lineHeight = layout.footer / (hashtags.length + 2.5);
  const fontSize = Math.round(lineHeight * 0.7);
  context.fillStyle = frame.ink;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `italic ${Math.round(fontSize * 0.9)}px Georgia, serif`;
  context.fillText(names, canvas.width / 2, footerTop + lineHeight, photo.width);
  context.font = `bold ${fontSize}px Georgia, serif`;
  hashtags.forEach((hashtag, index) => {
    context.fillText(hashtag, canvas.width / 2, footerTop + lineHeight * (index + 2.2), photo.width);
  });
  return canvas;
}