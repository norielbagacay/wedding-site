import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "../lib/supabase";
import { supabaseEnv } from "../lib/supabase-env";

/**
 * The signed-in user, and whether they're in the admins table. Signed-out visitors go to
 * the login page. The database checks admin rights again on every read and write.
 */
export const getAdmin = cache(async () => {
  if (!supabaseEnv()) redirect("/management/login");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/management/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { supabase, email: user.email ?? "", isAdmin: isAdmin === true };
});
