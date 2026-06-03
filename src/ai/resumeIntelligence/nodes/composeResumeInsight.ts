import { ResumeInsightResultSchema } from "@/types/resumeIntelligence";
import type { ResumeInsightGraphRuntimeState } from "../state";

function uniqueCompactList(items: string[], maxItems: number) {
  return Array.from(new Set(items.filter((item) => item.trim().length > 0)))
    .slice(0, maxItems);
}

export async function composeResumeInsight(
  state: ResumeInsightGraphRuntimeState
): Promise<Partial<ResumeInsightGraphRuntimeState>> {
  if (
    !state.summaryResult ||
    !state.profileSuggestionsResult ||
    !state.reusableAnswersAndMissingInfoResult
  ) {
    return { error: "Resume insight generation results are incomplete." };
  }

  const parsedResult = ResumeInsightResultSchema.safeParse({
    summary: state.summaryResult.summary,
    structuredData: state.summaryResult.structuredData,
    profileSuggestions:
      state.profileSuggestionsResult.profileSuggestions,
    reusableAnswerSuggestions:
      state.reusableAnswersAndMissingInfoResult
        .reusableAnswerSuggestions,
    missingInfoQuestions:
      state.reusableAnswersAndMissingInfoResult.missingInfoQuestions,
    warnings: uniqueCompactList(
      [
        ...state.summaryResult.warnings,
        ...state.reusableAnswersAndMissingInfoResult.warnings,
      ],
      5
    ),
    limitations: uniqueCompactList(
      [
        ...(state.wasResumeContentTruncated
          ? [
              "Resume content was truncated before analysis; later sections may not be reflected.",
            ]
          : []),
        ...state.summaryResult.limitations,
        ...state.reusableAnswersAndMissingInfoResult.limitations,
      ],
      5
    ),
  });

  if (!parsedResult.success) {
    console.error("Composed resume insight result validation failed:", {
      errors: parsedResult.error.flatten(),
    });

    return { error: "Composed resume insight did not match the schema." };
  }

  return {
    error: undefined,
    result: parsedResult.data,
  };
}
