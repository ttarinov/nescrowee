import { describe, it, expect } from "vitest";
import { parseAiResolution } from "@/agent/parser";

describe("parseAiResolution", () => {
  it("parses Freelancer resolution", () => {
    const response = `\`\`\`json
{
  "resolution": "Freelancer",
  "explanation": "The freelancer delivered all requirements as specified in the milestone.",
  "confidence": 85,
  "context_for_freelancer": null
}
\`\`\``;

    const result = parseAiResolution(response);
    expect(result.resolution).toBe("Freelancer");
    expect(result.confidence).toBe(85);
    expect(result.context_for_freelancer).toBeNull();
  });

  it("parses Client resolution", () => {
    const response = `{"resolution": "Client", "explanation": "No work was delivered.", "confidence": 92, "context_for_freelancer": null}`;
    const result = parseAiResolution(response);
    expect(result.resolution).toBe("Client");
    expect(result.confidence).toBe(92);
  });

  it("parses ContinueWork resolution", () => {
    const response = `{
      "resolution": "ContinueWork",
      "explanation": "Work is partial but fixable.",
      "confidence": 70,
      "context_for_freelancer": "Fix the login page styling and add tests."
    }`;

    const result = parseAiResolution(response);
    expect(result.resolution).toBe("ContinueWork");
    expect(result.context_for_freelancer).toBe("Fix the login page styling and add tests.");
  });

  it("parses Split resolution", () => {
    const response = `{"resolution": {"Split": {"freelancer_pct": 60}}, "explanation": "60% of work completed.", "confidence": 75, "context_for_freelancer": null}`;
    const result = parseAiResolution(response);
    expect(result.resolution).toEqual({ Split: { freelancer_pct: 60 } });
  });

  it("normalizes lowercase resolution strings", () => {
    const response = `{"resolution": "freelancer", "explanation": "Done.", "confidence": 80, "context_for_freelancer": null}`;
    const result = parseAiResolution(response);
    expect(result.resolution).toBe("Freelancer");
  });

  it("normalizes continuework casing", () => {
    const response = `{"resolution": "continuework", "explanation": "Fix it.", "confidence": 65, "context_for_freelancer": "Add tests"}`;
    const result = parseAiResolution(response);
    expect(result.resolution).toBe("ContinueWork");
  });

  it("extracts JSON from text with surrounding content", () => {
    const response = `Based on my analysis, here is the resolution:

{"resolution": "Client", "explanation": "No deliverables found.", "confidence": 95, "context_for_freelancer": null}

This concludes the investigation.`;

    const result = parseAiResolution(response);
    expect(result.resolution).toBe("Client");
    expect(result.confidence).toBe(95);
  });

  it("defaults confidence to 50 when missing", () => {
    const response = `{"resolution": "Freelancer", "explanation": "Done."}`;
    const result = parseAiResolution(response);
    expect(result.confidence).toBe(50);
  });

  it("throws on response without JSON", () => {
    expect(() => parseAiResolution("I cannot decide.")).toThrow("AI response did not contain valid JSON");
  });
});

describe("response format matches contract expectations", () => {
  it("Freelancer resolution is valid for smart contract", () => {
    const response = `{"resolution": "Freelancer", "explanation": "Work done.", "confidence": 90, "context_for_freelancer": null}`;
    const result = parseAiResolution(response);
    expect(["Freelancer", "Client", "ContinueWork"].includes(result.resolution as string) || typeof result.resolution === "object").toBe(true);
  });

  it("Split resolution has correct structure for contract", () => {
    const response = `{"resolution": {"Split": {"freelancer_pct": 45}}, "explanation": "Partial.", "confidence": 70, "context_for_freelancer": null}`;
    const result = parseAiResolution(response);
    const split = result.resolution as { Split: { freelancer_pct: number } };
    expect(split.Split.freelancer_pct).toBeGreaterThanOrEqual(1);
    expect(split.Split.freelancer_pct).toBeLessThanOrEqual(99);
  });
});

describe("anonymizeDisputeContext", () => {
  // Test is also here because the context is what the AI receives
  it("produces expected format", async () => {
    const { anonymizeDisputeContext } = await import("@/utils/anonymize");

    const context = anonymizeDisputeContext({
      contract: {
        client: "alice.near",
        freelancer: "bob.near",
        title: "Build a website",
        description: "Full stack website",
      },
      milestone: {
        title: "Frontend",
        description: "React frontend",
        amount: "1000000000000000000000000",
      },
      dispute: {
        raised_by: "alice.near",
        reason: "Work not delivered",
      },
    });

    expect(context).not.toContain("alice.near");
    expect(context).not.toContain("bob.near");
    expect(context).toContain("Dispute raised by: Party A (Client)");
    expect(context).toContain("Work not delivered");
  });
});
