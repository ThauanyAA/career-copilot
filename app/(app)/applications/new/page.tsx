import { ApplicationPrep } from "@/components/ApplicationPrep";

export default function NewApplicationPage() {
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

        <ApplicationPrep />
      </div>
    </main>
  );
}
