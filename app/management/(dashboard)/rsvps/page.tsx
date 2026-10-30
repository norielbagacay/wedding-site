import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RsvpRow } from "../../../lib/rsvp";
import { getAdmin } from "../../admin";
import { RsvpList } from "./RsvpList";

export const dynamic = "force-dynamic";

export default async function RsvpsPage() {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) return null;

  const { data, error } = await supabase
    .from("rsvps")
    .select("id, name, attending, guests, message, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Couldn't load the RSVPs: ${error.message}`);
  const rsvps: RsvpRow[] = data;

  const attending = rsvps.filter((rsvp) => rsvp.attending);
  const stats = [
    { label: "Replies", value: rsvps.length },
    { label: "Guests coming", value: attending.reduce((sum, rsvp) => sum + rsvp.guests, 0) },
    { label: "Accepted", value: attending.length },
    { label: "Declined", value: rsvps.length - attending.length },
  ];

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map(({ label, value }) => (
          <Card key={label} className="gap-1 py-4">
            <CardHeader className="px-4">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <RsvpList rsvps={rsvps} />
    </div>
  );
}
