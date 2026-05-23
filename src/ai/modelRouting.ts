export type AiTask =
  | "job_analysis"
  | "application_prep"
  | "answer_draft"
  | "context_summary";

export type ComplexityLevel = "low" | "medium" | "high";

export type UserTier = "free" | "starter" | "pro";

export type ModelCostClass = "free" | "cheap_paid" | "strong_paid";

export type ModelOption = {
  id: string;
  costClass: ModelCostClass;
};

export type ModelRouteRequest = {
  task: AiTask;
  complexity: ComplexityLevel;
  userTier: UserTier;
};

export type ModelRoute = {
  task: AiTask;
  complexity: ComplexityLevel;
  userTier: UserTier;
  primaryModel: ModelOption;
  fallbackModels: ModelOption[];
  maxTokens: number;
  temperature: number;
  allowPaidFallback: boolean;
};

const currentDefaultModel =
  process.env.OPENROUTER_DEFAULT_MODEL ?? "qwen/qwen3-235b-a22b-2507";

// Model IDs are environment-configurable, but cost class is declared here so a
// misconfigured model route cannot silently bypass tier guardrails.
const models = {
  free: {
    id:
      process.env.OPENROUTER_FREE_MODEL ??
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    costClass: "free",
  },
  cheapPaid: {
    id: process.env.OPENROUTER_CHEAP_MODEL ?? currentDefaultModel,
    costClass: "cheap_paid",
  },
  strongPaid: {
    id: process.env.OPENROUTER_STRONG_MODEL ?? currentDefaultModel,
    costClass: "strong_paid",
  },
} satisfies Record<string, ModelOption>;

const allowedCostClassesByTier: Record<UserTier, readonly ModelCostClass[]> = {
  free: ["free"],
  starter: ["free", "cheap_paid"],
  pro: ["free", "cheap_paid", "strong_paid"],
};

function canUseModel(userTier: UserTier, model: ModelOption) {
  return allowedCostClassesByTier[userTier].includes(model.costClass);
}

function assertRouteAllowed(route: ModelRoute) {
  const allModels = [route.primaryModel, ...route.fallbackModels];
  const disallowedModel = allModels.find(
    (model) => !canUseModel(route.userTier, model)
  );

  if (disallowedModel) {
    throw new Error(
      `Model route for ${route.userTier} users cannot use ${disallowedModel.costClass} model ${disallowedModel.id}`
    );
  }
}

function withGuardrails(route: ModelRoute): ModelRoute {
  // Fallbacks are intentionally narrow when paid fallback is disabled. This
  // keeps retry behavior deterministic and avoids accidental cost escalation.
  const fallbackModels = route.allowPaidFallback
    ? route.fallbackModels
    : route.fallbackModels.filter(
        (model) => model.costClass === route.primaryModel.costClass
      );

  const guardedRoute = {
    ...route,
    fallbackModels,
  };

  assertRouteAllowed(guardedRoute);

  return guardedRoute;
}

function getApplicationPrepRoute(
  request: ModelRouteRequest
): Omit<ModelRoute, "task" | "complexity" | "userTier"> {
  if (request.userTier === "free") {
    return {
      primaryModel: models.free,
      fallbackModels: [],
      maxTokens: request.complexity === "high" ? 1200 : 1400,
      temperature: 0.2,
      allowPaidFallback: false,
    };
  }

  if (request.userTier === "starter") {
    return {
      primaryModel:
        request.complexity === "low" ? models.free : models.cheapPaid,
      fallbackModels: [],
      maxTokens: request.complexity === "high" ? 1600 : 1400,
      temperature: 0.2,
      allowPaidFallback: false,
    };
  }

  return {
    primaryModel:
      request.complexity === "high" ? models.strongPaid : models.cheapPaid,
    fallbackModels:
      request.complexity === "high" ? [] : [models.strongPaid],
    maxTokens: request.complexity === "high" ? 2200 : 1600,
    temperature: 0.2,
    allowPaidFallback: true,
  };
}

function getDefaultRoute(
  request: ModelRouteRequest
): Omit<ModelRoute, "task" | "complexity" | "userTier"> {
  if (request.userTier === "free") {
    return {
      primaryModel: models.free,
      fallbackModels: [],
      maxTokens: 1000,
      temperature: 0.2,
      allowPaidFallback: false,
    };
  }

  if (request.userTier === "starter") {
    return {
      primaryModel: models.cheapPaid,
      fallbackModels: [],
      maxTokens: 1200,
      temperature: 0.2,
      allowPaidFallback: false,
    };
  }

  return {
    primaryModel:
      request.complexity === "high" ? models.strongPaid : models.cheapPaid,
    fallbackModels: [],
    maxTokens: request.complexity === "high" ? 1800 : 1200,
    temperature: 0.2,
    allowPaidFallback: false,
  };
}

export function resolveModelRoute(request: ModelRouteRequest): ModelRoute {
  const routeConfig =
    request.task === "application_prep"
      ? getApplicationPrepRoute(request)
      : getDefaultRoute(request);

  return withGuardrails({
    task: request.task,
    complexity: request.complexity,
    userTier: request.userTier,
    ...routeConfig,
  });
}
