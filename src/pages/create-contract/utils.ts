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
  "Qwen/Qwen3-30B-A3B": "~$0.003 / dispute · ~$0.01 / appeal",
  "openai/gpt-oss-120b": "~$0.005 / dispute · ~$0.015 / appeal",
  "deepseek-ai/DeepSeek-V3.1": "~$0.02 / dispute · ~$0.08 / appeal",
  "THUDM/GLM-4.1V-9B-Thinking": "~$0.003 / dispute · ~$0.01 / appeal",
};
