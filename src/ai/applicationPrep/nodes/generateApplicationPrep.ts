import { config } from "@/ai/config";
import {
  applicationPrepSystemPrompt,
  applicationPrepUserPrompt,
} from "@/ai/applicationPrep/prompts";
import { OpenRouterService } from "@/ai/services/openRouterService";
import { ApplicationPrepResultSchema } from "@/types/applicationPrep";
import type { ApplicationPrepGraphRuntimeState } from "../state";

type ErrorDetails = {
  cause?: unknown;
  code?: string;
  message?: string;
  name?: string;
  response?: {
    data?: unknown;
    status?: number;
    statusText?: string;
  };
  status?: number;
};

function getErrorDiagnostics(error: unknown) {
  if (error instanceof Error) {
    const details = error as Error & ErrorDetails;

    return {
      cause: details.cause,
      code: details.code,
      message: details.message,
      name: details.name,
      responseData: details.response?.data,
      responseStatus: details.response?.status,
      responseStatusText: details.response?.statusText,
      status: details.status,
    };
  }

  return { message: String(error) };
}

export async function generateApplicationPrep(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  if (!state.candidateContext || !state.modelRoute) {
    return { error: "Application prep context or model route is missing." };
  }

  const selectedModelIds = [
    state.modelRoute.primaryModel,
    ...state.modelRoute.fallbackModels,
  ];

  const llmService = new OpenRouterService({
    ...config,
    models: selectedModelIds,
    maxTokens: state.modelRoute.maxTokens,
    temperature: state.modelRoute.temperature,
  });

  let response: Awaited<ReturnType<typeof llmService.generateStructured>>;

  try {
    response = await llmService.generateStructured(
      applicationPrepSystemPrompt,
      applicationPrepUserPrompt(state.candidateContext),
      ApplicationPrepResultSchema
    );
  } catch (error) {
    console.error("Application prep OpenRouter call failed:", {
      hasCandidateContext: true,
      hasModelRoute: true,
      modelRoute: state.modelRoute,
      selectedModelIds,
      error: getErrorDiagnostics(error),
    });

    return { error: "Unable to generate application prep." };
  }

  if (!response.data) {
    console.error("Application prep OpenRouter returned no structured data:", {
      modelRoute: state.modelRoute,
      selectedModelIds,
    });

    return { error: "No application prep data returned from LLM service." };
  }

  const parsedResult = ApplicationPrepResultSchema.safeParse(response.data);

  if (!parsedResult.success) {
    console.error("Application prep result schema validation failed:", {
      errors: parsedResult.error.flatten(),
      modelRoute: state.modelRoute,
      selectedModelIds,
    });

    return { error: "Unable to generate application prep." };
  }

  return {
    result: parsedResult.data,
    error: undefined,
  };
}
