import { callDisputeAi, getAiSignature } from "./client";
import { parseAiResolution } from "./parser";
import type { AiResolutionResult } from "./types";

export async function runInvestigation(
  modelId: string,
  prompt: string,
  context: string,
): Promise<AiResolutionResult> {
  const { response, chatId } = await callDisputeAi(modelId, prompt, context);
  const tee = await getAiSignature(chatId, modelId);
  const parsed = parseAiResolution(response);

  return { ...parsed, tee };
}
