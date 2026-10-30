import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { wedding as defaultWedding, type Wedding } from "../content";
import { supabaseEnv } from "./supabase-env";

/** Cache tag for the site content; saving in /management expires it. */
export const WEDDING_TAG = "wedding";

/**
 * The content guests see. The page is cached and refreshed when /management saves
 * (and every few minutes, to pick up edits made straight in the Supabase dashboard).
 * Falls back to app/content.ts until Supabase is set up or while it can't be reached.
 */
export async function getWedding(): Promise<Wedding> {
  const env = supabaseEnv();
  if (!env) return defaultWedding;
  try {
    const response = await fetch(`${env.url}/rest/v1/site_content?id=eq.1&select=data`, {
      headers: { apikey: env.key },
      cache: "force-cache",
      next: { tags: [WEDDING_TAG], revalidate: 300 },
    });
    if (!response.ok) throw new Error(`Supabase responded ${response.status}`);
    const rows: { data: Partial<Wedding> }[] = await response.json();
    // Fields added to the site after the last save still get their defaults.
    return rows[0] ? { ...defaultWedding, ...rows[0].data } : defaultWedding;
  } catch (error) {
    console.error("Couldn't load the site content from Supabase:", error);
    return defaultWedding;
  }
}

/** A client that acts as the signed-in admin, for /management. */
export async function createSupabaseServerClient() {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase isn't set up: add the keys from .env.example to .env.local.");
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Pages can't set cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
