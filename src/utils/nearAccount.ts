import { nearConfig } from "@/near/config";

const NEAR_ACCOUNT_RE = /^(([a-z\d]([a-z\d-_]*[a-z\d])?\.)+[a-z\d]([a-z\d-_]*[a-z\d])?|[a-f0-9]{64})$/i;

export function isValidNearAccountFormat(id: string): boolean {
  return id.length >= 2 && id.length <= 64 && NEAR_ACCOUNT_RE.test(id);
}

export async function nearAccountExists(accountId: string): Promise<boolean> {
  try {
    const res = await fetch(nearConfig.nodeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "account-check",
        method: "query",
        params: {
          request_type: "view_account",
          finality: "final",
          account_id: accountId,
        },
      }),
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    return !data.error;
  } catch {
    return false;
  }
}
