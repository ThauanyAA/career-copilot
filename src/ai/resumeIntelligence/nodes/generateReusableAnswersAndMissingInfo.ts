import { ResumeReusableAnswersAndMissingInfoResultSchema } from "@/types/resumeIntelligence";
import { runResumeInsightStructuredStep } from "../structuredGeneration";
import {
  reusableAnswersAndMissingInfoSystemPrompt,
  reusableAnswersAndMissingInfoUserPrompt,
} from "../prompts";
import {
  appendStepDiagnostic,
  type ResumeInsightGraphRuntimeState,
} from "../state";

export async function generateReusableAnswersAndMissingInfo(
  state: ResumeInsightGraphRuntimeState
): Promise<Partial<ResumeInsightGraphRuntimeState>> {
  if (!state.request || !state.summaryResult) {
    return { error: "Resume summary context is missing." };
  }

  const step = await runResumeInsightStructuredStep({
    schema: ResumeReusableAnswersAndMissingInfoResultSchema,
    state,
    step: "generateReusableAnswersAndMissingInfo",
    systemPrompt: reusableAnswersAndMissingInfoSystemPrompt,
    userPrompt: reusableAnswersAndMissingInfoUserPrompt({
      existingReusableAnswers: state.request.existingReusableAnswers,
      summaryResult: state.summaryResult,
    }),
  });

  if (step.error || !step.data) {
    return {
      diagnostics: step.diagnostic
        ? appendStepDiagnostic(state, step.diagnostic)
        : state.diagnostics,
      error:
        step.error ??
        "Unable to generate reusable answers and missing info questions.",
    };
  }

  return {
    diagnostics: appendStepDiagnostic(state, step.diagnostic),
    error: undefined,
    reusableAnswersAndMissingInfoResult: step.data,
  };
}
