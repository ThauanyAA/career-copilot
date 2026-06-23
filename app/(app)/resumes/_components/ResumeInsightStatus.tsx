import { MarkResumeInsightReviewedButton } from "../MarkResumeInsightReviewedButton";
import type { ResumeInsightPreview } from "./types";

export function ResumeInsightStatus({
  insightId,
  isOutdated,
  status,
  updatedAt,
}: {
  insightId: string;
  isOutdated: boolean;
  status: ResumeInsightPreview["row"]["status"];
  updatedAt?: string;
}) {
  return (
    <div
      className={`${updatedAt ? "mb-4" : "mb-3"} flex flex-wrap items-center justify-between gap-2`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Latest insight
        </h4>
        <InsightStatusBadge status={status} />
        {isOutdated && <OutdatedInsightBadge />}
      </div>
      {updatedAt ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Updated {new Date(updatedAt).toLocaleDateString()}
          </p>
          <MarkReviewedAction insightId={insightId} status={status} />
        </div>
      ) : (
        <MarkReviewedAction insightId={insightId} status={status} />
      )}
    </div>
  );
}

export function OutdatedInsightMessage() {
  return (
    <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      This insight was generated from an older version of this resume. Run a
      new analysis to refresh it.
    </p>
  );
}

function MarkReviewedAction({
  insightId,
  status,
}: {
  insightId: string;
  status: ResumeInsightPreview["row"]["status"];
}) {
  if (status !== "draft") {
    return null;
  }

  return <MarkResumeInsightReviewedButton insightId={insightId} />;
}

function OutdatedInsightBadge() {
  return (
    <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-200">
      Outdated
    </span>
  );
}

function InsightStatusBadge({
  status,
}: {
  status: ResumeInsightPreview["row"]["status"];
}) {
  return (
    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {status}
    </span>
  );
}
