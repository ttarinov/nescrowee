import type { ChatResponse, TeeSignature } from "./types";

export async function callDisputeAi(
  modelId: string,
  context: string,
): Promise<ChatResponse> {
  const res = await fetch("/api/ai-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "chat",
      model: modelId,
      context,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || `AI proxy error: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let chatId = "";
  let content = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const chunk = JSON.parse(data);
        if (!chatId) chatId = chunk.id || chunk.chat_id || "";
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) content += delta;
      } catch { /* skip malformed chunks */ }
    }
  }

  if (!content) throw new Error("AI returned empty response");

  return { response: content, chatId };
}

export async function getAiSignature(
  chatId: string,
  modelId: string,
): Promise<TeeSignature> {
  const res = await fetch("/api/ai-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "signature",
      chatId,
      model: modelId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || `Signature proxy error: ${res.status}`);
  }

  return res.json();
}

export function signatureToBytes(base64Sig: string): number[] {
  const binary = atob(base64Sig);
  return Array.from(binary, (c) => c.charCodeAt(0));
}

export function addressToBytes(address: string): number[] {
  const binary = atob(address);
  return Array.from(binary, (c) => c.charCodeAt(0));
}
