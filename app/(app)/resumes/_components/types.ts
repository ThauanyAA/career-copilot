import type { Database } from "@/types/database";
import type { ResumeInsightResult } from "@/types/resumeIntelligence";

export type Resume = Database["public"]["Tables"]["resumes"]["Row"];
export type ResumeInsightRow =
  Database["public"]["Tables"]["resume_insights"]["Row"];

export type ResumeInsightPreview = {
  row: Pick<
    ResumeInsightRow,
    | "id"
    | "resume_id"
    | "source_content_hash"
    | "status"
    | "summary"
    | "structured_data"
    | "profile_suggestions"
    | "reusable_answer_suggestions"
    | "missing_info_questions"
    | "warnings"
    | "limitations"
    | "updated_at"
  >;
  result: ResumeInsightResult | null;
};

export type ResumeFormAction = (formData: FormData) => Promise<void>;
