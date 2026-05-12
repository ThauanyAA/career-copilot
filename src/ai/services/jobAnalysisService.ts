import { OpenRouterService } from "./openRouterService";
import {
  AnalysisResult,
  AnalysisResultSchema,
  AnalysisRequest,
} from "@/types/analysis";
import {
  jobAnalysisSystemPrompt,
  jobAnalysisUserPrompt,
} from "../prompts/v1/jobAnalysis";

export class JobAnalysisService {
  private llmService: OpenRouterService;

  constructor(llmService?: OpenRouterService) {
    this.llmService = llmService || new OpenRouterService();
  }

  async analyzeJobMatch(request: AnalysisRequest): Promise<AnalysisResult> {
    const systemPrompt = jobAnalysisSystemPrompt;
    const userPrompt = jobAnalysisUserPrompt(
      request.resumeContent,
      request.jobDescription
    );

    const response = await this.llmService.generateStructured<AnalysisResult>(
      systemPrompt,
      userPrompt,
      AnalysisResultSchema
    );

    // Handle response data
    let analysisResult: AnalysisResult;

    if (typeof response.data === "string") {
      // If response is string, it's a fallback - parse it as JSON
      try {
        const parsed = JSON.parse(response.data);
        analysisResult = AnalysisResultSchema.parse(parsed);
      } catch (error) {
        throw new Error("Failed to parse analysis result");
      }
    } else if (response.data) {
      // If response is already structured object
      analysisResult = AnalysisResultSchema.parse(response.data);
    } else {
      throw new Error("No analysis data returned");
    }

    return analysisResult;
  }
}
