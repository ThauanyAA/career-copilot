import Link from "next/link";
import { createResume } from "../actions";
import { ResumeForm } from "../_components/ResumeForm";
import { getAuthenticatedResumeUser } from "../_lib/auth";

export default async function NewResumePage() {
  await getAuthenticatedResumeUser();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/resumes"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          Back to resumes
        </Link>

        <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Career Copilot
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
            Add a resume
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Save a text version of your resume for analysis and application
            workflows.
          </p>
          <ResumeForm action={createResume} submitLabel="Save resume" />
        </section>
      </div>
    </main>
  );
}
