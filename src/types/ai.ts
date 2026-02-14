export const AI_MODELS = [
  {
    id: "Qwen/Qwen3-30B-A3B",
    name: "Qwen3 30B",
    description: "Fast, cost-effective",
    pricing: "$0.15 / $0.55 per M tokens",
    speed: "~10s",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "Strong reasoning",
    pricing: "$0.15 / $0.55 per M tokens",
    speed: "~20s",
  },
  {
    id: "deepseek-ai/DeepSeek-V3.1",
    name: "DeepSeek V3.1",
    description: "Most thorough",
    pricing: "$1.05 / $3.10 per M tokens",
    speed: "~45s",
  },
  {
    id: "THUDM/GLM-4.1V-9B-Thinking",
    name: "GLM-4.1V 9B",
    description: "Vision-capable",
    pricing: "$0.15 / $0.55 per M tokens",
    speed: "~15s",
  },
] as const;

export const APPEAL_MODEL_ID = "deepseek-ai/DeepSeek-V3.1";
