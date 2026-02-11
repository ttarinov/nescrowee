export type MilestoneStatus = "not_funded" | "funded" | "in_progress" | "completed" | "disputed";
export type ContractStatus = "draft" | "active" | "completed" | "disputed" | "resolved";
export type BudgetType = "milestones" | "total";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
}

export interface ChatMessage {
  id: string;
  sender: "client" | "freelancer" | "system";
  content: string;
  timestamp: string;
  type: "message" | "file" | "action";
  fileName?: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  clientAddress: string;
  freelancerAddress: string;
  totalAmount: number;
  securityDeposit: number;
  budgetType: BudgetType;
  milestones: Milestone[];
  status: ContractStatus;
  createdAt: string;
  inviteToken?: string;
  chatMessages: ChatMessage[];
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
  resolution?: "contractor" | "client";
  explanation?: string;
}
