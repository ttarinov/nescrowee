function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function anonymizeDisputeContext(params: {
  contract: {
    client: string;
    freelancer: string | null;
    title: string;
    description: string;
  };
  milestone: { title: string; description: string; amount: string };
  dispute: { raised_by: string; reason: string; explanation?: string | null };
  chatHistory?: Array<{ sender: string; content: string }>;
  evidence?: Array<{ fileName: string; content: string }>;
}): string {
  const { contract, milestone, dispute, chatHistory, evidence } = params;

  const isClientRaiser = dispute.raised_by === contract.client;

  const scrub = (text: string): string => {
    let cleaned = text;

    if (contract.client) {
      cleaned = cleaned.replace(new RegExp(escapeRegex(contract.client), "gi"), "Party A");
    }
    if (contract.freelancer) {
      cleaned = cleaned.replace(new RegExp(escapeRegex(contract.freelancer), "gi"), "Party B");
    }

    cleaned = cleaned.replace(/\b[\w-]+\.near\b/gi, "[ACCOUNT]");
    cleaned = cleaned.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[EMAIL]");
    cleaned = cleaned.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[PHONE]");
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "[URL]");
    cleaned = cleaned.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP]");
    cleaned = cleaned.replace(/\b[0-9a-f]{40,}\b/gi, "[HASH]");
    cleaned = cleaned.replace(/\b(sk|pk|api|key|secret|token)[-_][\w-]{20,}\b/gi, "[API_KEY]");

    return cleaned;
  };

  const lines: string[] = [
    `Contract Title: ${scrub(contract.title)}`,
    `Contract Description: ${scrub(contract.description)}`,
    ``,
    `Disputed Milestone: ${scrub(milestone.title)}`,
    `Milestone Description: ${scrub(milestone.description)}`,
    `Milestone Amount: ${milestone.amount}`,
    ``,
    `Dispute raised by: ${isClientRaiser ? "Party A (Client)" : "Party B (Freelancer)"}`,
    `Reason: ${scrub(dispute.reason)}`,
  ];

  if (dispute.explanation) {
    lines.push(`Previous AI resolution: ${scrub(dispute.explanation)}`);
  }

  if (chatHistory?.length) {
    lines.push(``, `--- Chat History (anonymized) ---`);
    for (const msg of chatHistory) {
      const role = msg.sender === contract.client ? "Party A" : "Party B";
      lines.push(`[${role}]: ${scrub(msg.content)}`);
    }
  }

  if (evidence?.length) {
    lines.push(``, `--- Evidence Files (encrypted via NOVA, decrypted for analysis) ---`);
    for (const file of evidence) {
      lines.push(`[File: ${file.fileName}]`, scrub(file.content), ``);
    }
  }

  return lines.join("\n");
}
