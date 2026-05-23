import { ApplicationPrepRequestSchema } from "@/types/applicationPrep";
import type { ApplicationPrepGraphRuntimeState } from "../state";

export async function validateInput(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  const parsed = ApplicationPrepRequestSchema.safeParse(state.request);

  if (!parsed.success) {
    return {
      error: "Application prep requires resume content and a job description.",
    };
  }

  return {
    error: undefined,
    request: parsed.data,
  };
}
