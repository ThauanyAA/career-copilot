import {
  ApplicationPrepResultSchema,
  type ApplicationPrepResult,
} from "@/types/applicationPrep";
import type { ApplicationPrepGraphRuntimeState } from "../state";

function compactText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export async function generateApplicationPrepStub(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  if (!state.candidateContext || !state.modelRoute) {
    return { error: "Application prep context or model route is missing." };
  }

  const result: ApplicationPrepResult = {
    fitSummary:
      "Stub result: this will become the one Application Prep LLM call.",
    tailoredPitch:
      "Stub pitch: future generation will tailor this to the role and candidate context.",
    suggestedAnswers: state.candidateContext.relevantReusableAnswers
      .slice(0, 3)
      .map((answer) => ({
        category: answer.category,
        question: answer.question,
        answer: compactText(
          `Stub answer based on saved response: ${answer.answer}`,
          900
        ),
        source: "reusable_answer" as const,
        confidence: "medium" as const,
      })),
    missingCandidateInfo: [],
    applicationRisks: [
      "Stub risk: real risks will be generated after the LLM node is added.",
    ],
    prepChecklist: [
      "Review the saved profile context.",
      "Review selected reusable answers.",
      "Run the real Application Prep generation when enabled.",
    ],
  };

  return {
    result: ApplicationPrepResultSchema.parse(result),
    error: undefined,
  };
}
