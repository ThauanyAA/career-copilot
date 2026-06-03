import { ResumeInsightRequestSchema } from "@/types/resumeIntelligence";
import type { ResumeInsightRequest } from "@/types/resumeIntelligence";
import type { UserTier } from "@/ai/modelRouting";
import { buildResumeInsightGraph } from "./graph";

export { calculateResumeContentHash } from "./hash";

export async function analyzeSavedResume({
  request,
  userTier,
}: {
  request: ResumeInsightRequest;
  userTier: UserTier;
}) {
  const parsedRequest = ResumeInsightRequestSchema.parse(request);
  const graph = buildResumeInsightGraph();
  const finalState = await graph.invoke({
    request: parsedRequest,
    userTier,
  });

  if (finalState.error || !finalState.result) {
    throw new Error(finalState.error ?? "Unable to generate resume insight.");
  }

  if (!finalState.modelRoute || !finalState.sourceContentHash) {
    throw new Error("Resume insight graph did not return required metadata.");
  }

  const steps = finalState.diagnostics ?? [];
  const totalLlmDurationMs = steps.reduce(
    (total, step) => total + step.llmDurationMs,
    0
  );

  return {
    complexity: finalState.complexity,
    diagnostics: {
      maxTokens: finalState.modelRoute.maxTokens,
      modelId: finalState.modelRoute.primaryModel,
      promptResumeContentLength:
        finalState.resumeContentForPrompt?.length ?? 0,
      resumeContentLength: parsedRequest.resumeContent.length,
      steps,
      totalLlmDurationMs,
      wasResumeContentTruncated: Boolean(
        finalState.wasResumeContentTruncated
      ),
    },
    modelRoute: finalState.modelRoute,
    result: finalState.result,
    sourceContentHash: finalState.sourceContentHash,
    wasResumeContentTruncated: Boolean(finalState.wasResumeContentTruncated),
  };
}
