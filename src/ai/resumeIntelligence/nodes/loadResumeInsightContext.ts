import {
  resolveModelRoute,
  type ComplexityLevel,
} from "@/ai/modelRouting";
import { ResumeInsightRequestSchema } from "@/types/resumeIntelligence";
import { calculateResumeContentHash } from "../hash";
import type { ResumeInsightGraphRuntimeState } from "../state";

const MAX_RESUME_PROMPT_CHARS = 20000;

function estimateResumeIntelligenceComplexity(
  state: ResumeInsightGraphRuntimeState
): ComplexityLevel {
  const request = state.request;

  if (!request) {
    return "low";
  }

  const reusableAnswerLength = (request.existingReusableAnswers ?? []).reduce(
    (total, answer) =>
      total +
      answer.label.length +
      answer.question.length +
      Math.min(answer.answer.length, 700),
    0
  );

  const profileLength = JSON.stringify(
    request.existingCandidateProfile ?? {}
  ).length;

  const totalCharacters =
    request.resumeContent.length + reusableAnswerLength + profileLength;

  if (totalCharacters < 8000) {
    return "low";
  }

  if (totalCharacters < 22000) {
    return "medium";
  }

  return "high";
}

export async function loadResumeInsightContext(
  state: ResumeInsightGraphRuntimeState
): Promise<Partial<ResumeInsightGraphRuntimeState>> {
  const parsedRequest = ResumeInsightRequestSchema.safeParse(state.request);

  if (!parsedRequest.success) {
    return { error: "Resume insight request did not match the schema." };
  }

  const resumeContent = parsedRequest.data.resumeContent.trim();
  const complexity = estimateResumeIntelligenceComplexity({
    ...state,
    request: parsedRequest.data,
  });
  const modelRoute = resolveModelRoute({
    complexity,
    task: "resume_intelligence",
    userTier: state.userTier,
  });

  return {
    complexity,
    error: undefined,
    modelRoute: {
      allowPaidFallback: modelRoute.allowPaidFallback,
      fallbackModels: modelRoute.fallbackModels.map((model) => model.id),
      maxTokens: modelRoute.maxTokens,
      primaryModel: modelRoute.primaryModel.id,
      temperature: modelRoute.temperature,
    },
    request: parsedRequest.data,
    resumeContentForPrompt: resumeContent.slice(0, MAX_RESUME_PROMPT_CHARS),
    sourceContentHash: calculateResumeContentHash(
      parsedRequest.data.resumeContent
    ),
    wasResumeContentTruncated:
      resumeContent.length > MAX_RESUME_PROMPT_CHARS,
  };
}
