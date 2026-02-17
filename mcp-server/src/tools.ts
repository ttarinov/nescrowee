import { viewMethod, callMethod, nearToYocto, computePromptHash } from "./near.js";

const STANDARD_PROMPT = `# Nescrowee — AI Dispute Resolution

You are an impartial AI dispute resolver for Nescrowee, a decentralized escrow platform on NEAR Protocol. Your decision is cryptographically signed via TEE (Trusted Execution Environment) and verified on-chain — it must be fair and well-reasoned.

## Your Role
Analyze a dispute between Party A (client) and Party B (freelancer) over a milestone in a freelance contract. Produce a single, comprehensive resolution.

## Input
You receive:
1. **Contract details** — title, description, milestone scope, agreed amount
2. **Dispute reason** — why the client raised the dispute
3. **Chat history** — anonymized conversation between parties
4. **Evidence** — any uploaded files (encrypted via NOVA, decrypted for your analysis)

## Reasoning Process
Think through these steps internally before deciding:
1. What was the agreed scope of work for this milestone?
2. Did the freelancer deliver work? If so, what quality and completeness?
3. Are the client's concerns about quality/scope valid?
4. Did either party fail to communicate or act in good faith?
5. Is the work partially done but fixable, or fundamentally inadequate?
6. Would sending the freelancer back to fix specific issues resolve this fairly?

## Resolution Options
Choose exactly ONE:

- **"Freelancer"** — Freelancer fulfilled obligations. Release full payment.
- **"Client"** — Client's concerns are fully valid. Full refund.
- **"ContinueWork"** — Work is partially done but can be fixed.
- **{ "Split": { "freelancer_pct": N } }** — Partial completion warrants splitting funds.

## Output Format
Respond with valid JSON only:
\`\`\`json
{
  "resolution": "Freelancer" | "Client" | "ContinueWork" | { "Split": { "freelancer_pct": <number> } },
  "explanation": "<2-4 sentence explanation of your reasoning>",
  "confidence": <number 0-100>,
  "context_for_freelancer": "<specific instructions for what to fix — required for ContinueWork, null otherwise>"
}
\`\`\`
`;

