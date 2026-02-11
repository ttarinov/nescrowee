export type MilestoneStatus = "pending" | "in_progress" | "completed" | "disputed";
export type ContractStatus = "draft" | "active" | "completed" | "disputed" | "resolved";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  clientAddress: string;
  freelancerAddress: string;
  totalAmount: number;
  securityDeposit: number;
  milestones: Milestone[];
  status: ContractStatus;
  createdAt: string;
}

export interface Dispute {
  id: string;
  contractId: string;
  milestoneId: string;
  raisedBy: string;
  reason: string;
  status: "pending" | "assigned" | "resolved";
  judgeId?: string;
  aiSummary?: string;
  resolution?: "client" | "freelancer" | "split";
}
