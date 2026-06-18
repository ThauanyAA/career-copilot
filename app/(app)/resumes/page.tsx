import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  createResume,
  deleteResume,
  markResumePrimary,
  updateResume,
} from "./actions";
import { AddReusableAnswerSuggestionButton } from "./AddReusableAnswerSuggestionButton";
import { AnalyzeResumeButton } from "./AnalyzeResumeButton";
import { ApplyProfileSuggestionButton } from "./ApplyProfileSuggestionButton";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { MarkResumeInsightReviewedButton } from "./MarkResumeInsightReviewedButton";
import {
  getProfileSuggestionApplyState,
  type CandidateProfileRow,
  type ProfileSuggestionApplyState,
} from "./profileSuggestionApply";
import {
  getReusableAnswerSuggestionApplyState,
  type ReusableAnswerDuplicateCandidate,
  type ReusableAnswerSuggestionApplyState,
} from "./reusableAnswerSuggestionApply";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import {
  ResumeInsightResultSchema,
  type ResumeInsightResult,
} from "@/types/resumeIntelligence";

type Resume = Database["public"]["Tables"]["resumes"]["Row"];
type ResumeInsightRow =
  Database["public"]["Tables"]["resume_insights"]["Row"];

type ResumeInsightPreview = {
  row: Pick<
    ResumeInsightRow,
    | "id"
    | "resume_id"
    | "status"
    | "summary"
    | "structured_data"
    | "profile_suggestions"
    | "reusable_answer_suggestions"
    | "missing_info_questions"
    | "warnings"
    | "limitations"
    | "updated_at"
  >;
  result: ResumeInsightResult | null;
};

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

  const [
    latestInsightsByResumeId,
    { data: profileRow, error: profileError },
    { data: reusableAnswerRows, error: reusableAnswersError },
  ] = await Promise.all([
    loadLatestInsightsByResumeId({
      resumeIds: resumes.map((resume) => resume.id),
      supabase,
      userId,
    }),
    supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("reusable_answers")
      .select("label, answer")
      .eq("user_id", userId),
  ]);
  const currentProfile = profileRow ?? null;
  const existingReusableAnswers = reusableAnswerRows ?? [];

  if (profileError) {
    console.error("Resume profile suggestion profile load error:", {
      code: profileError.code,
      message: profileError.message,
    });
  }

  if (reusableAnswersError) {
    console.error("Resume reusable answer suggestion duplicate load error:", {
      code: reusableAnswersError.code,
      message: reusableAnswersError.message,
    });
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
                      <AnalyzeResumeButton resumeId={resume.id} />
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

                  <ResumeInsightPreviewSection
                    currentProfile={currentProfile}
                    existingReusableAnswers={existingReusableAnswers}
                    insight={latestInsightsByResumeId.get(resume.id)}
                  />

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

async function loadLatestInsightsByResumeId({
  resumeIds,
  supabase,
  userId,
}: {
  resumeIds: string[];
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
}) {
  const insightsByResumeId = new Map<string, ResumeInsightPreview>();

  if (resumeIds.length === 0) {
    return insightsByResumeId;
  }

  const { data: insights, error } = await supabase
    .from("resume_insights")
    .select(
      "id,resume_id,status,summary,structured_data,profile_suggestions,reusable_answer_suggestions,missing_info_questions,warnings,limitations,updated_at"
    )
    .eq("user_id", userId)
    .in("resume_id", resumeIds)
    .in("status", ["draft", "reviewed", "stale"])
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Resume insights load error:", {
      code: error.code,
      message: error.message,
    });

    return insightsByResumeId;
  }

  for (const insight of insights ?? []) {
    if (insightsByResumeId.has(insight.resume_id)) {
      continue;
    }

    insightsByResumeId.set(insight.resume_id, {
      row: insight,
      result: parseResumeInsightResult(insight),
    });
  }

  return insightsByResumeId;
}

