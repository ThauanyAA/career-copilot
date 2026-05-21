"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getRedirectPath(error: string) {
  return `/login?error=${encodeURIComponent(error)}`;
}

export async function login(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(getRedirectPath("Enter a valid email and password."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(getRedirectPath("Unable to log in with those credentials."));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