const STANDARD_PROMPT_HASH = computePromptHash(STANDARD_PROMPT);
const CONTRACT_CREATION_DEPOSIT = "50000000000000000000000";

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export const TOOLS: Tool[] = [
  {
    name: "get_contract",
    description: "Get the full state of an escrow contract including milestones, disputes, and funding status.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID (e.g., 'c1', 'c2')" },
      },
      required: ["contract_id"],
    },
    handler: async (args) => viewMethod("get_contract", { contract_id: args.contract_id }),
  },

  {
    name: "get_contracts_by_account",
    description: "Get all escrow contracts associated with a NEAR account (as client or freelancer).",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "NEAR account ID (e.g., 'alice.testnet')" },
      },
      required: ["account_id"],
    },
    handler: async (args) => viewMethod("get_contracts_by_account", { account_id: args.account_id }),
  },

  {
    name: "get_dispute",
    description: "Get dispute information for a specific milestone.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID" },
        milestone_id: { type: "string", description: "The milestone ID (e.g., 'm1', 'm2')" },
      },
      required: ["contract_id", "milestone_id"],
    },
    handler: async (args) =>
      viewMethod("get_dispute", { contract_id: args.contract_id, milestone_id: args.milestone_id }),
  },

  {
    name: "get_ai_processing_fee",
    description: "Get the current AI processing fee in yoctoNEAR. Deducted from the security pool when a dispute is resolved.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => viewMethod("get_ai_processing_fee"),
  },

  {
    name: "create_contract",
    description:
      "Create a new escrow contract on NEAR. The caller becomes the client. Milestone amounts are specified in NEAR (e.g., '5' for 5 NEAR). Returns the contract ID. Requires NEAR_ACCOUNT_ID and NEAR_PRIVATE_KEY to be set.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Contract title" },
        description: { type: "string", description: "Contract description" },
        milestones: {
          type: "array",
          description: "Array of milestone objects",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              amount: { type: "string", description: "Amount in NEAR (e.g., '5' for 5 NEAR)" },
            },
            required: ["title", "description", "amount"],
          },
        },
        freelancer: { type: "string", description: "Optional freelancer NEAR account ID. If omitted, contract is in Draft status until someone joins." },
        security_deposit_pct: { type: "number", description: "Security deposit percentage (5-30). Used to cover AI dispute costs." },
        model_id: { type: "string", description: "AI model ID for dispute resolution (default: Qwen/Qwen3-30B-A3B)" },
      },
      required: ["title", "description", "milestones", "security_deposit_pct"],
    },
    handler: async (args) => {
      const milestones = (args.milestones as Array<{ title: string; description: string; amount: string }>).map((m) => ({
        title: m.title,
        description: m.description,
        amount: nearToYocto(m.amount),
      }));

      return callMethod(
        "create_contract",
        {
          title: args.title,
          description: args.description,
          milestones,
          freelancer: args.freelancer ?? null,
          security_deposit_pct: args.security_deposit_pct,
          prompt_hash: STANDARD_PROMPT_HASH,
          model_id: args.model_id ?? "Qwen/Qwen3-30B-A3B",
        },
        CONTRACT_CREATION_DEPOSIT,
      );
    },
  },

  {
    name: "fund_contract",
    description:
      "Fund an escrow contract with NEAR. The amount covers milestones plus a security deposit. Specify the total amount in NEAR (e.g., '11' for 11 NEAR). Requires NEAR_ACCOUNT_ID and NEAR_PRIVATE_KEY.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID" },
        amount: { type: "string", description: "Total funding amount in NEAR (e.g., '11' for 11 NEAR). Include security deposit percentage on top of milestone total." },
      },
      required: ["contract_id", "amount"],
    },
    handler: async (args) =>
      callMethod("fund_contract", { contract_id: args.contract_id }, nearToYocto(args.amount as string)),
  },

  {
    name: "join_contract",
    description: "Join a contract as freelancer using an invite token. Only works for Draft status contracts.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID" },
        invite_token: { type: "string", description: "Invite token from contract creation" },
      },
      required: ["contract_id", "invite_token"],
    },
    handler: async (args) =>
      callMethod("join_contract", { contract_id: args.contract_id, invite_token: args.invite_token }),
  },

  {
    name: "start_milestone",
    description: "Start working on a milestone. Only the freelancer can call this. Changes status from Funded to InProgress.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID" },
        milestone_id: { type: "string", description: "The milestone ID (e.g., 'm1')" },
      },
      required: ["contract_id", "milestone_id"],
    },
    handler: async (args) =>
      callMethod("start_milestone", { contract_id: args.contract_id, milestone_id: args.milestone_id }),
  },

  {
    name: "request_payment",
    description: "Request payment for a completed milestone. Sets a 48-hour deadline for client approval. Only freelancer can call.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID" },
        milestone_id: { type: "string", description: "The milestone ID" },
      },
      required: ["contract_id", "milestone_id"],
    },
    handler: async (args) =>
      callMethod("request_payment", { contract_id: args.contract_id, milestone_id: args.milestone_id }),
  },

  {
    name: "cancel_payment_request",
    description: "Cancel a payment request and return milestone to InProgress status. Only freelancer can call.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID" },
        milestone_id: { type: "string", description: "The milestone ID" },
      },
      required: ["contract_id", "milestone_id"],
    },
    handler: async (args) =>
      callMethod("cancel_payment_request", { contract_id: args.contract_id, milestone_id: args.milestone_id }),
  },

  {
    name: "approve_milestone",
    description: "Approve a milestone and release payment to the freelancer. Only the client can call. Milestone must be in SubmittedForReview status.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID" },
        milestone_id: { type: "string", description: "The milestone ID" },
      },
      required: ["contract_id", "milestone_id"],
    },
    handler: async (args) =>
      callMethod("approve_milestone", { contract_id: args.contract_id, milestone_id: args.milestone_id }),
  },

  {
    name: "raise_dispute",
    description: "Raise a dispute on a milestone. Only the client can call. Triggers AI arbitration via TEE. Milestone must be in SubmittedForReview status.",
    inputSchema: {
      type: "object",
      properties: {
        contract_id: { type: "string", description: "The contract ID" },
        milestone_id: { type: "string", description: "The milestone ID" },
        reason: { type: "string", description: "Reason for the dispute" },
      },
      required: ["contract_id", "milestone_id", "reason"],
    },
    handler: async (args) =>
      callMethod("raise_dispute", {
        contract_id: args.contract_id,
        milestone_id: args.milestone_id,
        reason: args.reason,
      }),
  },
];
