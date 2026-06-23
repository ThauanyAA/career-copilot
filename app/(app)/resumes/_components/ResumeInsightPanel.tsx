import type { CandidateProfileRow } from "../profileSuggestionApply";
import type { ReusableAnswerDuplicateCandidate } from "../reusableAnswerSuggestionApply";
import { InsightWarningsSection } from "./InsightWarningsSection";
import { MissingInfoSection } from "./MissingInfoSection";
import { ProfileSuggestionsSection } from "./ProfileSuggestionsSection";
import { ReusableAnswerSuggestionsSection } from "./ReusableAnswerSuggestionsSection";
import { PreviewBlock } from "./ResumeInsightPreviewPrimitives";
import {
  OutdatedInsightMessage,
  ResumeInsightStatus,
} from "./ResumeInsightStatus";
import type { ResumeInsightPreview } from "./types";

export function ResumeInsightPanel({
  currentProfile,
  existingReusableAnswers,
  insight,
  isOutdated,
}: {
  currentProfile: CandidateProfileRow | null;
  existingReusableAnswers: ReusableAnswerDuplicateCandidate[];
  insight?: ResumeInsightPreview;
  isOutdated: boolean;
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
        <ResumeInsightStatus
          insightId={insight.row.id}
          isOutdated={isOutdated}
          status={insight.row.status}
        />
        {isOutdated && <OutdatedInsightMessage />}
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
      <ResumeInsightStatus
        insightId={insight.row.id}
        isOutdated={isOutdated}
        status={insight.row.status}
        updatedAt={insight.row.updated_at}
      />
      {isOutdated && <OutdatedInsightMessage />}

      <div className="space-y-5">
        <PreviewBlock title="Summary">
          <p className="break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {result.summary}
          </p>
        </PreviewBlock>

        <ProfileSuggestionsSection
          currentProfile={currentProfile}
          insightId={insight.row.id}
          suggestions={result.profileSuggestions}
        />

        <ReusableAnswerSuggestionsSection
          existingReusableAnswers={existingReusableAnswers}
          insightId={insight.row.id}
          suggestions={result.reusableAnswerSuggestions}
        />

        <MissingInfoSection questions={result.missingInfoQuestions} />

        <InsightWarningsSection
          limitations={result.limitations}
          warnings={result.warnings}
        />
      </div>
    </section>
  );
}
