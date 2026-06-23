import type { ReusableAnswerDuplicateCandidate } from "../reusableAnswerSuggestionApply";
import {
  EmptyPreviewText,
  PreviewBlock,
} from "./ResumeInsightPreviewPrimitives";
import { ReusableAnswerSuggestionItem } from "./ReusableAnswerSuggestionItem";
import type { ResumeInsightPreview } from "./types";
import type { ResumeInsightResult } from "@/types/resumeIntelligence";

export function ReusableAnswerSuggestionsSection({
  existingReusableAnswers,
  insightId,
  suggestions,
}: {
  existingReusableAnswers: ReusableAnswerDuplicateCandidate[];
  insightId: ResumeInsightPreview["row"]["id"];
  suggestions: ResumeInsightResult["reusableAnswerSuggestions"];
}) {
  return (
    <PreviewBlock title="Reusable answer suggestions">
      {suggestions.length === 0 ? (
        <EmptyPreviewText>No reusable answer suggestions yet.</EmptyPreviewText>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <ReusableAnswerSuggestionItem
              existingReusableAnswers={existingReusableAnswers}
              index={index}
              insightId={insightId}
              key={`${suggestion.label}-${index}`}
              suggestion={suggestion}
            />
          ))}
        </div>
      )}
    </PreviewBlock>
  );
}
