export type MilestoneStatus = "NotFunded" | "Funded" | "InProgress" | "Completed" | "Disputed";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: string;
  status: MilestoneStatus;
}
