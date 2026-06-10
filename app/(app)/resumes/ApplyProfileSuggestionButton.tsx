"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId } from "react";
import {
  applyResumeProfileSuggestion,
  type ApplyProfileSuggestionFormState,
} from "./actions";

type ApplyProfileSuggestionButtonProps = {
  insightId: string;
  suggestionIndex: number;
};

const initialState: ApplyProfileSuggestionFormState = {
  appliedAt: null,
  error: null,
};

export function ApplyProfileSuggestionButton({
  insightId,
  suggestionIndex,
}: ApplyProfileSuggestionButtonProps) {
  const router = useRouter();
  const messageId = useId();
  const [state, formAction, isPending] = useActionState(
    applyResumeProfileSuggestion,
    initialState
  );
  const message = state.error ?? (state.appliedAt ? "Applied." : null);

  useEffect(() => {
    if (state.appliedAt) {
      router.refresh();
    }
  }, [router, state.appliedAt]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="insightId" value={insightId} />
      <input
        type="hidden"
        name="suggestionIndex"
        value={String(suggestionIndex)}
      />
      <button
        type="submit"
        disabled={isPending}
        aria-describedby={message ? messageId : undefined}
        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"
      >
        {isPending ? "Applying..." : "Apply"}
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
