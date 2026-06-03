import { ResumeSummaryResultSchema } from "@/types/resumeIntelligence";
import { runResumeInsightStructuredStep } from "../structuredGeneration";
import {
  resumeSummarySystemPrompt,
  resumeSummaryUserPrompt,
} from "../prompts";
import {
  appendStepDiagnostic,
  type ResumeInsightGraphRuntimeState,
} from "../state";

export async function generateResumeSummary(
  state: ResumeInsightGraphRuntimeState
): Promise<Partial<ResumeInsightGraphRuntimeState>> {
  if (!state.request || !state.resumeContentForPrompt) {
    return { error: "Resume insight context is missing." };
  }

  const step = await runResumeInsightStructuredStep({
    schema: ResumeSummaryResultSchema,
    state,
    step: "generateResumeSummary",
    systemPrompt: resumeSummarySystemPrompt,
    userPrompt: resumeSummaryUserPrompt({
      resumeContentForPrompt: state.resumeContentForPrompt,
      resumeId: state.request.resumeId,
      resumeTitle: state.request.resumeTitle,
      wasResumeContentTruncated: Boolean(state.wasResumeContentTruncated),
    }),
  });

  if (step.error || !step.data) {
    return {
      diagnostics: step.diagnostic
        ? appendStepDiagnostic(state, step.diagnostic)
        : state.diagnostics,
      error: step.error ?? "Unable to summarize resume.",
    };
  }

  return {
    diagnostics: appendStepDiagnostic(state, step.diagnostic),
    error: undefined,
    summaryResult: step.data,
  };
}
