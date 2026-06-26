import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedResumeUser() {
  const supabase = await createClient();
  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (authError || typeof userId !== "string") {
    redirect("/login");
  }

  return { supabase, userId };
}
