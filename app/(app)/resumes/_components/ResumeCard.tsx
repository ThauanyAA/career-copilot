import Link from "next/link";
import { markResumePrimary } from "../actions";
import { AnalyzeResumeButton } from "../AnalyzeResumeButton";
import type { CandidateProfileRow } from "../profileSuggestionApply";
import type { ReusableAnswerDuplicateCandidate } from "../reusableAnswerSuggestionApply";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { DeleteResumeForm } from "./DeleteResumeForm";
import { ResumeInsightPanel } from "./ResumeInsightPanel";
import type { Resume, ResumeInsightPreview } from "./types";

type ResumeInsightStatus = {
  label: "No insight" | "Insight ready" | "Outdated" | "Reviewed";
  className: string;
};

function getResumeInsightStatus({
  insight,
  isInsightOutdated,
}: {
  insight?: ResumeInsightPreview;
  isInsightOutdated: boolean;
}): ResumeInsightStatus {
  if (!insight) {
    return {
      label: "No insight",
      className:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    };
  }

  if (isInsightOutdated) {
    return {
      label: "Outdated",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    };
  }

  if (insight.row.status === "reviewed") {
    return {
      label: "Reviewed",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    };
  }

  return {
    label: "Insight ready",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  };
}

export function ResumeCard({
  currentProfile,
  existingReusableAnswers,
  insight,
  isInsightOutdated,
  resume,
}: {
  currentProfile: CandidateProfileRow | null;
  existingReusableAnswers: ReusableAnswerDuplicateCandidate[];
  insight?: ResumeInsightPreview;
  isInsightOutdated: boolean;
  resume: Resume;
}) {
  const insightStatus = getResumeInsightStatus({ insight, isInsightOutdated });

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              {resume.title}
            </h3>
            {resume.is_primary && (
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                Primary
              </span>
            )}
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${insightStatus.className}`}
            >
              {insightStatus.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Updated {new Date(resume.updated_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-2 sm:shrink-0 sm:justify-end">
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
          <Link
            href={`/resumes/${resume.id}/edit`}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Edit
          </Link>
          <AnalyzeResumeButton resumeId={resume.id} />
          <DeleteResumeForm resumeId={resume.id} />
        </div>
      </div>

      <ResumeInsightPanel
        currentProfile={currentProfile}
        existingReusableAnswers={existingReusableAnswers}
        insight={insight}
        isOutdated={isInsightOutdated}
      />
    </article>
  );
}
