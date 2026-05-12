export interface AnalysisRequest {
  resumeContent: string;
  jobDescription: string;
}

export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  missingSkills: string[];
  suggestedAnswer: string;
}
