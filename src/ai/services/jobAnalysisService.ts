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
    const startTime = performance.now();
    console.log(`[TIMING] Job analysis started`);

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

    const llmEndTime = performance.now();
    console.log(`[TIMING] LLM call completed (${(llmEndTime - startTime).toFixed(2)}ms elapsed)`);

    const parseStartTime = performance.now();
    console.log(`[DEBUG] Response data:`, response.data);

    if (!response.data) {
      throw new Error("No analysis data returned from LLM service");
    }

    let analysisResult: AnalysisResult;

    try {
      analysisResult = AnalysisResultSchema.parse(response.data);
    } catch {
      throw new Error("Failed to validate analysis result structure");
    }

    const parseEndTime = performance.now();
    console.log(`[TIMING] Result validation completed (${(parseEndTime - parseStartTime).toFixed(2)}ms)`);

    const totalTime = parseEndTime - startTime;
    console.log(`[TIMING] Total job analysis duration: ${totalTime.toFixed(2)}ms`);

    return analysisResult;
  }
}
