"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useId, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Wedding, WeddingEvent } from "../../content";
import { saveWedding } from "../actions";

type Status =
  | { kind: "idle" }
  | { kind: "saved"; at: string }
  | { kind: "problems"; problems: string[] };

const SECTIONS = [
  { id: "day", title: "The day" },
  { id: "welcome", title: "Welcome" },
  { id: "events", title: "Events" },
  { id: "attire", title: "Dress code" },
  { id: "entourage", title: "Entourage" },
  { id: "photos", title: "Photos" },
  { id: "gifts", title: "Gifts" },
  { id: "rsvp", title: "RSVP" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const START = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?(Z|[+-]\d{2}:\d{2})$/;

/** The ceremony start, split into the parts the form edits. */
function splitStart(startsAt: string) {
  const match = START.exec(startsAt);
  return match ? { time: match[2], offset: match[3] } : { time: "15:00", offset: "+08:00" };
}

function displayDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatSavedAt(at: string) {
  return new Date(at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

/** Edits everything guests read on the site; saving updates the live site right away. */
export function ContentEditor({ initial, savedAt }: { initial: Wedding; savedAt: string | null }) {
  const [wedding, setWedding] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<Status>(
    savedAt ? { kind: "saved", at: savedAt } : { kind: "idle" },
  );
  const [saving, startSaving] = useTransition();
  const dirty = wedding !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof Wedding>(key: K, value: Wedding[K]) {
    setWedding((current) => ({ ...current, [key]: value }));
  }

  function save() {
    startSaving(async () => {
      const result = await saveWedding(wedding);
      if (result.ok) {
        setSaved(wedding);
        setStatus({ kind: "saved", at: result.savedAt });
      } else {
        setStatus({ kind: "problems", problems: result.problems });
      }
    });
  }

  const start = splitStart(wedding.startsAt);
  const setStart = (iso: string, time: string, offset: string) =>
    set("startsAt", `${iso}T${time}:00${offset}`);

  return (
    <div className="flex flex-1 flex-col">
      {/* Section shortcuts; scrolls sideways on phones. */}
      <nav aria-label="Sections" className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur">
        <ul className="flex gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:px-6">
          {SECTIONS.map(({ id, title }) => (
            <li key={id} className="shrink-0">
              <Button variant="ghost" size="sm" asChild>
                <a href={`#${id}`}>{title}</a>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto grid w-full max-w-3xl gap-4 p-4 md:gap-6 md:p-6">
        <Section id="day" description="Names, date, and when the countdown ends.">
          <Grid>
            <Text label="First name" value={wedding.couple.first}
              onChange={(first) => set("couple", { ...wedding.couple, first })} />
            <Text label="Second name" value={wedding.couple.second}
              onChange={(second) => set("couple", { ...wedding.couple, second })} />
            <Text label="Wedding date" type="date" value={wedding.date.iso}
              onChange={(iso) => {
                if (!iso) return;
                setWedding((current) => ({
                  ...current,
                  date: { iso, display: displayDate(iso) },
                  startsAt: `${iso}T${start.time}:00${start.offset}`,
                }));
              }} />
            <Text label="Ceremony starts" type="time" value={start.time}
              hint="The countdown runs to this."
              onChange={(time) => time && setStart(wedding.date.iso, time, start.offset)} />
            <Text label="Time zone (UTC offset)" value={start.offset}
              hint="e.g. +08:00 for the Philippines"
              onChange={(offset) => setStart(wedding.date.iso, start.time, offset)} />
          </Grid>
        </Section>

        <Section id="welcome" description="The greeting at the top of the details.">
          <Text label="Heading" value={wedding.welcome.heading}
            onChange={(heading) => set("welcome", { ...wedding.welcome, heading })} />
          <Text label="Message" multiline value={wedding.welcome.message}
            onChange={(message) => set("welcome", { ...wedding.welcome, message })} />
        </Section>

        <Section id="events" description="The order of the day and where to find each venue.">
          <List<WeddingEvent>
            items={wedding.events}
            onChange={(events) => set("events", events)}
            blank={{ name: "", icon: "rings", time: "", venue: "", address: "", mapUrl: "" }}
            itemLabel={(event) => event.name || "New event"}
            addLabel="Add event"
            render={(event, update) => (
              <Grid>
                <Text label="Name" value={event.name} onChange={(name) => update({ name })} />
                <IconSelect value={event.icon} onChange={(icon) => update({ icon })} />
                <Text label="Time" value={event.time} hint="e.g. 3:00 PM"
                  onChange={(time) => update({ time })} />
                <Text label="Venue" value={event.venue} onChange={(venue) => update({ venue })} />
                <Text label="Address" value={event.address}
                  onChange={(address) => update({ address })} />
                <Text label="Map link" type="url" value={event.mapUrl}
                  hint="The Share link from Google Maps."
                  onChange={(mapUrl) => update({ mapUrl })} />
              </Grid>
            )}
          />
        </Section>

        <Section id="attire" description="Theme, motif colors, and what to wear.">
          <Grid>
            <Text label="Theme" value={wedding.attire.theme}
              onChange={(theme) => set("attire", { ...wedding.attire, theme })} />
            <Text label="Note" value={wedding.attire.note}
              onChange={(note) => set("attire", { ...wedding.attire, note })} />
          </Grid>
          <Subheading>Motif colors</Subheading>
          <List
            items={wedding.attire.palette}
            onChange={(palette) => set("attire", { ...wedding.attire, palette })}
            blank={{ name: "", color: "#e9d4b4" }}
            itemLabel={(swatch) => swatch.name || "New color"}
            addLabel="Add color"
            render={(swatch, update) => (
              <div className="flex items-end gap-3">
                <input type="color" aria-label="Color" value={swatch.color}
                  onChange={(e) => update({ color: e.target.value })}
                  className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-background p-1 shadow-xs" />
                <div className="flex-1">
                  <Text label="Name" value={swatch.name} onChange={(name) => update({ name })} />
                </div>
              </div>
            )}
          />
          <Subheading>Guides</Subheading>
          <List
            items={wedding.attire.guides}
            onChange={(guides) => set("attire", { ...wedding.attire, guides })}
            blank={{ who: "", text: "" }}
            itemLabel={(guide) => guide.who || "New guide"}
            addLabel="Add guide"
            render={(guide, update) => (
              <>
                <Text label="For" value={guide.who} hint="e.g. Gentlemen"
                  onChange={(who) => update({ who })} />
                <Text label="Text" multiline value={guide.text}
                  onChange={(text) => update({ text })} />
              </>
            )}
          />
        </Section>

        <Section id="entourage" description="Each group and the people in it.">
          <List
            items={wedding.entourage}
            onChange={(entourage) => set("entourage", entourage)}
            blank={{ group: "", names: [] }}
            itemLabel={(group) => group.group || "New group"}
            addLabel="Add group"
            render={(group, update) => (
              <>
                <Text label="Group" value={group.group} hint="e.g. Principal Sponsors"
                  onChange={(title) => update({ group: title })} />
                <Lines label="Names" hint="One per line." value={group.names}
                  onChange={(names) => update({ names })} />
              </>
            )}
          />
        </Section>

        <Section id="photos" description="The photo-sharing message, hashtags, and camera QR code.">
          <Text label="Message" multiline value={wedding.photoSharing.message}
            onChange={(message) => set("photoSharing", { ...wedding.photoSharing, message })} />
          <Lines label="Hashtags" hint="One per line." value={wedding.hashtags}
            onChange={(hashtags) => set("hashtags", hashtags)} />
          <Text label="QR code image" value={wedding.photoSharing.qrImage}
            hint="A file in public/ like /photos/snap-qr.svg, or an https:// image link."
            onChange={(qrImage) => set("photoSharing", { ...wedding.photoSharing, qrImage })} />
        </Section>

        <Section id="gifts" description="The gift message and the accounts guests can send to.">
          <Text label="Message" multiline value={wedding.gifts.message}
            onChange={(message) => set("gifts", { ...wedding.gifts, message })} />
          <List
            items={wedding.gifts.methods}
            onChange={(methods) => set("gifts", { ...wedding.gifts, methods })}
            blank={{ name: "", accountName: "", accountNumber: "" }}
            itemLabel={(method) => method.name || "New account"}
            addLabel="Add account"
            render={(method, update) => (
              <Grid>
                <Text label="Name" value={method.name} hint="e.g. GCash"
                  onChange={(name) => update({ name })} />
                <Text label="Account name" value={method.accountName}
                  onChange={(accountName) => update({ accountName })} />
                <Text label="Account number" value={method.accountNumber}
                  onChange={(accountNumber) => update({ accountNumber })} />
                <Text label="QR code image" value={method.qr ?? ""}
                  hint="Optional. /gifts/gcash-qr.png or an https:// link."
                  onChange={(qr) => update({ qr })} />
              </Grid>
            )}
          />
        </Section>

        <Section id="rsvp" description="Replies are listed on the RSVPs page.">
          <Text label="Reply by" value={wedding.rsvp.by} hint="e.g. April 18, 2027"
            onChange={(by) => set("rsvp", { ...wedding.rsvp, by })} />
        </Section>
      </div>

      <div className="sticky bottom-0 z-10 mt-auto border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div aria-live="polite" className="min-w-0 flex-1 text-sm">
            {status.kind === "problems" ? (
              <ul role="alert" className="list-disc pl-5 text-destructive">
                {status.problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                {dirty
                  ? "Unsaved changes"
                  : status.kind === "saved"
                    ? `Saved ${formatSavedAt(status.at)}`
                    : "Not saved yet"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {dirty && (
              <Button variant="outline" disabled={saving} onClick={() => setWedding(saved)}>
                Discard
              </Button>
            )}
            <Button disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, description, children }: { id: SectionId; description: string; children: ReactNode }) {
  const title = SECTIONS.find((section) => section.id === id)?.title;
  return (
    <Card id={id} className="scroll-mt-28 gap-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">{children}</CardContent>
    </Card>
  );
}

function Subheading({ children }: { children: ReactNode }) {
  return <h3 className="-mb-1 pt-2 text-sm font-medium">{children}</h3>;
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type TextProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url" | "date" | "time";
  multiline?: boolean;
  hint?: string;
};

function Text({ label, value, onChange, type = "text", multiline, hint }: TextProps) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint}>
      {multiline ? (
        <Textarea id={id} rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

/** A list of short texts edited as lines of a textarea; blank lines are dropped on save. */
function Lines({ label, hint, value, onChange }: { label: string; hint: string; value: string[]; onChange: (value: string[]) => void }) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint}>
      <Textarea id={id} rows={Math.max(3, value.length + 1)} value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))} />
    </Field>
  );
}

function IconSelect({ value, onChange }: { value: WeddingEvent["icon"]; onChange: (value: WeddingEvent["icon"]) => void }) {
  const id = useId();
  return (
    <Field id={id} label="Drawing">
      <Select value={value} onValueChange={(icon) => onChange(icon as WeddingEvent["icon"])}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rings">Rings</SelectItem>
          <SelectItem value="dinner">Dinner</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}

type ListProps<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  blank: T;
  itemLabel: (item: T) => string;
  addLabel: string;
  render: (item: T, update: (changes: Partial<T>) => void) => ReactNode;
};

/** Items that can be edited, added, removed and reordered. */
function List<T>({ items, onChange, blank, itemLabel, addLabel, render }: ListProps<T>) {
  function move(from: number, to: number) {
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  }
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border">
          <div className="flex items-center gap-1 border-b bg-muted/50 py-1 pr-1 pl-3">
            <span className="flex-1 truncate text-sm font-medium">{itemLabel(item)}</span>
            <Button variant="ghost" size="icon" className="size-8" disabled={i === 0}
              onClick={() => move(i, i - 1)} aria-label={`Move ${itemLabel(item)} up`}>
              <ChevronUp />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" disabled={i === items.length - 1}
              onClick={() => move(i, i + 1)} aria-label={`Move ${itemLabel(item)} down`}>
              <ChevronDown />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove ${itemLabel(item)}`}>
              <Trash2 />
            </Button>
          </div>
          <div className="grid gap-5 p-3 sm:p-4">
            {render(item, (changes) =>
              onChange(items.map((current, j) => (j === i ? { ...current, ...changes } : current))),
            )}
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="justify-self-start"
        onClick={() => onChange([...items, blank])}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}
