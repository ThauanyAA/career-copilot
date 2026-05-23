import { ApplicationPrepResultSchema } from "@/types/applicationPrep";
import type { ApplicationPrepGraphRuntimeState } from "../state";

export async function validateResult(
  state: ApplicationPrepGraphRuntimeState
): Promise<Partial<ApplicationPrepGraphRuntimeState>> {
  const parsed = ApplicationPrepResultSchema.safeParse(state.result);

  if (!parsed.success) {
    return { error: "Application prep result did not match the schema." };
  }

  return {
    error: undefined,
    result: parsed.data,
  };
}
