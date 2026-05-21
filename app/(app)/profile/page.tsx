import { redirect } from "next/navigation";
import { saveCandidateProfile } from "./actions";
import { createClient } from "@/lib/supabase/server";

type ProfilePageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

function formatList(items: string[] | null | undefined) {
  return items?.join("\n") ?? "";
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient();
  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !claimsData?.claims) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  if (typeof userId !== "string") {
    redirect("/login");
  }

  const { data: profiles, error } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", userId)
    .limit(1);

  let profile = profiles?.[0] ?? null;
  let loadError: string | null = null;

  if (error) {
    console.error("Candidate profile load error:", {
      code: error.code,
      message: error.message,
    });
    profile = null;
    loadError = "Unable to load your saved profile right now.";
  }

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Career Copilot
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
            Candidate Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Save the application details you reuse often. This becomes the
            foundation for persistent candidate memory.
          </p>
        </div>

        {params.saved && (
          <p className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            Profile saved.
          </p>
        )}

        {params.error && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {params.error}
          </p>
        )}

        {loadError && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {loadError}
          </p>
        )}

        <form
          action={saveCandidateProfile}
          className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <ProfileInput
              label="Full name"
              name="full_name"
              defaultValue={profile?.full_name}
            />
            <ProfileInput
              label="Headline"
              name="headline"
              defaultValue={profile?.headline}
            />
            <ProfileInput
              label="Location"
              name="location"
              defaultValue={profile?.location}
            />
            <ProfileInput
              label="LinkedIn URL"
              name="linkedin_url"
              type="url"
              defaultValue={profile?.linkedin_url}
            />
            <ProfileInput
              label="GitHub URL"
              name="github_url"
              type="url"
              defaultValue={profile?.github_url}
            />
            <ProfileInput
              label="Portfolio URL"
              name="portfolio_url"
              type="url"
              defaultValue={profile?.portfolio_url}
            />
            <ProfileInput
              label="Salary expectation"
              name="salary_expectation"
              defaultValue={profile?.salary_expectation}
            />
            <ProfileInput
              label="Notice period"
              name="notice_period"
              defaultValue={profile?.notice_period}
            />
            <ProfileInput
              label="Work authorization"
              name="work_authorization"
              defaultValue={profile?.work_authorization}
            />
            <ProfileInput
              label="English level"
              name="english_level"
              defaultValue={profile?.english_level}
            />
            <div className="sm:col-span-2">
              <ProfileInput
                label="Relocation preference"
                name="relocation_preference"
                defaultValue={profile?.relocation_preference}
              />
            </div>
            <ProfileTextarea
              label="Target roles"
              name="target_roles"
              defaultValue={formatList(profile?.target_roles)}
            />
            <ProfileTextarea
              label="Skills"
              name="skills"
              defaultValue={formatList(profile?.skills)}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Save profile
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function ProfileInput({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: "text" | "url";
  defaultValue?: string | null;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-900 dark:text-white"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}

function ProfileTextarea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-900 dark:text-white"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={5}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />
    </div>
  );
}
