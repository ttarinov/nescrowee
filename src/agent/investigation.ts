import { callDisputeAi, getAiSignature } from "./client";
import { parseInvestigationRound } from "./parser";
import type { InvestigationRoundResult, InvestigationResult } from "./types";

function buildRoundPrompt(
  basePrompt: string,
  roundNumber: number,
  maxRounds: number,
  previousRounds: InvestigationRoundResult[],
): string {
  let previousFindings = "None — this is the first round.";
  if (previousRounds.length > 0) {
    previousFindings = previousRounds
      .map(
        (r) =>
          `Round ${r.round_number} (confidence: ${r.confidence}%):\n  Analysis: ${r.analysis}\n  Findings: ${r.findings}`,
      )
      .join("\n\n");
  }

  return basePrompt
    .replace("{round}", String(roundNumber))
    .replace("{max_rounds}", String(maxRounds))
    .replace("{previous_findings}", previousFindings);
}

export async function runInvestigation(
  modelId: string,
  prompt: string,
  context: string,
  maxRounds: number,
  onRoundComplete: (round: InvestigationRoundResult) => void,
): Promise<InvestigationResult> {
  const rounds: InvestigationRoundResult[] = [];

  for (let i = 1; i <= maxRounds; i++) {
    const roundPrompt = buildRoundPrompt(prompt, i, maxRounds, rounds);
    const { response, chatId } = await callDisputeAi(modelId, roundPrompt, context);
    const teeSig = await getAiSignature(chatId, modelId);
    const parsed = parseInvestigationRound(response);

    const round: InvestigationRoundResult = {
      ...parsed,
      round_number: i,
      tee: teeSig,
    };
    rounds.push(round);
    onRoundComplete(round);

    if (!parsed.needs_more_analysis) break;
  }

  return { rounds, finalResolution: rounds[rounds.length - 1] };
}
