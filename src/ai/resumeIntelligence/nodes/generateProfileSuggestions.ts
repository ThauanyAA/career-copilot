import {
  ResumeProfileSuggestionsResultSchema,
  sanitizeProfileSuggestions,
} from "@/types/resumeIntelligence";
import { z } from "zod";
import { runResumeInsightStructuredStep } from "../structuredGeneration";
import {
  profileSuggestionsSystemPrompt,
  profileSuggestionsUserPrompt,
} from "../prompts";
import {
  appendStepDiagnostic,
  type ResumeInsightGraphRuntimeState,
} from "../state";

const RawSuggestionValueSchema = z.union([
  z.string().max(1000),
  z.array(z.string().max(120)).max(20),
]);

const RawResumeProfileSuggestionSchema = z.object({
  confidence: z.string().max(20),
  currentValue: RawSuggestionValueSchema.nullable(),
  evidenceType: z.string().max(80),
  field: z.string().max(120),
  reason: z.string().max(220),
  sourceLabel: z.string().max(120),
  sourceSnippet: z.string().max(200).nullable(),
  suggestedValue: RawSuggestionValueSchema,
});

const RawResumeProfileSuggestionsResultSchema = z.object({
  profileSuggestions: z.array(RawResumeProfileSuggestionSchema).max(6),
});

export async function generateProfileSuggestions(
  state: ResumeInsightGraphRuntimeState
): Promise<Partial<ResumeInsightGraphRuntimeState>> {
  if (!state.request || !state.summaryResult) {
    return { error: "Resume summary context is missing." };
  }

  const step = await runResumeInsightStructuredStep({
    schema: RawResumeProfileSuggestionsResultSchema,
    state,
    step: "generateProfileSuggestions",
    systemPrompt: profileSuggestionsSystemPrompt,
    userPrompt: profileSuggestionsUserPrompt({
      existingCandidateProfile: state.request.existingCandidateProfile,
      summaryResult: state.summaryResult,
    }),
  });

  if (step.error || !step.data) {
    return {
      diagnostics: step.diagnostic
        ? appendStepDiagnostic(state, step.diagnostic)
        : state.diagnostics,
      error: step.error ?? "Unable to generate profile suggestions.",
    };
  }

  const sanitizedProfileSuggestions = sanitizeProfileSuggestions(
    step.data.profileSuggestions
  );

  if (sanitizedProfileSuggestions.droppedCount > 0) {
    console.warn("Resume profile suggestions dropped during sanitization:", {
      droppedCount: sanitizedProfileSuggestions.droppedCount,
      keptCount: sanitizedProfileSuggestions.profileSuggestions.length,
      step: "generateProfileSuggestions",
    });
  }

  const parsedProfileSuggestionsResult =
    ResumeProfileSuggestionsResultSchema.safeParse({
      profileSuggestions: sanitizedProfileSuggestions.profileSuggestions,
    });

  if (!parsedProfileSuggestionsResult.success) {
    console.error("Sanitized resume profile suggestions validation failed:", {
      errors: parsedProfileSuggestionsResult.error.flatten(),
      step: "generateProfileSuggestions",
    });

    return {
      diagnostics: appendStepDiagnostic(state, step.diagnostic),
      error: "Unable to generate valid profile suggestions.",
    };
  }

  return {
    diagnostics: appendStepDiagnostic(state, step.diagnostic),
    error: undefined,
    profileSuggestionsResult: parsedProfileSuggestionsResult.data,
  };
}
