import {
  CollapsiblePreviewSection,
  EmptyPreviewText,
  PreviewReason,
} from "./ResumeInsightPreviewPrimitives";
import type { ResumeInsightResult } from "@/types/resumeIntelligence";

export function MissingInfoSection({
  questions,
}: {
  questions: ResumeInsightResult["missingInfoQuestions"];
}) {
  return (
    <CollapsiblePreviewSection
      count={questions.length}
      title="Missing info questions"
    >
      {questions.length === 0 ? (
        <EmptyPreviewText>No missing info questions yet.</EmptyPreviewText>
      ) : (
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div key={`${question.field}-${index}`}>
              <p className="break-words text-sm font-medium text-zinc-900 dark:text-white">
                {question.question}
              </p>
              <PreviewReason reason={question.reason} />
            </div>
          ))}
        </div>
      )}
    </CollapsiblePreviewSection>
  );
}
