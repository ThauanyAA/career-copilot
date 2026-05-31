import { redirect } from "next/navigation";
import {
  createResume,
  deleteResume,
  markResumePrimary,
  updateResume,
} from "./actions";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Resume = Database["public"]["Tables"]["resumes"]["Row"];

type ResumesPageProps = {
  searchParams: Promise<{
    created?: string;
    deleted?: string;
    error?: string;
    primary?: string;
    updated?: string;
  }>;
};

export default async function ResumesPage({ searchParams }: ResumesPageProps) {
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

  const { data: resumeRows, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("updated_at", { ascending: false });

  let resumes = resumeRows ?? [];
  let loadError: string | null = null;

  if (error) {
    console.error("Resumes load error:", {
      code: error.code,
      message: error.message,
    });
    resumes = [];
    loadError = "Unable to load your saved resumes right now.";
  }

  const params = await searchParams;
  const statusMessage = getStatusMessage(params);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Career Copilot
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
            Resumes
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Save text versions of your resume and choose a primary version for
            future application workflows.
          </p>
        </div>

        {statusMessage && (
          <p className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            {statusMessage}
          </p>
        )}

        {params.error && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {params.error}
          </p>
        )}

        {loadError && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {loadError}
          </p>
        )}

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Add a resume
          </h2>
          <ResumeForm action={createResume} submitLabel="Save resume" />
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Saved resumes
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {loadError
                  ? "Unable to load saved resumes"
                  : `${resumes.length} saved`}
              </p>
            </div>
          </div>

          {loadError ? null : resumes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
              No resumes saved yet.
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <article
                  key={resume.id}
                  className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                          {resume.title}
                        </h3>
                        {resume.is_primary && (
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Updated {new Date(resume.updated_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!resume.is_primary && (
                        <form action={markResumePrimary}>
                          <input type="hidden" name="id" value={resume.id} />
                          <FormSubmitButton
                            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"
                            pendingLabel="Updating..."
                          >
                            Make primary
                          </FormSubmitButton>
                        </form>
                      )}
                      <form action={deleteResume}>
                        <input type="hidden" name="id" value={resume.id} />
                        <FormSubmitButton
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                          pendingLabel="Deleting..."
                        >
                          Delete
                        </FormSubmitButton>
                      </form>
                    </div>
                  </div>

                  <ResumeForm
                    action={updateResume}
                    resume={resume}
                    submitLabel="Update resume"
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function getStatusMessage(params: Awaited<ResumesPageProps["searchParams"]>) {
  if (params.created) {
    return "Resume saved.";
  }

  if (params.updated) {
    return "Resume updated.";
  }

  if (params.deleted) {
    return "Resume deleted.";
  }

  if (params.primary) {
    return "Primary resume updated.";
  }

  return null;
}

function ResumeForm({
  action,
  resume,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  resume?: Resume;
  submitLabel: string;
}) {
  const fieldIdPrefix = resume?.id ?? "new";

  return (
    <form action={action} className="mt-5">
      {resume && <input type="hidden" name="id" value={resume.id} />}
      <div className="space-y-5">
        <ResumeInput
          fieldId={`${fieldIdPrefix}-title`}
          label="Title"
          name="title"
          defaultValue={resume?.title}
          placeholder="Frontend resume - May 2026"
        />
        <ResumeTextarea
          fieldId={`${fieldIdPrefix}-content`}
          label="Resume text"
          name="content"
          defaultValue={resume?.content}
          placeholder="Paste the text version of your resume."
          rows={resume ? 10 : 14}
        />
        {!resume && (
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              name="is_primary"
              className="h-4 w-4 rounded border-zinc-300 text-blue-600"
            />
            Set as primary resume
          </label>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <FormSubmitButton
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          pendingLabel={resume ? "Updating..." : "Saving..."}
        >
          {submitLabel}
        </FormSubmitButton>
      </div>
    </form>
  );
}

function ResumeInput({
  defaultValue,
  fieldId,
  label,
  name,
  placeholder,
}: {
  defaultValue?: string | null;
  fieldId: string;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-zinc-900 dark:text-white"
      >
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        type="text"
        required
        maxLength={120}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}

function ResumeTextarea({
  defaultValue,
  fieldId,
  label,
  name,
  placeholder,
  rows,
}: {
  defaultValue?: string | null;
  fieldId: string;
  label: string;
  name: string;
  placeholder?: string;
  rows: number;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-zinc-900 dark:text-white"
      >
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        required
        maxLength={60000}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}
