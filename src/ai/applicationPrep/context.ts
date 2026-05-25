import {
  CandidateContextSchema,
  type CandidateContext,
} from "@/types/applicationPrep";
import type { Database } from "@/types/database";
import { selectRelevantReusableAnswers } from "./reusableAnswerSelector";

type CandidateProfileRow =
  Database["public"]["Tables"]["candidate_profiles"]["Row"];
type ReusableAnswerRow =
  Database["public"]["Tables"]["reusable_answers"]["Row"];

function compactOptionalText(value: string | null | undefined) {
  const compacted = value?.trim().replace(/\s+/g, " ") ?? "";
  return compacted.length > 0 ? compacted : null;
}

function compactRequiredText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function compactList(items: string[] | null | undefined, maxItems: number) {
  return (items ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

export function mapCandidateProfileToContextProfile(
  profile: CandidateProfileRow | null
): CandidateContext["profile"] {
  return {
    fullName: compactOptionalText(profile?.full_name),
    headline: compactOptionalText(profile?.headline),
    location: compactOptionalText(profile?.location),
    linkedinUrl: compactOptionalText(profile?.linkedin_url),
    githubUrl: compactOptionalText(profile?.github_url),
    portfolioUrl: compactOptionalText(profile?.portfolio_url),
    targetRoles: compactList(profile?.target_roles, 12),
    skills: compactList(profile?.skills, 40),
    salaryExpectation: compactOptionalText(profile?.salary_expectation),
    noticePeriod: compactOptionalText(profile?.notice_period),
    workAuthorization: compactOptionalText(profile?.work_authorization),
    englishLevel: compactOptionalText(profile?.english_level),
    relocationPreference: compactOptionalText(profile?.relocation_preference),
  };
}

export function buildCandidateContext({
  profile,
  reusableAnswers,
  resumeContent,
  jobDescription,
}: {
  profile: CandidateProfileRow | null;
  reusableAnswers: ReusableAnswerRow[];
  resumeContent: string;
  jobDescription: string;
}): CandidateContext {
  const compactResumeContent = compactRequiredText(resumeContent, 12000);
  const compactJobDescription = compactRequiredText(jobDescription, 12000);

  return CandidateContextSchema.parse({
    profile: mapCandidateProfileToContextProfile(profile),
    relevantReusableAnswers: selectRelevantReusableAnswers({
      answers: reusableAnswers,
      jobDescription: compactJobDescription,
      resumeContent: compactResumeContent,
    }),
    resumeContent: compactResumeContent,
    jobDescription: compactJobDescription,
  });
}
