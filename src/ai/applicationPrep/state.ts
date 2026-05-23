import type { ApplicationPrepGraphState } from "@/types/applicationPrep";
import type { Database } from "@/types/database";

export type CandidateProfileRow =
  Database["public"]["Tables"]["candidate_profiles"]["Row"];

export type ReusableAnswerRow =
  Database["public"]["Tables"]["reusable_answers"]["Row"];

export type ApplicationPrepGraphRuntimeState = ApplicationPrepGraphState & {
  profile?: CandidateProfileRow | null;
  reusableAnswers?: ReusableAnswerRow[];
};

export function routeByError(state: ApplicationPrepGraphRuntimeState) {
  return state.error ? "stop" : "continue";
}
