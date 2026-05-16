import { AnalysisResult } from "@/types/analysis";
import { ResultCard } from "./ResultCard";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Analysis Results
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard
          title="Match Score"
          content={result.matchScore.toString()}
          variant="score"
        />
        <ResultCard
          title="Strengths"
          content={result.strengths}
          variant="list"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard
          title="Missing Skills"
          content={result.missingSkills}
          variant="list"
        />
        <ResultCard
          title="Strategic Summary"
          content={result.quickSummary}
          variant="text"
        />
      </div>

      <div>
        <ResultCard
          title="Recommended Actions"
          content={result.improvementActions}
          variant="list"
        />
      </div>
    </div>
  );
}
