import { buildGraphPipeline } from './graph';
import { OpenRouterService } from '../services/openRouterService';

export async function buildGraph() {
  const llm = new OpenRouterService();
  return buildGraphPipeline(llm);
}

export const graph = async () => {
  return buildGraph();
};

export default graph;