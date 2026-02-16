import { nearConfig } from "./config";
import { signAndSendTransaction } from "./wallet";

export type MessageType = "text" | "ai_resolution" | "ai_context" | "ai_step" | "evidence" | "payment_request" | "payment_approved";

export interface AiResolutionData {
  analysis: string;
  confidence: number;
  model_id: string;
  tee_verified: boolean;
  resolution: string;
  explanation: string;
  context_for_freelancer?: string;
}

export interface EvidenceData {
  fileName: string;
  fileType: string;
  fileSize: number;
  cid?: string;
}

export interface SocialMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: MessageType;
  data?: AiResolutionData | EvidenceData | Record<string, unknown>;
}

export async function getChatMessages(contractId: string): Promise<SocialMessage[]> {
  const keys = [`*/nescrowee/chat/${contractId}/**`];

  const response = await fetch(nearConfig.nodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: nearConfig.socialDbContract,
        method_name: "get",
        args_base64: btoa(JSON.stringify({ keys })),
      },
    }),
  });

  const data = await response.json();
  if (data.error) return [];

  const resultBytes = data.result.result;
  const resultStr = String.fromCharCode(...resultBytes);
  const socialData = JSON.parse(resultStr);

  const messages: SocialMessage[] = [];

  for (const [accountId, accountData] of Object.entries(socialData)) {
    const chat = (accountData as Record<string, unknown>)?.["nescrowee"] as Record<string, unknown> | undefined;
    const contractChat = chat?.chat as Record<string, unknown> | undefined;
    const chatMessages = contractChat?.[contractId] as Record<string, unknown> | undefined;

    if (!chatMessages) continue;

    for (const [msgId, msgData] of Object.entries(chatMessages)) {
      const msg = msgData as Record<string, string>;
      let type: MessageType = "text";
      let parsedData: SocialMessage["data"];

      if (msg.type && msg.data) {
        type = msg.type as MessageType;
        try {
          parsedData = JSON.parse(msg.data);
        } catch { /* treat as text */ }
      }

      messages.push({
        id: `${accountId}/${msgId}`,
        sender: accountId,
        content: msg.text || "",
        timestamp: parseInt(msg.timestamp || "0"),
        type,
        data: parsedData,
      });
    }
  }

  return messages.sort((a, b) => a.timestamp - b.timestamp);
}

export async function sendChatMessage(
  accountId: string,
  contractId: string,
  content: string
) {
  const msgId = `${Date.now()}`;
  const data = {
    [accountId]: {
      "nescrowee": {
        chat: {
          [contractId]: {
            [msgId]: {
              text: content,
              timestamp: msgId,
            },
          },
        },
      },
    },
  };

  return signAndSendTransaction({
    receiverId: nearConfig.socialDbContract,
    actions: [
      {
        type: "FunctionCall",
        params: {
          methodName: "set",
          args: { data },
          gas: "300000000000000",
          deposit: "50000000000000000000000",
        },
      },
    ],
  });
}

export async function sendStructuredMessage(
  accountId: string,
  contractId: string,
  content: string,
  type: MessageType,
  messageData: Record<string, unknown>,
) {
  const msgId = `${Date.now()}`;
  const data = {
    [accountId]: {
      "nescrowee": {
        chat: {
          [contractId]: {
            [msgId]: {
              text: content,
              timestamp: msgId,
              type,
              data: JSON.stringify(messageData),
            },
          },
        },
      },
    },
  };

  return signAndSendTransaction({
    receiverId: nearConfig.socialDbContract,
    actions: [
      {
        type: "FunctionCall",
        params: {
          methodName: "set",
          args: { data },
          gas: "300000000000000",
          deposit: "50000000000000000000000",
        },
      },
    ],
  });
}
