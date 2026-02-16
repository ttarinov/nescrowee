import { connect, keyStores, KeyPair, utils } from "near-api-js";
import type { Near, Account } from "near-api-js";

const NETWORK = process.env.NEAR_NETWORK || "testnet";

const CONFIGS = {
  testnet: {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    contractId: "nescrowee.testnet",
    socialDbContract: "v1.social08.testnet",
  },
  mainnet: {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    contractId: "nescrowee.near",
    socialDbContract: "social.near",
  },
} as const;

export const config = CONFIGS[NETWORK as keyof typeof CONFIGS] || CONFIGS.testnet;

let nearInstance: Near | null = null;
let agentAccount: Account | null = null;

export function getAgentAccountId(): string {
  const id = process.env.AGENT_ACCOUNT_ID;
  if (!id) throw new Error("AGENT_ACCOUNT_ID env var not set");
  return id;
}

async function getNear(): Promise<Near> {
  if (nearInstance) return nearInstance;

  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY env var not set");

  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(privateKey);
  await keyStore.setKey(config.networkId, getAgentAccountId(), keyPair);

  nearInstance = await connect({
    networkId: config.networkId,
    nodeUrl: config.nodeUrl,
    keyStore,
  });

  return nearInstance;
}

export async function getAccount(): Promise<Account> {
  if (agentAccount) return agentAccount;
  const near = await getNear();
  agentAccount = await near.account(getAgentAccountId());
  return agentAccount;
}

export async function viewMethod<T>(
  contractId: string,
  methodName: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(config.nodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: contractId,
        method_name: methodName,
        args_base64: btoa(JSON.stringify(args)),
      },
    }),
  });

  const data = await response.json() as any;
  if (data.error) throw new Error(data.error.message);
  const resultStr = String.fromCharCode(...data.result.result);
  return JSON.parse(resultStr);
}

export async function getPendingDisputes(): Promise<Array<[string, string]>> {
  return viewMethod(config.contractId, "get_pending_disputes");
}

export async function getContract(contractId: string): Promise<any> {
  return viewMethod(config.contractId, "get_contract", { contract_id: contractId });
}

export async function getDispute(contractId: string, milestoneId: string): Promise<any> {
  return viewMethod(config.contractId, "get_dispute", {
    contract_id: contractId,
    milestone_id: milestoneId,
  });
}

export async function submitAiResolution(
  contractId: string,
  milestoneId: string,
  resolution: unknown,
  explanation: string,
  signature: number[],
  signingAddress: number[],
  teeText: string,
): Promise<void> {
  const account = await getAccount();
  await account.functionCall({
    contractId: config.contractId,
    methodName: "submit_ai_resolution",
    args: {
      contract_id: contractId,
      milestone_id: milestoneId,
      resolution,
      explanation,
      signature,
      signing_address: signingAddress,
      tee_text: teeText,
    },
    gas: BigInt("300000000000000"),
    attachedDeposit: BigInt("0"),
  });
}

export async function socialDbSet(data: Record<string, unknown>): Promise<void> {
  const account = await getAccount();
  await account.functionCall({
    contractId: config.socialDbContract,
    methodName: "set",
    args: { data },
    gas: BigInt("300000000000000"),
    attachedDeposit: BigInt("50000000000000000000000"),
  });
}
