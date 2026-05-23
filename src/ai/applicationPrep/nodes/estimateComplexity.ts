import { estimateApplicationPrepComplexity } from "../complexity";
import type { ApplicationPrepGraphRuntimeState } from "../state";

export async function estimateComplexity(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  if (!state.candidateContext) {
    return { error: "Candidate context is missing." };
  }

  return {
    complexity: estimateApplicationPrepComplexity(state.candidateContext),
    error: undefined,
  };
}
