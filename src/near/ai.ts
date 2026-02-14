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

export function signatureToBytes(base64Sig: string): number[] {
  const binary = atob(base64Sig);
  return Array.from(binary, (c) => c.charCodeAt(0));
}

export function addressToBytes(address: string): number[] {
  const binary = atob(address);
  return Array.from(binary, (c) => c.charCodeAt(0));
}
