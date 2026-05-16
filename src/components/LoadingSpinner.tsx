"use client";

import { useEffect, useState } from "react";

const loadingMessages = [
  "Analyzing your resume",
  "Matching your skills to the job requirements",
  "Identifying strengths and gaps",
  "Generating personalized recommendations",
  "Finalizing your analysis",
];

export function LoadingSpinner() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((currentIndex) =>
        currentIndex === loadingMessages.length - 1 ? 0 : currentIndex + 1
      );
    }, 1400);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentMessage = loadingMessages[messageIndex];

  return (
    <div
      className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-950"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
        <div
          className="h-6 w-6 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-3">
        <p
          key={currentMessage}
          className="animate-pulse text-sm font-medium text-zinc-900 transition-opacity dark:text-white"
        >
          {currentMessage}
          <span className="inline-flex w-5 justify-start" aria-hidden="true">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse [animation-delay:160ms]">.</span>
            <span className="animate-pulse [animation-delay:320ms]">.</span>
          </span>
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          This usually takes just a few seconds while Career Copilot reviews the
          fit.
        </p>
      </div>

      <div
        className="mt-6 flex items-center gap-2"
        aria-label={`Step ${messageIndex + 1} of ${loadingMessages.length}`}
      >
        {loadingMessages.map((message, index) => (
          <span
            key={message}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === messageIndex
                ? "w-6 bg-blue-600 dark:bg-blue-400"
                : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
