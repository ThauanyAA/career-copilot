import { ChatOpenAI } from '@langchain/openai';
import { config, type ModelConfig } from '../config';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { createAgent, providerStrategy } from 'langchain';
import { z } from 'zod/v3';

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

export class OpenRouterService {
    private config: ModelConfig;
    private llmClient: ChatOpenAI;

    constructor(configOverride?: ModelConfig) {
        this.config = configOverride ?? config;
        this.llmClient = this.#createChatModel(this.config.models[0]);
    }

    #createChatModel(modelName: string): ChatOpenAI {
        return new ChatOpenAI({
            apiKey: this.config.apiKey,
            modelName: modelName,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': this.config.httpReferer,
                    'X-Title': this.config.xTitle,
                },
            },
            modelKwargs: {
                models: this.config.models,
                provider: this.config.provider,
            },
        });
    }

    async generateStructured<T>(
        systemPrompt: string,
        userPrompt: string,
        schema: z.ZodSchema<T>,
    ): Promise<{ data?: T; }> {
        const agentConfig = {
            responseFormat: providerStrategy(schema),
            tools: [],
        };

        const agent = createAgent({
            ...agentConfig,
            model: this.llmClient,
        });

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ];

        let data: unknown;

        try {
            data = await agent.invoke(
                {
                    messages
                },
                {
                    callbacks: [{
                        handleChatModelStart(_llm, promptMessages) {
                            const lastMsg = promptMessages.at(-1)?.at(-1);
                            console.log(`\n🧠 LLM thinking...`);
                            console.log(` (last message: "${lastMsg?.content?.toString()}")`);
                        },
                    }]
                });
        } catch (error) {
            console.error('OpenRouter structured call failed:', {
                models: this.config.models,
                maxTokens: this.config.maxTokens,
                temperature: this.config.temperature,
                error: getErrorDiagnostics(error),
            });
            throw error;
        }

        console.log('✅ LLM Response:', JSON.stringify(data, null, 2));

        return {
            data: (data as { structuredResponse?: T }).structuredResponse,
        };
    }
}
