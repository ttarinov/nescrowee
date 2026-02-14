import standardPrompt from "@/agent/prompts/standard.md?raw";
import appealPrompt from "@/agent/prompts/appeal.md?raw";
import investigationPrompt from "@/agent/prompts/investigation.md?raw";
import investigationAppealPrompt from "@/agent/prompts/investigation-appeal.md?raw";

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

export async function getAppealPromptHash(): Promise<string> {
  return hashPrompt(appealPrompt);
}

export async function getInvestigationPromptHash(): Promise<string> {
  return hashPrompt(investigationPrompt);
}

export async function getInvestigationAppealPromptHash(): Promise<string> {
  return hashPrompt(investigationAppealPrompt);
}

export { standardPrompt, appealPrompt, investigationPrompt, investigationAppealPrompt };
