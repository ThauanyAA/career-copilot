"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  canApplySensitiveProfileSuggestion,
  getProfileSuggestionColumn,
  getSuggestionValueForProfileColumn,
  isCandidateProfileArrayColumn,
  mergeProfileArraySuggestion,
  ResumeProfileSuggestionsSchema,
  type CandidateProfileInsert,
} from "./profileSuggestionApply";
import {
  getReusableAnswerSuggestionInput,
  reusableAnswerSuggestionAlreadyExists,
  ResumeReusableAnswerSuggestionsSchema,
  type ReusableAnswerInsert,
} from "./reusableAnswerSuggestionApply";
import { createClient } from "@/lib/supabase/server";

export type ApplyProfileSuggestionFormState = {
  appliedAt: number | null;
  error: string | null;
};
export type AddReusableAnswerSuggestionFormState = {
  addedAt: number | null;
  error: string | null;
  message: string | null;
};
export type MarkResumeInsightReviewedFormState = {
  error: string | null;
  reviewedAt: number | null;
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
const AddReusableAnswerSuggestionSchema = z.object({
  insightId: z.string().uuid(),
  suggestionIndex: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0).max(3)),
});
const MarkResumeInsightReviewedSchema = z.object({
  insightId: z.string().uuid(),
});

function getRedirectPath(error: string) {
  return `/resumes?error=${encodeURIComponent(error)}`;
}

function getApplyProfileSuggestionState(
  error: string
): ApplyProfileSuggestionFormState {
  return {
    appliedAt: null,
    error,
  };
}

function getAddReusableAnswerSuggestionState({
  error,
  message,
}: {
  error?: string;
  message?: string;
}): AddReusableAnswerSuggestionFormState {
  return {
    addedAt: null,
    error: error ?? null,
    message: message ?? null,
  };
}

function getMarkResumeInsightReviewedState(
  error: string
): MarkResumeInsightReviewedFormState {
  return {
    error,
    reviewedAt: null,
  };
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

  const column = getProfileSuggestionColumn(suggestion);

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

  let profileValue = value;

  if (isCandidateProfileArrayColumn(column)) {
    if (!Array.isArray(value)) {
      return getApplyProfileSuggestionState(
        "This profile suggestion has an unsupported value."
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Resume profile suggestion current profile load error:", {
        code: profileError.code,
        message: profileError.message,
      });

      return getApplyProfileSuggestionState(
        "Unable to load your profile before applying this suggestion."
      );
    }

    profileValue = mergeProfileArraySuggestion({
      existingValues: profile?.[column] ?? [],
      suggestedValues: value,
    });
  }

  const profileUpdate = {
    user_id: userId,
    [column]: profileValue,
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

export async function addResumeReusableAnswerSuggestion(
  _previousState: AddReusableAnswerSuggestionFormState,
  formData: FormData
): Promise<AddReusableAnswerSuggestionFormState> {
  const parsedForm = AddReusableAnswerSuggestionSchema.safeParse({
    insightId: formData.get("insightId"),
    suggestionIndex: formData.get("suggestionIndex"),
  });

  if (!parsedForm.success) {
    return getAddReusableAnswerSuggestionState({
      error: "Choose a valid reusable answer suggestion to add.",
    });
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { data: insight, error: insightError } = await supabase
    .from("resume_insights")
    .select("id, reusable_answer_suggestions")
    .eq("id", parsedForm.data.insightId)
    .eq("user_id", userId)
    .maybeSingle();

  if (insightError) {
    console.error("Resume reusable answer suggestion load error:", {
      code: insightError.code,
      message: insightError.message,
    });

    return getAddReusableAnswerSuggestionState({
      error: "Unable to load this reusable answer suggestion.",
    });
  }

  if (!insight) {
    return getAddReusableAnswerSuggestionState({
      error: "This reusable answer suggestion is no longer available.",
    });
  }

  const parsedSuggestions = ResumeReusableAnswerSuggestionsSchema.safeParse(
    insight.reusable_answer_suggestions
  );

  if (!parsedSuggestions.success) {
    return getAddReusableAnswerSuggestionState({
      error: "This reusable answer suggestion cannot be added.",
    });
  }

  const suggestion = parsedSuggestions.data[parsedForm.data.suggestionIndex];

  if (!suggestion) {
    return getAddReusableAnswerSuggestionState({
      error: "This reusable answer suggestion is no longer available.",
    });
  }

  const answerInput = getReusableAnswerSuggestionInput(suggestion);

  if (!answerInput) {
    return getAddReusableAnswerSuggestionState({
      error: "This reusable answer suggestion has an unsupported value.",
    });
  }

  const { data: existingAnswers, error: existingAnswersError } = await supabase
    .from("reusable_answers")
    .select("label, answer")
    .eq("user_id", userId);

  if (existingAnswersError) {
    console.error("Resume reusable answer duplicate lookup error:", {
      code: existingAnswersError.code,
      message: existingAnswersError.message,
    });

    return getAddReusableAnswerSuggestionState({
      error: "Unable to check your existing answers right now.",
    });
  }

  if (
    reusableAnswerSuggestionAlreadyExists({
      existingAnswers: existingAnswers ?? [],
      suggestion,
    })
  ) {
    return getAddReusableAnswerSuggestionState({
      message: "Already in answers",
    });
  }

  const reusableAnswer = {
    ...answerInput,
    user_id: userId,
  } satisfies ReusableAnswerInsert;
  const { error } = await supabase.from("reusable_answers").insert(
    reusableAnswer
  );

  if (error) {
    console.error("Resume reusable answer suggestion add error:", {
      code: error.code,
      message: error.message,
    });

    return getAddReusableAnswerSuggestionState({
      error: "Unable to add this reusable answer right now.",
    });
  }

  revalidatePath("/answers");
  revalidatePath("/resumes");

  return {
    addedAt: Date.now(),
    error: null,
    message: "Added to answers.",
  };
}

export async function markResumeInsightReviewed(
  _previousState: MarkResumeInsightReviewedFormState,
  formData: FormData
): Promise<MarkResumeInsightReviewedFormState> {
  const parsedForm = MarkResumeInsightReviewedSchema.safeParse({
    insightId: formData.get("insightId"),
  });

  if (!parsedForm.success) {
    return getMarkResumeInsightReviewedState(
      "Choose a valid resume insight to mark as reviewed."
    );
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("resume_insights")
    .update({ status: "reviewed" })
    .eq("id", parsedForm.data.insightId)
    .eq("user_id", userId)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Resume insight mark reviewed error:", {
      code: error.code,
      message: error.message,
    });

    return getMarkResumeInsightReviewedState(
      "Unable to mark this resume insight as reviewed right now."
    );
  }

  if (!data) {
    return getMarkResumeInsightReviewedState(
      "This resume insight is no longer available to mark as reviewed."
    );
  }

  revalidatePath("/resumes");

  return {
    error: null,
    reviewedAt: Date.now(),
  };
}
