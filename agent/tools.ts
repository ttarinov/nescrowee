import { getContract } from "./near-client";
import { readChat, readEvidenceMessages } from "./social-db";
import { NovaSdk } from "nova-sdk-js";

const NETWORK = process.env.NEAR_NETWORK || "testnet";
const NOVA_API_KEY = process.env.NOVA_API_KEY || "";

const NOVA_CONFIGS = {
  testnet: { rpcUrl: "https://rpc.testnet.near.org", contractId: "nova-sdk-6.testnet" },
  mainnet: { rpcUrl: "https://rpc.mainnet.near.org", contractId: "nova-sdk.near" },
} as const;

function getNovaAccountId(nearAccountId: string): string {
  return NETWORK === "testnet"
    ? `${nearAccountId.replace(".testnet", "")}.nova-sdk-6.testnet`
    : `${nearAccountId.replace(".near", "")}.nova-sdk.near`;
}

function createNovaSdk(nearAccountId: string): NovaSdk {
  const novaAccount = getNovaAccountId(nearAccountId);
  const config = NOVA_CONFIGS[NETWORK as keyof typeof NOVA_CONFIGS] || NOVA_CONFIGS.testnet;
  return new NovaSdk(novaAccount, {
    apiKey: NOVA_API_KEY,
    rpcUrl: config.rpcUrl,
    contractId: config.contractId,
  });
}

export interface ToolResult {
  name: string;
  result: string;
}

export async function executeTool(name: string, args: string, contractId: string): Promise<ToolResult> {
  switch (name) {
    case "read_chat":
      return { name, result: await toolReadChat(contractId, args) };
    case "read_evidence":
      return { name, result: await toolReadEvidence(contractId, args) };
    case "get_milestone":
      return { name, result: await toolGetMilestone(contractId, args) };
    case "list_evidence":
      return { name, result: await toolListEvidence(contractId) };
    default:
      return { name, result: `Unknown tool: ${name}` };
  }
}

async function toolReadChat(contractId: string, args: string): Promise<string> {
  let offset = 0;
  try {
    const parsed = JSON.parse(args);
    offset = parsed.offset || 0;
  } catch {}

  const messages = await readChat(contractId, offset);
  if (messages.length === 0) return "No messages found.";

  return messages
    .map((m) => `[${m.sender}] (${m.type}): ${m.content}`)
    .join("\n");
}

async function toolReadEvidence(contractId: string, fileName: string): Promise<string> {
  const evidenceMessages = await readEvidenceMessages(contractId);
  const match = evidenceMessages.find((m) => {
    const data = m.data as any;
    return data?.fileName === fileName.trim();
  });

  if (!match) return `Evidence file "${fileName}" not found.`;

  const data = match.data as any;
  if (!data.cid) return `Evidence file "${fileName}" has no CID — cannot retrieve content.`;

  const isTextFile = /\.(txt|md|csv|json|log)$/i.test(data.fileName);
  if (!isTextFile) {
    return `Evidence file "${data.fileName}" is a binary file (${data.fileType}). Cannot display text content — noted as evidence.`;
  }

  if (!NOVA_API_KEY) {
    return `Evidence file "${data.fileName}" (${data.fileType}, ${data.fileSize} bytes, CID: ${data.cid}). NOVA API key not configured — cannot decrypt.`;
  }

  try {
    const agentAccountId = process.env.AGENT_ACCOUNT_ID;
    if (!agentAccountId) return `Agent account ID not set — cannot access NOVA vault.`;

    const sdk = createNovaSdk(agentAccountId);
    const groupName = `nescrowee-${contractId}`;
    const { data: buffer } = await sdk.retrieve(groupName, data.cid);
    const content = new TextDecoder().decode(buffer);

    if (content.length > 5000) {
      return `Evidence file "${data.fileName}" (truncated to 5000 chars):\n${content.slice(0, 5000)}\n... [truncated]`;
    }

    return `Evidence file "${data.fileName}":\n${content}`;
  } catch (err) {
    return `Evidence file "${data.fileName}" — decryption failed: ${err}. File noted as evidence (CID: ${data.cid}).`;
  }
}

async function toolGetMilestone(contractId: string, milestoneId: string): Promise<string> {
  const contract = await getContract(contractId);
  if (!contract) return "Contract not found.";

  const mid = milestoneId.trim();
  const milestone = contract.milestones.find((m: any) => m.id === mid);
  if (!milestone) return `Milestone "${mid}" not found.`;

  return [
    `Title: ${milestone.title}`,
    `Description: ${milestone.description}`,
    `Amount: ${milestone.amount}`,
    `Status: ${milestone.status}`,
  ].join("\n");
}

async function toolListEvidence(contractId: string): Promise<string> {
  const evidenceMessages = await readEvidenceMessages(contractId);
  if (evidenceMessages.length === 0) return "No evidence files uploaded.";

  return evidenceMessages
    .map((m) => {
      const data = m.data as any;
      return `- ${data.fileName} (${data.fileType}, ${data.fileSize} bytes) uploaded by ${m.sender}`;
    })
    .join("\n");
}
