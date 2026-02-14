import type { Resolution } from "@/types/dispute";

function normalizeResolution(resolution: unknown): Resolution | null {
  if (!resolution) return null;

  if (typeof resolution === "string") {
    const lower = resolution.toLowerCase();
    if (lower === "freelancer") return "Freelancer";
    if (lower === "client") return "Client";
  }

  if (typeof resolution === "object" && resolution !== null && "split" in resolution) {
    const split = (resolution as Record<string, Record<string, number>>).split;
    return { Split: { freelancer_pct: split.freelancer_pct } };
  }

  return resolution as Resolution;
}

export function parseAiResolution(responseText: string): {
  resolution: Resolution;
  explanation: string;
  confidence: string;
} {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI response did not contain valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    resolution: normalizeResolution(parsed.resolution) as Resolution,
    explanation: parsed.explanation || "",
    confidence: parsed.confidence || "medium",
  };
}

export function parseInvestigationRound(responseText: string): {
  analysis: string;
  findings: string;
  confidence: number;
  needs_more_analysis: boolean;
  resolution: Resolution | null;
  explanation: string | null;
} {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI response did not contain valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    analysis: parsed.analysis || "",
    findings: parsed.findings || "",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 50,
    needs_more_analysis: parsed.needs_more_analysis ?? false,
    resolution: normalizeResolution(parsed.resolution),
    explanation: parsed.explanation || null,
  };
}
