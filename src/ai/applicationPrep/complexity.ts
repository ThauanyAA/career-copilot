import type { ComplexityLevel } from "@/ai/modelRouting";
import type { CandidateContext } from "@/types/applicationPrep";

function getReusableAnswerTextLength(context: CandidateContext) {
  return context.relevantReusableAnswers.reduce(
    (total, answer) =>
      total + answer.label.length + answer.question.length + answer.answer.length,
    0
  );
}

function getProfileTextLength(context: CandidateContext) {
  const { profile } = context;

  return [
    profile.fullName,
    profile.headline,
    profile.location,
    profile.salaryExpectation,
    profile.noticePeriod,
    profile.workAuthorization,
    profile.englishLevel,
    profile.relocationPreference,
    ...profile.targetRoles,
    ...profile.skills,
  ].reduce((total, value) => total + (value?.length ?? 0), 0);
}

export function estimateApplicationPrepComplexity(
  context: CandidateContext
): ComplexityLevel {
  const totalCharacters =
    context.resumeContent.length +
    context.jobDescription.length +
    getReusableAnswerTextLength(context) +
    getProfileTextLength(context);

  if (totalCharacters < 7000) {
    return "low";
  }

  if (totalCharacters < 18000) {
    return "medium";
  }

  return "high";
}
