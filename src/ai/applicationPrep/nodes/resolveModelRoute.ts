import { resolveModelRoute as resolveModelRouteForRequest } from "@/ai/modelRouting";
import type { ApplicationPrepGraphRuntimeState } from "../state";

export async function resolveModelRoute(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  if (!state.complexity) {
    return { error: "Application prep complexity is missing." };
  }

  try {
    const route = resolveModelRouteForRequest({
      task: "application_prep",
      complexity: state.complexity,
      userTier: state.userTier,
    });

    return {
      modelRoute: {
        primaryModel: route.primaryModel.id,
        fallbackModels: route.fallbackModels.map((model) => model.id),
        maxTokens: route.maxTokens,
        temperature: route.temperature,
        allowPaidFallback: route.allowPaidFallback,
      },
      error: undefined,
    };
  } catch {
    return { error: "Unable to resolve model route." };
  }
}
