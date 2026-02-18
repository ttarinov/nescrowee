import { HotKit, WalletType } from "@hot-labs/kit";
import NearPlugin from "@hot-labs/kit/near";
import { saveAccountId, clearAccountId, getAccountId } from "./wallet-account";

let kit: HotKit | null = null;

const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "1292473190ce7eb75c9de67e15aaad99";

function getKit(): HotKit {
  if (!kit) {
    kit = new HotKit({
      apiKey: import.meta.env.VITE_HOT_PAY_API_KEY || "",
      connectors: [NearPlugin()],
      walletConnect: {
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: "Nescrowee",
          description: "Milestone escrow with AI dispute resolution",
          url: typeof window !== "undefined" ? window.location.origin : "",
          icons: [typeof window !== "undefined" ? `${window.location.origin}/favicon.ico` : ""],
        },
      },
    });
  }
  return kit;
}

export async function connectWallet(): Promise<string | null> {
  const k = getKit();
  try {
    const wallet = await k.connect(WalletType.NEAR);
    if (k.near) {
      const accountId = k.near.address;
      saveAccountId(accountId);
      return accountId;
    }
    return wallet?.address || null;
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied") || msg.includes("dismiss") || msg.includes("closed")) {
      return null;
    }
    throw err;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    const k = getKit();
    if (k.near) await k.disconnect(k.near);
  } catch { /* ignore */ }
  clearAccountId();
}

export { getAccountId } from "./wallet-account";

async function ensureConnected(): Promise<HotKit> {
  const k = getKit();
  if (k.near) return k;

  if (getAccountId()) {
    for (let i = 0; i < 2; i++) {
      try {
        await k.connect(WalletType.NEAR);
        if (k.near) return k;
      } catch { /* retry */ }
      if (i === 0) await new Promise((r) => setTimeout(r, 500));
    }
  }

  throw new Error("Wallet not connected. Please reconnect your wallet.");
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
  const k = await ensureConnected();
  const nearWallet = k.near!;

  let result: unknown;
  try {
    result = await nearWallet.sendTransaction({
      receiverId: params.receiverId,
      actions: params.actions,
    });
  } catch (err) {
    if (!err) return null;
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied")) throw err;
      return null;
    }
    const msg = typeof err === "string" ? err : JSON.stringify(err);
    if (msg === "null" || msg === "undefined" || !msg) return null;
    const lower = msg.toLowerCase();
    if (lower.includes("reject") || lower.includes("cancel") || lower.includes("denied")) {
      throw new Error(msg);
    }
    return null;
  }

  return result;
}
