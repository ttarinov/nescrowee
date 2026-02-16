export const AI_MODELS = [
  {
    id: "Qwen/Qwen3-30B-A3B-Instruct-2507",
    name: "Qwen3 30B",
    description: "Fast, cost-effective",
    pricing: "0.15 / 0.55 USDC per M tokens",
    speed: "~10s",
    stars: 3,
    use_case: "Standard disputes",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "Strong reasoning",
    pricing: "0.15 / 0.55 USDC per M tokens",
    speed: "~20s",
    stars: 4,
    use_case: "Complex disputes",
  },
  {
    id: "deepseek-ai/DeepSeek-V3.1",
    name: "DeepSeek V3.1",
    description: "Most thorough",
    pricing: "1.05 / 3.10 USDC per M tokens",
    speed: "~45s",
    stars: 5,
    use_case: "High-stakes disputes",
  },
  {
    id: "zai-org/GLM-4.7",
    name: "GLM-4.7",
    description: "Hybrid reasoning",
    pricing: "0.85 / 3.30 USDC per M tokens",
    speed: "~25s",
    stars: 4,
    use_case: "Deep analysis",
  },
] as const;

export type ModelId = (typeof AI_MODELS)[number]["id"];
