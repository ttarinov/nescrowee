import type { Resolution } from "@/types/dispute";

export interface ChatResponse {
  response: string;
  chatId: string;
}

export interface TeeSignature {
  text: string;
  signature: string;
  signing_address: string;
}

export interface InvestigationRoundResult {
  round_number: number;
  analysis: string;
  findings: string;
  confidence: number;
  needs_more_analysis: boolean;
  resolution: Resolution | null;
  explanation: string | null;
  tee: TeeSignature;
}

export interface InvestigationResult {
  rounds: InvestigationRoundResult[];
  finalResolution: InvestigationRoundResult;
}
