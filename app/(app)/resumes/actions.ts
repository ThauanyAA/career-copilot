"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import {
  ResumeProfileSuggestionSchema,
  type ResumeProfileSuggestion,
} from "@/types/resumeIntelligence";

type CandidateProfileInsert =
  Database["public"]["Tables"]["candidate_profiles"]["Insert"];
type CandidateProfileColumn = keyof Pick<
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

export type ApplyProfileSuggestionFormState = {
  appliedAt: number | null;
  error: string | null;
};

const ResumeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(60000),
});

const ResumeIdSchema = z.string().uuid();
const ApplyProfileSuggestionSchema = z.object({
  insightId: z.string().uuid(),
  suggestionIndex: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0).max(5)),
});
const ResumeProfileSuggestionsSchema = z
  .array(ResumeProfileSuggestionSchema)
  .max(6);
const ProfileSuggestionUrlSchema = z.string().trim().url();
const PROFILE_SUGGESTION_FIELD_TO_PROFILE_COLUMN = {
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

function getRedirectPath(error: string) {
  return `/resumes?error=${encodeURIComponent(error)}`;
}

function parseListField(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getApplyProfileSuggestionState(
  error: string
): ApplyProfileSuggestionFormState {
  return {
    appliedAt: null,
    error,
  };
}

function getSuggestionValueForProfileColumn({
  column,
  suggestedValue,
}: {
  column: CandidateProfileColumn;
  suggestedValue: ResumeProfileSuggestion["suggestedValue"];
}) {
  if (ARRAY_PROFILE_COLUMNS.has(column as CandidateProfileArrayColumn)) {
    return Array.isArray(suggestedValue)
      ? suggestedValue
      : parseListField(suggestedValue);
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

function canApplySensitiveProfileSuggestion(
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

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (error || typeof userId !== "string") {
    redirect("/login");
  }

  return { supabase, userId };
}

export async function createResume(formData: FormData) {
  const parsed = ResumeSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    redirect(getRedirectPath("Review the resume fields and try again."));
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const shouldSetPrimary = formData.get("is_primary") === "on";

  const { data: existingResume, error: existingResumeError } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingResumeError) {
    redirect(getRedirectPath("Unable to save this resume right now."));
  }

  const { error } = await supabase.from("resumes").insert({
    user_id: userId,
    ...parsed.data,
    is_primary: shouldSetPrimary || !existingResume,
  });

  if (error) {
    redirect(getRedirectPath("Unable to save this resume right now."));
  }

  revalidatePath("/resumes");
  redirect("/resumes?created=1");
}

export async function updateResume(formData: FormData) {
  const id = ResumeIdSchema.safeParse(formData.get("id"));
  const parsed = ResumeSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!id.success || !parsed.success) {
    redirect(getRedirectPath("Review the resume fields and try again."));
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("resumes")
    .update(parsed.data)
    .eq("id", id.data)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirect(getRedirectPath("Unable to update this resume right now."));
  }

  revalidatePath("/resumes");
  redirect("/resumes?updated=1");
}

export async function deleteResume(formData: FormData) {
  const id = ResumeIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    redirect(getRedirectPath("Choose a valid resume to delete."));
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id.data)
    .eq("user_id", userId)
    .select("id, is_primary")
    .maybeSingle();

  if (error || !data) {
    redirect(getRedirectPath("Unable to delete this resume right now."));
  }

  if (data.is_primary) {
    const { data: fallbackResume, error: fallbackError } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackError) {
      redirect(getRedirectPath("Unable to choose a new primary resume."));
    }

    if (fallbackResume) {
      const { error: primaryError } = await supabase
        .from("resumes")
        .update({ is_primary: true })
        .eq("id", fallbackResume.id)
        .eq("user_id", userId);

      if (primaryError) {
        redirect(getRedirectPath("Unable to choose a new primary resume."));
      }
    }
  }

  revalidatePath("/resumes");
  redirect("/resumes?deleted=1");
}

export async function markResumePrimary(formData: FormData) {
  const id = ResumeIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    redirect(getRedirectPath("Choose a valid resume to mark as primary."));
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("resumes")
    .update({ is_primary: true })
    .eq("id", id.data)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirect(getRedirectPath("Unable to mark this resume as primary."));
  }

  revalidatePath("/resumes");
  redirect("/resumes?primary=1");
}

export async function applyResumeProfileSuggestion(
  _previousState: ApplyProfileSuggestionFormState,
  formData: FormData
): Promise<ApplyProfileSuggestionFormState> {
  const parsedForm = ApplyProfileSuggestionSchema.safeParse({
    insightId: formData.get("insightId"),
    suggestionIndex: formData.get("suggestionIndex"),
  });

  if (!parsedForm.success) {
    return getApplyProfileSuggestionState(
      "Choose a valid profile suggestion to apply."
    );
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { data: insight, error: insightError } = await supabase
    .from("resume_insights")
    .select("id, profile_suggestions")
    .eq("id", parsedForm.data.insightId)
    .eq("user_id", userId)
    .maybeSingle();

  if (insightError) {
    console.error("Resume profile suggestion load error:", {
      code: insightError.code,
      message: insightError.message,
    });

    return getApplyProfileSuggestionState(
      "Unable to load this profile suggestion."
    );
  }

  if (!insight) {
    return getApplyProfileSuggestionState(
      "This profile suggestion is no longer available."
    );
  }

  const parsedSuggestions = ResumeProfileSuggestionsSchema.safeParse(
    insight.profile_suggestions
  );

  if (!parsedSuggestions.success) {
    return getApplyProfileSuggestionState(
      "This profile suggestion cannot be applied."
    );
  }

  const suggestion = parsedSuggestions.data[parsedForm.data.suggestionIndex];

  if (!suggestion) {
    return getApplyProfileSuggestionState(
      "This profile suggestion is no longer available."
    );
  }

  const column =
    PROFILE_SUGGESTION_FIELD_TO_PROFILE_COLUMN[suggestion.field] ?? null;

  if (!column) {
    return getApplyProfileSuggestionState(
      "This profile field is not supported yet."
    );
  }

  if (!canApplySensitiveProfileSuggestion(suggestion)) {
    return getApplyProfileSuggestionState(
      "This sensitive profile suggestion needs explicit resume evidence before it can be applied."
    );
  }

  const value = getSuggestionValueForProfileColumn({
    column,
    suggestedValue: suggestion.suggestedValue,
  });

  if (value === null || (Array.isArray(value) && value.length === 0)) {
    return getApplyProfileSuggestionState(
      "This profile suggestion has an unsupported value."
    );
  }

  const profileUpdate = {
    user_id: userId,
    [column]: value,
  } as CandidateProfileInsert;

  const { error } = await supabase.from("candidate_profiles").upsert(
    profileUpdate,
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    console.error("Resume profile suggestion apply error:", {
      code: error.code,
      message: error.message,
    });

    return getApplyProfileSuggestionState(
      "Unable to apply this profile suggestion right now."
    );
  }

  revalidatePath("/profile");
  revalidatePath("/resumes");

  return {
    appliedAt: Date.now(),
    error: null,
  };
}
