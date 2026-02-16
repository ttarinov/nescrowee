import standardPrompt from "@/agent/prompts/standard.md?raw";

export async function hashPrompt(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getStandardPromptHash(): Promise<string> {
  return hashPrompt(standardPrompt);
}

export const appealPrompt = standardPrompt;
export const investigationPrompt = standardPrompt;
export const investigationAppealPrompt = standardPrompt;

export async function getAppealPromptHash(): Promise<string> {
  return hashPrompt(standardPrompt);
}

export async function getInvestigationPromptHash(): Promise<string> {
  return hashPrompt(standardPrompt);
}

export async function getInvestigationAppealPromptHash(): Promise<string> {
  return hashPrompt(standardPrompt);
}

export { standardPrompt };
