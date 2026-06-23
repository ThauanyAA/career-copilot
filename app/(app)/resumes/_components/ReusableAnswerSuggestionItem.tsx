import { AddReusableAnswerSuggestionButton } from "../AddReusableAnswerSuggestionButton";
import {
  getReusableAnswerSuggestionApplyState,
  type ReusableAnswerDuplicateCandidate,
  type ReusableAnswerSuggestionApplyState,
} from "../reusableAnswerSuggestionApply";
import {
  formatFieldName,
  PreviewReason,
  SourceSnippet,
  SupportingDetails,
} from "./ResumeInsightPreviewPrimitives";
import type { ResumeInsightPreview } from "./types";
import type { ResumeInsightResult } from "@/types/resumeIntelligence";

type ReusableAnswerSuggestion =
  ResumeInsightResult["reusableAnswerSuggestions"][number];

export function ReusableAnswerSuggestionItem({
  existingReusableAnswers,
  index,
  insightId,
  suggestion,
}: {
  existingReusableAnswers: ReusableAnswerDuplicateCandidate[];
  index: number;
  insightId: ResumeInsightPreview["row"]["id"];
  suggestion: ReusableAnswerSuggestion;
}) {
  const applyState = getReusableAnswerSuggestionApplyState({
    existingAnswers: existingReusableAnswers,
    suggestion,
  });

  return (
    <div className="border-l-2 border-emerald-100 pl-3 dark:border-emerald-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="break-words text-sm font-medium text-zinc-900 dark:text-white">
            {suggestion.label}
          </p>
          <p className="mt-1 break-words text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
            {formatFieldName(suggestion.category)}
          </p>
          <p className="mt-2 break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {suggestion.answer}
          </p>
          <SupportingDetails>
            <p className="break-words text-sm font-medium text-zinc-900 dark:text-white">
              Question:{" "}
              <span className="font-normal text-zinc-700 dark:text-zinc-200">
                {suggestion.question}
              </span>
            </p>
            <PreviewReason reason={suggestion.reason} />
            <SourceSnippet snippet={suggestion.sourceSnippet} />
          </SupportingDetails>
        </div>
        {applyState.status === "ready" ? (
          <AddReusableAnswerSuggestionButton
            actionLabel={applyState.actionLabel}
            insightId={insightId}
            suggestionIndex={index}
          />
        ) : (
          <ReusableAnswerSuggestionApplyStatus state={applyState} />
        )}
      </div>
    </div>
  );
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
