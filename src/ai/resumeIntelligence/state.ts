import type { ResumeInsightGraphState } from "@/types/resumeIntelligence";

export type ResumeInsightGraphRuntimeState = ResumeInsightGraphState;

export type ResumeInsightStepName =
  | "generateResumeSummary"
  | "generateProfileSuggestions"
  | "generateReusableAnswersAndMissingInfo";

export type ResumeInsightStepDiagnostic = {
  step: ResumeInsightStepName;
  llmDurationMs: number;
  maxTokens: number;
  modelId: string;
};

export function routeByError(state: ResumeInsightGraphRuntimeState) {
  return state.error ? "stop" : "continue";
}

export function appendStepDiagnostic(
  state: ResumeInsightGraphRuntimeState,
  diagnostic: ResumeInsightStepDiagnostic
) {
  return [...(state.diagnostics ?? []), diagnostic].slice(0, 5);
}
