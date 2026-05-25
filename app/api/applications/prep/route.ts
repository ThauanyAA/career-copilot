import { NextRequest, NextResponse } from "next/server";
import { buildApplicationPrepGraph } from "@/ai/applicationPrep/graph";
import type { ApplicationPrepGraphRuntimeState } from "@/ai/applicationPrep/state";
import { createClient } from "@/lib/supabase/server";
import {
  ApplicationPrepRequestSchema,
  ApplicationPrepResultSchema,
} from "@/types/applicationPrep";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const parsedRequest = ApplicationPrepRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: "Invalid application prep request.",
        details: parsedRequest.error.flatten().fieldErrors,
      },
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

  const { data: profile, error: profileError } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Application prep profile load error:", {
      code: profileError.code,
      message: profileError.message,
    });

    return NextResponse.json(
      { error: "Unable to load candidate profile." },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json(
      { error: "Create a candidate profile before generating application prep." },
      { status: 409 }
    );
  }

  const { data: reusableAnswers, error: reusableAnswersError } = await supabase
    .from("reusable_answers")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (reusableAnswersError) {
    console.error("Application prep reusable answers load error:", {
      code: reusableAnswersError.code,
      message: reusableAnswersError.message,
    });

    return NextResponse.json(
      { error: "Unable to load reusable answers." },
      { status: 500 }
    );
  }

  try {
    const graph = buildApplicationPrepGraph();
    const initialState: ApplicationPrepGraphRuntimeState = {
      userId,
      userTier: "free",
      request: parsedRequest.data,
      profile,
      reusableAnswers: reusableAnswers ?? [],
    };

    const graphResult = await graph.invoke(
      initialState as unknown as Parameters<typeof graph.invoke>[0]
    );

    if (graphResult.error || !graphResult.result) {
      console.error("Application prep graph error:", graphResult.error);

      return NextResponse.json(
        { error: "Unable to generate application prep right now." },
        { status: 500 }
      );
    }

    const result = ApplicationPrepResultSchema.safeParse(graphResult.result);

    if (!result.success) {
      console.error("Application prep result validation error:", {
        errors: result.error.flatten().fieldErrors,
      });

      return NextResponse.json(
        { error: "Application prep result was invalid." },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Application prep error:", error);

    return NextResponse.json(
      { error: "Failed to generate application prep. Please try again." },
      { status: 500 }
    );
  }
}
