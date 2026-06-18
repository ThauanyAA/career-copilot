"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId } from "react";
import {
  markResumeInsightReviewed,
  type MarkResumeInsightReviewedFormState,
} from "./actions";

type MarkResumeInsightReviewedButtonProps = {
  insightId: string;
};

const initialState: MarkResumeInsightReviewedFormState = {
  error: null,
  reviewedAt: null,
};

export function MarkResumeInsightReviewedButton({
  insightId,
}: MarkResumeInsightReviewedButtonProps) {
  const router = useRouter();
  const messageId = useId();
  const [state, formAction, isPending] = useActionState(
    markResumeInsightReviewed,
    initialState
  );
  const message = state.error ?? (state.reviewedAt ? "Marked reviewed." : null);

  useEffect(() => {
    if (state.reviewedAt) {
      router.refresh();
    }
  }, [router, state.reviewedAt]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="insightId" value={insightId} />
      <button
        type="submit"
        disabled={isPending}
        aria-describedby={message ? messageId : undefined}
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        {isPending ? "Marking..." : "Mark as reviewed"}
      </button>
      {message && (
        <p
          id={messageId}
          aria-live={state.error ? "assertive" : "polite"}
          role={state.error ? "alert" : "status"}
          className={
            state.error
              ? "max-w-64 text-xs leading-relaxed text-red-600 dark:text-red-300"
              : "max-w-64 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
