"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type AnalyzeResumeButtonProps = {
  resumeId: string;
};

export function AnalyzeResumeButton({ resumeId }: AnalyzeResumeButtonProps) {
  const router = useRouter();
  const statusId = useId();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const statusMessage = isPending
    ? "Analyzing your resume. This may take about a minute."
    : error;

  async function handleAnalyze() {
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/resumes/${resumeId}/insights`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(payload?.error ?? "Unable to analyze this resume.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to analyze this resume."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isPending}
        aria-describedby={statusMessage ? statusId : undefined}
        className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950"
      >
        {isPending ? "Analyzing..." : "Analyze resume"}
      </button>
      {statusMessage && (
        <p
          id={statusId}
          aria-live={error ? "assertive" : "polite"}
          role={error ? "alert" : "status"}
          className={
            error
              ? "max-w-64 text-xs leading-relaxed text-red-600 dark:text-red-300"
              : "max-w-64 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
          }
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
}
