"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ResumeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(60000),
});

const ResumeIdSchema = z.string().uuid();

function getRedirectPath(error: string) {
  return `/resumes?error=${encodeURIComponent(error)}`;
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
