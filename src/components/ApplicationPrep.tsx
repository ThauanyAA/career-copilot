"use client";

import Link from "next/link";
import { FormEvent, useState, type ReactNode } from "react";
import { AnalysisResults } from "@/components/AnalysisResults";
import type { ApplicationPrepResult } from "@/types/applicationPrep";
import type { AnalysisResult } from "@/types/analysis";

type PrepError = {
  message: string;
  missingProfile: boolean;
};

function getConfidenceLabel(confidence: string) {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
        <div
          className="h-6 w-6 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm font-medium text-zinc-900 dark:text-white">
        {message}
      </p>
    </div>
  );
}

function AnalysisError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950"
      role="alert"
    >
      <h3 className="font-semibold text-red-900 dark:text-red-100">
        Match Analysis Failed
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-red-800 dark:text-red-200">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
      >
        Try Again
      </button>
    </div>
  );
}

function PrepErrorPanel({
  error,
  onRetry,
}: {
  error: PrepError;
  onRetry: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950"
      role="alert"
    >
      <h3 className="font-semibold text-red-900 dark:text-red-100">
        Application Prep Failed
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-red-800 dark:text-red-200">
        {error.message}
      </p>
      {error.missingProfile ? (
        <Link
          href="/profile"
          className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        >
          Complete Profile
        </Link>
      ) : (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

function ApplicationPrepResults({ result }: { result: ApplicationPrepResult }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Application Prep
      </h2>

      <Section title="Fit Summary">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {result.fitSummary}
        </p>
      </Section>

      <Section title="Tailored Pitch">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {result.tailoredPitch}
        </p>
      </Section>

      <Section title="Suggested Answers">
        {result.suggestedAnswers.length > 0 ? (
          <div className="space-y-4">
            {result.suggestedAnswers.map((answer, index) => (
              <article
                key={`${answer.category}-${index}`}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    {answer.category.replaceAll("_", " ")}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {getConfidenceLabel(answer.confidence)} confidence
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Source: {answer.source.replaceAll("_", " ")}
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                  {answer.question}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {answer.answer}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No suggested answers were generated.
          </p>
        )}
      </Section>

      <Section title="Missing Candidate Info">
        {result.missingCandidateInfo.length > 0 ? (
          <ul className="space-y-3">
            {result.missingCandidateInfo.map((item, index) => (
              <li
                key={`${item.field}-${index}`}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    {item.priority} priority
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.field.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                  {item.question}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {item.reason}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No missing candidate details were identified.
          </p>
        )}
      </Section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Application Risks">
          {result.applicationRisks.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {result.applicationRisks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No specific risks were identified.
            </p>
          )}
        </Section>

        <Section title="Prep Checklist">
          {result.prepChecklist.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {result.prepChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No checklist items were generated.
            </p>
          )}
        </Section>
      </div>
    </div>
  );
}

export function ApplicationPrep() {
  const [resumeContent, setResumeContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [prepResult, setPrepResult] = useState<ApplicationPrepResult | null>(
    null
  );
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [prepError, setPrepError] = useState<PrepError | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const hasInput = Boolean(resumeContent.trim() && jobDescription.trim());
  const isBusy = isAnalyzing || isPreparing;

  const requestData = {
    resumeContent,
    jobDescription,
  };

  const resetOutputs = () => {
    setAnalysisResult(null);
    setPrepResult(null);
    setAnalysisError(null);
    setPrepError(null);
  };

  const updateResumeContent = (value: string) => {
    setResumeContent(value);
    resetOutputs();
  };

  const updateJobDescription = (value: string) => {
    setJobDescription(value);
    resetOutputs();
  };

  const runMatchAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        setAnalysisError("Unable to analyze fit right now. Please try again.");
        return;
      }

      const data = (await response.json()) as AnalysisResult;
      setAnalysisResult(data);
    } catch {
      setAnalysisError("Network error while analyzing fit.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runApplicationPrep = async () => {
    setIsPreparing(true);
    setPrepError(null);
    setPrepResult(null);

    try {
      const response = await fetch("/api/applications/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        setPrepError({
          message:
            response.status === 409
              ? "Create a candidate profile before generating application prep."
              : "Unable to generate application prep right now. Please try again.",
          missingProfile: response.status === 409,
        });
        return;
      }

      const data = (await response.json()) as ApplicationPrepResult;
      setPrepResult(data);
    } catch {
      setPrepError({
        message: "Network error while generating application prep.",
        missingProfile: false,
      });
    } finally {
      setIsPreparing(false);
    }
  };

  const handleAnalyzeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasInput || isBusy) {
      return;
    }

    void runMatchAnalysis();
  };

  const handlePrepareClick = () => {
    if (!hasInput || isBusy) {
      return;
    }

    void runApplicationPrep();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form
          onSubmit={handleAnalyzeSubmit}
          className="sticky top-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Application Context
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Use the same resume and job description for either path.
          </p>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="new-application-resume"
                className="block text-sm font-medium text-zinc-900 dark:text-white"
              >
                Resume Content
              </label>
              <textarea
                id="new-application-resume"
                value={resumeContent}
                onChange={(event) => updateResumeContent(event.target.value)}
                placeholder="Paste your resume content here..."
                disabled={isBusy}
                className="h-40 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 transition-colors disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400 dark:disabled:bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="new-application-job-description"
                className="block text-sm font-medium text-zinc-900 dark:text-white"
              >
                Job Description
              </label>
              <textarea
                id="new-application-job-description"
                value={jobDescription}
                onChange={(event) => updateJobDescription(event.target.value)}
                placeholder="Paste the job description here..."
                disabled={isBusy}
                className="h-40 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 transition-colors disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400 dark:disabled:bg-zinc-800"
              />
            </div>

            <div className="grid gap-3">
              <button
                type="submit"
                disabled={!hasInput || isBusy}
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-300"
              >
                {isAnalyzing ? "Analyzing Fit..." : "Analyze Fit First"}
              </button>
              <button
                type="button"
                onClick={handlePrepareClick}
                disabled={!hasInput || isBusy}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-zinc-700"
              >
                {isPreparing
                  ? "Preparing Application..."
                  : "Prepare Application Now"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-8 lg:col-span-2" aria-live="polite">
        {!analysisResult &&
          !prepResult &&
          !analysisError &&
          !prepError &&
          !isAnalyzing &&
          !isPreparing && (
            <div
              className="flex min-h-96 flex-col justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/50"
              role="status"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Choose a path to start this application.
              </p>
            </div>
          )}

        {isAnalyzing && <LoadingPanel message="Analyzing fit..." />}
        {analysisError && !isAnalyzing && (
          <AnalysisError message={analysisError} onRetry={runMatchAnalysis} />
        )}
        {analysisResult && !isAnalyzing && (
          <section className="space-y-4">
            <AnalysisResults result={analysisResult} />
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
              <h3 className="font-semibold text-blue-950 dark:text-blue-100">
                Ready for application prep?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-900 dark:text-blue-200">
                Use this same resume and job description to generate tailored
                application materials.
              </p>
              <button
                type="button"
                onClick={handlePrepareClick}
                disabled={!hasInput || isBusy}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-zinc-700"
              >
                Prepare Application Using This Context
              </button>
            </div>
          </section>
        )}

        {isPreparing && <LoadingPanel message="Preparing application..." />}
        {prepError && !isPreparing && (
          <PrepErrorPanel error={prepError} onRetry={runApplicationPrep} />
        )}
        {prepResult && !isPreparing && (
          <ApplicationPrepResults result={prepResult} />
        )}
      </div>
    </div>
  );
}
