import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./app/lib/supabase-env";

const LOGIN = "/management/login";

/** Keeps the management sign-in fresh, and sends signed-out visitors to the login page. */
export async function proxy(request: NextRequest) {
  const env = supabaseEnv();
  const onLogin = request.nextUrl.pathname === LOGIN;
  if (!env) return onLogin ? NextResponse.next() : NextResponse.redirect(new URL(LOGIN, request.url));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Also refreshes the session cookies when they're about to expire.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  if (!signedIn && !onLogin) return redirect(LOGIN, request, response);
  if (signedIn && onLogin) return redirect("/management", request, response);
  return response;
}

/** A redirect that keeps any session cookies Supabase just refreshed. */
function redirect(path: string, request: NextRequest, from: NextResponse) {
  const response = NextResponse.redirect(new URL(path, request.url));
  for (const cookie of from.cookies.getAll()) response.cookies.set(cookie);
  return response;
}

export const config = {
  matcher: ["/management", "/management/:path*"],
};
