import { JobMatchAnalyzer } from "@/components/JobMatchAnalyzer";

export default function NewApplicationPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Career Copilot
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
            New Application / Analyzer
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Analyze a resume against a job description from inside your
            authenticated application workspace.
          </p>
        </div>

        <JobMatchAnalyzer />
      </div>
    </main>
  );
}
