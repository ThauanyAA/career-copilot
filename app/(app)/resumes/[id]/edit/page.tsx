import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updateResume } from "../../actions";
import { ResumeForm } from "../../_components/ResumeForm";
import { getAuthenticatedResumeUser } from "../../_lib/auth";

type EditResumePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const ResumeRouteParamsSchema = z.object({
  id: z.string().uuid(),
});

function getResumesRedirectPath(error: string) {
  return `/resumes?error=${encodeURIComponent(error)}`;
}

export default async function EditResumePage({ params }: EditResumePageProps) {
  const { supabase, userId } = await getAuthenticatedResumeUser();
  const parsedParams = ResumeRouteParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    redirect(getResumesRedirectPath("Resume not found"));
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", parsedParams.data.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Resume edit load error:", {
      code: error.code,
      message: error.message,
    });
    redirect(getResumesRedirectPath("Unable to load resume"));
  }

  if (!resume) {
    redirect(getResumesRedirectPath("Resume not found"));
  }

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
            Edit resume
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Update the saved resume text used by analysis and application
            workflows.
          </p>
          <ResumeForm
            action={updateResume}
            resume={resume}
            submitLabel="Update resume"
          />
        </section>
      </div>
    </main>
  );
}
