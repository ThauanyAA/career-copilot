import { ResumeProfileSuggestionsResultSchema } from "@/types/resumeIntelligence";
import { runResumeInsightStructuredStep } from "../structuredGeneration";
import {
  profileSuggestionsSystemPrompt,
  profileSuggestionsUserPrompt,
} from "../prompts";
import {
  appendStepDiagnostic,
  type ResumeInsightGraphRuntimeState,
} from "../state";

export async function generateProfileSuggestions(
  state: ResumeInsightGraphRuntimeState
): Promise<Partial<ResumeInsightGraphRuntimeState>> {
  if (!state.request || !state.summaryResult) {
    return { error: "Resume summary context is missing." };
  }

  const step = await runResumeInsightStructuredStep({
    schema: ResumeProfileSuggestionsResultSchema,
    state,
    step: "generateProfileSuggestions",
    systemPrompt: profileSuggestionsSystemPrompt,
    userPrompt: profileSuggestionsUserPrompt({
      existingCandidateProfile: state.request.existingCandidateProfile,
      summaryResult: state.summaryResult,
    }),
  });

  if (step.error || !step.data) {
    return {
      diagnostics: step.diagnostic
        ? appendStepDiagnostic(state, step.diagnostic)
        : state.diagnostics,
      error: step.error ?? "Unable to generate profile suggestions.",
    };
  }

  return {
    diagnostics: appendStepDiagnostic(state, step.diagnostic),
    error: undefined,
    profileSuggestionsResult: step.data,
  };
}
