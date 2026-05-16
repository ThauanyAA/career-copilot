import { z } from "zod";

export interface AnalysisRequest {
  resumeContent: string;
  jobDescription: string;
}

// Lightweight MVP schema - optimized for reliability and token efficiency
export const AnalysisResultSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Match percentage 0-100: based on required skill alignment, experience alignment, seniority alignment, and explicit language requirements"),
  strengths: z
    .array(z.string())
    .max(6)
    .describe("Evidence-based strengths from resume matching job requirements (max 6)"),
  missingSkills: z
    .array(z.string())
    .max(6)
    .describe("Explicitly required skills from job description not evidenced in resume (max 6)"),
  quickSummary: z
    .string()
    .max(2000)
    .describe("Strategic summary of job fit and overall assessment (150-250 words)"),
  improvementActions: z
    .array(z.string())
    .max(5)
    .describe("Concrete, actionable steps candidate can take to improve their fit (max 5 items)"),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
