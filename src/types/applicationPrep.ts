import { z } from "zod";

export const ReusableAnswerCategorySchema = z.enum([
  "salary_expectation",
  "notice_period",
  "work_authorization",
  "relocation",
  "availability",
  "motivation",
  "experience_summary",
  "custom",
]);

export const ApplicationPrepRequestSchema = z.object({
  resumeContent: z
    .string()
    .trim()
    .min(1, "Resume content is required")
    .max(30000, "Resume content is too long"),
  jobDescription: z
    .string()
    .trim()
    .min(1, "Job description is required")
    .max(30000, "Job description is too long"),
});

export const RelevantReusableAnswerSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(1).max(120),
  category: ReusableAnswerCategorySchema,
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(2000),
  relevanceReason: z.string().trim().min(1).max(160).optional(),
});

export const CandidateProfileRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  full_name: z.string().nullable(),
  headline: z.string().nullable(),
  location: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  github_url: z.string().nullable(),
  portfolio_url: z.string().nullable(),
  target_roles: z.array(z.string()),
  skills: z.array(z.string()),
  salary_expectation: z.string().nullable(),
  notice_period: z.string().nullable(),
  work_authorization: z.string().nullable(),
  english_level: z.string().nullable(),
  relocation_preference: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ReusableAnswerRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  label: z.string(),
  category: ReusableAnswerCategorySchema,
  question: z.string(),
  answer: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CandidateContextSchema = z.object({
  profile: z.object({
    fullName: z.string().trim().min(1).nullable(),
    headline: z.string().trim().min(1).nullable(),
    location: z.string().trim().min(1).nullable(),
    linkedinUrl: z.string().trim().min(1).nullable(),
    githubUrl: z.string().trim().min(1).nullable(),
    portfolioUrl: z.string().trim().min(1).nullable(),
    targetRoles: z.array(z.string().trim().min(1)).max(12),
    skills: z.array(z.string().trim().min(1)).max(40),
    salaryExpectation: z.string().trim().min(1).nullable(),
    noticePeriod: z.string().trim().min(1).nullable(),
    workAuthorization: z.string().trim().min(1).nullable(),
    englishLevel: z.string().trim().min(1).nullable(),
    relocationPreference: z.string().trim().min(1).nullable(),
  }),
  relevantReusableAnswers: z.array(RelevantReusableAnswerSchema).max(8),
  resumeContent: z.string().trim().min(1).max(12000),
  jobDescription: z.string().trim().min(1).max(12000),
});

export const SuggestedApplicationAnswerSchema = z.object({
  category: ReusableAnswerCategorySchema,
  question: z.string().trim().min(1).max(220),
  answer: z.string().trim().min(1).max(900),
  source: z.enum([
    "candidate_profile",
    "reusable_answer",
    "resume",
    "job_description",
    "generated",
  ]),
  confidence: z.enum(["low", "medium", "high"]),
});

export const MissingCandidateInfoSchema = z.object({
  field: z.enum([
    "salary_expectation",
    "notice_period",
    "work_authorization",
    "relocation",
    "availability",
    "motivation",
    "experience_summary",
    "portfolio",
    "other",
  ]),
  question: z.string().trim().min(1).max(220),
  reason: z.string().trim().min(1).max(300),
  priority: z.enum(["low", "medium", "high"]),
});

export const ApplicationPrepResultSchema = z.object({
  fitSummary: z.string().trim().min(1).max(900),
  tailoredPitch: z.string().trim().min(1).max(900),
  suggestedAnswers: z.array(SuggestedApplicationAnswerSchema).max(6),
  missingCandidateInfo: z.array(MissingCandidateInfoSchema).max(5),
  applicationRisks: z.array(z.string().trim().min(1).max(220)).max(5),
  prepChecklist: z.array(z.string().trim().min(1).max(180)).max(6),
});

export const ApplicationPrepGraphStateSchema = z.object({
  userId: z.string().uuid(),
  userTier: z.enum(["free", "starter", "pro"]),
  request: ApplicationPrepRequestSchema.optional(),
  profile: CandidateProfileRowSchema.nullable().optional(),
  reusableAnswers: z.array(ReusableAnswerRowSchema).optional(),
  candidateContext: CandidateContextSchema.optional(),
  complexity: z.enum(["low", "medium", "high"]).optional(),
  modelRoute: z
    .object({
      primaryModel: z.string().trim().min(1),
      fallbackModels: z.array(z.string().trim().min(1)),
      maxTokens: z.number().int().positive(),
      temperature: z.number().min(0).max(2),
      allowPaidFallback: z.boolean(),
    })
    .optional(),
  result: ApplicationPrepResultSchema.optional(),
  error: z.string().optional(),
}).passthrough();

export type ReusableAnswerCategory = z.infer<
  typeof ReusableAnswerCategorySchema
>;
export type ApplicationPrepRequest = z.infer<
  typeof ApplicationPrepRequestSchema
>;
export type RelevantReusableAnswer = z.infer<
  typeof RelevantReusableAnswerSchema
>;
export type CandidateContext = z.infer<typeof CandidateContextSchema>;
export type SuggestedApplicationAnswer = z.infer<
  typeof SuggestedApplicationAnswerSchema
>;
export type MissingCandidateInfo = z.infer<typeof MissingCandidateInfoSchema>;
export type ApplicationPrepResult = z.infer<
  typeof ApplicationPrepResultSchema
>;
export type ApplicationPrepGraphState = z.infer<
  typeof ApplicationPrepGraphStateSchema
>;
