"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId } from "react";
import {
  addResumeReusableAnswerSuggestion,
  type AddReusableAnswerSuggestionFormState,
} from "./actions";

type AddReusableAnswerSuggestionButtonProps = {
  actionLabel?: string;
  insightId: string;
  suggestionIndex: number;
};

const initialState: AddReusableAnswerSuggestionFormState = {
  addedAt: null,
  error: null,
  message: null,
};

export function AddReusableAnswerSuggestionButton({
  actionLabel = "Add to answers",
  insightId,
  suggestionIndex,
}: AddReusableAnswerSuggestionButtonProps) {
  const router = useRouter();
  const messageId = useId();
  const [state, formAction, isPending] = useActionState(
    addResumeReusableAnswerSuggestion,
    initialState
  );
  const message = state.error ?? state.message;

  useEffect(() => {
    if (state.addedAt) {
      router.refresh();
    }
  }, [router, state.addedAt]);

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
        className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950"
      >
        {isPending ? "Adding..." : actionLabel}
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
