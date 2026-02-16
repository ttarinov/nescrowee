export type DisputeStatus = "Pending" | "AiResolved" | "Finalized";

export type Resolution =
  | "Freelancer"
  | "Client"
  | "ContinueWork"
  | { Split: { freelancer_pct: number } };

export interface EvidenceFile {
  cid: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
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
  ai_fee_deducted: boolean;
  tee_signature: number[] | null;
  tee_signing_address: number[] | null;
  tee_text: string | null;
  funds_released: boolean;
}
