"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(z.string().url().nullable());

const CandidateProfileSchema = z.object({
  full_name: optionalText,
  headline: optionalText,
  location: optionalText,
  linkedin_url: optionalUrl,
  github_url: optionalUrl,
  portfolio_url: optionalUrl,
  target_roles: z.string().transform(parseListField),
  skills: z.string().transform(parseListField),
  salary_expectation: optionalText,
  notice_period: optionalText,
  work_authorization: optionalText,
  english_level: optionalText,
  relocation_preference: optionalText,
});

function parseListField(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRedirectPath(error: string) {
  return `/profile?error=${encodeURIComponent(error)}`;
}

export async function saveCandidateProfile(formData: FormData) {
  const parsed = CandidateProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    headline: formData.get("headline"),
    location: formData.get("location"),
    linkedin_url: formData.get("linkedin_url"),
    github_url: formData.get("github_url"),
    portfolio_url: formData.get("portfolio_url"),
    target_roles: formData.get("target_roles"),
    skills: formData.get("skills"),
    salary_expectation: formData.get("salary_expectation"),
    notice_period: formData.get("notice_period"),
    work_authorization: formData.get("work_authorization"),
    english_level: formData.get("english_level"),
    relocation_preference: formData.get("relocation_preference"),
  });

  if (!parsed.success) {
    redirect(getRedirectPath("Review the profile fields and try again."));
  }

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (authError || typeof userId !== "string") {
    redirect("/login");
  }

  const { error } = await supabase.from("candidate_profiles").upsert(
    {
      user_id: userId,
      ...parsed.data,
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    redirect(getRedirectPath("Unable to save your profile right now."));
  }

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}
