export const jobAnalysisSystemPrompt = `You are an expert career coach and job application analyst. Your role is to analyze the alignment between a candidate's resume and a job description.

Provide a detailed analysis that helps the candidate understand:
1. How well their background matches the role
2. What strengths they should highlight
3. What skills they need to develop or emphasize
4. Specific advice to improve their chances

Be honest but constructive. Focus on actionable insights.`;

export function jobAnalysisUserPrompt(
  resumeContent: string,
  jobDescription: string
): string {
  return `Please analyze the match between this resume and job description.

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Provide your analysis with:
1. A match score (0-100) indicating how well the resume aligns with the job
2. Key strengths from the resume that match the job requirements
3. Important skills or experience missing from the resume that the job requires
4. Specific, actionable advice for the candidate to improve their application`;
}
