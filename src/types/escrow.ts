import type { Milestone } from "./milestone";
import type { Dispute } from "./dispute";

export type ContractStatus = "Draft" | "Active" | "Completed" | "Disputed" | "Resolved";

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
