import { HotKit } from "@hot-labs/kit";
import NearPlugin from "@hot-labs/kit/near";

const STORAGE_KEY = "hot:near-account";

let kit: HotKit | null = null;

function getKit(): HotKit {
  if (!kit) {
    kit = new HotKit({
      apiKey: import.meta.env.VITE_HOT_KIT_API_KEY || "",
      connectors: [NearPlugin()],
    });
  }
  return kit;
}

export async function connectWallet(): Promise<string | null> {
  try {
    const k = getKit();
    const wallet = await k.connect();
    if (k.near) {
      const accountId = k.near.address;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accountId }));
      return accountId;
    }
    return wallet?.address || null;
  } catch {
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    const k = getKit();
    if (k.near) await k.disconnect(k.near);
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
  const k = getKit();
  const nearWallet = k.near;
  if (!nearWallet) throw new Error("NEAR wallet not connected");

  const result = await nearWallet.sendTransaction({
    receiverId: params.receiverId,
    actions: params.actions,
  });

  return result;
}
