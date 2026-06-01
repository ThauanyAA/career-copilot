import { z } from "zod";
import { ReusableAnswerCategorySchema } from "./applicationPrep";

const ConfidenceSchema = z.enum(["low", "medium", "high"]);
const PrioritySchema = z.enum(["low", "medium", "high"]);
const ProfileSuggestionEvidenceTypeSchema = z.enum([
  "explicit_resume_text",
  "reasonable_inference",
]);

const OptionalInsightTextSchema = z.string().trim().min(1).nullable();

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
    targetRoleHints: z.array(z.string().trim().min(1).max(120)).max(12),
    industries: z.array(z.string().trim().min(1).max(120)).max(12),
    senioritySignals: z.array(z.string().trim().min(1).max(160)).max(12),
  }),
  skills: z.object({
    technicalSkills: z.array(z.string().trim().min(1).max(80)).max(60),
    tools: z.array(z.string().trim().min(1).max(80)).max(40),
    languages: z.array(z.string().trim().min(1).max(80)).max(20),
    frameworks: z.array(z.string().trim().min(1).max(80)).max(40),
    softSkills: z.array(z.string().trim().min(1).max(100)).max(20),
  }),
  experience: z.object({
    roles: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(160),
          company: OptionalInsightTextSchema,
          dateRange: OptionalInsightTextSchema,
          summary: OptionalInsightTextSchema,
          achievements: z.array(z.string().trim().min(1).max(240)).max(8),
          metrics: z.array(z.string().trim().min(1).max(160)).max(8),
        })
      )
      .max(12),
    projects: z
      .array(
        z.object({
          name: OptionalInsightTextSchema,
          summary: z.string().trim().min(1).max(300),
          technologies: z.array(z.string().trim().min(1).max(80)).max(20),
          outcomes: z.array(z.string().trim().min(1).max(180)).max(6),
        })
      )
      .max(12),
  }),
  education: z
    .array(
      z.object({
        institution: OptionalInsightTextSchema,
        credential: OptionalInsightTextSchema,
        dateRange: OptionalInsightTextSchema,
      })
    )
    .max(8),
  certifications: z.array(z.string().trim().min(1).max(180)).max(20),
  summary: z.object({
    shortSummary: z.string().trim().min(1).max(700),
    strengths: z.array(z.string().trim().min(1).max(180)).max(8),
    differentiators: z.array(z.string().trim().min(1).max(180)).max(8),
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
    z.string().trim().min(1).max(2000),
    z.array(z.string().trim().min(1).max(120)).max(80),
  ]),
  currentValue: z
    .union([
      z.string().trim().min(1).max(2000),
      z.array(z.string().trim().min(1).max(120)).max(80),
    ])
    .nullable(),
  reason: z.string().trim().min(1).max(300),
  confidence: ConfidenceSchema,
  evidenceType: ProfileSuggestionEvidenceTypeSchema,
  sourceSnippet: z.string().trim().min(1).max(500).optional(),
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
  answer: z.string().trim().min(1).max(2000),
  reason: z.string().trim().min(1).max(300),
  confidence: ConfidenceSchema,
  sourceSnippet: z.string().trim().min(1).max(500).optional(),
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
  question: z.string().trim().min(1).max(240),
  reason: z.string().trim().min(1).max(300),
  priority: PrioritySchema,
});

export const ResumeInsightResultSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  structuredData: ResumeStructuredDataSchema,
  profileSuggestions: z.array(ResumeProfileSuggestionSchema).max(20),
  reusableAnswerSuggestions: z
    .array(ResumeReusableAnswerSuggestionSchema)
    .max(12),
  missingInfoQuestions: z.array(ResumeMissingInfoQuestionSchema).max(12),
  warnings: z.array(z.string().trim().min(1).max(240)).max(8),
  limitations: z.array(z.string().trim().min(1).max(240)).max(8),
});

export type ExistingCandidateProfileContext = z.infer<
  typeof ExistingCandidateProfileContextSchema
>;
export type ExistingReusableAnswerContext = z.infer<
  typeof ExistingReusableAnswerContextSchema
>;
export type ResumeInsightRequest = z.infer<typeof ResumeInsightRequestSchema>;
export type ResumeStructuredData = z.infer<typeof ResumeStructuredDataSchema>;
export type ResumeProfileSuggestion = z.infer<
  typeof ResumeProfileSuggestionSchema
>;
export type ResumeReusableAnswerSuggestion = z.infer<
  typeof ResumeReusableAnswerSuggestionSchema
>;
export type ResumeMissingInfoQuestion = z.infer<
  typeof ResumeMissingInfoQuestionSchema
>;
export type ResumeInsightResult = z.infer<typeof ResumeInsightResultSchema>;
