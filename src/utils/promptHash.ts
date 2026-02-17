import { STANDARD_PROMPT as standardPrompt } from "@/investigation/prompts/standard";

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

export { standardPrompt };
