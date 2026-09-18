export type RsvpLink = { href: string; external: boolean };

/**
 * Where RSVP buttons point: the Google Form once its URL is set,
 * otherwise the RSVP section on this page.
 */
export function rsvpLink(formUrl: string): RsvpLink {
  const url = formUrl.trim();
  return url ? { href: url, external: true } : { href: "#rsvp", external: false };
}
