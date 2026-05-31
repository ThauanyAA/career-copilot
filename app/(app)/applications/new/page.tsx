import { redirect } from "next/navigation";
import { ApplicationPrep } from "@/components/ApplicationPrep";
import { createClient } from "@/lib/supabase/server";

export default async function NewApplicationPage() {
  const supabase = await createClient();
  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !claimsData?.claims) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  if (typeof userId !== "string") {
    redirect("/login");
  }

  const { data: primaryResume, error: primaryResumeError } = await supabase
    .from("resumes")
    .select("title, content")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (primaryResumeError) {
    console.error("Primary resume load error:", {
      code: primaryResumeError.code,
      message: primaryResumeError.message,
    });
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Career Copilot
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
            New Application
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Prepare application-ready materials from your saved profile,
            reusable answers, resume, and the job description.
          </p>
        </div>

        <ApplicationPrep primaryResume={primaryResume ?? null} />
      </div>
    </main>
  );
}
