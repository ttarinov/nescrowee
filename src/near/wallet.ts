import { HotKit, WalletType } from "@hot-labs/kit";
import NearPlugin from "@hot-labs/kit/near";

const STORAGE_KEY = "hot:near-account";

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
          icons: ["/favicon.ico"],
        },
      },
    });
  }
  return kit;
}

export async function connectWallet(): Promise<string | null> {
  try {
    const k = getKit();
    const wallet = await k.connect(WalletType.NEAR);
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

async function ensureConnected(): Promise<HotKit> {
  const k = getKit();
  if (k.near) return k;

  if (getAccountId()) {
    try {
      await k.connect(WalletType.NEAR);
      if (k.near) return k;
    } catch { /* reconnect failed, will throw below */ }
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
    if (err instanceof Error) throw err;
    const msg = typeof err === "string" ? err : JSON.stringify(err);
    throw new Error(msg || "Transaction failed");
  }

  // HOT Wallet extension may return null on success — treat as success
  return result;
}
