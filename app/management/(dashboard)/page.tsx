import { wedding as defaultWedding, type Wedding } from "../../content";
import { getAdmin } from "../admin";
import { ContentEditor } from "./ContentEditor";

// Always checks who's signed in and shows the latest saved content.
export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) return null;

  const { data: row, error } = await supabase
    .from("site_content")
    .select("data, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(`Couldn't load the site content: ${error.message}`);
  const content: Wedding = row ? { ...defaultWedding, ...row.data } : defaultWedding;

  return <ContentEditor initial={content} savedAt={row?.updated_at ?? null} />;
}
