import { FloralDivider } from "./Florals";
import { Monogram } from "./Monogram";

type SiteFooterProps = {
  monogram: readonly [string, string];
  names: string;
  dateDisplay: string;
  hashtag: string;
};

export function SiteFooter({ monogram, names, dateDisplay, hashtag }: SiteFooterProps) {
  return (
    <footer className="bg-cream px-6 py-14 text-center">
      <Monogram letters={monogram} className="text-2xl" />
      <FloralDivider idPrefix="footer-divider" className="mx-auto mt-3 w-48" />
      <p className="mt-3 text-xl">
        {names} · {dateDisplay}
      </p>
      {hashtag && <p className="mt-2 tracking-wide text-taupe-soft">{hashtag}</p>}
    </footer>
  );
}
