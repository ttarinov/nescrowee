import type { VercelRequest, VercelResponse } from "@vercel/node";
import { NovaSdk } from "nova-sdk-js";

const NOVA_API_KEY = process.env.VITE_NOVA_API_KEY || "";
const NOVA_NETWORK = process.env.VITE_NEAR_NETWORK || "testnet";

const TESTNET_CONFIG = {
  rpcUrl: "https://rpc.testnet.near.org",
  contractId: "nova-sdk-6.testnet",
} as const;

function getNovaAccountId(nearAccountId: string): string {
  return NOVA_NETWORK === "testnet"
    ? `${nearAccountId.replace(".testnet", "")}.nova-sdk-6.testnet`
    : `${nearAccountId.replace(".near", "")}.nova-sdk.near`;
}

function getGroupName(contractId: string): string {
  return `nescrowee-${contractId}`;
}

function createSdk(nearAccountId: string): NovaSdk {
  const novaAccount = getNovaAccountId(nearAccountId);
  const options: Record<string, unknown> = { apiKey: NOVA_API_KEY };

  if (NOVA_NETWORK === "testnet") {
    options.rpcUrl = TESTNET_CONFIG.rpcUrl;
    options.contractId = TESTNET_CONFIG.contractId;
  }

  return new NovaSdk(novaAccount, options);
}

type ActionHandler = (body: Record<string, string>) => Promise<unknown>;

const actions: Record<string, ActionHandler> = {
  async registerGroup({ nearAccountId, contractId }) {
    const sdk = createSdk(nearAccountId);
    const groupName = getGroupName(contractId);
    await sdk.registerGroup(groupName);
    return { groupName };
  },

  async addMember({ ownerAccountId, contractId, memberNearAccountId }) {
    const sdk = createSdk(ownerAccountId);
    const groupName = getGroupName(contractId);
    const memberNovaId = getNovaAccountId(memberNearAccountId);
    await sdk.addGroupMember(groupName, memberNovaId);
    return { ok: true };
  },

  async upload({ nearAccountId, contractId, fileData, fileName }) {
    const sdk = createSdk(nearAccountId);
    const groupName = getGroupName(contractId);
    const buffer = Buffer.from(fileData, "base64");
    const result = await sdk.upload(groupName, buffer, fileName);
    return {
      cid: result.cid,
      fileHash: result.file_hash,
      transactionId: result.trans_id,
    };
  },

  async retrieve({ nearAccountId, contractId, cid }) {
    const sdk = createSdk(nearAccountId);
    const groupName = getGroupName(contractId);
    const { data } = await sdk.retrieve(groupName, cid);
    return { data: data.toString("base64") };
  },

  async isAuthorized({ nearAccountId, contractId }) {
    const sdk = createSdk(nearAccountId);
    const groupName = getGroupName(contractId);
    try {
      const authorized = await sdk.isAuthorized(groupName);
      return { authorized };
    } catch {
      return { authorized: false };
    }
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, ...params } = req.body || {};

  if (!action || !actions[action]) {
    return res.status(400).json({ error: `Unknown action: ${action}` });
  }

  try {
    const result = await actions[action](params);
    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Nova proxy error [${action}]:`, message);
    return res.status(500).json({ error: message });
  }
}
