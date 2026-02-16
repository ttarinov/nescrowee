export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const responses: Record<string, string> = {
  platform:
    "Nescrowee is a trustless escrow platform built on NEAR Protocol. It enables freelancers and clients to create milestone-based contracts where funds are locked in a smart contract and released when milestones are approved. If disputes arise, an AI analyzes the situation inside TEE hardware on NEAR AI Cloud, with Ed25519-signed and verified resolutions.",
  security:
    "Nescrowee uses multiple security layers: 1) TEE-verified AI runs inside Trusted Execution Environment hardware, 2) Ed25519 signatures verify every AI response on-chain, 3) Evidence is encrypted via NOVA SDK (AES-256-GCM) before storage, 4) PII is scrubbed before AI sees any context, 5) Smart contracts are open-source and auditable. All funds are held in escrow until milestones are completed or disputes are resolved.",
  escrow:
    "Here's how escrow works: 1) Client creates a contract with milestones, 2) Client funds the contract (amount includes a security deposit), 3) Funds are split into main pool and security pool, 4) Freelancer starts work on a milestone, 5) Freelancer submits work for review, 6) Client approves or disputes within 48 hours, 7) If approved, funds are released to freelancer. The security pool covers AI dispute costs and is returned to the freelancer when all milestones complete.",
  disputes:
    "Dispute resolution works like this: 1) Client raises a dispute when work is submitted, 2) AI analyzes the situation in a single comprehensive pass inside TEE hardware, 3) AI response is Ed25519-signed and verified on-chain, 4) AI can decide: pay freelancer, refund client, split funds, or send back for fixes, 5) Both parties have 48 hours to accept, or it auto-finalizes, 6) Funds are released per the resolution. The AI fee is deducted from the security pool.",
  payments:
    "You can fund contracts in two ways: 1) Direct NEAR payment - connect your NEAR wallet and pay directly, 2) HOT Pay - pay with any token (USDC, ETH, BNB, etc.) across 30+ chains. HOT Pay settles on NEAR via OmniBridge. The security deposit percentage (5-30%) is added to milestone amounts. Funds are split automatically: main pool for milestones, security pool for dispute costs.",
  integrations:
    "Nescrowee integrates with: 1) NEAR AI Cloud - TEE-protected AI inference with Ed25519 signatures, 2) NOVA SDK - encrypted evidence storage on IPFS with group access control, 3) NEAR Social DB - on-chain chat messages, 4) HOT Wallet SDK - seamless wallet connection, 5) HOT Pay - multi-token payments across chains. All integrations are designed for trustless, decentralized operation.",
  tee: "TEE (Trusted Execution Environment) is secure hardware that runs AI inference in an isolated, tamper-proof environment. On NEAR AI Cloud, the AI runs inside TEE hardware, signs responses with Ed25519, and the smart contract verifies these signatures on-chain. This ensures AI responses can't be manipulated and are cryptographically verifiable.",
  ed25519:
    "Ed25519 is a cryptographic signature scheme used to verify AI responses. When the AI resolves a dispute inside TEE hardware, it signs the response with an Ed25519 private key. The smart contract verifies this signature using the corresponding public key (registered by the contract owner). This proves the response came from the trusted TEE environment.",
  nova: "NOVA SDK provides encrypted evidence storage. Files are encrypted client-side using AES-256-GCM before upload to IPFS. Each contract has a NOVA group that both parties can access. During disputes, the AI retrieves and decrypts evidence to analyze the situation. Your files are never stored unencrypted.",
  milestones:
    "Milestones break work into manageable chunks. Each milestone has: an amount, description, and status (NotFunded, Funded, InProgress, SubmittedForReview, Completed, Disputed). Freelancers start milestones, submit work for review, and clients approve or dispute. Payment requests have a 48-hour deadline - if not approved or disputed, they auto-approve.",
  default:
    "I'm here to help answer questions about Nescrowee! I can explain how the platform works, security features, escrow flow, dispute resolution, payments, integrations, and more. What would you like to know?",
};

export function getMockAiResponse(userMessage: string): Promise<string> {
  return new Promise((resolve) => {
    const lowerMessage = userMessage.toLowerCase();
    
    setTimeout(() => {
      if (lowerMessage.includes("what is") || lowerMessage.includes("nescrowee") || lowerMessage.includes("platform")) {
        resolve(responses.platform);
      } else if (
        lowerMessage.includes("secure") ||
        lowerMessage.includes("security") ||
        lowerMessage.includes("safe") ||
        lowerMessage.includes("trust")
      ) {
        resolve(responses.security);
      } else if (
        lowerMessage.includes("escrow") ||
        lowerMessage.includes("how does") ||
        lowerMessage.includes("work") ||
        lowerMessage.includes("flow")
      ) {
        resolve(responses.escrow);
      } else if (
        lowerMessage.includes("dispute") ||
        lowerMessage.includes("disagree") ||
        lowerMessage.includes("conflict")
      ) {
        resolve(responses.disputes);
      } else if (
        lowerMessage.includes("pay") ||
        lowerMessage.includes("payment") ||
        lowerMessage.includes("fund") ||
        lowerMessage.includes("hot pay") ||
        lowerMessage.includes("near")
      ) {
        resolve(responses.payments);
      } else if (
        lowerMessage.includes("integrat") ||
        lowerMessage.includes("nova") ||
        lowerMessage.includes("social db") ||
        lowerMessage.includes("hot wallet")
      ) {
        resolve(responses.integrations);
      } else if (lowerMessage.includes("tee") || lowerMessage.includes("trusted execution")) {
        resolve(responses.tee);
      } else if (lowerMessage.includes("ed25519") || lowerMessage.includes("signature")) {
        resolve(responses.ed25519);
      } else if (lowerMessage.includes("nova") || lowerMessage.includes("evidence")) {
        resolve(responses.nova);
      } else if (lowerMessage.includes("milestone")) {
        resolve(responses.milestones);
      } else {
        resolve(responses.default);
      }
    }, 800 + Math.random() * 700);
  });
}
