import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { KeyPair, connect, keyStores } from "near-api-js";

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

function verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}

function parseMemo(memo: string): { contractId: string; milestoneId: string } | null {
  const match = memo.match(/^mt-([^-]+)-(.+)$/);
  if (!match) return null;
  return { contractId: match[1], milestoneId: match[2] };
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

  try {
    const keyStore = new keyStores.InMemoryKeyStore();
    await keyStore.setKey(network, relayAccountId, KeyPair.fromString(relayKey));

    const near = await connect({
      networkId: network,
      nodeUrl: network === "mainnet"
        ? "https://rpc.mainnet.near.org"
        : "https://rpc.testnet.near.org",
      keyStore,
    });

    const account = await near.account(relayAccountId);
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
