/** Set in .env.local (and in Vercel's environment variables); see .env.example. */
export function supabaseEnv() {
  // Only the project address: the dashboard also shows it with /rest/v1/ on the end.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/(rest\/v1)?\/?$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && key ? { url, key } : null;
}
