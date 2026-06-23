import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../actions";
import { createClient } from "@/lib/supabase/server";

type WorkflowStep = {
  actionLabel: string;
  description: string;
  detail: string;
  href: string;
  status: "complete" | "ready" | "todo";
  title: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  if (typeof userId !== "string") {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : "Authenticated user";

  const [
    { data: profile, error: profileError },
    { data: resumes, error: resumesError },
    { data: reusableAnswers, error: reusableAnswersError },
    { data: latestInsight, error: latestInsightError },
  ] = await Promise.all([
    supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("resumes").select("id").eq("user_id", userId),
    supabase.from("reusable_answers").select("id").eq("user_id", userId),
    supabase
      .from("resume_insights")
      .select("status, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileError) {
    console.error("Dashboard profile status load error:", {
      code: profileError.code,
      message: profileError.message,
    });
  }

  if (resumesError) {
    console.error("Dashboard resumes status load error:", {
      code: resumesError.code,
      message: resumesError.message,
    });
  }

  if (reusableAnswersError) {
    console.error("Dashboard saved answers status load error:", {
      code: reusableAnswersError.code,
      message: reusableAnswersError.message,
    });
  }

  if (latestInsightError) {
    console.error("Dashboard latest insight status load error:", {
      code: latestInsightError.code,
      message: latestInsightError.message,
    });
  }

  const hasProfile = Boolean(profile);
  const resumeCount = resumes?.length ?? 0;
  const reusableAnswerCount = reusableAnswers?.length ?? 0;
  const latestInsightStatus = latestInsight?.status ?? null;
  const hasSuccessfulInsight =
    latestInsightStatus !== null && latestInsightStatus !== "failed";

  const workflowSteps: WorkflowStep[] = [
    {
      actionLabel: hasProfile ? "Update profile" : "Complete profile",
      description:
        "Save your identity, target roles, skills, and preferences so the app can personalize prep.",
      detail: hasProfile ? "Profile saved" : "No profile saved yet",
      href: "/profile",
      status: hasProfile ? "complete" : "todo",
      title: "Complete profile",
    },
    {
      actionLabel: resumeCount > 0 ? "Manage resumes" : "Add resume",
      description:
        "Store the resume text you want Career Copilot to reuse across analysis and prep.",
      detail:
        resumeCount === 1 ? "1 resume saved" : `${resumeCount} resumes saved`,
      href: "/resumes",
      status: resumeCount > 0 ? "complete" : "todo",
      title: "Add resume",
    },
    {
      actionLabel: "Analyze resume",
      description:
        "Generate profile suggestions and reusable answer ideas from your saved resume.",
      detail: latestInsightStatus
        ? `Latest insight: ${formatStatusLabel(latestInsightStatus)}`
        : resumeCount > 0
          ? "No resume insight yet"
          : "Add a resume first",
      href: "/resumes",
      status: hasSuccessfulInsight ? "complete" : resumeCount > 0 ? "ready" : "todo",
      title: "Analyze resume",
    },
    {
      actionLabel: "Start application prep",
      description:
        "Use your saved profile, resume, reusable answers, and a job description to prepare an application.",
      detail:
        hasProfile && resumeCount > 0
          ? "Ready for a job description"
          : "Profile and resume help prep work better",
      href: "/applications/new",
      status: hasProfile && resumeCount > 0 ? "ready" : "todo",
      title: "Prepare application",
    },
    {
      actionLabel:
        reusableAnswerCount > 0 ? "Manage saved answers" : "Save answers",
      description:
        "Keep polished answers for common application questions and reuse them later.",
      detail:
        reusableAnswerCount === 1
          ? "1 saved answer"
          : `${reusableAnswerCount} saved answers`,
      href: "/answers",
      status: reusableAnswerCount > 0 ? "complete" : "todo",
      title: "Save reusable answers",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Career Copilot
          </p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                Build your reusable career memory, then use it to prepare
                stronger applications with less repeated typing.
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Log out
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <DashboardMetric
              label="Profile"
              value={hasProfile ? "Saved" : "Missing"}
            />
            <DashboardMetric label="Resumes" value={String(resumeCount)} />
            <DashboardMetric
              label="Saved answers"
              value={String(reusableAnswerCount)}
            />
            <DashboardMetric
              label="Latest insight"
              value={
                latestInsightStatus
                  ? formatStatusLabel(latestInsightStatus)
                  : "None"
              }
            />
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Main workflow
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Work through these steps whenever you set up or refresh your
              application materials.
            </p>
          </div>

          <div className="space-y-3">
            {workflowSteps.map((step, index) => (
              <WorkflowStepCard
                index={index + 1}
                key={step.title}
                step={step}
              />
            ))}
          </div>
        </section>

        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          Signed in as {email}
        </p>
      </div>
    </main>
  );
}

function DashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function WorkflowStepCard({
  index,
  step,
}: {
  index: number;
  step: WorkflowStep;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            {index}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {step.title}
              </h3>
              <WorkflowStatusBadge status={step.status} />
            </div>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {step.description}
            </p>
            <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {step.detail}
            </p>
          </div>
        </div>
        <Link
          href={step.href}
          className="shrink-0 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {step.actionLabel}
        </Link>
      </div>
    </article>
  );
}

function WorkflowStatusBadge({ status }: { status: WorkflowStep["status"] }) {
  const label =
    status === "complete" ? "Done" : status === "ready" ? "Ready" : "To do";
  const className =
    status === "complete"
      ? "rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-200"
      : status === "ready"
        ? "rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200"
        : "rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  return <span className={className}>{label}</span>;
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}
