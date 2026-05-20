import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/");
  }

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : "Authenticated user";

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Career Copilot
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Supabase authentication is wired for this protected area. Candidate
          memory features will be added in the next phase.
        </p>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Signed in as {email}
        </p>
      </div>
    </main>
  );
}
