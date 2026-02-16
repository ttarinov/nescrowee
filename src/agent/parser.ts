import type { Resolution } from "@/types/dispute";

function normalizeResolution(resolution: unknown): Resolution | null {
  if (!resolution) return null;

  if (typeof resolution === "string") {
    const lower = resolution.toLowerCase();
    if (lower === "freelancer") return "Freelancer";
    if (lower === "client") return "Client";
    if (lower === "continuework") return "ContinueWork";
  }

  if (typeof resolution === "object" && resolution !== null && "Split" in resolution) {
    const split = (resolution as Record<string, Record<string, number>>).Split;
    return { Split: { freelancer_pct: split.freelancer_pct } };
  }

  return resolution as Resolution;
}

export function parseAiResolution(responseText: string): {
  resolution: Resolution;
  explanation: string;
  confidence: number;
  context_for_freelancer: string | null;
} {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI response did not contain valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    resolution: normalizeResolution(parsed.resolution) as Resolution,
    explanation: parsed.explanation || "",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 50,
    context_for_freelancer: parsed.context_for_freelancer || null,
  };
}
