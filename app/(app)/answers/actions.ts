"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const AnswerCategorySchema = z.enum([
  "salary_expectation",
  "notice_period",
  "work_authorization",
  "relocation",
  "availability",
  "motivation",
  "experience_summary",
  "custom",
]);

const ReusableAnswerSchema = z.object({
  label: z.string().trim().min(1).max(120),
  category: AnswerCategorySchema.default("custom"),
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(5000),
});

const AnswerIdSchema = z.string().uuid();

function getRedirectPath(error: string) {
  return `/answers?error=${encodeURIComponent(error)}`;
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

export async function createReusableAnswer(formData: FormData) {
  const parsed = ReusableAnswerSchema.safeParse({
    label: formData.get("label"),
    category: formData.get("category"),
    question: formData.get("question"),
    answer: formData.get("answer"),
  });

  if (!parsed.success) {
    redirect(getRedirectPath("Review the answer fields and try again."));
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  const { error } = await supabase.from("reusable_answers").insert({
    user_id: userId,
    ...parsed.data,
  });

  if (error) {
    redirect(getRedirectPath("Unable to save this answer right now."));
  }

  revalidatePath("/answers");
  redirect("/answers?created=1");
}

export async function updateReusableAnswer(formData: FormData) {
  const id = AnswerIdSchema.safeParse(formData.get("id"));
  const parsed = ReusableAnswerSchema.safeParse({
    label: formData.get("label"),
    category: formData.get("category"),
    question: formData.get("question"),
    answer: formData.get("answer"),
  });

  if (!id.success || !parsed.success) {
    redirect(getRedirectPath("Review the answer fields and try again."));
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("reusable_answers")
    .update(parsed.data)
    .eq("id", id.data)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirect(getRedirectPath("Unable to update this answer right now."));
  }

  revalidatePath("/answers");
  redirect("/answers?updated=1");
}

export async function deleteReusableAnswer(formData: FormData) {
  const id = AnswerIdSchema.safeParse(formData.get("id"));

  if (!id.success) {
    redirect(getRedirectPath("Choose a valid answer to delete."));
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("reusable_answers")
    .delete()
    .eq("id", id.data)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirect(getRedirectPath("Unable to delete this answer right now."));
  }

  revalidatePath("/answers");
  redirect("/answers?deleted=1");
}
