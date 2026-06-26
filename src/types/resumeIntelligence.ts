import { z } from "zod";
import { ReusableAnswerCategorySchema } from "./applicationPrep";

const ConfidenceSchema = z.enum(["low", "medium", "high"]);
const PrioritySchema = z.enum(["low", "medium", "high"]);
const ProfileSuggestionEvidenceTypeSchema = z.enum([
  "explicit_resume_text",
  "reasonable_inference",
]);

const OptionalInsightTextSchema = z.string().trim().min(1).nullable();

const EvidenceHighlightSchema = z.object({
  label: z.string().trim().min(1).max(80),
  detail: z.string().trim().min(1).max(180),
  sourceSnippet: z.string().trim().min(1).max(200).nullable(),
});

export const ExistingCandidateProfileContextSchema = z.object({
  fullName: z.string().trim().min(1).nullable().optional(),
  headline: z.string().trim().min(1).nullable().optional(),
  location: z.string().trim().min(1).nullable().optional(),
  linkedinUrl: z.string().trim().min(1).nullable().optional(),
  githubUrl: z.string().trim().min(1).nullable().optional(),
  portfolioUrl: z.string().trim().min(1).nullable().optional(),
  targetRoles: z.array(z.string().trim().min(1)).max(20).optional(),
  skills: z.array(z.string().trim().min(1)).max(80).optional(),
  salaryExpectation: z.string().trim().min(1).nullable().optional(),
  noticePeriod: z.string().trim().min(1).nullable().optional(),
  workAuthorization: z.string().trim().min(1).nullable().optional(),
  englishLevel: z.string().trim().min(1).nullable().optional(),
  relocationPreference: z.string().trim().min(1).nullable().optional(),
});

export const ExistingReusableAnswerContextSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1).max(120),
  category: ReusableAnswerCategorySchema,
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(5000),
});

export const ResumeInsightRequestSchema = z.object({
  resumeId: z.string().uuid(),
  resumeTitle: z.string().trim().min(1).max(120),
  resumeContent: z.string().trim().min(1).max(60000),
  existingCandidateProfile: ExistingCandidateProfileContextSchema.optional(),
  existingReusableAnswers: z
    .array(ExistingReusableAnswerContextSchema)
    .max(40)
    .optional(),
});

export const ResumeStructuredDataSchema = z.object({
  identity: z.object({
    fullName: OptionalInsightTextSchema,
    headline: OptionalInsightTextSchema,
    location: OptionalInsightTextSchema,
    links: z.object({
      linkedinUrl: OptionalInsightTextSchema,
      githubUrl: OptionalInsightTextSchema,
      portfolioUrl: OptionalInsightTextSchema,
      otherUrls: z.array(z.string().trim().min(1).max(300)).max(8),
    }),
  }),
  career: z.object({
    currentTitle: OptionalInsightTextSchema,
    yearsOfExperience: OptionalInsightTextSchema,
    targetRoleHints: z.array(z.string().trim().min(1).max(100)).max(5),
    industries: z.array(z.string().trim().min(1).max(100)).max(5),
    senioritySignals: z.array(z.string().trim().min(1).max(140)).max(5),
  }),
  skills: z.object({
    technicalSkills: z.array(z.string().trim().min(1).max(80)).max(16),
    tools: z.array(z.string().trim().min(1).max(80)).max(10),
    languages: z.array(z.string().trim().min(1).max(80)).max(8),
    frameworks: z.array(z.string().trim().min(1).max(80)).max(10),
    softSkills: z.array(z.string().trim().min(1).max(90)).max(6),
  }),
  evidenceHighlights: z.array(EvidenceHighlightSchema).max(6),
  summary: z.object({
    shortSummary: z.string().trim().min(1).max(350),
    strengths: z.array(z.string().trim().min(1).max(140)).max(4),
    differentiators: z.array(z.string().trim().min(1).max(140)).max(4),
  }),
});

