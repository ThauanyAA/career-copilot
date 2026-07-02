"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type AnalyzeResumeButtonProps = {
  resumeId: string;
};

const ANALYZE_ERROR_MESSAGE =
  "We couldn't analyze this resume right now. Please try again.";

const loadingMessages = [
  "Reading saved resume",
  "Finding profile signals",
  "Preparing suggestions",
];

export function AnalyzeResumeButton({ resumeId }: AnalyzeResumeButtonProps) {
  const router = useRouter();
  const statusId = useId();
  const isRequestInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const currentLoadingMessage = loadingMessages[messageIndex];
  const statusMessage = isPending ? currentLoadingMessage : error;

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setMessageIndex((currentIndex) =>
        currentIndex === loadingMessages.length - 1 ? 0 : currentIndex + 1
      );
    }, 1400);

    return () => window.clearInterval(intervalId);
  }, [isPending]);

  async function handleAnalyze() {
    if (isRequestInFlight.current) {
      return;
    }

    isRequestInFlight.current = true;
    setError(null);
    setMessageIndex(0);
    setIsPending(true);

    try {
      const response = await fetch(`/api/resumes/${resumeId}/insights`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(ANALYZE_ERROR_MESSAGE);
      }

      router.refresh();
    } catch {
      setError(ANALYZE_ERROR_MESSAGE);
    } finally {
      isRequestInFlight.current = false;
      setIsPending(false);
    }
  }

  return (
    <div className="w-40 space-y-2">
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isPending}
        aria-describedby={statusMessage ? statusId : undefined}
        className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950"
      >
        {isPending && (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600 dark:border-emerald-900 dark:border-t-emerald-300"
            aria-hidden="true"
          />
        )}
        {isPending ? "Analyzing resume..." : "Analyze resume"}
      </button>
      {statusMessage && (
        <div
          id={statusId}
          aria-live={error ? "assertive" : "polite"}
          aria-busy={isPending || undefined}
          role={error ? "alert" : "status"}
          className={
            error
              ? "text-xs leading-relaxed text-red-600 dark:text-red-300"
              : "text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
          }
        >
          <p>
            {statusMessage}
            {isPending && (
              <span
                className="inline-flex w-4 justify-start"
                aria-hidden="true"
              >
                <span className="animate-pulse">.</span>
                <span className="animate-pulse [animation-delay:160ms]">
                  .
                </span>
                <span className="animate-pulse [animation-delay:320ms]">
                  .
                </span>
              </span>
            )}
          </p>
          {isPending && (
            <div
              className="mt-2 flex items-center gap-1"
              aria-label={`Step ${messageIndex + 1} of ${loadingMessages.length}`}
            >
              {loadingMessages.map((message, index) => (
                <span
                  key={message}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === messageIndex
                      ? "w-4 bg-emerald-600 dark:bg-emerald-300"
                      : "w-1 bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
