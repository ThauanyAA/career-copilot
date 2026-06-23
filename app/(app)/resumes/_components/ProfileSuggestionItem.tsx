import { ApplyProfileSuggestionButton } from "../ApplyProfileSuggestionButton";
import {
  getProfileSuggestionApplyState,
  type CandidateProfileRow,
  type ProfileSuggestionApplyState,
} from "../profileSuggestionApply";
import {
  formatFieldName,
  formatSuggestedValue,
  PreviewEvidenceType,
  PreviewReason,
  SourceSnippet,
} from "./ResumeInsightPreviewPrimitives";
import type { ResumeInsightPreview } from "./types";
import type { ResumeInsightResult } from "@/types/resumeIntelligence";

type ProfileSuggestion =
  ResumeInsightResult["profileSuggestions"][number];

export function ProfileSuggestionItem({
  currentProfile,
  index,
  insightId,
  suggestion,
}: {
  currentProfile: CandidateProfileRow | null;
  index: number;
  insightId: ResumeInsightPreview["row"]["id"];
  suggestion: ProfileSuggestion;
}) {
  const applyState = getProfileSuggestionApplyState({
    profile: currentProfile,
    suggestion,
  });

  return (
    <div className="border-l-2 border-blue-100 pl-3 dark:border-blue-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="break-words text-sm font-medium text-zinc-900 dark:text-white">
            {formatFieldName(suggestion.field)}:{" "}
            <span className="font-normal text-zinc-700 dark:text-zinc-200">
              {formatSuggestedValue(suggestion.suggestedValue)}
            </span>
          </p>
          <PreviewReason reason={suggestion.reason} />
          <PreviewEvidenceType evidenceType={suggestion.evidenceType} />
          <SourceSnippet snippet={suggestion.sourceSnippet} />
        </div>
        {applyState.status === "ready" ? (
          <ApplyProfileSuggestionButton
            actionLabel={applyState.actionLabel}
            insightId={insightId}
            suggestionIndex={index}
          />
        ) : (
          <ProfileSuggestionApplyStatus state={applyState} />
        )}
      </div>
    </div>
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
