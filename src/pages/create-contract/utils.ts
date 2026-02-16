export const DISPUTE_FUND_MIN = 5;
export const DISPUTE_FUND_MAX = 30;

export const nearToYocto = (near: number) => {
  return (BigInt(Math.round(near * 1e6)) * BigInt(1e18)).toString();
};

export async function fetchNearPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd",
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();
    return data?.near?.usd ?? null;
  } catch {
    return null;
  }
}

export const MODEL_COST_LABEL: Record<string, string> = {
  "Qwen/Qwen3-30B-A3B-Instruct-2507": "~0.003 USDC / dispute · ~0.01 USDC / appeal",
  "openai/gpt-oss-120b": "~0.005 USDC / dispute · ~0.015 USDC / appeal",
  "deepseek-ai/DeepSeek-V3.1": "~0.02 USDC / dispute · ~0.08 USDC / appeal",
  "zai-org/GLM-4.7": "~0.015 USDC / dispute · ~0.05 USDC / appeal",
};
