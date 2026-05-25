import { buildCandidateContext } from "../context";
import type { ApplicationPrepGraphRuntimeState } from "../state";

function countMappedProfileFields(
  profile: NonNullable<ApplicationPrepGraphRuntimeState["candidateContext"]>["profile"]
) {
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
  ].filter((value) => typeof value === "string" && value.trim().length > 0)
    .length;
}

export async function loadCandidateContext(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  if (!state.request) {
    return { error: "Application prep request was not validated." };
  }

  try {
    const candidateContext = buildCandidateContext({
      profile: state.profile ?? null,
      reusableAnswers: [],
      resumeContent: state.request.resumeContent,
      jobDescription: state.request.jobDescription,
    });

    console.log("Application prep candidate context diagnostics:", {
      mappedProfileNonEmptyFieldCount: countMappedProfileFields(
        candidateContext.profile
      ),
      profileRowExists: Boolean(state.profile),
    });

    return {
      candidateContext,
      error: undefined,
    };
  } catch {
    return { error: "Unable to prepare candidate context." };
  }
}
