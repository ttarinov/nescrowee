import { Hono } from "hono";
import {
  getPendingDisputes,
  getContract,
  submitAiResolution,
  config,
  getAgentAccountId,
} from "./near-client";
import { readContext, postResolution } from "./social-db";
import { investigate } from "./investigator";

const app = new Hono();
const NEAR_AI_BASE_URL = "https://cloud-api.near.ai/v1";
const POLL_INTERVAL_MS = 15_000;
const processingDisputes = new Set<string>();
const completedDisputes: Array<{ contractId: string; milestoneId: string; resolution: string; confidence: number; timestamp: number }> = [];

function getApiKey(): string {
  const key = process.env.NEAR_AI_KEY;
  if (!key) throw new Error("NEAR_AI_KEY env var not set");
  return key;
}

function signatureToBytes(base64Sig: string): number[] {
  const binary = atob(base64Sig);
  return Array.from(binary, (c) => c.charCodeAt(0));
}

function addressToBytes(address: string): number[] {
  const binary = atob(address);
  return Array.from(binary, (c) => c.charCodeAt(0));
}

function normalizeResolution(res: string): unknown {
  const lower = res.toLowerCase();
  if (lower === "freelancer") return "Freelancer";
  if (lower === "client") return "Client";
  if (lower === "continuework") return "ContinueWork";
  if (lower === "split") return { Split: { freelancer_pct: 50 } };
  return res;
}

async function getTeeSignature(
  chatId: string,
  modelId: string,
): Promise<{ text: string; signature: string; signing_address: string }> {
  const res = await fetch(
    `${NEAR_AI_BASE_URL}/signature/${chatId}?model=${encodeURIComponent(modelId)}&signing_algo=ed25519`,
    { headers: { Authorization: `Bearer ${getApiKey()}` } },
  );
  if (!res.ok) throw new Error(`TEE signature error: ${res.status} ${await res.text()}`);
  return res.json() as any;
}

async function processDispute(contractId: string, milestoneId: string): Promise<string> {
  const key = `${contractId}:${milestoneId}`;
  if (processingDisputes.has(key)) return "already processing";
  processingDisputes.add(key);

  try {
    console.log(`[Agent] Processing dispute: ${contractId} / ${milestoneId}`);

    const context = await readContext(contractId);
    if (!context) {
      console.log(`[Agent] No ai_context found for ${contractId}, skipping`);
      return "no context found";
    }

    const contract = await getContract(contractId);
    if (!contract) throw new Error(`Contract ${contractId} not found`);

    const modelId = contract.model_id;
    console.log(`[Agent] Using model: ${modelId}`);

    const result = await investigate(modelId, contractId, context);
    console.log(`[Agent] Investigation complete: ${result.resolution} (confidence: ${result.confidence})`);

    const tee = await getTeeSignature(result.chatId, modelId);
    console.log(`[Agent] TEE signature obtained`);

    const resolution = normalizeResolution(result.resolution);

    await submitAiResolution(
      contractId,
      milestoneId,
      resolution,
      result.explanation,
      signatureToBytes(tee.signature),
      addressToBytes(tee.signing_address),
      tee.text,
    );
    console.log(`[Agent] Resolution submitted on-chain`);

    await postResolution(contractId, {
      resolution: result.resolution,
      explanation: result.explanation,
      confidence: result.confidence,
      model_id: modelId,
      tee_verified: true,
      context_for_freelancer: result.context_for_freelancer ?? undefined,
    });
    console.log(`[Agent] Resolution posted to Social DB`);

    completedDisputes.push({
      contractId,
      milestoneId,
      resolution: result.resolution,
      confidence: result.confidence,
      timestamp: Date.now(),
    });

    return `resolved: ${result.resolution} (${result.confidence}%)`;
  } catch (err) {
    console.error(`[Agent] Error processing ${contractId}/${milestoneId}:`, err);
    return `error: ${err}`;
  } finally {
    processingDisputes.delete(key);
  }
}

async function pollOnce(): Promise<number> {
  try {
    const pending = await getPendingDisputes();
    if (pending.length > 0) {
      console.log(`[Agent] Found ${pending.length} pending dispute(s)`);
    }

    for (const [contractId, milestoneId] of pending) {
      await processDispute(contractId, milestoneId);
    }
    return pending.length;
  } catch (err) {
    console.error("[Agent] Poll error:", err);
    return 0;
  }
}

// --- Hono HTTP endpoints (Shade Agent pattern) ---

app.get("/", (c) =>
  c.json({
    agent: "nescrowee-investigator",
    network: config.networkId,
    contract: config.contractId,
    status: "running",
    processing: Array.from(processingDisputes),
    completed: completedDisputes.length,
  }),
);

app.get("/api/status", (c) =>
  c.json({
    agent: getAgentAccountId(),
    network: config.networkId,
    contract: config.contractId,
    processing: Array.from(processingDisputes),
    completed: completedDisputes.slice(-10),
    uptime: process.uptime(),
  }),
);

app.get("/api/pending", async (c) => {
  const pending = await getPendingDisputes();
  return c.json({ count: pending.length, disputes: pending });
});

app.post("/api/investigate", async (c) => {
  const { contractId, milestoneId } = await c.req.json();
  if (!contractId || !milestoneId) {
    return c.json({ error: "contractId and milestoneId required" }, 400);
  }
  const result = await processDispute(contractId, milestoneId);
  return c.json({ result });
});

app.get("/api/poll", async (c) => {
  const count = await pollOnce();
  return c.json({ processed: count });
});

// --- Start server + polling loop ---

const PORT = parseInt(process.env.PORT || "3000");

console.log(`[Agent] Starting on ${config.networkId} (contract: ${config.contractId})`);
console.log(`[Agent] HTTP server on port ${PORT}`);
console.log(`[Agent] Polling every ${POLL_INTERVAL_MS / 1000}s`);

pollOnce();
setInterval(pollOnce, POLL_INTERVAL_MS);

export default {
  port: PORT,
  fetch: app.fetch,
};
