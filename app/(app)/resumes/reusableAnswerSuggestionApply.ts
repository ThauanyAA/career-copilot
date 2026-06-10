import { z } from "zod";
import type { Database } from "@/types/database";
import { ResumeReusableAnswerSuggestionSchema } from "@/types/resumeIntelligence";
import type { ResumeReusableAnswerSuggestion } from "@/types/resumeIntelligence";

export type ReusableAnswerInsert =
  Database["public"]["Tables"]["reusable_answers"]["Insert"];
export type ReusableAnswerSuggestionInput = Omit<
  ReusableAnswerInsert,
  "user_id"
>;
export type ReusableAnswerDuplicateCandidate = Pick<
  Database["public"]["Tables"]["reusable_answers"]["Row"],
  "answer" | "label"
>;

export type ReusableAnswerSuggestionApplyState =
  | { status: "ready"; actionLabel: string }
  | { status: "added"; message: string }
  | { status: "blocked"; message: string };

export const ResumeReusableAnswerSuggestionsSchema = z
  .array(ResumeReusableAnswerSuggestionSchema)
  .max(4);

function normalizeReusableAnswerText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ").toLocaleLowerCase() ?? "";
}

export function getReusableAnswerSuggestionInput(
  suggestion: ResumeReusableAnswerSuggestion
): ReusableAnswerSuggestionInput | null {
  const label = suggestion.label.trim();
  const question = suggestion.question.trim();
  const answer = suggestion.answer.trim();

  if (!label || !question || !answer) {
    return null;
  }

  return {
    label,
    category: suggestion.category,
    question,
    answer,
  };
}

export function reusableAnswerSuggestionAlreadyExists({
  existingAnswers,
  suggestion,
}: {
  existingAnswers: ReusableAnswerDuplicateCandidate[];
  suggestion: ResumeReusableAnswerSuggestion;
}) {
  const normalizedLabel = normalizeReusableAnswerText(suggestion.label);
  const normalizedAnswer = normalizeReusableAnswerText(suggestion.answer);

  if (!normalizedLabel || !normalizedAnswer) {
    return false;
  }

  return existingAnswers.some(
    (answer) =>
      normalizeReusableAnswerText(answer.label) === normalizedLabel ||
      normalizeReusableAnswerText(answer.answer) === normalizedAnswer
  );
}

export function getReusableAnswerSuggestionApplyState({
  existingAnswers,
  suggestion,
}: {
  existingAnswers: ReusableAnswerDuplicateCandidate[];
  suggestion: ResumeReusableAnswerSuggestion;
}): ReusableAnswerSuggestionApplyState {
  const input = getReusableAnswerSuggestionInput(suggestion);

  if (!input) {
    return {
      status: "blocked",
      message: "Unsupported answer",
    };
  }

  if (
    reusableAnswerSuggestionAlreadyExists({
      existingAnswers,
      suggestion,
    })
  ) {
    return {
      status: "added",
      message: "Already in answers",
    };
  }

  return {
    status: "ready",
    actionLabel: "Add to answers",
  };
}
