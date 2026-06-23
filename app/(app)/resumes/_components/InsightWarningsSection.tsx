import { PreviewBlock } from "./ResumeInsightPreviewPrimitives";
import type { ResumeInsightResult } from "@/types/resumeIntelligence";

export function InsightWarningsSection({
  limitations,
  warnings,
}: {
  limitations: ResumeInsightResult["limitations"];
  warnings: ResumeInsightResult["warnings"];
}) {
  if (warnings.length === 0 && limitations.length === 0) {
    return null;
  }

  return (
    <PreviewBlock title="Warnings and limitations">
      <ul className="space-y-1 break-words text-sm text-zinc-600 dark:text-zinc-300">
        {[...warnings, ...limitations].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </PreviewBlock>
  );
}
