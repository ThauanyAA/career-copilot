import { config } from "@/ai/config";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import type {
  ResumeInsightGraphRuntimeState,
  ResumeInsightStepName,
} from "./state";
import type { ZodType } from "zod";

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

export async function runResumeInsightStructuredStep<T>({
  schema,
  state,
  step,
  systemPrompt,
  userPrompt,
}: {
  schema: ZodType<T>;
  state: ResumeInsightGraphRuntimeState;
  step: ResumeInsightStepName;
  systemPrompt: string;
  userPrompt: string;
}) {
  if (!state.modelRoute) {
    return { error: "Resume insight model route is missing." };
  }

  const selectedModelIds = [
    state.modelRoute.primaryModel,
    ...state.modelRoute.fallbackModels,
  ];

  const model = new ChatOpenAI({
    apiKey: config.apiKey,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": config.httpReferer,
        "X-Title": config.xTitle,
      },
    },
    maxTokens: state.modelRoute.maxTokens,
    modelKwargs: {
      models: selectedModelIds,
      provider: config.provider,
    },
    modelName: state.modelRoute.primaryModel,
    temperature: state.modelRoute.temperature,
  });
  const structuredModel = model.withStructuredOutput(schema, {
    name: step,
    strict: true,
  });

  const startedAt = Date.now();
  let data: T;

  try {
    data = (await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ])) as T;
  } catch (error) {
    const llmDurationMs = Date.now() - startedAt;
    console.error("Resume insight structured step failed:", {
      error: getErrorDiagnostics(error),
      maxTokens: state.modelRoute.maxTokens,
      modelId: state.modelRoute.primaryModel,
      step,
    });

    return {
      diagnostic: {
        llmDurationMs,
        maxTokens: state.modelRoute.maxTokens,
        modelId: state.modelRoute.primaryModel,
        step,
      },
      error: `Unable to complete resume insight step: ${step}.`,
    };
  }

  const llmDurationMs = Date.now() - startedAt;
  const diagnostic = {
    llmDurationMs,
    maxTokens: state.modelRoute.maxTokens,
    modelId: state.modelRoute.primaryModel,
    step,
  };

  if (!data) {
    console.error("Resume insight structured step returned no data:", {
      maxTokens: state.modelRoute.maxTokens,
      modelId: state.modelRoute.primaryModel,
      step,
    });

    return {
      diagnostic,
      error: `No structured data returned for resume insight step: ${step}.`,
    };
  }

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    console.error("Resume insight structured step validation failed:", {
      errors: parsed.error.flatten(),
      maxTokens: state.modelRoute.maxTokens,
      modelId: state.modelRoute.primaryModel,
      step,
    });

    return {
      diagnostic,
      error: `Structured data did not match schema for resume insight step: ${step}.`,
    };
  }

  return {
    data: parsed.data,
    diagnostic,
  };
}
