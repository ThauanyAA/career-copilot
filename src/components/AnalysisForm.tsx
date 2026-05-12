"use client";

import { FormEvent, useState } from "react";

interface AnalysisFormProps {
  onSubmit: (data: { resumeContent: string; jobDescription: string }) => void;
  isLoading: boolean;
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [resumeContent, setResumeContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ resumeContent, jobDescription });
  };

  const isDisabled = isLoading || !resumeContent.trim() || !jobDescription.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="resume"
          className="block text-sm font-medium text-zinc-900 dark:text-white"
        >
          Resume Content
        </label>
        <textarea
          id="resume"
          value={resumeContent}
          onChange={(e) => setResumeContent(e.target.value)}
          placeholder="Paste your resume content here..."
          disabled={isLoading}
          className="h-32 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 transition-colors disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400 dark:disabled:bg-zinc-800"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="job-description"
          className="block text-sm font-medium text-zinc-900 dark:text-white"
        >
          Job Description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          disabled={isLoading}
          className="h-32 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 transition-colors disabled:bg-zinc-50 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400 dark:disabled:bg-zinc-800"
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-zinc-700"
      >
        {isLoading ? "Analyzing..." : "Analyze Match"}
      </button>
    </form>
  );
}
