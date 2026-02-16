import { config, viewMethod, socialDbSet, getAgentAccountId } from "./near-client";

export interface SocialMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: string;
  data?: Record<string, unknown>;
}

async function getChatMessages(contractId: string): Promise<SocialMessage[]> {
  const keys = [`*/nescrowee/chat/${contractId}/**`];

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
        account_id: config.socialDbContract,
        method_name: "get",
        args_base64: btoa(JSON.stringify({ keys })),
      },
    }),
  });

  const data = (await response.json()) as any;
  if (data.error) return [];

  const resultStr = String.fromCharCode(...data.result.result);
  const socialData = JSON.parse(resultStr);
  const messages: SocialMessage[] = [];

  for (const [accountId, accountData] of Object.entries(socialData)) {
    const chat = (accountData as any)?.nescrowee?.chat?.[contractId];
    if (!chat) continue;

    for (const [msgId, msgData] of Object.entries(chat)) {
      const msg = msgData as Record<string, string>;
      let parsedData: Record<string, unknown> | undefined;
      if (msg.data) {
        try { parsedData = JSON.parse(msg.data); } catch {}
      }

      messages.push({
        id: `${accountId}/${msgId}`,
        sender: accountId,
        content: msg.text || "",
        timestamp: parseInt(msg.timestamp || "0"),
        type: msg.type || "text",
        data: parsedData,
      });
    }
  }

  return messages.sort((a, b) => a.timestamp - b.timestamp);
}

export async function readContext(contractId: string): Promise<string | null> {
  const messages = await getChatMessages(contractId);
  const contextMsg = messages
    .filter((m) => m.type === "ai_context")
    .pop();
  if (!contextMsg) return null;
  return contextMsg.content;
}

export async function readChat(contractId: string, offset = 0, limit = 50): Promise<SocialMessage[]> {
  const messages = await getChatMessages(contractId);
  const textMessages = messages.filter((m) => m.type === "text" || m.type === "evidence");
  return textMessages.slice(offset, offset + limit);
}

export async function readEvidenceMessages(contractId: string): Promise<SocialMessage[]> {
  const messages = await getChatMessages(contractId);
  return messages.filter((m) => m.type === "evidence" && m.data);
}

export async function postStep(
  contractId: string,
  step: { round: number; action: string; thought: string; observation?: string },
): Promise<void> {
  const agentId = getAgentAccountId();
  const msgId = `${Date.now()}`;

  await socialDbSet({
    [agentId]: {
      nescrowee: {
        chat: {
          [contractId]: {
            [msgId]: {
              text: step.thought,
              timestamp: msgId,
              type: "ai_step",
              data: JSON.stringify(step),
            },
          },
        },
      },
    },
  });
}

export async function postResolution(
  contractId: string,
  result: {
    resolution: string;
    explanation: string;
    confidence: number;
    model_id: string;
    tee_verified: boolean;
    context_for_freelancer?: string;
  },
): Promise<void> {
  const agentId = getAgentAccountId();
  const msgId = `${Date.now()}`;

  await socialDbSet({
    [agentId]: {
      nescrowee: {
        chat: {
          [contractId]: {
            [msgId]: {
              text: "AI Resolution",
              timestamp: msgId,
              type: "ai_resolution",
              data: JSON.stringify({
                analysis: result.explanation,
                confidence: result.confidence,
                model_id: result.model_id,
                tee_verified: result.tee_verified,
                resolution: result.resolution,
                explanation: result.explanation,
                context_for_freelancer: result.context_for_freelancer,
              }),
            },
          },
        },
      },
    },
  });
}
