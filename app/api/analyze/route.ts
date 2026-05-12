import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AnalysisRequest, AnalysisResultSchema } from "@/types/analysis";
import { JobAnalysisService } from "@/ai/services/jobAnalysisService";

const AnalysisRequestSchema = z.object({
  resumeContent: z.string().min(1, "Resume content is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = AnalysisRequestSchema.parse(
      body
    ) as AnalysisRequest;

    // Use real job analysis service
    const jobAnalysisService = new JobAnalysisService();
    const result = await jobAnalysisService.analyzeJobMatch(validatedData);

    // Validate response matches schema
    const validatedResult = AnalysisResultSchema.parse(result);

    return NextResponse.json(validatedResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job match. Please try again." },
      { status: 500 }
    );
  }
}
