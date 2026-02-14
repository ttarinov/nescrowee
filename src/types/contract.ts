export type MilestoneStatus = "NotFunded" | "Funded" | "InProgress" | "Completed" | "Disputed";
export type ContractStatus = "Draft" | "Active" | "Completed" | "Disputed" | "Resolved";
export type DisputeStatus = "Pending" | "AiResolved" | "Appealed" | "AppealResolved" | "Finalized";

export type Resolution =
  | "Freelancer"
  | "Client"
  | { Split: { freelancer_pct: number } };

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: string;
  status: MilestoneStatus;
}

export interface Dispute {
  milestone_id: string;
  raised_by: string;
  reason: string;
  status: DisputeStatus;
  resolution: Resolution | null;
  explanation: string | null;
  deadline_ns: number | null;
  client_accepted: boolean;
  freelancer_accepted: boolean;
  is_appeal: boolean;
  tee_signature: number[] | null;
  tee_signing_address: number[] | null;
  tee_text: string | null;
}

export interface EscrowContract {
  id: string;
  title: string;
  description: string;
  client: string;
  freelancer: string | null;
  total_amount: string;
  funded_amount: string;
  security_deposit_pct: number;
  milestones: Milestone[];
  status: ContractStatus;
  created_at: number;
  invite_token: string | null;
  prompt_hash: string;
  disputes: Dispute[];
  model_id: string;
}

export const AI_MODELS = [
  {
    id: "Qwen/Qwen3-30B-A3B",
    name: "Qwen3 30B",
    description: "Fast, cost-effective",
    pricing: "$0.15 / $0.55 per M tokens",
    speed: "~10s",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "Strong reasoning",
    pricing: "$0.15 / $0.55 per M tokens",
    speed: "~20s",
  },
  {
    id: "deepseek-ai/DeepSeek-V3.1",
    name: "DeepSeek V3.1",
    description: "Most thorough",
    pricing: "$1.05 / $3.10 per M tokens",
    speed: "~45s",
  },
  {
    id: "THUDM/GLM-4.1V-9B-Thinking",
    name: "GLM-4.1V 9B",
    description: "Vision-capable",
    pricing: "$0.15 / $0.55 per M tokens",
    speed: "~15s",
  },
] as const;

export const APPEAL_MODEL_ID = "deepseek-ai/DeepSeek-V3.1";
