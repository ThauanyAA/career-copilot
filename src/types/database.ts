export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      candidate_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          headline: string | null;
          location: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          target_roles: string[];
          skills: string[];
          salary_expectation: string | null;
          notice_period: string | null;
          work_authorization: string | null;
          english_level: string | null;
          relocation_preference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          headline?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          target_roles?: string[];
          skills?: string[];
          salary_expectation?: string | null;
          notice_period?: string | null;
          work_authorization?: string | null;
          english_level?: string | null;
          relocation_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          headline?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          target_roles?: string[];
          skills?: string[];
          salary_expectation?: string | null;
          notice_period?: string | null;
          work_authorization?: string | null;
          english_level?: string | null;
          relocation_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reusable_answers: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          category: Database["public"]["Enums"]["reusable_answer_category"];
          question: string;
          answer: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          category?: Database["public"]["Enums"]["reusable_answer_category"];
          question: string;
          answer: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          category?: Database["public"]["Enums"]["reusable_answer_category"];
          question?: string;
          answer?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_single_primary_resume: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_candidate_profiles_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_reusable_answers_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      set_resumes_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {
      reusable_answer_category:
        | "salary_expectation"
        | "notice_period"
        | "work_authorization"
        | "relocation"
        | "availability"
        | "motivation"
        | "experience_summary"
        | "custom";
    };
    CompositeTypes: Record<string, never>;
  };
};
