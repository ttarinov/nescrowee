import { nearConfig } from "./config";
import type { EscrowContract } from "@/types/escrow";
import type { Dispute } from "@/types/dispute";

const GAS = "300000000000000";
const NO_DEPOSIT = "0";
const CONTRACT_CREATION_DEPOSIT = "50000000000000000000000";

async function viewMethod<T>(methodName: string, args: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(nearConfig.nodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: nearConfig.contractId,
        method_name: methodName,
        args_base64: btoa(JSON.stringify(args)),
      },
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const resultBytes = data.result.result;
  const resultStr = new TextDecoder().decode(new Uint8Array(resultBytes));
  return JSON.parse(resultStr);
}

async function callMethod(methodName: string, args: Record<string, unknown>, deposit = NO_DEPOSIT) {
  const { signAndSendTransaction } = await import("./wallet");
  return signAndSendTransaction({
    receiverId: nearConfig.contractId,
    actions: [
      {
        type: "FunctionCall",
        params: { methodName, args, gas: GAS, deposit },
      },
    ],
  });
}

export async function getContract(contractId: string): Promise<EscrowContract | null> {
  return viewMethod<EscrowContract | null>("get_contract", { contract_id: contractId });
}

export async function getContractsByAccount(accountId: string): Promise<EscrowContract[]> {
  return viewMethod<EscrowContract[]>("get_contracts_by_account", { account_id: accountId });
}

export async function getDispute(contractId: string, milestoneId: string): Promise<Dispute | null> {
  return viewMethod<Dispute | null>("get_dispute", { contract_id: contractId, milestone_id: milestoneId });
}

export async function getPromptHash(contractId: string): Promise<string | null> {
  return viewMethod<string | null>("get_prompt_hash", { contract_id: contractId });
}

export async function getAiProcessingFee(): Promise<string> {
  return viewMethod<string>("get_ai_processing_fee");
}

export interface CreateContractArgs {
  title: string;
  description: string;
  milestones: Array<{ title: string; description: string; amount: string }>;
  freelancer?: string;
  security_deposit_pct: number;
  prompt_hash: string;
  model_id: string;
}

export function createContract(args: CreateContractArgs) {
  return callMethod("create_contract", {
    title: args.title,
    description: args.description,
    milestones: args.milestones.map((m) => ({
      title: m.title,
      description: m.description,
      amount: m.amount,
    })),
    freelancer: args.freelancer || null,
    security_deposit_pct: args.security_deposit_pct,
    prompt_hash: args.prompt_hash,
    model_id: args.model_id,
  }, CONTRACT_CREATION_DEPOSIT);
}

export function joinContract(contractId: string, inviteToken: string) {
  return callMethod("join_contract", { contract_id: contractId, invite_token: inviteToken });
}

export function fundContract(contractId: string, amount: string) {
  return callMethod("fund_contract", { contract_id: contractId }, amount);
}

export function startMilestone(contractId: string, milestoneId: string) {
  return callMethod("start_milestone", { contract_id: contractId, milestone_id: milestoneId });
}

export function requestPayment(contractId: string, milestoneId: string) {
  return callMethod("request_payment", { contract_id: contractId, milestone_id: milestoneId });
}

export function cancelPaymentRequest(contractId: string, milestoneId: string) {
  return callMethod("cancel_payment_request", { contract_id: contractId, milestone_id: milestoneId });
}

export function approveMilestone(contractId: string, milestoneId: string) {
  return callMethod("approve_milestone", { contract_id: contractId, milestone_id: milestoneId });
}

export function autoApprovePayment(contractId: string, milestoneId: string) {
  return callMethod("auto_approve_payment", { contract_id: contractId, milestone_id: milestoneId });
}

export function raiseDispute(contractId: string, milestoneId: string, reason: string) {
  return callMethod("raise_dispute", {
    contract_id: contractId,
    milestone_id: milestoneId,
    reason,
  });
}

export function submitAiResolution(
  contractId: string,
  milestoneId: string,
  resolution: unknown,
  explanation: string,
  signature: number[],
  signingAddress: number[],
  teeText: string,
) {
  return callMethod("submit_ai_resolution", {
    contract_id: contractId,
    milestone_id: milestoneId,
    resolution,
    explanation,
    signature,
    signing_address: signingAddress,
    tee_text: teeText,
  });
}

export function acceptResolution(contractId: string, milestoneId: string) {
  return callMethod("accept_resolution", { contract_id: contractId, milestone_id: milestoneId });
}

export function finalizeResolution(contractId: string, milestoneId: string) {
  return callMethod("finalize_resolution", { contract_id: contractId, milestone_id: milestoneId });
}

export function releaseDisputeFunds(contractId: string, milestoneId: string) {
  return callMethod("release_dispute_funds", { contract_id: contractId, milestone_id: milestoneId });
}

export function overrideToContinueWork(contractId: string, milestoneId: string) {
  return callMethod("override_to_continue_work", { contract_id: contractId, milestone_id: milestoneId });
}

export function completeContractSecurity(contractId: string) {
  return callMethod("complete_contract_security", { contract_id: contractId });
}

export function setAiProcessingFee(feeYoctonear: string) {
  return callMethod("set_ai_processing_fee", { fee_yoctonear: feeYoctonear });
}
