import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AnalysisResult } from "@/types/analysis";

const AnalysisRequestSchema = z.object({
  resumeContent: z.string().min(1, "Resume content is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

function getMockAnalysisResult(): AnalysisResult {
  return {
    matchScore: 78,
    strengths: [
      "Strong technical background matching core requirements",
      "Relevant project experience with similar tech stack",
      "Experience with agile methodologies",
      "Proven leadership in team environments",
    ],
    missingSkills: [
      "Docker containerization",
      "Kubernetes orchestration",
      "Cloud infrastructure design",
      "Advanced system architecture patterns",
    ],
    suggestedAnswer:
      "Your profile shows a strong alignment with the role. To strengthen your candidacy, consider deepening your knowledge in containerization and cloud infrastructure, as these are key requirements mentioned in the job description. Highlight any experience with scalable system design and performance optimization in your interview preparation.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = AnalysisRequestSchema.parse(body);

    // TODO: Replace with actual AI analysis logic
    // For now, return mock data
    const result = getMockAnalysisResult();

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