function parseResumeInsightResult(
  insight: ResumeInsightPreview["row"]
): ResumeInsightResult | null {
  const parsed = ResumeInsightResultSchema.safeParse({
    summary: insight.summary,
    structuredData: insight.structured_data,
    profileSuggestions: insight.profile_suggestions,
    reusableAnswerSuggestions: insight.reusable_answer_suggestions,
    missingInfoQuestions: insight.missing_info_questions,
    warnings: insight.warnings,
    limitations: insight.limitations,
  });

  return parsed.success ? parsed.data : null;
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

function ResumeInsightPreviewSection({
  currentProfile,
  existingReusableAnswers,
  insight,
}: {
  currentProfile: CandidateProfileRow | null;
  existingReusableAnswers: ReusableAnswerDuplicateCandidate[];
  insight?: ResumeInsightPreview;
}) {
  if (!insight) {
    return (
      <section className="border-t border-zinc-100 py-5 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        No resume insights yet.
      </section>
    );
  }

  if (!insight.result) {
    return (
      <section className="border-t border-zinc-100 py-5 dark:border-zinc-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Latest insight
            </h4>
            <InsightStatusBadge status={insight.row.status} />
          </div>
          <MarkReviewedAction insight={insight} />
        </div>
        <p className="break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {insight.row.summary}
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          This insight uses an older format and cannot be previewed fully.
        </p>
      </section>
    );
  }

  const result = insight.result;

  return (
    <section className="border-t border-zinc-100 py-5 dark:border-zinc-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Latest insight
          </h4>
          <InsightStatusBadge status={insight.row.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Updated {new Date(insight.row.updated_at).toLocaleDateString()}
          </p>
          <MarkReviewedAction insight={insight} />
        </div>
      </div>

      <div className="space-y-5">
        <PreviewBlock title="Summary">
          <p className="break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {result.summary}
          </p>
        </PreviewBlock>

        <PreviewBlock title="Profile suggestions">
          {result.profileSuggestions.length === 0 ? (
            <EmptyPreviewText>No profile suggestions yet.</EmptyPreviewText>
          ) : (
            <div className="space-y-3">
              {result.profileSuggestions.map((suggestion, index) => {
                const applyState = getProfileSuggestionApplyState({
                  profile: currentProfile,
                  suggestion,
                });

                return (
                  <div
                    key={`${suggestion.field}-${index}`}
                    className="border-l-2 border-blue-100 pl-3 dark:border-blue-900"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="break-words text-sm font-medium text-zinc-900 dark:text-white">
                          {formatFieldName(suggestion.field)}:{" "}
                          <span className="font-normal text-zinc-700 dark:text-zinc-200">
                            {formatSuggestedValue(suggestion.suggestedValue)}
                          </span>
                        </p>
                        <PreviewReason reason={suggestion.reason} />
                        <PreviewEvidenceType
                          evidenceType={suggestion.evidenceType}
                        />
                        <SourceSnippet snippet={suggestion.sourceSnippet} />
                      </div>
                      {applyState.status === "ready" ? (
                        <ApplyProfileSuggestionButton
                          actionLabel={applyState.actionLabel}
                          insightId={insight.row.id}
                          suggestionIndex={index}
                        />
                      ) : (
                        <ProfileSuggestionApplyStatus state={applyState} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PreviewBlock>

        <PreviewBlock title="Reusable answer suggestions">
          {result.reusableAnswerSuggestions.length === 0 ? (
            <EmptyPreviewText>No reusable answer suggestions yet.</EmptyPreviewText>
          ) : (
            <div className="space-y-3">
              {result.reusableAnswerSuggestions.map((suggestion, index) => {
                const applyState = getReusableAnswerSuggestionApplyState({
                  existingAnswers: existingReusableAnswers,
                  suggestion,
                });

                return (
                  <div
                    key={`${suggestion.label}-${index}`}
                    className="border-l-2 border-emerald-100 pl-3 dark:border-emerald-900"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="break-words text-sm font-medium text-zinc-900 dark:text-white">
                          {suggestion.label}
                        </p>
                        <p className="mt-1 break-words text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                          {formatFieldName(suggestion.category)}
                        </p>
                        <p className="mt-2 break-words text-sm font-medium text-zinc-900 dark:text-white">
                          Question:{" "}
                          <span className="font-normal text-zinc-700 dark:text-zinc-200">
                            {suggestion.question}
                          </span>
                        </p>
                        <p className="mt-1 break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                          {suggestion.answer}
                        </p>
                        <PreviewReason reason={suggestion.reason} />
                        <SourceSnippet snippet={suggestion.sourceSnippet} />
                      </div>
                      {applyState.status === "ready" ? (
                        <AddReusableAnswerSuggestionButton
                          actionLabel={applyState.actionLabel}
                          insightId={insight.row.id}
                          suggestionIndex={index}
                        />
                      ) : (
                        <ReusableAnswerSuggestionApplyStatus
                          state={applyState}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PreviewBlock>

        <PreviewBlock title="Missing info questions">
          {result.missingInfoQuestions.length === 0 ? (
            <EmptyPreviewText>No missing info questions yet.</EmptyPreviewText>
          ) : (
            <div className="space-y-2">
              {result.missingInfoQuestions.map((question, index) => (
                <div key={`${question.field}-${index}`}>
                  <p className="break-words text-sm font-medium text-zinc-900 dark:text-white">
                    {question.question}
                  </p>
                  <PreviewReason reason={question.reason} />
                </div>
              ))}
            </div>
          )}
        </PreviewBlock>

        {(result.warnings.length > 0 || result.limitations.length > 0) && (
          <PreviewBlock title="Warnings and limitations">
            <ul className="space-y-1 break-words text-sm text-zinc-600 dark:text-zinc-300">
              {[...result.warnings, ...result.limitations].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </PreviewBlock>
        )}
      </div>
    </section>
  );
}

function MarkReviewedAction({ insight }: { insight: ResumeInsightPreview }) {
  if (insight.row.status !== "draft") {
    return null;
  }

  return <MarkResumeInsightReviewedButton insightId={insight.row.id} />;
}

function InsightStatusBadge({
  status,
}: {
  status: ResumeInsightPreview["row"]["status"];
}) {
  return (
    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {status}
    </span>
  );
}

function ProfileSuggestionApplyStatus({
  state,
}: {
  state: ProfileSuggestionApplyState;
}) {
  if (state.status === "ready") {
    return null;
  }

  const className =
    state.status === "applied"
      ? "shrink-0 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-200"
      : "shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  return <span className={className}>{state.message}</span>;
}

function ReusableAnswerSuggestionApplyStatus({
  state,
}: {
  state: ReusableAnswerSuggestionApplyState;
}) {
  if (state.status === "ready") {
    return null;
  }

  const className =
    state.status === "added"
      ? "shrink-0 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-200"
      : "shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  return <span className={className}>{state.message}</span>;
}

function PreviewBlock({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div>
      <h5 className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        {title}
      </h5>
      {children}
    </div>
  );
}

function EmptyPreviewText({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>
  );
}

function PreviewReason({ reason }: { reason: string }) {
  return (
    <p className="mt-1 break-words text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
      {reason}
    </p>
  );
}

function PreviewEvidenceType({ evidenceType }: { evidenceType: string }) {
  return (
    <p className="mt-1 break-words text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
      Evidence: {formatFieldName(evidenceType)}
    </p>
  );
}

function SourceSnippet({ snippet }: { snippet: string | null }) {
  if (!snippet) {
    return null;
  }

  return (
    <p className="mt-2 break-words text-xs italic leading-relaxed text-zinc-500 dark:text-zinc-400">
      Source: {snippet}
    </p>
  );
}

function formatFieldName(field: string) {
  return field.replaceAll("_", " ");
}

function formatSuggestedValue(value: string | string[]) {
  return Array.isArray(value) ? value.join(", ") : value;
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
