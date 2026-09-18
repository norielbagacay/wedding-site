import type { FaqItem } from "../content";
import { ChevronDownIcon } from "./icons";
import { Section } from "./Section";

export function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Section id="details" title="Details & FAQ" tone="sand">
      <div className="mx-auto max-w-2xl divide-y divide-tan/20 border-y border-tan/20 text-left">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-medium [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDownIcon className="size-5 shrink-0 text-tan-dark transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 leading-relaxed text-taupe-soft">{answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
