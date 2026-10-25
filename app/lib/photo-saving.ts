/** Include iPadOS browsers that identify themselves as a desktop Mac. */
export function isPhonePhotoSaving(userAgent: string, touchPoints: number): boolean {
  return /Android|iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && touchPoints > 1);
}