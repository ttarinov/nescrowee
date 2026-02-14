const NEAR_AI_BASE_URL = "https://cloud-api.near.ai/v1";

function getApiKey(): string {
  const key = import.meta.env.VITE_NEAR_AI_KEY;
  if (!key) throw new Error("VITE_NEAR_AI_KEY env var not set");
  return key;
}

interface ChatResponse {
  response: string;
  chatId: string;
}

export async function callDisputeAi(
  modelId: string,
  systemPrompt: string,
  userContext: string,
): Promise<ChatResponse> {
  const res = await fetch(`${NEAR_AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContext },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    throw new Error(`NEAR AI error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const chatId = data.id || data.chat_id;
  const content = data.choices[0].message.content;

  return { response: content, chatId };
}

export interface TeeSignature {
  text: string;
  signature: string;
  signing_address: string;
}

export async function getAiSignature(
  chatId: string,
  modelId: string,
): Promise<TeeSignature> {
  const res = await fetch(
    `${NEAR_AI_BASE_URL}/signature/${chatId}?model=${encodeURIComponent(modelId)}&signing_algo=ed25519`,
    {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    },
  );

  if (!res.ok) {
    throw new Error(`TEE signature error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export function parseAiResolution(responseText: string): {
  resolution: "Freelancer" | "Client" | { Split: { freelancer_pct: number } };
  explanation: string;
  confidence: string;
} {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI response did not contain valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  let resolution = parsed.resolution;
  if (typeof resolution === "string") {
    const lower = resolution.toLowerCase();
    if (lower === "freelancer") resolution = "Freelancer";
    else if (lower === "client") resolution = "Client";
  }
  if (typeof resolution === "object" && resolution.split) {
    resolution = { Split: { freelancer_pct: resolution.split.freelancer_pct } };
  }

  return {
    resolution,
    explanation: parsed.explanation || "",
    confidence: parsed.confidence || "medium",
  };
}

export interface InvestigationRoundResult {
  round_number: number;
  analysis: string;
  findings: string;
  confidence: number;
  needs_more_analysis: boolean;
  resolution: "Freelancer" | "Client" | { Split: { freelancer_pct: number } } | null;
  explanation: string | null;
  tee: TeeSignature;
}

export interface InvestigationResult {
  rounds: InvestigationRoundResult[];
  finalResolution: InvestigationRoundResult;
}

function parseInvestigationRound(responseText: string): {
  analysis: string;
  findings: string;
  confidence: number;
  needs_more_analysis: boolean;
  resolution: "Freelancer" | "Client" | { Split: { freelancer_pct: number } } | null;
  explanation: string | null;
} {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI response did not contain valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  let resolution = parsed.resolution;
  if (resolution) {
    if (typeof resolution === "string") {
      const lower = resolution.toLowerCase();
      if (lower === "freelancer") resolution = "Freelancer";
      else if (lower === "client") resolution = "Client";
    }
    if (typeof resolution === "object" && resolution.split) {
      resolution = { Split: { freelancer_pct: resolution.split.freelancer_pct } };
    }
  }

  return {
    analysis: parsed.analysis || "",
    findings: parsed.findings || "",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 50,
    needs_more_analysis: parsed.needs_more_analysis ?? false,
    resolution: resolution || null,
    explanation: parsed.explanation || null,
  };
}

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

export function signatureToBytes(base64Sig: string): number[] {
  const binary = atob(base64Sig);
  return Array.from(binary, (c) => c.charCodeAt(0));
}

export function addressToBytes(address: string): number[] {
  const binary = atob(address);
  return Array.from(binary, (c) => c.charCodeAt(0));
}
