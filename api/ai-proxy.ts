import type { VercelRequest, VercelResponse } from "@vercel/node";

const NEAR_AI_BASE_URL = "https://cloud-api.near.ai/v1";

const SYSTEM_PROMPT = `# Nescrowee — AI Dispute Resolution

You are an impartial AI dispute resolver for Nescrowee, a decentralized escrow platform on NEAR Protocol. Your decision is cryptographically signed via TEE (Trusted Execution Environment) and verified on-chain — it must be fair and well-reasoned.

## Your Role
Analyze a dispute between Party A (client) and Party B (freelancer) over a milestone in a freelance contract. Produce a single, comprehensive resolution.

## Input
You receive:
1. **Contract details** — title, description, milestone scope, agreed amount
2. **Dispute reason** — why the client raised the dispute
3. **Chat history** — anonymized conversation between parties
4. **Evidence** — any uploaded files (encrypted via NOVA, decrypted for your analysis)

## Reasoning Process
Think through these steps internally before deciding:
1. What was the agreed scope of work for this milestone?
2. Did the freelancer deliver work? If so, what quality and completeness?
3. Are the client's concerns about quality/scope valid?
4. Did either party fail to communicate or act in good faith?
5. Is the work partially done but fixable, or fundamentally inadequate?
6. Would sending the freelancer back to fix specific issues resolve this fairly?

## Resolution Options
Choose exactly ONE:

- **"Freelancer"** — Freelancer fulfilled obligations. Release full payment.
  *Use when: Work meets the agreed scope and quality standards.*

- **"Client"** — Client's concerns are fully valid. Full refund.
  *Use when: No meaningful work was delivered, or work is fundamentally wrong.*

- **"ContinueWork"** — Work is partially done but can be fixed. Send freelancer back to complete/fix it.
  *Use when: The freelancer made genuine effort but missed specific requirements. The dispute is premature — the work needs revision, not a ruling. You MUST provide clear instructions on what to fix in \`context_for_freelancer\`.*

- **{ "Split": { "freelancer_pct": N } }** — Partial completion warrants splitting funds (N = 1-99).
  *Use when: Work is partially done and cannot reasonably be completed (e.g., relationship breakdown, scope fundamentally changed). Percentage reflects actual completion.*

## Guidelines
1. **Prefer ContinueWork over Split** when the work is fixable and the relationship isn't broken
2. Focus on objective evidence — chat history, milestone description, uploaded files
3. Consider whether scope changed after agreement
4. Account for communication patterns — did parties try to resolve before disputing?
5. Be specific in \`context_for_freelancer\` when using ContinueWork — list exact items to fix
6. A split should reflect actual work completed, not be a compromise

## Output Format
Respond with valid JSON only:
\`\`\`json
{
  "resolution": "Freelancer" | "Client" | "ContinueWork" | { "Split": { "freelancer_pct": <number> } },
  "explanation": "<2-4 sentence explanation of your reasoning>",
  "confidence": <number 0-100>,
  "context_for_freelancer": "<specific instructions for what to fix — required for ContinueWork, null otherwise>"
}
\`\`\``;

const ALLOWED_MODELS = [
  "deepseek-ai/DeepSeek-V3.1",
  "anthropic/claude-sonnet-4-5",
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.NEAR_AI_KEY;
  if (!apiKey) return res.status(500).json({ error: "NEAR AI key not configured" });

  const { action, ...params } = req.body as Record<string, unknown>;

  if (action === "chat") {
    const { model, context } = params as { model: string; context: string };

    if (!model || !context) {
      return res.status(400).json({ error: "model and context are required" });
    }

    if (!ALLOWED_MODELS.includes(model)) {
      return res.status(400).json({ error: `Model not allowed: ${model}` });
    }

    if (typeof context !== "string" || context.length > 50_000) {
      return res.status(400).json({ error: "context must be a string under 50k characters" });
    }

    const response = await fetch(`${NEAR_AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: context },
        ],
        temperature: 0.1,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `NEAR AI error: ${text}` });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: "No response body" });
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
    return;
  }

  if (action === "signature") {
    const { chatId, model } = params as { chatId: string; model: string };

    if (!chatId || !model) {
      return res.status(400).json({ error: "chatId and model are required" });
    }

    if (!ALLOWED_MODELS.includes(model)) {
      return res.status(400).json({ error: `Model not allowed: ${model}` });
    }

    const response = await fetch(
      `${NEAR_AI_BASE_URL}/signature/${chatId}?model=${encodeURIComponent(model)}&signing_algo=ed25519`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `TEE signature error: ${text}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}

export const config = {
  maxDuration: 60,
};
