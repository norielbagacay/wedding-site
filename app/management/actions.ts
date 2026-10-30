"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, WEDDING_TAG } from "../lib/supabase";
import { parseWedding } from "../lib/wedding-data";

export type SignInState = { error?: string };

export async function signIn(_state: SignInState, formData: FormData): Promise<SignInState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    console.error("Sign-in failed:", error.code, error.message);
    if (error.code === "email_not_confirmed") {
      return { error: "This account’s email isn’t confirmed yet. Confirm the user in Supabase." };
    }
    if (error.code === "invalid_credentials") {
      return { error: "That email and password don’t match an account." };
    }
    return { error: `Couldn’t sign in: ${error.message}` };
  }
  redirect("/management");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/management/login");
}

export type SaveResult = { ok: true; savedAt: string } | { ok: false; problems: string[] };

/** Saves the content and refreshes the public pages, so guests see it without a rebuild. */
export async function saveWedding(input: unknown): Promise<SaveResult> {
  const parsed = parseWedding(input);
  if (!parsed.ok) return parsed;

  const supabase = await createSupabaseServerClient();
  // The database only accepts writes from emails in the admins table (supabase/schema.sql).
  const { data, error } = await supabase
    .from("site_content")
    .upsert({ id: 1, data: parsed.wedding, updated_at: new Date().toISOString() })
    .select("updated_at")
    .single();
  if (error || !data) {
    console.error("Couldn't save the site content:", error);
    return {
      ok: false,
      problems: ["Couldn’t save. Check that you’re still signed in as an admin, then try again."],
    };
  }

  updateTag(WEDDING_TAG);
  revalidatePath("/", "layout");
  return { ok: true, savedAt: data.updated_at };
}

/** Removes a reply, e.g. a duplicate or a test. Only admins can (supabase/schema.sql). */
export async function deleteRsvp(id: string): Promise<{ ok: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("rsvps").delete({ count: "exact" }).eq("id", id);
  if (error || count !== 1) {
    console.error("Couldn't delete an RSVP:", error);
    return { ok: false };
  }
  revalidatePath("/management/rsvps");
  return { ok: true };
}
