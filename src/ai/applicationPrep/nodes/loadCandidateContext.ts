import { buildCandidateContext } from "../context";
import type { ApplicationPrepGraphRuntimeState } from "../state";

export async function loadCandidateContext(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  if (!state.request) {
    return { error: "Application prep request was not validated." };
  }

  try {
    return {
      candidateContext: buildCandidateContext({
        profile: state.profile ?? null,
        reusableAnswers: [],
        resumeContent: state.request.resumeContent,
        jobDescription: state.request.jobDescription,
      }),
      error: undefined,
    };
  } catch {
    return { error: "Unable to prepare candidate context." };
  }
}
