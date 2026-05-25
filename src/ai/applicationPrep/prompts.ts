import type {
  CandidateContext,
  RelevantReusableAnswer,
} from "@/types/applicationPrep";

export const applicationPrepSystemPrompt = `
You are an application preparation assistant.

Your job is to help a candidate prepare concise, truthful application materials
for a specific job.

Rules:
- Use only the provided candidate profile, reusable answers, resume content, and job description.
- Do not invent candidate facts, experience, credentials, dates, salary expectations, authorization status, availability, or relocation preferences.
- Do not expand vague resume/profile phrases into specific practices unless those practices are explicitly present.
- If only a general phrase is provided, keep the generated answer general.
- For factual application questions, prefer reusable answers first, then candidate profile, then resume.
- For experience, skills, and achievements, prefer resume first, then candidate profile.
- Use the job description only to tailor wording and identify role requirements. Never use it as evidence of candidate facts.
- If a factual answer cannot be supported by reusable answers, profile, or resume, do not create a suggested answer for it.
- If important candidate information is missing or unclear, add it to missingCandidateInfo instead of guessing.
- Prefer lower confidence or missingCandidateInfo when support is weak.
- Keep suggested answers concise and application-form friendly.
- Keep all output compact, practical, and application-ready.
- Return structured data matching the requested schema only.
`.trim();

function formatNullableField(label: string, value: string | null) {
  return value ? `${label}: ${value}` : null;
}

function formatListField(label: string, values: string[]) {
  return values.length > 0 ? `${label}: ${values.join(", ")}` : null;
}

function formatProfile(profile: CandidateContext["profile"]) {
  return [
    formatNullableField("Full name", profile.fullName),
    formatNullableField("Headline", profile.headline),
    formatNullableField("Location", profile.location),
    formatListField("Target roles", profile.targetRoles),
    formatListField("Skills", profile.skills),
    formatNullableField("Salary expectation", profile.salaryExpectation),
    formatNullableField("Notice period", profile.noticePeriod),
    formatNullableField("Work authorization", profile.workAuthorization),
    formatNullableField("English level", profile.englishLevel),
    formatNullableField("Relocation preference", profile.relocationPreference),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatReusableAnswer(answer: RelevantReusableAnswer) {
  return [
    `Label: ${answer.label}`,
    `Category: ${answer.category}`,
    `Question: ${answer.question}`,
    `Answer: ${answer.answer}`,
    answer.relevanceReason ? `Relevance: ${answer.relevanceReason}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatReusableAnswers(answers: RelevantReusableAnswer[]) {
  if (answers.length === 0) {
    return "No relevant reusable answers were selected.";
  }

  return answers
    .map((answer, index) => `Answer ${index + 1}\n${formatReusableAnswer(answer)}`)
    .join("\n\n");
}

export function applicationPrepUserPrompt(context: CandidateContext) {
  const profileText = formatProfile(context.profile);

  return `
Prepare application materials for this job using the supplied candidate context.

CANDIDATE PROFILE:
${profileText || "No candidate profile fields are available."}

RELEVANT REUSABLE ANSWERS:
${formatReusableAnswers(context.relevantReusableAnswers)}

RESUME CONTENT:
${context.resumeContent}

JOB DESCRIPTION:
${context.jobDescription}

OUTPUT REQUIREMENTS:

1. fitSummary
- 2-4 concise sentences.
- Summarize candidate fit using resume/profile evidence.
- Mention key strengths and main gaps.
- Do not include a numeric score.

2. tailoredPitch
- 1 concise application pitch.
- Should sound like something the candidate could paste into an application.
- Ground it in the resume/profile and job description.
- Do not overclaim.

3. suggestedAnswers
- Max 6.
- Generate likely application question/answer pairs.
- Prioritize categories present in reusable answers or strongly implied by the job description.
- Each answer must be concise and form-ready.
- Use categories strictly:
  salary_expectation = compensation expectation/current salary only when explicitly supported
  notice_period = notice period only
  work_authorization = legal work permission, right-to-work, visa, or sponsorship only
  relocation = relocation or location flexibility only
  availability = start date, schedule, or general availability only
  motivation = why this role/company/career interest only
  experience_summary = experience, tools, technologies, projects, skills, workflows, and achievements
  custom = only when no listed category fits
- For factual questions, use saved reusable answers first, then candidate profile, then resume.
- For experience/skills/achievements, use resume first, then candidate profile.
- Never use the job description as evidence of candidate facts.
- Do not turn broad phrases like "agile collaboration", "cross-functional work", or "team collaboration" into specific practices such as sprint planning, stand-ups, Scrum, or iterative delivery unless those exact practices are present.
- If evidence is general, keep the answer general and set confidence to medium or low.
- Set source to the strongest source used: candidate_profile, reusable_answer, resume, job_description, or generated.
- Use job_description as source only for role requirements or question framing, never for candidate facts.
- Use generated as source only for non-factual phrasing or structure that does not add new candidate facts.
- If a factual answer lacks support from reusable answers, profile, or resume, put that need in missingCandidateInfo instead of suggestedAnswers.
- Use confidence:
  high = directly supported by profile/reusable answer/resume
  medium = reasonable synthesis from supplied context
  low = weakly supported; prefer missingCandidateInfo if factual

4. missingCandidateInfo
- Max 5.
- Include facts needed for a stronger application that are missing or unclear.
- Use this instead of inventing answers for salary, notice period, authorization, availability, relocation, motivation, or experience details.

5. applicationRisks
- Max 5.
- Concise risks or gaps based on job requirements and candidate context.
- Do not invent job requirements.

6. prepChecklist
- Max 6.
- Concrete next steps before applying.
- Keep each item short.
`.trim();
}
