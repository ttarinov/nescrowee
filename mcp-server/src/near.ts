import { connect, keyStores, KeyPair } from "near-api-js";
import { createHash } from "crypto";

const NETWORK = process.env.NEAR_NETWORK || "testnet";
export const CONTRACT_ID = process.env.NEAR_CONTRACT_ID || "nescrowee.testnet";
const ACCOUNT_ID = process.env.NEAR_ACCOUNT_ID;
const PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY;

const RPC_URLS: Record<string, string> = {
  testnet: "https://rpc.testnet.near.org",
  mainnet: "https://rpc.mainnet.near.org",
};

const GAS = "300000000000000";

async function getNearAccount() {
  if (!ACCOUNT_ID || !PRIVATE_KEY) {
    throw new Error("NEAR_ACCOUNT_ID and NEAR_PRIVATE_KEY environment variables must be set for change methods");
  }

  const keyStore = new keyStores.InMemoryKeyStore();
  await keyStore.setKey(NETWORK, ACCOUNT_ID, KeyPair.fromString(PRIVATE_KEY));

  const near = await connect({
    networkId: NETWORK,
    nodeUrl: RPC_URLS[NETWORK] ?? RPC_URLS.testnet,
    keyStore,
  });

  return near.account(ACCOUNT_ID);
}

export async function viewMethod<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const nodeUrl = RPC_URLS[NETWORK] ?? RPC_URLS.testnet;

  const response = await fetch(nodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: CONTRACT_ID,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      },
    }),
  });

  const data = await response.json() as { error?: { message: string }; result: { result: number[] } };
  if (data.error) throw new Error(data.error.message);

  const resultStr = Buffer.from(data.result.result).toString("utf8");
  return JSON.parse(resultStr) as T;
}

export async function callMethod(method: string, args: Record<string, unknown>, depositYocto = "0"): Promise<unknown> {
  const account = await getNearAccount();

  return account.functionCall({
    contractId: CONTRACT_ID,
    methodName: method,
    args,
    gas: BigInt(GAS),
    attachedDeposit: BigInt(depositYocto),
  });
}

export function nearToYocto(near: string): string {
  const [whole, decimal = ""] = near.split(".");
  const paddedDecimal = decimal.padEnd(24, "0").slice(0, 24);
  return (BigInt(whole) * BigInt("1000000000000000000000000") + BigInt(paddedDecimal)).toString();
}

export function computePromptHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
