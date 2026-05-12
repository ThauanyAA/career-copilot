import { z } from "zod";

export interface AnalysisRequest {
  resumeContent: string;
  jobDescription: string;
}

// Zod schema for structured LLM response
export const AnalysisResultSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Match percentage between 0 and 100"),
  strengths: z
    .array(z.string())
    .describe("List of resume strengths that match the job requirements"),
  missingSkills: z
    .array(z.string())
    .describe("List of required skills missing from the resume"),
  suggestedAnswer: z
    .string()
    .describe("Personalized advice to improve job application"),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
