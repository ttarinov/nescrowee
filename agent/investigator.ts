import { executeTool } from "./tools";
import { postStep } from "./social-db";
import * as fs from "fs";
import * as path from "path";

const NEAR_AI_BASE_URL = "https://cloud-api.near.ai/v1";
const MAX_TOOL_CALLS = 12;

function getApiKey(): string {
  const key = process.env.NEAR_AI_KEY;
  if (!key) throw new Error("NEAR_AI_KEY env var not set");
  return key;
}

function getSystemPrompt(): string {
  return fs.readFileSync(path.join(import.meta.dir, "prompts", "investigation.md"), "utf-8");
}

const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "read_chat",
      description: "Read the anonymized chat history between contract parties. Returns messages in chronological order.",
      parameters: {
        type: "object",
        properties: {
          offset: { type: "number", description: "Skip this many messages (for pagination). Default 0." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "read_evidence",
      description: "Read a specific evidence file from the encrypted NOVA vault by its file name.",
      parameters: {
        type: "object",
        properties: {
          fileName: { type: "string", description: "The name of the evidence file to read." },
        },
        required: ["fileName"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_milestone",
      description: "Get milestone requirements, description, amount, and current status.",
      parameters: {
        type: "object",
        properties: {
          milestoneId: { type: "string", description: "The milestone ID (e.g. 'm1')." },
        },
        required: ["milestoneId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_evidence",
      description: "List all available evidence files with their metadata (name, type, size, uploader).",
      parameters: { type: "object", properties: {} },
    },
  },
];

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

export interface InvestigationResult {
  resolution: string;
  explanation: string;
  confidence: number;
  context_for_freelancer: string | null;
  evidence_reviewed: string[];
  chatId: string;
}

async function callAi(
  modelId: string,
  messages: ChatMessage[],
  useTools: boolean,
): Promise<{ message: any; chatId: string }> {
  const body: any = {
    model: modelId,
    messages,
    temperature: 0.1,
    max_tokens: 4096,
  };

  if (useTools) {
    body.tools = TOOL_DEFINITIONS;
    body.tool_choice = "auto";
  }

  const res = await fetch(`${NEAR_AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`NEAR AI error: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as any;
  return {
    message: data.choices[0].message,
    chatId: data.id || data.chat_id,
  };
}

function parseAnalysisFromContent(content: string): InvestigationResult | null {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.recommended_resolution && !parsed.resolution) return null;

    return {
      resolution: parsed.recommended_resolution || parsed.resolution,
      explanation: parsed.reasoning || parsed.explanation || parsed.summary || "",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 50,
      context_for_freelancer: parsed.context_for_freelancer || null,
      evidence_reviewed: parsed.evidence_reviewed || [],
      chatId: "",
    };
  } catch {
    return null;
  }
}

export async function investigate(
  modelId: string,
  contractId: string,
  context: string,
): Promise<InvestigationResult> {
  const systemPrompt = getSystemPrompt();
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: context },
  ];

  let lastChatId = "";
  let toolCallCount = 0;

  for (let turn = 0; turn < MAX_TOOL_CALLS + 2; turn++) {
    const hasToolBudget = toolCallCount < MAX_TOOL_CALLS;
    const { message, chatId } = await callAi(modelId, messages, hasToolBudget);
    lastChatId = chatId;

    if (message.tool_calls && message.tool_calls.length > 0) {
      messages.push(message);

      for (const toolCall of message.tool_calls) {
        toolCallCount++;
        const fnName = toolCall.function.name;
        let fnArgs = "";
        try {
          const parsed = JSON.parse(toolCall.function.arguments);
          fnArgs = Object.values(parsed).join(", ");
        } catch {
          fnArgs = toolCall.function.arguments;
        }

        console.log(`  [Tool ${toolCallCount}] ${fnName}(${fnArgs})`);

        await postStep(contractId, {
          round: toolCallCount,
          action: `${fnName}(${fnArgs})`,
          thought: `Calling ${fnName} to gather more information`,
        });

        let args = "";
        try {
          const parsed = JSON.parse(toolCall.function.arguments);
          args = parsed.fileName || parsed.milestoneId || JSON.stringify(parsed);
        } catch {
          args = toolCall.function.arguments;
        }

        const result = await executeTool(fnName, args, contractId);

        messages.push({
          role: "tool",
          content: result.result,
          tool_call_id: toolCall.id,
        });
      }
      continue;
    }

    // No tool calls — AI produced a text response (should be the analysis)
    if (message.content) {
      const analysis = parseAnalysisFromContent(message.content);
      if (analysis) {
        analysis.chatId = lastChatId;

        await postStep(contractId, {
          round: toolCallCount + 1,
          action: "ANALYSIS",
          thought: `Final analysis: ${analysis.explanation.slice(0, 200)}...`,
        });

        return analysis;
      }

      // Not a valid analysis — ask AI to produce one
      messages.push(message);
      messages.push({
        role: "user",
        content: "Please produce your final analysis as JSON with: recommended_resolution, reasoning, confidence, evidence_reviewed, context_for_freelancer.",
      });
      continue;
    }

    break;
  }

  throw new Error("Agent failed to produce a valid analysis after maximum rounds");
}
