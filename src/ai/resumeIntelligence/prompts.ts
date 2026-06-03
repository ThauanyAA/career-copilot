import type {
  ExistingCandidateProfileContext,
  ExistingReusableAnswerContext,
  ResumeSummaryResult,
} from "@/types/resumeIntelligence";

export const resumeSummarySystemPrompt = `
You summarize a saved resume for a reviewable career memory workflow.

Rules:
- Use only the supplied resume text.
- Produce compact output matching the requested schema.
- Do not extract full work history.
- Do not extract detailed roles, projects, education, or certifications.
- Prefer a few useful facts and evidence highlights over completeness.
- Do not invent names, employers, dates, metrics, salary, authorization, availability, relocation preferences, or motivations.
- Use null for absent nullable fields and empty arrays for absent lists.
- Keep evidence snippets under 200 characters.
- sourceSnippet fields are required by the schema; use null when no concise snippet is useful.
- Keep warnings and limitations short.
`.trim();

export const profileSuggestionsSystemPrompt = `
You create reviewable candidate profile suggestions from a compact resume summary.

Rules:
- Use only the supplied resume summary and existing profile context.
- Return only suggestions that would improve the candidate profile.
- Suggestions are drafts for user review and must not assume auto-save.
- Return at most 6 profile suggestions.
- Use evidenceType "explicit_resume_text" only when an evidence highlight directly supports the value.
- Use evidenceType "reasonable_inference" only for low-risk fields such as headline, target_roles, or skills.
- salary_expectation, notice_period, work_authorization, and relocation_preference can only be suggested when directly supported by resume evidence.
- If those sensitive fields are not explicit, do not suggest them.
- Keep source snippets under 200 characters.
- sourceSnippet fields are required by the schema; use null when no concise snippet is useful.
`.trim();

export const reusableAnswersAndMissingInfoSystemPrompt = `
You create reviewable reusable application-answer suggestions and strategic missing-info questions.

Rules:
- Use only the supplied resume summary and existing reusable answers.
- Return compact output matching the requested schema.
- Return at most 4 reusable answer suggestions.
- Return at most 6 missing info questions.
- Do not duplicate existing reusable answers.
- Suggested answers are drafts for user review and must not assume auto-save.
- Do not invent salary, notice period, work authorization, availability, relocation, or motivation.
- Prefer missing-info questions over guessing strategic details.
- Keep source snippets under 200 characters.
- sourceSnippet fields are required by the schema; use null when no concise snippet is useful.
`.trim();

function compactJson(value: unknown) {
  return JSON.stringify(value ?? null);
}

function compactReusableAnswers(
  reusableAnswers: ExistingReusableAnswerContext[] | undefined
) {
  return (reusableAnswers ?? []).slice(0, 12).map((answer) => ({
    id: answer.id,
    label: answer.label,
    category: answer.category,
    question: answer.question,
    answer: answer.answer.slice(0, 700),
  }));
}

export function resumeSummaryUserPrompt({
  resumeContentForPrompt,
  resumeId,
  resumeTitle,
  wasResumeContentTruncated,
}: {
  resumeContentForPrompt: string;
  resumeId: string;
  resumeTitle: string;
  wasResumeContentTruncated: boolean;
}) {
  return `
Analyze this saved resume and return a compact summary result.

Resume:
- id: ${resumeId}
- title: ${resumeTitle}
- content_truncated_for_prompt: ${wasResumeContentTruncated ? "yes" : "no"}

Resume content:
${resumeContentForPrompt}

Output guidance:
- summary: one short paragraph, under 4 sentences.
- structuredData: identity, career, skills, evidenceHighlights, and short summary only.
- evidenceHighlights: at most 6 important resume-supported facts.
- Do not include full roles, projects, education history, or certification lists.
- If content was truncated, include that in limitations.
`.trim();
}

export function profileSuggestionsUserPrompt({
  existingCandidateProfile,
  summaryResult,
}: {
  existingCandidateProfile?: ExistingCandidateProfileContext;
  summaryResult: ResumeSummaryResult;
}) {
  return `
Create reviewable profile suggestions from this resume summary.

Resume summary result:
${compactJson(summaryResult)}

Existing candidate profile:
${compactJson(existingCandidateProfile ?? null)}

Output guidance:
- Return only useful changes or additions.
- Return an empty profileSuggestions array if no useful suggestion is supported.
- Include currentValue when the existing profile provides one.
- For sensitive profile fields, suggest only when explicitly supported by an evidence highlight.
`.trim();
}

export function reusableAnswersAndMissingInfoUserPrompt({
  existingReusableAnswers,
  summaryResult,
}: {
  existingReusableAnswers?: ExistingReusableAnswerContext[];
  summaryResult: ResumeSummaryResult;
}) {
  return `
Create reusable answer suggestions and missing-info questions from this resume summary.

Resume summary result:
${compactJson(summaryResult)}

Existing reusable answers:
${compactJson(compactReusableAnswers(existingReusableAnswers))}

Output guidance:
- Reusable answers should be short, application-form friendly drafts.
- Do not repeat existing reusable answers.
- Ask missing-info questions for strategic application details absent from the resume.
- Use missingInfoQuestions for salary, notice period, work authorization, availability, relocation, motivation, and preferences when absent.
`.trim();
}
