import Link from "next/link";
import { ResumeCard } from "./_components/ResumeCard";
import { ResumeHeader } from "./_components/ResumeHeader";
import type { ResumeInsightPreview } from "./_components/types";
import { getAuthenticatedResumeUser } from "./_lib/auth";
import {
  ResumeInsightResultSchema,
  type ResumeInsightResult,
} from "@/types/resumeIntelligence";
import { calculateResumeContentHash } from "@/ai/resumeIntelligence/hash";

type ResumeSupabaseClient = Awaited<
  ReturnType<typeof getAuthenticatedResumeUser>
>["supabase"];

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
  const { supabase, userId } = await getAuthenticatedResumeUser();

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

  const currentResumeHashesByResumeId = new Map(
    resumes.map((resume) => [
      resume.id,
      calculateResumeContentHash(resume.content),
    ])
  );

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
        <ResumeHeader />

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

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
            <Link
              href="/resumes/new"
              className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Add resume
            </Link>
          </div>

          {loadError ? null : resumes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
              No resumes saved yet.
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => {
                const latestInsight = latestInsightsByResumeId.get(resume.id);
                const currentResumeHash = currentResumeHashesByResumeId.get(
                  resume.id
                );
                const isInsightOutdated = Boolean(
                  latestInsight &&
                    currentResumeHash &&
                    latestInsight.row.source_content_hash !== currentResumeHash
                );

                return (
                  <ResumeCard
                    currentProfile={currentProfile}
                    existingReusableAnswers={existingReusableAnswers}
                    insight={latestInsight}
                    isInsightOutdated={isInsightOutdated}
                    key={resume.id}
                    resume={resume}
                  />
                );
              })}
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
  supabase: ResumeSupabaseClient;
  userId: string;
}) {
  const insightsByResumeId = new Map<string, ResumeInsightPreview>();

  if (resumeIds.length === 0) {
    return insightsByResumeId;
  }

  const { data: insights, error } = await supabase
    .from("resume_insights")
    .select(
      "id,resume_id,source_content_hash,status,summary,structured_data,profile_suggestions,reusable_answer_suggestions,missing_info_questions,warnings,limitations,updated_at"
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