export const ResumeProfileSuggestionSchema = z.object({
  field: z.enum([
    "full_name",
    "headline",
    "location",
    "linkedin_url",
    "github_url",
    "portfolio_url",
    "target_roles",
    "skills",
    "salary_expectation",
    "notice_period",
    "work_authorization",
    "english_level",
    "relocation_preference",
  ]),
  suggestedValue: z.union([
    z.string().trim().min(1).max(1000),
    z.array(z.string().trim().min(1).max(120)).max(20),
  ]),
  currentValue: z
    .union([
      z.string().trim().min(1).max(1000),
      z.array(z.string().trim().min(1).max(120)).max(20),
    ])
    .nullable(),
  reason: z.string().trim().min(1).max(220),
  confidence: ConfidenceSchema,
  evidenceType: ProfileSuggestionEvidenceTypeSchema,
  sourceSnippet: z.string().trim().min(1).max(200).nullable(),
  sourceLabel: z.string().trim().min(1).max(120),
}).superRefine((suggestion, context) => {
  const explicitlySupportedOnlyFields = new Set([
    "salary_expectation",
    "notice_period",
    "work_authorization",
    "relocation_preference",
  ]);

  if (!explicitlySupportedOnlyFields.has(suggestion.field)) {
    return;
  }

  if (suggestion.evidenceType !== "explicit_resume_text") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "This field can only be suggested when explicitly supported by resume text.",
      path: ["evidenceType"],
    });
  }

  if (!suggestion.sourceSnippet) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "This field requires a source snippet from the resume when suggested.",
      path: ["sourceSnippet"],
    });
  }
});

export const ResumeReusableAnswerSuggestionSchema = z.object({
  label: z.string().trim().min(1).max(120),
  category: ReusableAnswerCategorySchema,
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(650),
  reason: z.string().trim().min(1).max(200),
  confidence: ConfidenceSchema,
  sourceSnippet: z.string().trim().min(1).max(200).nullable(),
  sourceLabel: z.string().trim().min(1).max(120),
});

export const ResumeMissingInfoQuestionSchema = z.object({
  field: z.enum([
    "salary_expectation",
    "notice_period",
    "work_authorization",
    "relocation",
    "availability",
    "motivation",
    "target_roles",
    "target_locations",
    "work_preferences",
    "portfolio",
    "achievement_metrics",
    "other",
  ]),
  question: z.string().trim().min(1).max(180),
  reason: z.string().trim().min(1).max(200),
  priority: PrioritySchema,
});

export const ResumeSummaryResultSchema = z.object({
  summary: z.string().trim().min(1).max(400),
  structuredData: ResumeStructuredDataSchema,
  warnings: z.array(z.string().trim().min(1).max(160)).max(3),
  limitations: z.array(z.string().trim().min(1).max(160)).max(3),
});

export const ResumeProfileSuggestionsResultSchema = z.object({
  profileSuggestions: z.array(ResumeProfileSuggestionSchema).max(6),
});

const SensitiveResumeProfileSuggestionFieldSchema = z.enum([
  "salary_expectation",
  "notice_period",
  "work_authorization",
  "relocation_preference",
]);

