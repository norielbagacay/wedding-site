import type { EntourageGroup } from "../content";
import { Section } from "./Section";

export function Entourage({ groups }: { groups: EntourageGroup[] }) {
  return (
    <Section id="entourage" title="Entourage" tone="cream">
      <div className="space-y-12">
        {groups.map(({ group, names }) => (
          <div key={group}>
            <h3 className="text-sm font-semibold tracking-[0.3em] text-tan-dark uppercase">
              {group}
            </h3>
            <ul className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-y-2">
              {names.map((name, i) => (
                <li key={i} className="w-full sm:w-1/2">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
