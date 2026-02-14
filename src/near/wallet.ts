import { HOT } from "@hot-wallet/sdk";
import { nearConfig } from "./config";

const STORAGE_KEY = "hot:near-account";

export async function connectWallet(): Promise<string | null> {
  try {
    const result = await HOT.request("near:signIn", {});
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accountId: result.accountId, publicKey: result.publicKey }));
    return result.accountId;
  } catch {
    window.open("https://www.hotdao.ai/wallet", "_blank");
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    await HOT.request("near:signOut", {});
  } catch { /* ignore */ }
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccountId(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.accountId || null;
  } catch {
    return null;
  }
}

export async function signAndSendTransaction(params: {
  receiverId: string;
  actions: Array<{
    type: "FunctionCall";
    params: {
      methodName: string;
      args: Record<string, unknown>;
      gas: string;
      deposit: string;
    };
  }>;
}) {
  const result = await HOT.request("near:signAndSendTransactions", {
    transactions: [
      {
        receiverId: params.receiverId,
        actions: params.actions,
      },
    ],
  });

  return result.transactions[0];
}
