"use client";

import { useState } from "react";
import { AnalysisForm } from "@/components/AnalysisForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AnalysisResult } from "@/types/analysis";

export function JobMatchAnalyzer() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestData, setLastRequestData] = useState<{
    resumeContent: string;
    jobDescription: string;
  } | null>(null);

  const handleAnalysis = async (data: {
    resumeContent: string;
    jobDescription: string;
  }) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setLastRequestData(data);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-white">
            Job Match Analyzer
          </h2>
          <AnalysisForm onSubmit={handleAnalysis} isLoading={isLoading} />
        </div>
      </div>

      <div className="lg:col-span-2">
        <div aria-live="polite" aria-atomic="true">
          {!hasSearched && (
            <div
              className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/50"
              role="status"
            >
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Enter your resume and job description to see the analysis
              </p>
            </div>
          )}

          {isLoading && <LoadingSpinner />}

          {hasSearched && !isLoading && error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
              role="alert"
            >
              <h3 className="mb-2 font-semibold text-red-900 dark:text-red-100">
                Analysis Failed
              </h3>
              <p className="mb-4 text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
              {lastRequestData && (
                <button
                  onClick={() => handleAnalysis(lastRequestData)}
                  className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {hasSearched && !isLoading && result && (
            <AnalysisResults result={result} />
          )}
        </div>
      </div>
    </div>
  );
}
