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

    // Handle response data
    let analysisResult: AnalysisResult;

    const parseStartTime = performance.now();
    console.log(`[DEBUG] Response.data type: ${typeof response.data}, value:`, response.data);

    if (typeof response.data === "string") {
      // If response is string, it's a fallback - parse it as JSON
      try {
        console.log(`[DEBUG] Attempting to parse string of length: ${response.data.length}`);
        const parsed = JSON.parse(response.data);
        console.log(`[DEBUG] JSON parsed successfully, keys:`, Object.keys(parsed || {}));
        analysisResult = AnalysisResultSchema.parse(parsed);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[DEBUG] Parse error: ${errorMsg}`);
        console.error(`[DEBUG] Response data type:`, typeof response.data);
        throw new Error(`Failed to parse analysis result: ${errorMsg}`);
      }
    } else if (response.data) {
      // If response is already structured object
      try {
        analysisResult = AnalysisResultSchema.parse(response.data);
      } catch {
        throw new Error("Failed to validate analysis result structure");
      }
    } else {
      throw new Error("No analysis data returned from LLM service");
    }

    const parseEndTime = performance.now();
    console.log(`[TIMING] Result validation completed (${(parseEndTime - parseStartTime).toFixed(2)}ms)`);

    const totalTime = parseEndTime - startTime;
    console.log(`[TIMING] Total job analysis duration: ${totalTime.toFixed(2)}ms`);

    return analysisResult;
  }
}
