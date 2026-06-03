import { END, START, StateGraph } from "@langchain/langgraph";
import { ResumeInsightGraphStateSchema } from "@/types/resumeIntelligence";
import { composeResumeInsight } from "./nodes/composeResumeInsight";
import { generateProfileSuggestions } from "./nodes/generateProfileSuggestions";
import { generateResumeSummary } from "./nodes/generateResumeSummary";
import { generateReusableAnswersAndMissingInfo } from "./nodes/generateReusableAnswersAndMissingInfo";
import { loadResumeInsightContext } from "./nodes/loadResumeInsightContext";
import { routeByError } from "./state";

export function buildResumeInsightGraph() {
  return new StateGraph(ResumeInsightGraphStateSchema)
    .addNode("loadResumeInsightContext", loadResumeInsightContext)
    .addNode("generateResumeSummary", generateResumeSummary)
    .addNode("generateProfileSuggestions", generateProfileSuggestions)
    .addNode(
      "generateReusableAnswersAndMissingInfo",
      generateReusableAnswersAndMissingInfo
    )
    .addNode("composeResumeInsight", composeResumeInsight)
    .addEdge(START, "loadResumeInsightContext")
    .addConditionalEdges("loadResumeInsightContext", routeByError, {
      stop: END,
      continue: "generateResumeSummary",
    })
    .addConditionalEdges("generateResumeSummary", routeByError, {
      stop: END,
      continue: "generateProfileSuggestions",
    })
    .addConditionalEdges("generateProfileSuggestions", routeByError, {
      stop: END,
      continue: "generateReusableAnswersAndMissingInfo",
    })
    .addConditionalEdges(
      "generateReusableAnswersAndMissingInfo",
      routeByError,
      {
        stop: END,
        continue: "composeResumeInsight",
      }
    )
    .addEdge("composeResumeInsight", END)
    .compile();
}
