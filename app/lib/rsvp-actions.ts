"use server";

import { createClient } from "@supabase/supabase-js";
import { rsvpRow, type RsvpAnswers } from "./rsvp";
import { supabaseEnv } from "./supabase-env";

/** Records a guest's reply in Supabase; admins see it in /management/rsvps. */
export async function submitRsvp(answers: RsvpAnswers): Promise<{ ok: true } | { ok: false; error: string }> {
  const checked = rsvpRow(answers);
  if (!checked.ok) return checked;

  const env = supabaseEnv();
  if (!env) return { ok: false, error: "Online RSVP isn’t open yet." };
  const supabase = createClient(env.url, env.key, { auth: { persistSession: false } });
  // No .select() afterwards: guests may add a reply but not read any back.
  const { error } = await supabase.from("rsvps").insert(checked.row);
  if (error) {
    console.error("Couldn't save an RSVP:", error);
    return { ok: false, error: "Sorry, that didn’t go through. Please try again." };
  }
  return { ok: true };
}
