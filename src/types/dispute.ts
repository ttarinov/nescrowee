export type DisputeStatus = "Pending" | "AiResolved" | "Appealed" | "AppealResolved" | "Finalized";

export type Resolution =
  | "Freelancer"
  | "Client"
  | { Split: { freelancer_pct: number } };

export interface InvestigationRound {
  round_number: number;
  analysis: string;
  findings: string;
  confidence: number;
  needs_more_analysis: boolean;
  is_appeal: boolean;
  tee_signature: number[];
  tee_signing_address: number[];
  tee_text: string;
  timestamp: number;
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
  investigation_rounds: InvestigationRound[];
  max_rounds: number;
  funds_released: boolean;
}
