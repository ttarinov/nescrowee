export type MilestoneStatus = "NotFunded" | "Funded" | "InProgress" | "SubmittedForReview" | "Completed" | "Disputed";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: string;
  status: MilestoneStatus;
  payment_request_deadline_ns: number | null;
}
