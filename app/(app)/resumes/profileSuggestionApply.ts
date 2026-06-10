import { z } from "zod";
import type { Database } from "@/types/database";
import {
  ResumeProfileSuggestionSchema,
  type ResumeProfileSuggestion,
} from "@/types/resumeIntelligence";

export type CandidateProfileRow =
  Database["public"]["Tables"]["candidate_profiles"]["Row"];
export type CandidateProfileInsert =
  Database["public"]["Tables"]["candidate_profiles"]["Insert"];
export type CandidateProfileColumn = keyof Pick<
  CandidateProfileInsert,
  | "full_name"
  | "headline"
  | "location"
  | "linkedin_url"
  | "github_url"
  | "portfolio_url"
  | "target_roles"
  | "skills"
  | "salary_expectation"
  | "notice_period"
  | "work_authorization"
  | "english_level"
  | "relocation_preference"
>;

type CandidateProfileArrayColumn = Extract<
  CandidateProfileColumn,
  "target_roles" | "skills"
>;
type CandidateProfileUrlColumn = Extract<
  CandidateProfileColumn,
  "linkedin_url" | "github_url" | "portfolio_url"
>;

export type ProfileSuggestionApplyState =
  | { status: "ready"; actionLabel: string }
  | { status: "applied"; message: string }
  | { status: "blocked"; message: string };

export const ResumeProfileSuggestionsSchema = z
  .array(ResumeProfileSuggestionSchema)
  .max(6);

export const PROFILE_SUGGESTION_FIELD_TO_PROFILE_COLUMN = {
  full_name: "full_name",
  headline: "headline",
  location: "location",
  linkedin_url: "linkedin_url",
  github_url: "github_url",
  portfolio_url: "portfolio_url",
  target_roles: "target_roles",
  skills: "skills",
  salary_expectation: "salary_expectation",
  notice_period: "notice_period",
  work_authorization: "work_authorization",
  english_level: "english_level",
  relocation_preference: "relocation_preference",
} as const satisfies Record<
  ResumeProfileSuggestion["field"],
  CandidateProfileColumn
>;

const ProfileSuggestionUrlSchema = z.string().trim().url();
const SENSITIVE_PROFILE_SUGGESTION_FIELDS = new Set<
  ResumeProfileSuggestion["field"]
>([
  "salary_expectation",
  "notice_period",
  "work_authorization",
  "relocation_preference",
]);
const ARRAY_PROFILE_COLUMNS = new Set<CandidateProfileArrayColumn>([
  "target_roles",
  "skills",
]);
const URL_PROFILE_COLUMNS = new Set<CandidateProfileUrlColumn>([
  "linkedin_url",
  "github_url",
  "portfolio_url",
]);

function parseListField(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseArraySuggestionValue(
  value: ResumeProfileSuggestion["suggestedValue"]
) {
  return Array.isArray(value)
    ? value.flatMap((item) => parseListField(item))
    : parseListField(value);
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ").toLocaleLowerCase() ?? "";
}

function compactArrayItem(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeArrayForStorage(values: string[] | null | undefined) {
  const seenValues = new Set<string>();
  const normalizedValues: string[] = [];

  for (const value of values ?? []) {
    const compactedValue = compactArrayItem(value);
    const normalizedValue = normalizeText(compactedValue);

    if (!normalizedValue || seenValues.has(normalizedValue)) {
      continue;
    }

    seenValues.add(normalizedValue);
    normalizedValues.push(compactedValue);
  }

  return normalizedValues;
}

export function getProfileSuggestionColumn(
  suggestion: ResumeProfileSuggestion
) {
  return PROFILE_SUGGESTION_FIELD_TO_PROFILE_COLUMN[suggestion.field] ?? null;
}

export function isCandidateProfileArrayColumn(
  column: CandidateProfileColumn
): column is CandidateProfileArrayColumn {
  return ARRAY_PROFILE_COLUMNS.has(column as CandidateProfileArrayColumn);
}

export function getSuggestionValueForProfileColumn({
  column,
  suggestedValue,
}: {
  column: CandidateProfileColumn;
  suggestedValue: ResumeProfileSuggestion["suggestedValue"];
}) {
  if (isCandidateProfileArrayColumn(column)) {
    return normalizeArrayForStorage(parseArraySuggestionValue(suggestedValue));
  }

  const textValue = Array.isArray(suggestedValue)
    ? suggestedValue.join(", ")
    : suggestedValue;
  const compactTextValue = textValue.trim();

  if (compactTextValue.length === 0) {
    return null;
  }

  if (URL_PROFILE_COLUMNS.has(column as CandidateProfileUrlColumn)) {
    const parsedUrl = ProfileSuggestionUrlSchema.safeParse(compactTextValue);

    if (!parsedUrl.success) {
      return null;
    }
  }

  return compactTextValue;
}

export function mergeProfileArraySuggestion({
  existingValues,
  suggestedValues,
}: {
  existingValues: string[] | null | undefined;
  suggestedValues: string[];
}) {
  return normalizeArrayForStorage([
    ...normalizeArrayForStorage(existingValues),
    ...suggestedValues,
  ]);
}

export function canApplySensitiveProfileSuggestion(
  suggestion: ResumeProfileSuggestion
) {
  if (!SENSITIVE_PROFILE_SUGGESTION_FIELDS.has(suggestion.field)) {
    return true;
  }

  return (
    suggestion.evidenceType === "explicit_resume_text" &&
    Boolean(suggestion.sourceSnippet?.trim())
  );
}

export function profileSuggestionMatchesCurrentProfile({
  column,
  profile,
  value,
}: {
  column: CandidateProfileColumn;
  profile: CandidateProfileRow | null;
  value: string | string[];
}) {
  if (!profile) {
    return false;
  }

  if (isCandidateProfileArrayColumn(column)) {
    const existingValues = new Set(
      normalizeArrayForStorage(profile[column]).map(normalizeText)
    );
    const suggestedValues = Array.isArray(value)
      ? value
      : normalizeArrayForStorage(parseListField(value));

    return suggestedValues.every((item) =>
      existingValues.has(normalizeText(item))
    );
  }

  if (Array.isArray(value)) {
    return false;
  }

  return normalizeText(profile[column] as string | null) === normalizeText(value);
}

export function getProfileSuggestionApplyState({
  profile,
  suggestion,
}: {
  profile: CandidateProfileRow | null;
  suggestion: ResumeProfileSuggestion;
}): ProfileSuggestionApplyState {
  const column = getProfileSuggestionColumn(suggestion);

  if (!column) {
    return {
      status: "blocked",
      message: "Unsupported field",
    };
  }

  const value = getSuggestionValueForProfileColumn({
    column,
    suggestedValue: suggestion.suggestedValue,
  });

  if (value === null || (Array.isArray(value) && value.length === 0)) {
    return {
      status: "blocked",
      message: "Unsupported value",
    };
  }

  if (
    profileSuggestionMatchesCurrentProfile({
      column,
      profile,
      value,
    })
  ) {
    return {
      status: "applied",
      message: "Already in profile",
    };
  }

  if (!canApplySensitiveProfileSuggestion(suggestion)) {
    return {
      status: "blocked",
      message: "Needs explicit source",
    };
  }

  return {
    status: "ready",
    actionLabel: isCandidateProfileArrayColumn(column)
      ? "Apply missing items"
      : "Apply",
  };
}
