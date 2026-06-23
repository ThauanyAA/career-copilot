import Link from "next/link";
import { Header } from "@/components/Header";
import { JobMatchAnalyzer } from "@/components/JobMatchAnalyzer";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Application workspace
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                Analyze a job match here, or use your saved profile, resumes,
                and answers in the protected workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAuthenticated ? (
                <HomeActionLink href="/dashboard" label="Go to dashboard" />
              ) : (
                <>
                  <HomeActionLink href="/login" label="Log in" />
                  <HomeActionLink
                    href="/signup"
                    label="Sign up"
                    variant="primary"
                  />
                </>
              )}
            </div>
          </div>
          <JobMatchAnalyzer />
        </div>
      </main>
    </div>
  );
}

function HomeActionLink({
  href,
  label,
  variant = "secondary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      : "rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900";

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
