import { config } from "@/ai/config";
import { applicationPrepSystemPrompt, applicationPrepUserPrompt } from "@/ai/applicationPrep/prompts";
import { OpenRouterService } from "@/ai/services/openRouterService";
import { ApplicationPrepResultSchema } from "@/types/applicationPrep";
import type { ApplicationPrepGraphRuntimeState } from "../state";

export async function generateApplicationPrep(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  if (!state.candidateContext || !state.modelRoute) {
    return { error: "Application prep context or model route is missing." };
  }

  const llmService = new OpenRouterService({
    ...config,
    models: [state.modelRoute.primaryModel, ...state.modelRoute.fallbackModels],
    maxTokens: state.modelRoute.maxTokens,
    temperature: state.modelRoute.temperature,
  });

  try {
    const response = await llmService.generateStructured(
      applicationPrepSystemPrompt,
      applicationPrepUserPrompt(state.candidateContext),
      ApplicationPrepResultSchema
    );

    if (!response.data) {
      return { error: "No application prep data returned from LLM service." };
    }

    return {
      result: ApplicationPrepResultSchema.parse(response.data),
      error: undefined,
    };
  } catch {
    return { error: "Unable to generate application prep." };
  }
}
