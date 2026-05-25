import { CandidateContextSchema } from "@/types/applicationPrep";
import { selectRelevantReusableAnswers as selectRelevantReusableAnswersHelper } from "../reusableAnswerSelector";
import type { ApplicationPrepGraphRuntimeState } from "../state";

export async function selectRelevantReusableAnswers(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  if (!state.candidateContext) {
    return { error: "Candidate context is missing." };
  }

  try {
    const relevantReusableAnswers = selectRelevantReusableAnswersHelper({
      answers: state.reusableAnswers ?? [],
      resumeContent: state.candidateContext.resumeContent,
      jobDescription: state.candidateContext.jobDescription,
    });

    return {
      candidateContext: CandidateContextSchema.parse({
        ...state.candidateContext,
        relevantReusableAnswers,
      }),
      error: undefined,
    };
  } catch {
    return { error: "Unable to select reusable answers." };
  }
}
