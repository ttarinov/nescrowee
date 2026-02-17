import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { KeyPair, KeyPairSigner, Account, JsonRpcProvider } from "near-api-js";
import type { KeyPairString } from "near-api-js";

interface HotPayEvent {
  type: "PAYMENT_STATUS_UPDATE";
  item_id: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | string;
  memo: string;
  amount: string;
  amount_float: number;
  amount_usd: number;
  near_trx: string;
}

interface NearTxResult {
  transaction: {
    receiver_id: string;
    actions: Array<{ Transfer?: { deposit: string } }>;
  };
  receipts_outcome: Array<{
    outcome: { status: { SuccessValue?: string; Failure?: unknown } };
  }>;
}

function verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}

function parseMemo(memo: string): { contractId: string; milestoneId: string } | null {
  const match = memo.match(/^mt-([^-]+)-(.+)$/);
  if (!match) return null;
  return { contractId: match[1], milestoneId: match[2] };
}

async function verifySettlementTx(
  nodeUrl: string,
  txHash: string,
  relayAccountId: string,
  expectedAmount: string,
): Promise<{ verified: boolean; error?: string }> {
  try {
    const response = await fetch(nodeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "verify",
        method: "tx",
        params: { tx_hash: txHash, sender_account_id: relayAccountId, wait_until: "EXECUTED" },
      }),
    });

    const rpcResult = await response.json() as { result?: NearTxResult; error?: { message: string } };
    if (rpcResult.error || !rpcResult.result) {
      return { verified: false, error: `Settlement tx ${txHash} not found on-chain` };
    }

    const tx = rpcResult.result;

    const receiverId = tx.transaction.receiver_id;
    if (receiverId !== relayAccountId) {
      return { verified: false, error: `Settlement recipient ${receiverId} does not match relay ${relayAccountId}` };
    }

    const transferAction = tx.transaction.actions.find((a) => a.Transfer);
    if (!transferAction?.Transfer) {
      return { verified: false, error: "Settlement tx has no Transfer action" };
    }

    const onChainAmount = transferAction.Transfer.deposit;
    if (onChainAmount !== expectedAmount) {
      return { verified: false, error: `Amount mismatch: on-chain ${onChainAmount} vs webhook ${expectedAmount}` };
    }

    const failed = tx.receipts_outcome.some((r) => r.outcome.status.Failure);
    if (failed) {
      return { verified: false, error: "Settlement tx failed on-chain" };
    }

    return { verified: true };
  } catch (err) {
    return { verified: false, error: `Failed to verify settlement tx: ${err}` };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.HOT_PAY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: "Webhook secret not configured" });

  const signature = req.headers["x-hot-pay-signature"] as string | undefined;
  if (!signature) return res.status(401).json({ error: "Missing signature" });

  const rawBody = req.body as Buffer;
  if (!verifySignature(rawBody, signature, secret)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  let event: HotPayEvent;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (event.type !== "PAYMENT_STATUS_UPDATE" || event.status !== "SUCCESS") {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const parsed = parseMemo(event.memo);
  if (!parsed) {
    return res.status(200).json({ ok: true, skipped: "unrecognized memo" });
  }

  const { contractId } = parsed;

  const relayKey = process.env.NEAR_RELAY_PRIVATE_KEY;
  const relayAccountId = process.env.NEAR_RELAY_ACCOUNT_ID;
  const contractAddress = process.env.NEAR_CONTRACT_ID;
  const network = (process.env.NEAR_NETWORK as "testnet" | "mainnet") || "testnet";

  if (!relayKey || !relayAccountId || !contractAddress) {
    return res.status(500).json({ error: "Relay NEAR credentials not configured" });
  }

  const nodeUrl = network === "mainnet"
    ? "https://rpc.mainnet.near.org"
    : "https://rpc.testnet.near.org";

  if (event.near_trx) {
    const verification = await verifySettlementTx(nodeUrl, event.near_trx, relayAccountId, event.amount);
    if (!verification.verified) {
      console.error("Settlement verification failed:", verification.error);
      return res.status(400).json({ error: "Settlement verification failed", detail: verification.error });
    }
  }

  try {
    const keyPair = KeyPair.fromString(relayKey as KeyPairString);
    const signer = KeyPairSigner.fromSecretKey(keyPair.getSecretKey());
    const provider = new JsonRpcProvider({ url: nodeUrl });
    const account = new Account(relayAccountId, provider, signer);

    await account.functionCall({
      contractId: contractAddress,
      methodName: "fund_contract",
      args: { contract_id: contractId },
      gas: BigInt("100000000000000"),
      attachedDeposit: BigInt(event.amount),
    });

    return res.status(200).json({
      ok: true,
      contractId,
      near_trx: event.near_trx,
      settlement_verified: true,
    });
  } catch (err) {
    console.error("NEAR relay failed:", err);
    return res.status(500).json({ error: "NEAR transaction failed" });
  }
}

export const config = {
  api: {
    bodyParser: {
      raw: true,
    },
  },
};
