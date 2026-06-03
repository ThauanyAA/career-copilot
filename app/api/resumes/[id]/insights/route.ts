import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSavedResume } from "@/ai/resumeIntelligence/service";
import { createClient } from "@/lib/supabase/server";
import {
  ResumeInsightRequestSchema,
  ResumeInsightResultSchema,
  type ExistingCandidateProfileContext,
  type ExistingReusableAnswerContext,
  type ResumeInsightResult,
} from "@/types/resumeIntelligence";
import type { Database, Json } from "@/types/database";

type CandidateProfileRow =
  Database["public"]["Tables"]["candidate_profiles"]["Row"];
type ReusableAnswerRow =
  Database["public"]["Tables"]["reusable_answers"]["Row"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ResumeIdSchema = z.string().uuid();

function compactOptionalText(value: string | null | undefined) {
  const compacted = value?.trim().replace(/\s+/g, " ") ?? "";
  return compacted.length > 0 ? compacted : null;
}

function mapProfileContext(
  profile: CandidateProfileRow | null
): ExistingCandidateProfileContext | undefined {
  if (!profile) {
    return undefined;
  }

  return {
    fullName: compactOptionalText(profile.full_name),
    headline: compactOptionalText(profile.headline),
    location: compactOptionalText(profile.location),
    linkedinUrl: compactOptionalText(profile.linkedin_url),
    githubUrl: compactOptionalText(profile.github_url),
    portfolioUrl: compactOptionalText(profile.portfolio_url),
    targetRoles: profile.target_roles,
    skills: profile.skills,
    salaryExpectation: compactOptionalText(profile.salary_expectation),
    noticePeriod: compactOptionalText(profile.notice_period),
    workAuthorization: compactOptionalText(profile.work_authorization),
    englishLevel: compactOptionalText(profile.english_level),
    relocationPreference: compactOptionalText(profile.relocation_preference),
  };
}

function mapReusableAnswerContext(
  answer: ReusableAnswerRow
): ExistingReusableAnswerContext {
  return {
    id: answer.id,
    label: answer.label,
    category: answer.category,
    question: answer.question,
    answer: answer.answer,
  };
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function POST(_request: Request, { params }: RouteContext) {
  const startedAt = Date.now();
  const { id } = await params;
  const resumeId = ResumeIdSchema.safeParse(id);

  if (!resumeId.success) {
    return NextResponse.json(
      { error: "Invalid resume id." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (authError || typeof userId !== "string") {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("id, title, content")
    .eq("id", resumeId.data)
    .eq("user_id", userId)
    .maybeSingle();

  if (resumeError) {
    console.error("Resume insight resume load error:", {
      code: resumeError.code,
      message: resumeError.message,
    });

    return NextResponse.json(
      { error: "Unable to load resume." },
      { status: 500 }
    );
  }

  if (!resume) {
    return NextResponse.json(
      { error: "Resume not found." },
      { status: 404 }
    );
  }

  const [{ data: profile, error: profileError }, { data: answers, error: answersError }] =
    await Promise.all([
      supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("reusable_answers")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(40),
    ]);

  if (profileError) {
    console.error("Resume insight profile load error:", {
      code: profileError.code,
      message: profileError.message,
    });

    return NextResponse.json(
      { error: "Unable to load candidate profile context." },
      { status: 500 }
    );
  }

  if (answersError) {
    console.error("Resume insight reusable answers load error:", {
      code: answersError.code,
      message: answersError.message,
    });

    return NextResponse.json(
      { error: "Unable to load reusable answers context." },
      { status: 500 }
    );
  }

  const insightRequest = ResumeInsightRequestSchema.safeParse({
    resumeId: resume.id,
    resumeTitle: resume.title,
    resumeContent: resume.content,
    existingCandidateProfile: mapProfileContext(profile),
    existingReusableAnswers: (answers ?? []).map(mapReusableAnswerContext),
  });

  if (!insightRequest.success) {
    return NextResponse.json(
      {
        error: "Saved resume cannot be analyzed.",
        details: insightRequest.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  let analysis: Awaited<ReturnType<typeof analyzeSavedResume>>;

  try {
    analysis = await analyzeSavedResume({
      request: insightRequest.data,
      userTier: "free",
    });

    console.log("Resume insight analysis diagnostics:", {
      maxTokens: analysis.diagnostics.maxTokens,
      modelId: analysis.diagnostics.modelId,
      promptResumeContentLength:
        analysis.diagnostics.promptResumeContentLength,
      resumeContentLength: analysis.diagnostics.resumeContentLength,
      steps: analysis.diagnostics.steps,
      totalDurationMs: Date.now() - startedAt,
      totalLlmDurationMs: analysis.diagnostics.totalLlmDurationMs,
      wasResumeContentTruncated:
        analysis.diagnostics.wasResumeContentTruncated,
    });
  } catch (error) {
    console.error("Resume insight generation error:", {
      error,
      resumeContentLength: resume.content.length,
      totalDurationMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      { error: "Unable to analyze resume right now." },
      { status: 500 }
    );
  }

  const parsedResult = ResumeInsightResultSchema.parse(analysis.result);
  const { data: savedInsight, error: saveError } = await supabase
    .from("resume_insights")
    .insert({
      user_id: userId,
      resume_id: resume.id,
      source_content_hash: analysis.sourceContentHash,
      summary: parsedResult.summary,
      structured_data: toJson(parsedResult.structuredData),
      profile_suggestions: toJson(parsedResult.profileSuggestions),
      reusable_answer_suggestions: toJson(
        parsedResult.reusableAnswerSuggestions
      ),
      missing_info_questions: toJson(parsedResult.missingInfoQuestions),
      warnings: toJson(parsedResult.warnings),
      limitations: toJson(parsedResult.limitations),
      model_id: analysis.diagnostics.modelId,
      status: "draft",
    })
    .select("id, status, source_content_hash, created_at")
    .maybeSingle();

  if (saveError || !savedInsight) {
    console.error("Resume insight save error:", {
      code: saveError?.code,
      message: saveError?.message,
    });

    return NextResponse.json(
      { error: "Unable to save resume insight." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    insight: {
      id: savedInsight.id,
      status: savedInsight.status,
      sourceContentHash: savedInsight.source_content_hash,
      createdAt: savedInsight.created_at,
    },
    result: parsedResult satisfies ResumeInsightResult,
  });
}
