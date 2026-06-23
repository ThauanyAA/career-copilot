import type { CandidateProfileRow } from "../profileSuggestionApply";
import {
  EmptyPreviewText,
  PreviewBlock,
} from "./ResumeInsightPreviewPrimitives";
import { ProfileSuggestionItem } from "./ProfileSuggestionItem";
import type { ResumeInsightPreview } from "./types";
import type { ResumeInsightResult } from "@/types/resumeIntelligence";

export function ProfileSuggestionsSection({
  currentProfile,
  insightId,
  suggestions,
}: {
  currentProfile: CandidateProfileRow | null;
  insightId: ResumeInsightPreview["row"]["id"];
  suggestions: ResumeInsightResult["profileSuggestions"];
}) {
  return (
    <PreviewBlock title="Profile suggestions">
      {suggestions.length === 0 ? (
        <EmptyPreviewText>No profile suggestions yet.</EmptyPreviewText>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <ProfileSuggestionItem
              currentProfile={currentProfile}
              index={index}
              insightId={insightId}
              key={`${suggestion.field}-${index}`}
              suggestion={suggestion}
            />
          ))}
        </div>
      )}
    </PreviewBlock>
  );
}
