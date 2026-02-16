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

export interface AiResolutionResult {
  resolution: Resolution;
  explanation: string;
  confidence: number;
  context_for_freelancer: string | null;
  tee: TeeSignature;
}
