import { END, START, StateGraph } from "@langchain/langgraph";
import { ApplicationPrepGraphStateSchema } from "@/types/applicationPrep";
import { estimateComplexity } from "./nodes/estimateComplexity";
import { generateApplicationPrep } from "./nodes/generateApplicationPrep";
import { loadCandidateContext } from "./nodes/loadCandidateContext";
import { resolveModelRoute } from "./nodes/resolveModelRoute";
import { selectRelevantReusableAnswers } from "./nodes/selectRelevantReusableAnswers";
import { validateInput } from "./nodes/validateInput";
import { validateResult } from "./nodes/validateResult";
import { routeByError } from "./state";

export function buildApplicationPrepGraph() {
  return new StateGraph(ApplicationPrepGraphStateSchema)
    .addNode("validateInput", validateInput)
    .addNode("loadCandidateContext", loadCandidateContext)
    .addNode("selectRelevantReusableAnswers", selectRelevantReusableAnswers)
    .addNode("estimateComplexity", estimateComplexity)
    .addNode("resolveModelRoute", resolveModelRoute)
    .addNode("generateApplicationPrep", generateApplicationPrep)
    .addNode("validateResult", validateResult)
    .addEdge(START, "validateInput")
    .addConditionalEdges("validateInput", routeByError, {
      stop: END,
      continue: "loadCandidateContext",
    })
    .addConditionalEdges("loadCandidateContext", routeByError, {
      stop: END,
      continue: "selectRelevantReusableAnswers",
    })
    .addConditionalEdges("selectRelevantReusableAnswers", routeByError, {
      stop: END,
      continue: "estimateComplexity",
    })
    .addConditionalEdges("estimateComplexity", routeByError, {
      stop: END,
      continue: "resolveModelRoute",
    })
    .addConditionalEdges("resolveModelRoute", routeByError, {
      stop: END,
      continue: "generateApplicationPrep",
    })
    .addConditionalEdges("generateApplicationPrep", routeByError, {
      stop: END,
      continue: "validateResult",
    })
    .addEdge("validateResult", END)
    .compile();
}
