import { callDisputeAi, getAiSignature } from "./client";
import { parseAiResolution } from "./parser";
import type { AiResolutionResult } from "./types";

export type InvestigationStep =
  | "collecting_evidence"
  | "anonymizing"
  | "connecting_tee"
  | "analyzing"
  | "retrieving_signature"
  | "submitting_onchain"
  | "done"
  | "error";

export type OnStepCallback = (step: InvestigationStep, detail?: string) => void;

export async function runInvestigation(
  modelId: string,
  context: string,
  onStep?: OnStepCallback,
): Promise<AiResolutionResult & { rawResponse: string }> {
  onStep?.("analyzing", modelId);
  const { response, chatId } = await callDisputeAi(modelId, context);

  onStep?.("retrieving_signature");
  const tee = await getAiSignature(chatId, modelId);

  const parsed = parseAiResolution(response);
  return { ...parsed, tee, rawResponse: response };
}