type SanitizedProfileSuggestionsResult = {
  droppedCount: number;
  profileSuggestions: ResumeProfileSuggestion[];
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasExplicitSensitiveSuggestionEvidence(
  suggestion: Record<string, unknown>
) {
  return (
    suggestion.evidenceType === "explicit_resume_text" &&
    typeof suggestion.sourceSnippet === "string" &&
    suggestion.sourceSnippet.trim().length > 0
  );
}

export function sanitizeProfileSuggestions(
  suggestions: unknown[]
): SanitizedProfileSuggestionsResult {
  const profileSuggestions: ResumeProfileSuggestion[] = [];
  let droppedCount = 0;

  for (const suggestion of suggestions) {
    if (!isObjectRecord(suggestion)) {
      droppedCount += 1;
      continue;
    }

    const sensitiveField = SensitiveResumeProfileSuggestionFieldSchema.safeParse(
      suggestion.field
    );

    if (
      sensitiveField.success &&
      !hasExplicitSensitiveSuggestionEvidence(suggestion)
    ) {
      droppedCount += 1;
      continue;
    }

    const parsedSuggestion =
      ResumeProfileSuggestionSchema.safeParse(suggestion);

    if (!parsedSuggestion.success) {
      droppedCount += 1;
      continue;
    }

    profileSuggestions.push(parsedSuggestion.data);
  }

  return { droppedCount, profileSuggestions };
}

export const ResumeReusableAnswersAndMissingInfoResultSchema = z.object({
  reusableAnswerSuggestions: z
    .array(ResumeReusableAnswerSuggestionSchema)
    .max(4),
  missingInfoQuestions: z.array(ResumeMissingInfoQuestionSchema).max(6),
  warnings: z.array(z.string().trim().min(1).max(160)).max(3),
  limitations: z.array(z.string().trim().min(1).max(160)).max(3),
});

export const ResumeInsightResultSchema = z.object({
  summary: z.string().trim().min(1).max(400),
  structuredData: ResumeStructuredDataSchema,
  profileSuggestions: z.array(ResumeProfileSuggestionSchema).max(6),
  reusableAnswerSuggestions: z
    .array(ResumeReusableAnswerSuggestionSchema)
    .max(4),
  missingInfoQuestions: z.array(ResumeMissingInfoQuestionSchema).max(6),
  warnings: z.array(z.string().trim().min(1).max(160)).max(5),
  limitations: z.array(z.string().trim().min(1).max(160)).max(5),
});

export const ResumeInsightGraphStateSchema = z
  .object({
    userTier: z.enum(["free", "starter", "pro"]),
    request: ResumeInsightRequestSchema.optional(),
    sourceContentHash: z.string().length(64).optional(),
    resumeContentForPrompt: z.string().trim().min(1).max(20000).optional(),
    wasResumeContentTruncated: z.boolean().optional(),
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
    summaryResult: ResumeSummaryResultSchema.optional(),
    profileSuggestionsResult: ResumeProfileSuggestionsResultSchema.optional(),
    reusableAnswersAndMissingInfoResult:
      ResumeReusableAnswersAndMissingInfoResultSchema.optional(),
    result: ResumeInsightResultSchema.optional(),
    diagnostics: z
      .array(
        z.object({
          step: z.enum([
            "generateResumeSummary",
            "generateProfileSuggestions",
            "generateReusableAnswersAndMissingInfo",
          ]),
          llmDurationMs: z.number().int().nonnegative(),
          maxTokens: z.number().int().positive(),
          modelId: z.string().trim().min(1),
        })
      )
      .max(5)
      .optional(),
    error: z.string().optional(),
  })
  .passthrough();

export type ExistingCandidateProfileContext = z.infer<
  typeof ExistingCandidateProfileContextSchema
>;
export type ExistingReusableAnswerContext = z.infer<
  typeof ExistingReusableAnswerContextSchema
>;
export type ResumeInsightRequest = z.infer<typeof ResumeInsightRequestSchema>;
export type ResumeStructuredData = z.infer<typeof ResumeStructuredDataSchema>;
export type ResumeSummaryResult = z.infer<typeof ResumeSummaryResultSchema>;
export type ResumeProfileSuggestion = z.infer<
  typeof ResumeProfileSuggestionSchema
>;
export type ResumeProfileSuggestionsResult = z.infer<
  typeof ResumeProfileSuggestionsResultSchema
>;
export type ResumeReusableAnswerSuggestion = z.infer<
  typeof ResumeReusableAnswerSuggestionSchema
>;
export type ResumeMissingInfoQuestion = z.infer<
  typeof ResumeMissingInfoQuestionSchema
>;
export type ResumeReusableAnswersAndMissingInfoResult = z.infer<
  typeof ResumeReusableAnswersAndMissingInfoResultSchema
>;
export type ResumeInsightResult = z.infer<typeof ResumeInsightResultSchema>;
export type ResumeInsightGraphState = z.infer<
  typeof ResumeInsightGraphStateSchema
>;
